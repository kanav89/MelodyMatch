import base64
import os
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, EmailStr

load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_uri = "http://127.0.0.1:8000/callback"

app = FastAPI()

# Password hashing context


class SongRecommendation:
    def __init__(self, artist_na, artist_na2, genre, mood):
        self.client_id = client_id
        self.client_secret = client_secret
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
        result = requests.post(url, headers=headers, data=data)
        result.raise_for_status()
        json_result = result.json()
        self.token = json_result["access_token"]
        return self.token

    def set_access_token(self, access_token):
        self.token = access_token

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
        result = requests.get(url, headers=header)
        result.raise_for_status()
        json_result = result.json()["artists"]["items"]
        if not json_result:
            return None
        return json_result[0]

    def get_recommendations(
        self, artist_id, seed_genre, min_valence, max_valence, min_danceability, max_danceability
    ):
        url = (
            f"https://api.spotify.com/v1/recommendations?limit=20&seed_artists={artist_id}"
            f"&seed_genres={seed_genre}&min_valence={min_valence}&max_valence={max_valence}"
            f"&min_danceability={min_danceability}&max_danceability={max_danceability}&market=IN"
        )
        header = self.get_auth_header()
        result = requests.get(url, headers=header)
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
                "track": track["name"],
                "artist": track["artists"][0]["name"],
                "link": track["album"]["external_urls"]["spotify"],
            }
            for track in songs["tracks"]
        ]
        return JSONResponse(content=result)
    except HTTPException as e:
        return JSONResponse(content={"error": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/login")
async def login():
    return RedirectResponse(
        f"https://accounts.spotify.com/authorize?client_id={client_id}&response_type=code&redirect_uri={redirect_uri}",
        status_code=302,
    )


@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")

    auth_options = {
        "url": "https://accounts.spotify.com/api/token",
        "data": {
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic "
            + base64.b64encode(f"{client_id}:{client_secret}".encode()).decode(),
        },
    }

    response = requests.post(
        auth_options["url"], data=auth_options["data"], headers=auth_options["headers"]
    )

    if response.status_code == 200:
        body = response.json()
        access_token = body["access_token"]
        refresh_token = body["refresh_token"]
        print(access_token)
        response = RedirectResponse(url=f"http://127.0.0.1:3000/form?access_token={access_token}")
        response.set_cookie(key="access_token", value=access_token, httponly=True)
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
        return response
    else:
        return {"error": "Failed to get token"}
