from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker, declarative_base
from src.utils.settings import Settings
import os

DATABASE_URL = os.getenv("DB_CONNECTION", Settings.DB_CONNECTION)

Base = declarative_base()

engine = create_engine(url=DATABASE_URL)

Session = sessionmaker(bind=engine)


def get_db():
    session = Session()

    try:
        yield session
    finally:
        session.close()