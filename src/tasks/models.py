from sqlalchemy import Column, String, Integer, Boolean
from src.utils.db import Base

class TaskModel(Base):
    __tablename__ = "New_Task_App"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    is_completed = Column(Boolean, default=False)