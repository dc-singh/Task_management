from sqlalchemy import Column, Integer, String, Boolean
from src.utils.db import Base

class UserModel(Base):
    __tablename__ = "User_table"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    username = Column(String, nullable=False)
    hash_password = Column(String, nullable=False)
    email = Column(String)

    