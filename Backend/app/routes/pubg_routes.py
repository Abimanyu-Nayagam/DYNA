from flask import Blueprint, request, jsonify
from app.models.pubg import PubgPlayerStats
from app import db

pubg_bp = Blueprint('pubg_bp', __name__)

@pubg_bp.route('/stats', methods=['POST'])
# @jwt_required()
def create_pubg_stats():
    """Create a new PUBG stats entry."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request must be JSON'}), 400 
    
    # Create new stats object
    new_stats = PubgPlayerStats()
    new_stats.user_id = data.get('user_id')
    new_stats.username = data.get('username')
    new_stats.in_game_id = data.get('in_game_id')
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
    except Exception as exc: 
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(exc)}), 500

    return jsonify(new_stats.to_dict()), 201

@pubg_bp.route('/', methods=['GET'])
# @jwt_required()
def get_pubg_stats():
    """Retrieve all PUBG players Stats."""
    stats_list = PubgPlayerStats.query.all()
    return jsonify([stats.to_dict() for stats in stats_list]), 200

@pubg_bp.route('/stats/<int:user_id>', methods=['GET'])
# @jwt_required()
def get_pubg_stats_by_user(user_id):
    """Retrieve PUBG stats by user ID."""
    stats = PubgPlayerStats.query.filter_by(user_id=user_id).first()
    if not stats:
        return jsonify({'error': 'Stats not found'}), 404
    return jsonify(stats.to_dict()), 200


@pubg_bp.route('/stats/<int:stats_id>', methods=['PATCH'])
# @jwt_required()
def update_pubg_stats(stats_id):
    """Update an existing entry or Hidden or not provided fields by ID."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request must be JSON'}), 400
    stats = PubgPlayerStats.query.get(stats_id)
    if not stats:
        return jsonify({'error': 'Stats not found'}), 404
    # Update only provided fields
    for field in ['username', 'in_game_id', 'fd_ratio', 'current_rank', 'highest_rank',
                  'headshot_rate', 'headshots', 'eliminations', 'most_eliminations',
                  'matches_played', 'wins', 'top_10', 'avg_damage',  'avg_survival_time', 'ishidden']:
        if field in data:
            setattr(stats, field, data[field])
    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(exc)}), 500
    return jsonify(stats.to_dict()), 200

