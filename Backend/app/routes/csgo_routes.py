from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.csgo import CsgoPlayerStats
from app import db

csgo_bp = Blueprint('csgo_bp', __name__)

@csgo_bp.route('/stats', methods=['POST'])
@jwt_required()
def create_csgo_stats():
    """Create a new CSGO stats entry."""
    user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    # Check if in_game_id already exists
    existing_stats = CsgoPlayerStats.query.filter_by(
        in_game_id=data.get('in_game_id')
    ).first()
    if existing_stats:
        return jsonify({'error': 'A portfolio with this In-Game ID already exists.'}), 400
    
    new_stats = CsgoPlayerStats()
    new_stats.user_id = user_id
    new_stats.username = data.get('username')
    new_stats.in_game_id = data.get('in_game_id')
    
    # Rankings / ratings
    new_stats.current_rank = data.get('current_rank')
    new_stats.highest_rank = data.get('highest_rank')
    new_stats.mm_rank = data.get('mm_rank')
    new_stats.faceit_level = data.get('faceit_level')
    new_stats.elo = data.get('elo')
    
    # Combat performance
    new_stats.kd_ratio = data.get('kd_ratio', 0)
    new_stats.headshot_percentage = data.get('headshot_percentage', 0)
    new_stats.kills = data.get('kills', 0)
    new_stats.deaths = data.get('deaths', 0)
    new_stats.assists = data.get('assists', 0)
    new_stats.mvps = data.get('mvps', 0)
    
    # Match statistics
    new_stats.matches_played = data.get('matches_played', 0)
    new_stats.wins = data.get('wins', 0)
    new_stats.win_rate = data.get('win_rate', 0)
    
    # Performance averages
    new_stats.avg_damage_per_round = data.get('avg_damage_per_round', 0)
    new_stats.avg_kills_per_round = data.get('avg_kills_per_round', 0)
    new_stats.rounds_played = data.get('rounds_played', 0)
    
    # Utility / objective
    new_stats.bomb_plants = data.get('bomb_plants', 0)
    new_stats.bomb_defuses = data.get('bomb_defuses', 0)
    new_stats.flash_assists = data.get('flash_assists', 0)
    
    try:
        db.session.add(new_stats)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(exc)}), 500
    
    return jsonify(new_stats.to_dict()), 201


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
        return jsonify({'error': 'Stats not found'}), 404
    return jsonify(stats.to_dict()), 200


@csgo_bp.route('/stats/<int:stats_id>', methods=['PATCH'])
@jwt_required()
def update_csgo_stats(stats_id):
    """Update an existing CSGO stats entry or hide/unhide it."""
    current_user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    stats = CsgoPlayerStats.query.get(stats_id)
    if not stats:
        return jsonify({'error': 'Stats not found'}), 404
    
    # Ensure user owns this stats entry
    if str(stats.user_id) != str(current_user_id):
        return jsonify({'error': 'Unauthorized: You can only update your own stats'}), 403
    
    updatable_fields = [
        'username', 'in_game_id',
        'current_rank', 'highest_rank', 'mm_rank',
        'faceit_level', 'elo',
        'kd_ratio', 'headshot_percentage',
        'kills', 'deaths', 'assists', 'mvps',
        'matches_played', 'wins', 'win_rate',
        'avg_damage_per_round', 'avg_kills_per_round',
        'rounds_played',
        'bomb_plants', 'bomb_defuses', 'flash_assists',
        'ishidden'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(stats, field, data[field])
    
    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(exc)}), 500
    
    return jsonify(stats.to_dict()), 200
