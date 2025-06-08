from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from app.locations import get_random_location_from_map
from app.database import Base, engine
from app.models import User, GameHistory
from app.schemas import UserCreate, UserLogin, Token, GameResult, GameEntry
from app import auth
from authlib.integrations.starlette_client import OAuth
from app.auth import get_db

from starlette.config import Config

import os
from dotenv import load_dotenv

# Choose which .env file to load
env = os.getenv("ENV", "local")  # default to 'local'
dotenv_file = f".env.{env}"
load_dotenv(dotenv_file)


#OAuth 2.0 Credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") #
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "some-default-key")
)

Base.metadata.create_all(bind=engine)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

@app.get("/random-location")
def get_random_location(map: str = Query("all")):
    try:
        location = get_random_location_from_map(map)
        return location
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/streetview")
def get_street_view(lat: float, lng: float):
    base_url = "https://maps.googleapis.com/maps/api/streetview"
    size = "640x400"
    fov = 90
    heading = 235
    pitch = 10

    image_url = (
        f"{base_url}?size={size}"
        f"&location={lat},{lng}"
        f"&fov={fov}&heading={heading}&pitch={pitch}"
        f"&key={GOOGLE_API_KEY}"
    )
    return {"image_url": image_url}

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(auth.get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = auth.create_user(db, user.email, user.password)
    token = auth.create_access_token({"sub": new_user.email})
    return {"access_token": token}

@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(auth.get_db)):
    auth_user = auth.authenticate_user(db, user.email, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": auth_user.email})
    return {"access_token": token}

@app.post("/submit-score")
def submit_score(
    result: GameResult,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    game = GameHistory(
        user_id=current_user.id,
        distance_km=result.distance_km,
        points=result.points,
        guess_lat=result.guess_lat,
        guess_lng=result.guess_lng,
        actual_lat=result.actual_lat,
        actual_lng=result.actual_lng,
    )
    db.add(game)
    db.commit()
    return {"message": "Score saved successfully!"}

@app.get("/me/history", response_model=List[GameEntry])
def get_history(
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    return (
        db.query(GameHistory)
        .filter(
            GameHistory.user_id == current_user.id,
            GameHistory.is_visible == True
        )
        .order_by(GameHistory.created_at.desc())
        .all()
    )

@app.put("/me/history/{entry_id}/hide")
def hide_history_entry(
    entry_id: int,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    entry = (
        db.query(GameHistory)
        .filter(GameHistory.id == entry_id, GameHistory.user_id == current_user.id)
        .first()
    )

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    entry.is_visible = False
    db.commit()
    return {"message": "Entry hidden successfully"}

@app.put("/me/history/reset")
def reset_all_history(
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    updated = (
        db.query(GameHistory)
        .filter(
            GameHistory.user_id == current_user.id,
            GameHistory.is_visible == True
        )
        .update({"is_visible": False})
    )
    db.commit()
    return {"message": f"{updated} entries hidden"}


config = Config(".env")

oauth = OAuth(config)
oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    access_token_url="https://oauth2.googleapis.com/token",
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params={"access_type": "offline", "prompt": "consent"},
    api_base_url="https://www.googleapis.com/oauth2/v1/",
    client_kwargs={"scope": "email profile"}  # 🔥 FIXED: no 'openid'
)

@app.get("/auth/google/login")
async def login_with_google(request: Request):
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)

@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(auth.get_db)):
    token = await oauth.google.authorize_access_token(request)
    resp = await oauth.google.get("userinfo", token=token)
    user_info = resp.json()

    email = user_info.get("email")
    google_id = user_info.get("id")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Invalid user info from Google")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, google_id=google_id, provider="google")
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = auth.create_access_token({"sub": email})
    return RedirectResponse(f"http://localhost:3000?token={jwt_token}")


@app.get("/me/stats")
def get_personal_stats(
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    entries = (
        db.query(GameHistory)
        .filter(GameHistory.user_id == current_user.id, GameHistory.is_visible == True)
        .all()
    )
    if not entries:
        return {}

    total_games = len(entries)
    total_points = sum(entry.points for entry in entries)
    avg_points = total_points / total_games
    total_distance = sum(entry.distance_km for entry in entries)
    avg_distance = total_distance / total_games

    return {
        "total_games": total_games,
        "avg_points": round(avg_points, 2),
        "avg_distance": round(avg_distance, 2)
    }

@app.get("/stats/global")
@app.get("/stats/global")
def get_global_stats(db: Session = Depends(auth.get_db)):
    entries = db.query(GameHistory).filter(GameHistory.is_visible == True).all()
    users = db.query(User).all()

    if not entries or not users:
        return {}

    total_games = len(entries)
    total_points = sum(entry.points for entry in entries)
    avg_points = total_points / total_games
    total_distance = sum(entry.distance_km for entry in entries)
    avg_distance = total_distance / total_games
    avg_games_per_user = total_games / len(users)

    return {
        "total_games": total_games,
        "avg_points": round(avg_points, 2),
        "avg_distance": round(avg_distance, 2),
        "avg_games_per_user": round(avg_games_per_user, 2)
    }


class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str

@app.put("/me/password")
def update_password(
    data: PasswordUpdateRequest,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user),
):
    # 🔐 Prevent password update if user has no password set (e.g., signed up with Google)
    if not current_user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="You don't have a password set. Use 'Set Password' instead.",
        )

    # ✅ Verify current password
    if not auth.verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # 🔁 Hash and update new password
    current_user.password_hash = auth.get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}
class SetPasswordRequest(BaseModel):
    new_password: str

@app.post("/me/password/set")
def set_password(
    data: SetPasswordRequest,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    if current_user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="You already have a password. Use the update form instead."
        )

    current_user.password_hash = auth.get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password set successfully"}

@app.get("/me")
def get_me(current_user: User = Depends(auth.get_current_user)):
    return {
        "email": current_user.email,
        "has_password": bool(current_user.password_hash)
    }

@app.get("/users/search")
def search_users(q: str, db: Session = Depends(auth.get_db)):
    users = db.query(User).filter(User.email.ilike(f"%{q}%")).all()
    return [{"id": user.id, "email": user.email} for user in users]


#This section - adding the user search functionality
@app.get("/user/{username}")
def get_user_info(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email}
@app.get("/user/{user_id}/stats")
def public_user_stats(user_id: int, db: Session = Depends(get_db)):
    entries = db.query(GameHistory).filter(GameHistory.user_id == user_id, GameHistory.is_visible == True).all()
    if not entries:
        return {}

    total_games = len(entries)
    total_points = sum(entry.points for entry in entries)
    avg_points = total_points / total_games
    total_distance = sum(entry.distance_km for entry in entries)
    avg_distance = total_distance / total_games

    return {
        "total_games": total_games,
        "avg_points": round(avg_points, 2),
        "avg_distance": round(avg_distance, 2)
    }

@app.get("/user/{user_id}/history", response_model=List[GameEntry])
def public_user_history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(GameHistory)
        .filter(GameHistory.user_id == user_id, GameHistory.is_visible == True)
        .order_by(GameHistory.created_at.desc())
        .all()
    )
