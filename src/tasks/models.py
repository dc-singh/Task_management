from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from src.utils.db import Base

class TaskModel(Base):
    __tablename__ = "New_Task_App"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    is_completed = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("User_table.id", ondelete="CASCADE"))