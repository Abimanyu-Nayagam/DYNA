from flask import Blueprint, request, jsonify,url_for, redirect
from flask_jwt_extended import get_jwt_identity, jwt_required
from app import db,bcrypt
from app.models import User
from app.schema.auth_schema import SignUpSchema,LoginSchema
from app.utils.response import success_response, error_response
from pydantic import ValidationError
from app.utils.jwtUtil import generate_jwt
import logging
import json
from urllib.parse import urlencode
from app.utils.clerk import create_clerk_user, verify_clerk_login
auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    # Check if already exists in DB
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "User already exists"}), 409

    try:
        clerk_response = create_clerk_user(email, password, name)
        
        clerk_user = clerk_response.get("json", {})  
        clerk_user_id = clerk_user.get("id") 
        
        if not clerk_user_id:
            return jsonify({
                "error": "Failed to create Clerk user",
                "details": clerk_response
            }), 400

        # Save to DB
        user = User(
            name=name,
            email=email,
            provider="clerk",
            provider_id=clerk_user_id
        )
        db.session.add(user)
        db.session.commit()

        token = generate_jwt(str(user.user_id))

        return jsonify({
            "message": "Signup successful",
            "token": token,
            "user": {
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()  
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    # Validate input
    try:
        data = LoginSchema(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    email = data.email
    password = data.password

    try:
        # ---- Clerk Login ----
        clerk_result = verify_clerk_login(email, password)

        # Extract Clerk user ID correctly
        clerk_json = clerk_result.get("json", {})
        clerk_user_id = clerk_result.get("user_id")

        if not clerk_user_id:
            return jsonify({
                "error": "Clerk login succeeded but no user_id returned",
                "clerk_response": clerk_result
            }), 400

        # ---- Sync with your DB ----
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                name=email.split("@")[0],
                email=email,
                provider="clerk",
                provider_id=clerk_user_id
            )
            db.session.add(user)
            db.session.commit()

        # ---- Generate Your Own JWT ----
        token = generate_jwt(str(user.user_id))

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "provider": user.provider
            }
        }), 200

    except Exception as e:
        # Always return full details for debugging
        return jsonify({"error": str(e)}), 400

