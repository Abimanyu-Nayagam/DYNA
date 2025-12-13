from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.pubg import PubgPlayerStats
from app.schema.pubg_schema import PubgBaseSchema
from app import db
import logging

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
    
    data = request.get_json()
    if not data:
        logger.warning("PUBG stats creation failed - no JSON data provided")
        return jsonify({'error': 'Request must be JSON'}), 400
    
    # Pydantic validation
    try:
        pubg_data = PubgBaseSchema(**data)
    except Exception as e:
        logger.warning(f"PUBG stats validation failed: {str(e)}")
        return jsonify({'error': str(e)}), 400
    
    in_game_id = data.get('in_game_id')
    # Check if in_game_id already exists
    existing_stats = PubgPlayerStats.query.filter_by(in_game_id=in_game_id).first()
    if existing_stats:
        logger.warning(f"PUBG stats creation failed - in_game_id already exists: {in_game_id}")
        return jsonify({'error': 'A portfolio with this In-Game ID already exists.'}), 400
    
    # Create new stats object
    new_stats = PubgPlayerStats()
    new_stats.user_id = user_id
    new_stats.username = data.get('username')
    new_stats.in_game_id = in_game_id
    new_stats.fd_ratio = data.get('fd_ratio', 0)
    new_stats.current_rank = data.get('current_rank', 'Gold 5')
    new_stats.highest_rank = data.get('highest_rank', 'Gold 5')
    new_stats.headshot_rate = data.get('headshot_rate', 0)
    new_stats.headshots = data.get('headshots', 0)
    new_stats.eliminations = data.get('eliminations', 0)
    new_stats.most_eliminations = data.get('most_eliminations', 0)
    new_stats.matches_played = data.get('matches_played', 0)
    new_stats.wins = data.get('wins', 0)
    new_stats.top_10 = data.get('top_10', 0)
    new_stats.avg_damage = data.get('avg_damage', 0)
    new_stats.avg_survival_time = data.get('avg_survival_time', 0)
    
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


@pubg_bp.route('/stats/<int:stats_id>', methods=['PATCH'])
@jwt_required()
def update_pubg_stats(stats_id):
    """Update an existing entry or Hidden or not provided fields by ID."""
    current_user_id = get_jwt_identity()
    logger.info(f"PUBG stats update attempt for stats_id: {stats_id} by user_id: {current_user_id}")
    
    data = request.get_json()
    if not data:
        logger.warning(f"PUBG stats update failed - no JSON data provided for stats_id: {stats_id}")
        return jsonify({'error': 'Request must be JSON'}), 400
    
    # Pydantic validation
    try:
        pubg_data = PubgBaseSchema(**data)
    except Exception as e:
        logger.warning(f"PUBG stats validation failed: {str(e)}")
        return jsonify({'error': str(e)}), 400
    
    stats = PubgPlayerStats.query.get(stats_id)
    if not stats:
        logger.warning(f"PUBG stats not found for stats_id: {stats_id}")
        return jsonify({'error': 'Stats not found'}), 404
    
    # Ensure user can only update their own stats
    if str(stats.user_id) != str(current_user_id):
        logger.warning(f"Unauthorized update attempt - user_id: {current_user_id} tried to update stats_id: {stats_id} owned by user_id: {stats.user_id}")
        return jsonify({'error': 'Unauthorized: You can only update your own stats'}), 403
    
    # Update only provided fields
    for field in ['username', 'in_game_id', 'fd_ratio', 'current_rank', 'highest_rank',
                  'headshot_rate', 'headshots', 'eliminations', 'most_eliminations',
                  'matches_played', 'wins', 'top_10', 'avg_damage',  'avg_survival_time', 'ishidden']:
        if field in data:
            setattr(stats, field, data[field])
    try:
        db.session.commit()
        logger.info(f"PUBG stats updated successfully for stats_id: {stats_id} by user_id: {current_user_id}")
    except Exception as exc:
        db.session.rollback()
        logger.error(f"Database error while updating PUBG stats for stats_id: {stats_id}")
        return jsonify({'error': 'Database error', 'details': str(exc)}), 500
    return jsonify(stats.to_dict()), 200

