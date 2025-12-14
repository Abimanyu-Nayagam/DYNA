import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.models import ValorantProfile, User
from app.schema.valorant_schema import ValorantProfileCreate, ValorantProfileUpdate
from pydantic import ValidationError

# Setup logger
logger = logging.getLogger(__name__)
valorant_bp = Blueprint('valorant', __name__, url_prefix='/api/valorant')


# 🔹 1. GET /api/valorant/me
@valorant_bp.route('/me', methods=['GET'])
# @jwt_required()
def get_own_profile():
    user_id = get_jwt_identity()
    logger.debug(f"Fetching profile for user_id={user_id}")
    try:
        profile = ValorantProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            logger.info(f"User {user_id} has no Valorant profile")
            return jsonify({"exists": False}), 404
        logger.info(f"Loaded profile for user {user_id}")
        return jsonify({"exists": True, "data": profile.to_dict()}), 200
    except Exception as e:
        logger.error(f"Error fetching profile for user {user_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch profile"}), 500


# 🔹 2. POST /api/valorant
@valorant_bp.route('', methods=['POST'])
# @jwt_required()
def create_profile():
    user_id = get_jwt_identity()
    logger.debug(f"User {user_id} attempting to create Valorant profile")
    try:
        if ValorantProfile.query.filter_by(user_id=user_id).first():
            logger.warning(f"User {user_id} tried to create duplicate profile")
            return jsonify({"error": "Valorant profile already exists"}), 400

        json_data = request.get_json()
        if not json_data:
            logger.warning(f"User {user_id} sent empty profile data")
            return jsonify({"error": "Request body is missing"}), 400

        try:
            data = ValorantProfileCreate(**json_data)
        except ValidationError as e:
            logger.warning(f"Validation failed for user {user_id}: {e}")
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400

        profile = ValorantProfile(user_id=user_id, **data.dict())
        db.session.add(profile)
        db.session.commit()
        logger.info(f"Created Valorant profile for user {user_id}")
        return jsonify(profile.to_dict()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"DB error creating profile for user {user_id}: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logger.error(f"Unexpected error for user {user_id}: {str(e)}")
        return jsonify({"error": "Unexpected error"}), 500


# 🔹 3. PATCH /api/valorant/me → Partial update (inline editing)
@valorant_bp.route('/me', methods=['PATCH'])
# @jwt_required()
def patch_profile():
    user_id = get_jwt_identity()
    logger.debug(f"User {user_id} updating Valorant profile")
    try:
        profile = ValorantProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            logger.warning(f"PATCH failed: user {user_id} has no profile")
            return jsonify({"error": "Profile not found"}), 404

        json_data = request.get_json()
        if not json_data:
            logger.warning(f"User {user_id} sent empty JSON body")
            return jsonify({"error": "No update data provided"}), 400

        try:
            data = ValorantProfileUpdate(**json_data)
        except ValidationError as e:
            logger.warning(f"PATCH validation failed for user {user_id}: {e}")
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400

        # Extract only fields that were sent (exclude_unset) and are not None
        update_dict = data.dict(exclude_unset=True)
        update_dict = {k: v for k, v in update_dict.items() if v is not None}

        # 🔹 Prevent meaningless updates
        if not update_dict:
            logger.warning(f"User {user_id} sent PATCH with no valid fields to update")
            return jsonify({"error": "No valid fields provided for update"}), 400

        # Apply updates
        for key, value in update_dict.items():
            setattr(profile, key, value)

        db.session.commit()
        logger.info(f"Successfully updated {len(update_dict)} fields for user {user_id}")
        return jsonify(profile.to_dict()), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during PATCH for user {user_id}: {str(e)}")
        return jsonify({"error": "Database update failed"}), 500
    except Exception as e:
        logger.error(f"Unexpected error during PATCH for user {user_id}: {str(e)}")
        return jsonify({"error": "Update failed"}), 500


# 🔹 4. DELETE /api/valorant/me
@valorant_bp.route('/me', methods=['DELETE'])
# @jwt_required()
def delete_profile():
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} requested profile deletion")
    try:
        profile = ValorantProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        db.session.delete(profile)
        db.session.commit()
        logger.info(f"Deleted profile for user {user_id}")
        return jsonify({"message": "Profile deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Deletion DB error for user {user_id}: {str(e)}")
        return jsonify({"error": "Deletion failed"}), 500
    except Exception as e:
        logger.error(f"Deletion error for user {user_id}: {str(e)}")
        return jsonify({"error": "Unexpected error"}), 500


# 🔹 5. GET /api/valorant/search (paginated, public)
@valorant_bp.route('/search', methods=['GET'])
def search_valorant_profiles():
    query = request.args.get('query', '').strip()
    rank = request.args.get('rank')
    region = request.args.get('region')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    logger.info(f"Valorant search: query='{query}', rank='{rank}', region='{region}', page={page}")

    try:
        page = int(page)
        per_page = min(int(per_page), 100)
    except ValueError:
        logger.warning("Invalid page/per_page in search")
        return jsonify({"error": "Invalid page or per_page"}), 400

    try:
        q = ValorantProfile.query.filter_by(is_public=True)

        if query:
            q = q.filter(
                (ValorantProfile.player_name.ilike(f"%{query}%")) |
                (ValorantProfile.riot_id.ilike(f"%{query}%"))
            )
        if rank:
            q = q.filter(ValorantProfile.current_rank == rank)
        if region:
            q = q.filter(ValorantProfile.region == region)

        pagination = q.paginate(page=page, per_page=per_page, error_out=False)
        results = [{
            "player_name": p.player_name,
            "current_rank": p.current_rank.value,
            "region": p.region.value,
            "best_agent": p.best_agent.value,
            "riot_id": p.riot_id,
            "tagline": p.tagline,
            "user_name": p.user.user_name
        } for p in pagination.items]

        logger.info(f"Search returned {len(results)} results (total: {pagination.total})")
        return jsonify({
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
            "results": results
        }), 200

    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({"error": "Search failed"}), 500
    
# 🔹 6. GET /api/valorant/<user_name> → Full public Valorant profile
@valorant_bp.route('/<user_name>', methods=['GET'])
def get_public_valorant_profile(user_name):
    logger.debug(f"Fetching public Valorant profile for user: {user_name}")
    try:
        user = User.query.filter(User.user_name.ilike(user_name)).first()
        if not user:
            logger.warning(f"User not found: {user_name}")
            return jsonify({"error": "User not found"}), 404

        profile = ValorantProfile.query.filter_by(
            user_id=user.user_id,
            is_public=True
        ).first()

        if not profile:
            logger.info(f"Valorant profile not public or missing for: {user_name}")
            return jsonify({"error": "Valorant profile is not public or does not exist"}), 404

        logger.info(f"Public Valorant profile served for: {user_name}")
        return jsonify(profile.to_dict()), 200

    except Exception as e:
        logger.error(f"Error fetching public Valorant profile for {user_name}: {str(e)}")
        return jsonify({"error": "Failed to load profile"}), 500