import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.models import ValorantProfile, User, TeamHistory, TournamentHistory, UserHighlights
from app.schema.valorant_schema import ValorantProfileCreate, ValorantProfileUpdate
from app.utils.s3 import upload_video_to_s3, delete_from_s3
from pydantic import ValidationError

# Setup logger
logger = logging.getLogger(__name__)
valorant_bp = Blueprint('valorant', __name__, url_prefix='/api/valorant')


# 📹 1. GET /api/valorant/me
@valorant_bp.route('/me', methods=['GET'])
@jwt_required()
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


# 📹 2. POST /api/valorant
@valorant_bp.route('', methods=['POST'])
@jwt_required()
def create_profile():
    user_id = get_jwt_identity()
    logger.debug(f"User {user_id} attempting to create Valorant profile")
    try:
        if ValorantProfile.query.filter_by(user_id=user_id).first():
            logger.warning(f"User {user_id} tried to create duplicate profile")
            return jsonify({"error": "Valorant profile already exists"}), 400

        # Handle multipart form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            json_data = request.form.to_dict()
            video_files = request.files.getlist("videos")
        else:
            json_data = request.get_json()
            video_files = []

        if not json_data:
            logger.warning(f"User {user_id} sent empty profile data")
            return jsonify({"error": "Request body is missing"}), 400

        # Parse JSON arrays from form data
        if 'top_agents' in json_data and isinstance(json_data['top_agents'], str):
            import json
            json_data['top_agents'] = json.loads(json_data['top_agents'])
        if 'team_history' in json_data and isinstance(json_data['team_history'], str):
            import json
            json_data['team_history'] = json.loads(json_data['team_history'])
        if 'tournaments' in json_data and isinstance(json_data['tournaments'], str):
            import json
            json_data['tournaments'] = json.loads(json_data['tournaments'])
        if 'media_clips' in json_data and isinstance(json_data['media_clips'], str):
            import json
            json_data['media_clips'] = json.loads(json_data['media_clips'])

        try:
            data = ValorantProfileCreate(**json_data)
        except ValidationError as e:
            logger.warning(f"Validation failed for user {user_id}: {e}")
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400

        # Build flat fields only
        clean_dict = data.dict(
            exclude={"team_history", "tournaments", "media_clips"}
        )

        user = User.query.get(user_id)

        profile = ValorantProfile(
            user_id=user_id,
            player_name=user.user_name,  # 🔒 enforced DYNA name
            **clean_dict
        )

        # Add team history
        if data.team_history:
            for th in data.team_history:
                th_data = th.dict()
                profile.team_history.append(TeamHistory(**th_data))

        # Add tournament history
        if data.tournaments:
            for tr in data.tournaments:
                tr_data = tr.dict()
                profile.tournaments.append(TournamentHistory(**tr_data))

        db.session.add(profile)
        db.session.flush()  # Get profile.id

        # Upload videos to S3 and store URLs
        media_urls = []
        
        # Handle uploaded video files
        for video in video_files:
            try:
                video_url = upload_video_to_s3(video, str(user_id), "valorant")
                media_urls.append(video_url)
                
                # Also add to UserHighlights table for consistency
                db.session.add(UserHighlights(
                    user_id=user_id,
                    username=user.user_name,
                    game_name="valorant",
                    video_url=video_url
                ))
            except Exception as e:
                logger.error(f"Failed to upload video: {str(e)}")

        # Combine with any existing media_clips URLs
        if data.media_clips:
            media_urls.extend(data.media_clips)

        profile.media_clips = media_urls

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


# 📹 3. PATCH /api/valorant/me → Partial update (inline editing)
@valorant_bp.route('/me', methods=['PATCH'])
@jwt_required()
def patch_profile():
    user_id = get_jwt_identity()
    logger.debug(f"User {user_id} updating Valorant profile")

    try:
        profile = ValorantProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            logger.warning(f"PATCH failed: user {user_id} has no profile")
            return jsonify({"error": "Profile not found"}), 404

        # Handle multipart form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            json_data = request.form.to_dict()
            video_files = request.files.getlist("videos")
        else:
            json_data = request.get_json()
            video_files = []

        if not json_data and not video_files:
            logger.warning(f"User {user_id} sent empty update data")
            return jsonify({"error": "No update data provided"}), 400

        # Parse JSON arrays from form data
        if 'top_agents' in json_data and isinstance(json_data['top_agents'], str):
            import json
            json_data['top_agents'] = json.loads(json_data['top_agents'])
        if 'team_history' in json_data and isinstance(json_data['team_history'], str):
            import json
            json_data['team_history'] = json.loads(json_data['team_history'])
        if 'tournaments' in json_data and isinstance(json_data['tournaments'], str):
            import json
            json_data['tournaments'] = json.loads(json_data['tournaments'])
        if 'media_clips' in json_data and isinstance(json_data['media_clips'], str):
            import json
            json_data['media_clips'] = json.loads(json_data['media_clips'])

        if "team_history" in json_data:
            json_data["been_in_team_before"] = True
            
        try:
            data = ValorantProfileUpdate(**json_data) if json_data else None
        except ValidationError as e:
            logger.warning(f"PATCH validation failed for user {user_id}: {e}")
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400

        # Extract only fields that were sent (exclude_unset) and are not None
        update_dict = data.dict(exclude_unset=True) if data else {}
        update_dict = {k: v for k, v in update_dict.items() if v is not None}

        # --- HANDLE nested lists separately ---
        team_hist_list = update_dict.pop("team_history", None)
        tourn_hist_list = update_dict.pop("tournaments", None)
        media_clips_list = update_dict.pop("media_clips", None)

        # Apply flat scalar fields
        for key, value in update_dict.items():
            setattr(profile, key, value)

        # --- TEAM HISTORY (REPLACE ALL) ---
        if team_hist_list is not None:
            profile.team_history.clear()
            for th_data in team_hist_list:
                profile.team_history.append(TeamHistory(**th_data))

        # --- TOURNAMENT HISTORY (REPLACE ALL) ---
        if tourn_hist_list is not None:
            profile.tournaments.clear()
            for tr_data in tourn_hist_list:
                profile.tournaments.append(TournamentHistory(**tr_data))

        # --- MEDIA CLIPS (UPLOAD NEW + KEEP EXISTING) ---
        user = User.query.get(user_id)
        new_media_urls = []
        
        # Upload new video files
        for video in video_files:
            try:
                video_url = upload_video_to_s3(video, str(user_id), "valorant")
                new_media_urls.append(video_url)
                
                # Also add to UserHighlights table
                db.session.add(UserHighlights(
                    user_id=user_id,
                    username=user.user_name,
                    game_name="valorant",
                    video_url=video_url
                ))
            except Exception as e:
                logger.error(f"Failed to upload video: {str(e)}")

        # Combine existing + new videos
        if media_clips_list is not None:
            # User sent explicit list - replace with that + new uploads
            profile.media_clips = media_clips_list + new_media_urls
        elif new_media_urls:
            # Just append new videos to existing
            existing = profile.media_clips or []
            profile.media_clips = existing + new_media_urls

        db.session.commit()
        logger.info(f"Successfully updated profile for user {user_id}")
        return jsonify(profile.to_dict()), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during PATCH for user {user_id}: {str(e)}")
        return jsonify({"error": "Database update failed"}), 500

    except Exception as e:
        logger.error(f"Unexpected error during PATCH for user {user_id}: {str(e)}")
        return jsonify({"error": "Update failed"}), 500


# 📹 4. DELETE /api/valorant/me
@valorant_bp.route('/me', methods=['DELETE'])
@jwt_required()
def delete_profile():
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} requested profile deletion")
    try:
        profile = ValorantProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        # Delete associated videos from S3
        if profile.media_clips:
            for video_url in profile.media_clips:
                try:
                    delete_from_s3(video_url)
                except Exception as e:
                    logger.error(f"Failed to delete video from S3: {str(e)}")

        # Delete UserHighlights entries
        UserHighlights.query.filter_by(
            user_id=user_id, 
            game_name="valorant"
        ).delete()

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


# 📹 5. GET /api/valorant/search (paginated, public)
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
        
        results = []
        for p in pagination.items:
            try:
                result = {
                    "player_name": p.player_name,
                    "current_rank": p.current_rank.value if p.current_rank else None,
                    "region": p.region.value if p.region else None,
                    "best_agent": p.best_agent.value if p.best_agent else None,
                    "riot_id": p.riot_id,
                    "tagline": p.tagline,
                    "user_name": p.user.user_name if p.user else None
                }
                results.append(result)
            except Exception as item_error:
                logger.error(f"Error serializing profile {p.id}: {str(item_error)}")
                continue

        logger.info(f"Search returned {len(results)} results (total: {pagination.total})")
        return jsonify({
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
            "results": results,
            "empty": pagination.total == 0,
            "message": "No profiles found" if pagination.total == 0 else None
        }), 200

    except Exception as e:
        logger.error(f"Search error: {str(e)}", exc_info=True)
        return jsonify({"error": "Search failed"}), 500
    
# 📹 6. GET /api/valorant/<user_name> → Full public Valorant profile
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


# 📹 7. GET /api/valorant/videos/<user_id> → Get user's video highlights
@valorant_bp.route('/videos/<int:user_id>', methods=['GET'])
def get_user_videos(user_id):
    try:
        videos = UserHighlights.query.filter_by(
            user_id=user_id, 
            game_name="valorant"
        ).all()
        
        video_list = [v.video_url for v in videos]
        return jsonify({"videos": video_list}), 200
    except Exception as e:
        logger.error(f"Error fetching videos for user {user_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch videos"}), 500