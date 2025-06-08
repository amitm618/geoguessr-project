from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String, Boolean
from app.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import pytz


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    provider = Column(String, default="local")
    google_id = Column(String, nullable=True)




class GameHistory(Base):
    __tablename__ = "game_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    distance_km = Column(Float)
    points = Column(Integer)
    guess_lat = Column(Float)
    guess_lng = Column(Float)
    actual_lat = Column(Float)
    actual_lng = Column(Float)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(pytz.timezone("Asia/Jerusalem")),
        nullable=False,
    )
    is_visible = Column(Boolean, default=True)  # 👈 Add this line

    user = relationship("User", backref="game_history")
