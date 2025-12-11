from app.config import Config
from flask import Flask,jsonify
from .utils.logger import setup_logging
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
 
    # loading the config file
    app.config.from_object(Config)
  
    # setting up logging
    setup_logging(app)
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # importing models for migrations
    from app.models.user import User

    # importing and registering the blueprints
    from app.routes import register_routes
    register_routes(app)
    return app