import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

class Config:
    MYSQL_USER = os.getenv('DB_USER', 'root')
    MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '')
    MYSQL_HOST = os.getenv('DB_HOST', 'localhost')
    MYSQL_DB = os.getenv('DB_NAME', 'dyna')
    MYSQL_PORT = os.getenv('DB_PORT', '3306')

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
        )
    # SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY','secret-key')
    LOG_FILE = os.getenv('LOG_FILE')
    LOG_LEVEL='INFO'
