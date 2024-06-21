import base64
import json
import os
from typing import Annotated, List, Optional

import database
import models
import oauth2
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from requests import get, post
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

load_dotenv()

app = FastAPI()
models.Base.metadata.create_all(bind=database.engine)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PlaylistBase(BaseModel):
    name: str


class CreateUserBase(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    password: str


class TokenData(BaseModel):
    id: Optional[str] = None


class SongRecommendation:
    def __init__(self, artist_na, artist_na2, genre, mood):
        self.client_id = os.getenv("CLIENT_ID")
        self.client_secret = os.getenv("CLIENT_SECRET")
        self.artist_na = artist_na
        self.artist_na2 = artist_na2
        self.genre = genre
        self.mood = mood
        self.token = None
        self.initialize()

    def get_token(self):
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode("utf-8")
        auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

        url = "https://accounts.spotify.com/api/token"
        headers = {
            "Authorization": "Basic " + auth_base64,
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {"grant_type": "client_credentials"}
        result = post(url, headers=headers, data=data)
        result.raise_for_status()
        json_result = result.json()
        self.token = json_result["access_token"]
        return self.token

    def initialize(self):
        if self.mood == "Happy":
            self.min_valence, self.max_valence, self.min_danceability, self.max_danceability = (
                0.6,
                1,
                0.5,
                0.8,
            )
        elif self.mood == "Dance":
            self.min_valence, self.max_valence, self.min_danceability, self.max_danceability = (
                0.8,
                1,
                0.8,
                1,
            )
        elif self.mood == "Sad":
            self.min_valence, self.max_valence, self.min_danceability, self.max_danceability = (
                0.0,
                0.4,
                0.2,
                0.5,
            )
        else:
            self.min_danceability, self.min_valence, self.max_valence, self.max_danceability = (
                0,
                0,
                1,
                1,
            )

    def get_auth_header(self):
        return {"Authorization": "Bearer " + self.token}

    def search_for_artist(self, artist_name):
        url = f"https://api.spotify.com/v1/search?q={artist_name}&type=artist&limit=1"
        header = self.get_auth_header()
        result = get(url, headers=header)
        result.raise_for_status()
        json_result = result.json()["artists"]["items"]
        if not json_result:
            return None
        return json_result[0]

    def get_recommendations(
        self, artist_id, seed_genre, min_valence, max_valence, min_danceability, max_danceability
    ):
        url = f"https://api.spotify.com/v1/recommendations?limit=20&seed_artists={artist_id}&seed_genres={seed_genre}&min_valence={min_valence}&max_valence={max_valence}&min_danceability={min_danceability}&max_danceability={max_danceability}&market=IN"
        header = self.get_auth_header()
        result = get(url, headers=header)
        result.raise_for_status()
        return result.json()


@app.get("/recommendations")
def output(artist_na: str, artist_na2: str, genre: str, mood: str):
    song_instance = SongRecommendation(artist_na, artist_na2, genre, mood)

    try:
        song_instance.get_token()
        result = song_instance.search_for_artist(artist_na)
        result2 = song_instance.search_for_artist(artist_na2)
        if not result or not result2:
            raise HTTPException(status_code=404, detail="Artist not found")

        artist_id = f"{result['id']},{result2['id']}"
        songs = song_instance.get_recommendations(
            artist_id,
            genre,
            song_instance.min_valence,
            song_instance.max_valence,
            song_instance.min_danceability,
            song_instance.max_danceability,
        )
        result = [
            {
                "track": f"{idx+1}. {track['name']} by {track['artists'][0]['name']}",
                "link": track["album"]["external_urls"]["spotify"],
            }
            for idx, track in enumerate(songs["tracks"])
        ]
        return JSONResponse(content=result)
    except HTTPException as e:
        return JSONResponse(content={"error": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


db_dependency = Annotated[Session, Depends(database.get_db)]


@app.post("/save")
def save_recommendations(playlist: PlaylistBase, db: db_dependency):
    try:
        db_playlist = models.Playlist(name=playlist.name)
        db.add(db_playlist)
        db.commit()
        db.refresh(db_playlist)
        return JSONResponse(content={"message": "Playlist saved successfully"})
    except Exception as e:
        db.rollback()
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/user")
def create_user(user: CreateUserBase, db: db_dependency):
    try:
        hashed_password = pwd_context.hash(user.password)
        db_user = models.User(email=user.email, password=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return JSONResponse(content={"message": "User Created successfully"})
    except Exception as e:
        db.rollback()
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/user/{id}")
def get_user(id: int, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id: {id} does not exist")
    return user


@app.post("/login")
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    if not user:
        raise HTTPException(
            status_code=404, detail=f"User with email {user_credentials.username} does not exist"
        )
    if not pwd_context.verify(user_credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
