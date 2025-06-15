from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class GameResult(BaseModel):
    distance_km: float
    points: int
    guess_lat: float
    guess_lng: float
    actual_lat: float
    actual_lng: float


class GameEntry(BaseModel):
    id: int
    distance_km: float
    points: int
    guess_lat: float
    guess_lng: float
    actual_lat: float
    actual_lng: float
    created_at: datetime

    class Config:
        orm_mode = True


class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str

class SetPasswordRequest(BaseModel):
        new_password: str