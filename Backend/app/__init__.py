from flask import Flask,jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from authlib.integrations.flask_client import OAuth
from .utils.logger import setup_logging
from app.config import Config
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # loading the config file
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app)

    # setting up logging
    setup_logging(app)

    # initializing the plugins
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # importing models
    from app.models.user import User
    from app.models.valorant import ValorantProfile, TeamHistory, TournamentHistory

    # importing and registering the blueprints
    from app.routes import register_routes
    register_routes(app)


    # error handlers 
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
        "status": "error",
        "code": 404,
        "message": "The requested resource was not found on the server."
    }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
        "status": "error",
        "code": 500,
        "message": "An internal server error occurred."
    }), 500


    CORS(
    app,
    resources={r"/auth/*": {"origins": "http://localhost:3173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    return app  