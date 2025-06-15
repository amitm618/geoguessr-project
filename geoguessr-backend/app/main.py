
import os
from typing import List

from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware

from app import auth
from app.auth import get_db
from app.database import Base, engine
from app.locations import get_random_location_from_map
from app.models import User, GameHistory
from app.schemas import UserCreate, UserLogin, Token, GameResult, GameEntry, PasswordUpdateRequest, SetPasswordRequest

# Choose which .env file to load
env = os.getenv("ENV", "local")  # default to 'local'
dotenv_file = f".env.{env}"
load_dotenv(dotenv_file)


#create FastAPI app
app = FastAPI()

#Adds CORS middleware to allow requests from any origin (used by front)
app.add_middleware(
    CORSMiddleware,   # type: ignore[arg-type]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Enables session support (cookies, used by authlib for OAuth)
app.add_middleware(
    SessionMiddleware, # type: ignore[arg-type]
    secret_key=os.getenv("SECRET_KEY", "some-default-key")
)

#Create DBs from app.models, if they don't already exit
Base.metadata.create_all(bind=engine)

#Google API key that's stored in my ENV file
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


#OAuth2:

#OAuth 2.0 Credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") #
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

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
    client_kwargs={"scope": "email profile"}
)

# Redirects the user to Google's OAuth 2.0 login page
@app.get("/auth/google/login")
async def login_with_google(request: Request):
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)

# Handles Google's OAuth callback, retrieves user info, creates user if needed, and returns a JWT
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

# Registers a new user, hashes their password, and returns a JWT token
@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(auth.get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered") #409 = client
    new_user = auth.create_user(db, user.email, user.password)
    token = auth.create_access_token({"sub": new_user.email})
    return {"access_token": token}

'''
another register version (one call instead of two)
try:
    new_user = auth.create_user(db, user.email, user.password)
    token = auth.create_access_token({"sub": new_user.email})
    return {"access_token": token}
except IntegrityError:
    raise HTTPException(status_code=409, detail="Email already registered")
'''



# Authenticates user credentials and returns a JWT token if valid
@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(auth.get_db)):
    auth_user = auth.authenticate_user(db, user.email, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials") #401 = unauthorized
    token = auth.create_access_token({"sub": auth_user.email})
    return {"access_token": token}

# Returns a random location from the selected map (default: all)
@app.get("/random-location")
def get_random_location(map: str = Query("all")):
    try:
        location = get_random_location_from_map(map)
        return location
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) #400 = bad request

# Returns a Google Street View image URL for given coordinates
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


# Saves a user's game result to the database (protected route)
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

# Returns all visible game entries for the current user, sorted newest to oldest
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

# Hides a specific game entry belonging to the current user
@app.put("/me/history/{entry_id}/hide")
def hide_history_entry(
    entry_id: int,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    entry = db.query(GameHistory).filter(GameHistory.id == entry_id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found") #404 = not found

    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to hide this entry")
#403 = forbidden
    entry.is_visible = False
    db.commit()
    return {"message": "Entry hidden successfully"}


# Hides all visible game entries for the current user
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



# Returns personal stats (total games, avg points/distance) for the current user
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

# Returns aggregated game stats across all users (public route)
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



# Updates the current user's password after verifying the current one
@app.put("/me/password")
def update_password(
    data: PasswordUpdateRequest,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user),
):
    #Prevent password update if user has no password set (when signing up with Google)
    if not current_user.password_hash:
        raise HTTPException(
            status_code=409, #409 - client
            detail="You don't have a password set. Use 'Set Password' instead.",
        )

    #Verify current password
    if not auth.verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # 🔁 Hash and update new password
    current_user.password_hash = auth.get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}

#Allows Google users to set a password if they don't already have one
@app.post("/me/password/set")
def set_password(
    data: SetPasswordRequest,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user)
):
    if current_user.password_hash:
        raise HTTPException(
            status_code=409, #409 = client
            detail="You already have a password. Use the update form instead."
        )

    current_user.password_hash = auth.get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password set successfully"}

#Returns basic account info (email and password status) for the current user
@app.get("/me")
def get_me(current_user: User = Depends(auth.get_current_user)):
    return {
        "email": current_user.email,
        "has_password": bool(current_user.password_hash)
    }

#Searches for users by partial email and returns matching user IDs and emails
@app.get("/users/search")
def search_users(q: str, db: Session = Depends(auth.get_db)):
    users = db.query(User).filter(User.email.ilike(f"%{q}%")).all()
    return [{"id": user.id, "email": user.email} for user in users]


#This section - adding the user search functionality

#Returns basic info for a user by their email (used to fetch ID from username)
@app.get("/user/{username}")
def get_user_info(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email}
@app.get("/user/{user_id}/stats")

#Returns public stats (total games, avg points/distance) for a given user ID
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
# Returns visible game history entries for a given user ID, newest first
@app.get("/user/{user_id}/history", response_model=List[GameEntry])
def public_user_history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(GameHistory)
        .filter(GameHistory.user_id == user_id, GameHistory.is_visible == True)
        .order_by(GameHistory.created_at.desc())
        .all()
    )
