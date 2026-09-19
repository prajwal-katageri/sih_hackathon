import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'urbantwin-sih2026-secret-key')
    # PostgreSQL connection string: postgresql://username:password@localhost:5432/urbantwin
    # Fallback to local SQLite database if PostgreSQL URI is not set
    POSTGRES_URI = os.getenv('POSTGRES_URI') or os.getenv('DATABASE_URL')
    
    if POSTGRES_URI:
        SQLALCHEMY_DATABASE_URI = POSTGRES_URI
    else:
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'urbantwin.db')}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
