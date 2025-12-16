import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from urllib.parse import quote_plus

load_dotenv()

class Config:
    DB_USER = os.getenv('MYSQL_USER')
    DB_PASSWORD = os.getenv('MYSQL_PASSWORD')
    DB_HOST = os.getenv('MYSQL_HOST')
    DB_NAME = os.getenv('MYSQL_DB')
    DB_PORT = os.getenv('MYSQL_PORT')
    
    # URL-encode password to handle special characters like @
    encoded_password = quote_plus(DB_PASSWORD)
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY','secret-key')
