from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.csgo import CsgoPlayerStats
from app import db
from app.schema.csgo_schema import CsgoBaseSchema
import logging
from app.utils.s3 import upload_video_to_s3,delete_from_s3
from pydantic import ValidationError

logger = logging.getLogger(__name__)
csgo_bp = Blueprint('csgo_bp', __name__)


@csgo_bp.route("/stats", methods=["POST"])
@jwt_required()
def create_csgo_stats():
    logger.info("CSGO stats creation attempt started")
    user_id = get_jwt_identity()

    data = request.form
    if not data:
        return jsonify({'error': 'Request must be form-data'}), 400

    # Pydantic validation
    try:
        data = CsgoBaseSchema(**data.to_dict())
    except Exception as e:
        logger.warning(f"CSGO stats validation failed: {str(e)}")
        return jsonify({'error': str(e)}), 400

    in_game_id = data.in_game_id

    # One portfolio per user
    if CsgoPlayerStats.query.filter_by(user_id=user_id).first():
        return jsonify({
            'error': 'You already have a CSGO portfolio.'
        }), 400

    # Unique in-game ID
    if CsgoPlayerStats.query.filter_by(in_game_id=in_game_id).first():
        return jsonify({
            'error': 'A portfolio with this In-Game ID already exists.'
        }), 400

    # Upload video (optional)
    video = request.files.get("video")
    video_url = None
    if video:
        video_url = upload_video_to_s3(video, in_game_id, "csgo")

    stats = CsgoPlayerStats(
        user_id=user_id,
        username=data.username,
        in_game_id=data.in_game_id,
        video_url=video_url,

        current_rank=data.current_rank,
        highest_rank=data.highest_rank,
        mm_rank=data.mm_rank,
        faceit_level=data.faceit_level,
        elo=data.elo,

        kd_ratio=data.kd_ratio or 0,
        headshot_percentage=data.headshot_percentage or 0,
        kills=data.kills or 0,
        deaths=data.deaths or 0,
        assists=data.assists or 0,
        mvps=data.mvps or 0,

        matches_played=data.matches_played or 0,
        wins=data.wins or 0,
        win_rate=data.win_rate or 0,

        avg_damage_per_round=data.avg_damage_per_round or 0,
        avg_kills_per_round=data.avg_kills_per_round or 0,
        rounds_played=data.rounds_played or 0,

        bomb_plants=data.bomb_plants or 0,
        bomb_defuses=data.bomb_defuses or 0,
        flash_assists=data.flash_assists or 0,
    )

    try:
        db.session.add(stats)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify(stats.to_dict()), 201


@csgo_bp.route('/', methods=['GET'])
def get_csgo_stats():
    """Retrieve all CSGO player stats."""
    stats_list = CsgoPlayerStats.query.all()
    return jsonify([stats.to_dict() for stats in stats_list]), 200


@csgo_bp.route('/stats/<int:user_id>', methods=['GET'])
@jwt_required()
def get_csgo_stats_by_user(user_id):
    """Retrieve CSGO stats by user ID."""
    stats = CsgoPlayerStats.query.filter_by(user_id=user_id).first()
    if not stats:
        stats_dict = stats.to_dict()
        logger.info(f"Returning stats with video_url: {stats_dict.get('video_url')}")
        return jsonify(stats_dict), 200
    return jsonify(stats.to_dict()), 200


@csgo_bp.route("/stats/<int:stats_id>", methods=["PATCH"])
@jwt_required()
def update_csgo_stats(stats_id):
    """Update existing CSGO stats (partial update + optional video)."""
    current_user_id = get_jwt_identity()
    data = request.form

    stats = CsgoPlayerStats.query.get(stats_id)
    if not stats:
        return jsonify({"error": "Stats not found"}), 404

    if str(stats.user_id) != str(current_user_id):
        return jsonify({"error": "Unauthorized"}), 403

    # Validate provided fields only
    try:
        csgo_data = CsgoBaseSchema(**data.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Update scalar fields
    updatable_fields = [
        "username", "in_game_id", "current_rank", "highest_rank",
        "mm_rank", "faceit_level", "elo", "kd_ratio", "headshot_percentage",
        "kills", "deaths", "assists", "mvps", "matches_played", "wins",
        "win_rate", "avg_damage_per_round", "avg_kills_per_round",
        "rounds_played", "bomb_plants", "bomb_defuses", "flash_assists",
        "ishidden"
    ]

    for field in updatable_fields:
        if field in data:
            setattr(stats, field, getattr(csgo_data, field))

    # Optional video upload: delete previous video first
    video = request.files.get("video")
    if video:
        if stats.video_url:
            delete_from_s3(stats.video_url)
        video_url = upload_video_to_s3(video, stats.in_game_id, "csgo")
        if not video_url:
            return jsonify({"error": "Video upload failed"}), 500
        stats.video_url = video_url

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(exc)}), 500

    return jsonify(stats.to_dict()), 200
