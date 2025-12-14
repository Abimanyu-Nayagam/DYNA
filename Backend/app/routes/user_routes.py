from flask import Blueprint, jsonify
from app.models import User, ValorantProfile
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


@user_bp.route('/<user_name>', methods=['GET'])
def get_public_user_profile(user_name):
    try:
        user = User.query.filter_by(user_name=user_name).first()
        if not user:
            return error_response("User not found", 404)

        # Build base DYNA profile
        profile_data = {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "games": {}
        }

        valorant = ValorantProfile.query.filter_by(
            user_id=user.user_id,
            is_public=True
        ).first()

        if valorant:
            profile_data["games"]["valorant"] = valorant.to_dict()

        return success_response(profile_data, "User profile retrieved successfully")

    except Exception as e:
        logger.error(f"Error fetching public profile for {user_name}: {str(e)}")
        return error_response(f"Failed to load profile: {str(e)}", 500)