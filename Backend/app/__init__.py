from app.config import Config
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from .utils.logger import setup_logging

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
 
    # loading the config file
    app.config.from_object(Config)

    # Initialize extensions with app
    db.init_app(app)
    bcrypt.init_app(app)

    # setting up logging
    setup_logging(app)

    # Create tables within app context
    with app.app_context():
        # importing models for migrations
        from app.models.user import User
        from app.models.pubg import PubgPlayerStats
        
        # Create all tables
        db.create_all()

    # importing and registering the blueprints
    from app.routes import register_routes
    register_routes(app)
    
    return app