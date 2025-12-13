from flask import Blueprint, jsonify
from app.models.user import User
from app.utils.response import success_response, error_response
import logging

user_bp = Blueprint('user', __name__)
logger = logging.getLogger(__name__)

@user_bp.route('/players', methods=['GET'])
def get_all_users():
    """Get all users/players"""
    logger.info("Fetching all users")
    try:
        users = User.query.all()
        
        # Convert users to dictionary format
        users_data = []
        for user in users:
            users_data.append({
                'user_id': user.user_id,
                'user_name': user.user_name,
                'email': user.email,
                'provider': user.provider,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'updated_at': user.updated_at.isoformat() if user.updated_at else None
            })
        
        logger.info(f"Successfully fetched {len(users_data)} users")
        return success_response(users_data, "Users fetched successfully")
    
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return error_response(f"Failed to fetch users: {str(e)}", 500)
