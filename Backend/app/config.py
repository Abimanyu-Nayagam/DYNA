import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

class Config:
    DB_USER = os.getenv('MYSQL_USER', 'root')
    DB_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
    DB_NAME = os.getenv('DB_NAME')
    DB_PORT = os.getenv('DB_PORT', '3306')
    
    # URL-encode password to handle special characters like @
    encoded_password = quote_plus(DB_PASSWORD)
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY','secret-key')
    LOG_FILE = os.getenv('LOG_FILE')
    LOG_LEVEL='INFO'