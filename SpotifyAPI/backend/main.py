import base64
import os
from typing import Optional
from urllib.parse import urlencode

import requests
from decouple import config

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_uri = config("REDIRECT_URI")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    def refresh_token(self, refresh_token):
        url = "https://accounts.spotify.com/api/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret,
        }
        print(1)
        print(refresh_token)
        response = requests.post(url, headers=headers, data=data)

        json_response = response.json()
        print(json_response)
        self.token = json_response["access_token"]
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

    def add_tracks_to_playlist(self, track_uris: list):
        headers = self.get_auth_header()
        headers["Content-Type"] = "application/json"

        url1 = "https://api.spotify.com/v1/me"
        res = requests.get(url1, headers=headers)
        res.raise_for_status()
        user_id = res.json()["id"]

        url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
        data = {"name": "MelodyMatch"}
        response = requests.post(url, headers=headers, json=data)
        print(response.json)
        try:
            response.raise_for_status()
        except requests.HTTPError as e:
            print(f"Error creating playlist: {e}")
            print(response.json())
            return {"error": "Failed to create playlist"}

        playlist_id = response.json()["id"]

        url2 = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        track_uris = {"uris": track_uris}
        dat = requests.post(url2, headers=headers, json=track_uris)
        try:
            dat.raise_for_status()
        except requests.HTTPError as e:
            print(f"Error adding tracks to playlist: {e}")
            print(dat.json())
            return {"error": "Failed to add tracks to playlist"}

        return dat.json()

    def get_auth_header(self):
        return {"Authorization": "Bearer " + self.token}

    def search_for_artist(self, artist_name):
        url = f"https://api.spotify.com/v1/search?q={artist_name}&type=artist&limit=1"
        header = self.get_auth_header()
        print(header)
        result = requests.get(url, headers=header)
        print(result.json())
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
def output(
    artist_na: str,
    artist_na2: str,
    genre: str,
    mood: str,
    access_token: Optional[str] = Query(None),
):
    song_instance = SongRecommendation(artist_na, artist_na2, genre, mood)
    song_instance.set_access_token(access_token)

    try:
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
                "link": track["external_urls"]["spotify"],
                "uri": track["uri"],
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
    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "scope": "playlist-read-private playlist-modify-public",
    }
    redirect_url = f"https://accounts.spotify.com/authorize?{urlencode(params)}"
    return RedirectResponse(url=redirect_url, status_code=302)


@app.get("/callback", response_class=RedirectResponse)
async def callback(request: Request) -> RedirectResponse:
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
        print(f"Access Token : {access_token}")
        redirect_response = RedirectResponse(
            url=f"https://melodymatchapp.vercel.app/form?access_token={access_token}&refresh_token={refresh_token}"
        )

        return redirect_response
    else:
        return {"error": "Failed to get token"}


@app.get("/save")
async def save_playlist(
    artist_na: str,
    artist_na2: str,
    genre: str,
    mood: str,
    access_token: Optional[str] = Query(None),
    uri: Optional[str] = Query(None),
):
    song_instance = SongRecommendation(artist_na, artist_na2, genre, mood)
    song_instance.set_access_token(access_token)

    try:
        result = song_instance.search_for_artist(artist_na)
        result2 = song_instance.search_for_artist(artist_na2)
        if not result or not result2:
            raise HTTPException(status_code=404, detail="Artist not found")

        artist_id = f"{result['id']},{result2['id']}"
        song_instance.get_recommendations(
            artist_id,
            genre,
            song_instance.min_valence,
            song_instance.max_valence,
            song_instance.min_danceability,
            song_instance.max_danceability,
        )

        song_instance.add_tracks_to_playlist(uri.split(","))

        return JSONResponse(content={"message": "Playlist created and tracks added successfully"})

    except HTTPException as e:
        return JSONResponse(content={"error": e.detail}, status_code=e.status_code)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/refresh-token")
async def refresh_token_handler(refresh_token: str = Query(None)):
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="Refresh Token header missing")

    try:
        song_instance = SongRecommendation("", "", "", "")
        print(refresh_token)
        new_access