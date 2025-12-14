import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

class Config:

    LOG_FILE = os.getenv('LOG_FILE',"logs/app.log")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # DB_USER = os.getenv('DB_USER')
    # DB_PASSWORD = os.getenv('DB_PASSWORD')
    # DB_HOST = os.getenv('DB_HOST')
    # DB_NAME = os.getenv('DB_NAME')
    # DB_PORT = os.getenv('DB_PORT', '3306')

    # encoded_password = quote_plus(DB_PASSWORD)
    # SQLALCHEMY_DATABASE_URI = (
    #     f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    #     )


    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY','secret-key')
