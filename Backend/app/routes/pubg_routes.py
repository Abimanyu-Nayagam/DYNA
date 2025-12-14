from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.pubg import PubgPlayerStats
from app.schema.pubg_schema import PubgBaseSchema
from app import db
import logging
from app.utils.s3 import upload_video_to_s3


logger = logging.getLogger(__name__)

pubg_bp = Blueprint('pubg_bp', __name__)

@pubg_bp.route('/stats', methods=['POST'])
@jwt_required()
def create_pubg_stats():
    """Create a new PUBG stats entry."""
    logger.info("PUBG stats creation attempt started")
    # Get authenticated user ID from JWT token
    user_id = get_jwt_identity()
    logger.info(f"Creating PUBG stats for user_id: {user_id}")
    
    data = request.form
    if not data:
        logger.warning("PUBG stats creation failed - no JSON data provided")
        return jsonify({'error': 'Request must be JSON'}), 400
    
    # Pydantic validation
    try:
        data = PubgBaseSchema(**data.to_dict())
    except Exception as e:
        logger.warning(f"PUBG stats validation failed: {str(e)}")
        return jsonify({'error': str(e)}), 400
    
    
    in_game_id = data.in_game_id
    # Check if user already has a portfolio
    existing_user_stats = PubgPlayerStats.query.filter_by(user_id=user_id).first()
    if existing_user_stats:
        logger.warning(f"PUBG stats creation failed - user already has a portfolio: {user_id}")
        return jsonify({'error': 'You already have a PUBG portfolio. You can only have one portfolio per user.'}), 400
    
    # Check if in_game_id already exists
    existing_stats = PubgPlayerStats.query.filter_by(in_game_id=in_game_id).first()
    if existing_stats:
        logger.warning(f"PUBG stats creation failed - in_game_id already exists: {in_game_id}")
        return jsonify({'error': 'A portfolio with this In-Game ID already exists.'}), 400
    
    # Upload video (optional)
    video = request.files.get("video")
    video_url = None
    if video:
        video_url = upload_video_to_s3(video, in_game_id, "pubg")

    # Create new stats object
    new_stats = PubgPlayerStats(
        user_id=user_id,
        username=data.username,
        in_game_id=in_game_id,
        video_url=video_url,

        fd_ratio=data.fd_ratio or 0,
        current_rank=data.current_rank or "Gold 5",
        highest_rank=data.highest_rank or "Gold 5",

        headshot_rate=data.headshot_rate or 0,
        headshots=data.headshots or 0,
        eliminations=data.eliminations or 0,
        most_eliminations=data.most_eliminations or 0,

        matches_played=data.matches_played or 0,
        wins=data.wins or 0,
        top_10=data.top_10 or 0,

        avg_damage=data.avg_damage or 0,
        avg_survival_time=data.avg_survival_time or 0,
    )

    
    try:
        db.session.add(new_stats) 
        db.session.commit()
        logger.info(f"PUBG stats created successfully for user_id: {user_id}, in_game_id: {in_game_id}")
    except Exception as exc: 
        db.session.rollback()
        logger.error(f"Database error while creating PUBG stats for user_id: {user_id}")
        return jsonify({'error': 'Database error', 'details': str(exc)}), 500

    return jsonify(new_stats.to_dict()), 201

@pubg_bp.route('/', methods=['GET'])
def get_pubg_stats():
    """Retrieve all PUBG players Stats. (Public route - no authentication required)"""
    logger.info("Fetching all PUBG player stats")
    try:
        stats_list = PubgPlayerStats.query.all()
        logger.info(f"Successfully fetched {len(stats_list)} PUBG player stats")
        return jsonify([stats.to_dict() for stats in stats_list]), 200
    except Exception as exc:
        logger.error(f"Error fetching PUBG stats: {str(exc)}")
        return jsonify({'error': 'Failed to fetch player stats'}), 500

@pubg_bp.route('/stats/<int:user_id>', methods=['GET'])
@jwt_required()
def get_pubg_stats_by_user(user_id):
    """Retrieve PUBG stats by user ID."""
    logger.info(f"Fetching PUBG stats for user_id: {user_id}")
    stats = PubgPlayerStats.query.filter_by(user_id=user_id).first()
    if not stats:
        logger.warning(f"PUBG stats not found for user_id: {user_id}")
        return jsonify({'error': 'Stats not found'}), 404
    logger.info(f"Successfully fetched PUBG stats for user_id: {user_id}")
    return jsonify(stats.to_dict()), 200


@pubg_bp.route("/stats/<int:stats_id>", methods=["PATCH"])
@jwt_required()
def update_pubg_stats(stats_id):
    current_user_id = get_jwt_identity()
    logger.info(f"PUBG stats update attempt for stats_id={stats_id}, user_id={current_user_id}")

    data = request.form
    if not data:
        return jsonify({"error": "Request must be form-data"}), 400

    # Pydantic validation (partial update)
    try:
        pubg_data = PubgBaseSchema(**data.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    stats = PubgPlayerStats.query.get(stats_id)
    if not stats:
        return jsonify({"error": "Stats not found"}), 404

    if str(stats.user_id) != str(current_user_id):
        return jsonify({"error": "Unauthorized"}), 403

    # Update only provided fields
    updatable_fields = [
        "username", "in_game_id", "fd_ratio",
        "current_rank", "highest_rank",
        "headshot_rate", "headshots",
        "eliminations", "most_eliminations",
        "matches_played", "wins", "top_10",
        "avg_damage", "avg_survival_time",
        "ishidden"
    ]

    for field in updatable_fields:
        if field in data:
            setattr(stats, field, data.get(field))

    # ---- optional video upload ----
    video = request.files.get("video")
    if video:
        video_url = upload_video_to_s3(
            video,
            stats.in_game_id,
            "pubg"
        )
        if not video_url:
            return jsonify({"error": "Video upload failed"}), 500
        stats.video_url = video_url

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    return jsonify(stats.to_dict()), 200
