from app.config import Config
from flask import Flask,jsonify
from .utils.logger import setup_logging

def create_app():
    app = Flask(__name__)
 
    # loading the config file
    app.config.from_object(Config)

    # setting up logging
    setup_logging(app)

    # importing models for migrations
    from app.models.user import User
    from app.models.task import Task

    # importing and registering the blueprints
    from app.routes import register_routes
    register_routes(app)