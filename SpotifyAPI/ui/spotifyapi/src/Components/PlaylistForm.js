import React, { useState, useEffect } from "react";
import { TextInput, Button, Label, Alert } from "flowbite-react";

function PlaylistForm() {
  const [artist_na, setArtist_na] = useState("");
  const [artist_na2, setArtist_na2] = useState("");
  const [genre, setGenre] = useState(""); // Store the selected genre value
  const [mood, setMood] = useState("");
  const [fetchedData, setFetchedData] = useState([]);
  const [showList, setShowList] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [uri, seturi] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (accessToken && refreshToken) {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      startTokenRefreshTimer();
    }
  }, []);

  useEffect(() => {
    if (refreshToken) {
      startTokenRefreshTimer();
    }
  }, [refreshToken]);

  const startTokenRefreshTimer = () => {
    setInterval(() => {
      handleTokenRefresh();
    }, 1000 * 60 * 30); // Refresh every 30 minutes
  };

  const handleTokenRefresh = async () => {
    const params = new URLSearchParams(window.location.search);
    const refreshToken = params.get("refresh_token");
    console.log("Refresh Token", refreshToken);
    try {
      const res = await fetch(`/refresh-token?refresh_token=${refreshToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Refresh-Token": refreshToken,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to refresh access token");
      }
      const data = await res.json();
      setAccessToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Handle token refresh error here (e.g., logout user, show error message)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Loading...");
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    console.log("Refresh Token", refreshToken);
    console.log("Access Token", accessToken);

    const apiUrl = `/recommendations?artist_na=${artist_na}&artist_na2=${artist_na2}&genre=${genre}&mood=${mood}&access_token=${accessToken}`;

    try {
      console.log("one");
      const res = await fetch(apiUrl, {
        method: "Get",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Refresh-Token": refreshToken,
        },
      });
      console.log("two");
      // if (!res.ok) {
      //   alert("error");

      //   if (res.status === 401) {
      //     // Redirect to homepage if 401 error occurs
      //     window.location.href = "/";
      //     return;
      //   }
      //   alert("error2");

      //   console.log("two");
      //   return;
      // }
      // const uri = [];
      // const data = await res.json();
      // console.log("two");
      // console.log("Data:", data);
      // console.log("three");
      // for (let i = 0; i < data.length; i++) {
      //   uri.push(data[i].uri);
      // }
      // console.log("two");
      // console.log(uri);
      // console.log("two");
      // seturi(uri);
      // console.log("two");
      // setFetchedData(data);
      // console.log("two");
      // setShowList(true); // Display the list
      // console.log("two");
    } catch (error) {
      console.log("hi");

      console.error("Error fetching data:", error);
    }
  };
  const savePlaylist = async () => {
    try {
      const response = await fetch(
        `/save?artist_na=${artist_na}&artist_na2=${artist_na2}&genre=${genre}&mood=${mood}&access_token=${accessToken}&uri=${uri}`
      );
      if (!response.ok) {
        <Alert color="failure" onDismiss={() => alert("Alert dismissed!")}>
          <span className="font-medium">Check all fields!</span>
        </Alert>;
        console.log("Failed to save playlist item");
      }
      console.log("hi");
      <Alert color="warning" rounded>
        <span className="font-medium">Info alert!</span> Change a few things up
        and try submitting again.
      </Alert>;
    } catch (error) {
      console.error("Error saving playlist:", error);
      alert("Failed to save playlist items");
    }
  };
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#1DB954] to-[#191414] px-4 py-12 md:px-6 lg:py-18">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-6 text-center">
        <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl">
          Curate your own playlist!
        </h1>
        <Button onClick={handleTokenRefresh} />
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="artist1" className="text-white">
                Artist 1
              </Label>
              <TextInput
                pill
                id="artist1"
                type="text"
                onChange={(e) => setArtist_na(e.target.value)}
                placeholder="Enter artist name"
                className=""
              />
            </div>
            <div>
              <Label htmlFor="artist2" className="text-white">
                Artist 2
              </Label>
              <TextInput
                pill
                id="artist2"
                onChange={(e) => setArtist_na2(e.target.value)}
                type="text"
                placeholder="Enter artist name"
                className=""
              />
            </div>
          </div>
          <div>
            <Label htmlFor="mood" className="text-white">
              Current mood
            </Label>
            <div className="flex flex-col items-center justify-content">
              <select
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 mt-1 block w-full"
              >
                <option value="">Select a mood</option>
                <option value="pop">Happy</option>
                <option value="rock">Sad</option>
                <option value="hip-hop">Dance</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="genre" className="text-white">
              Favorite Genre
            </Label>
            <div className="flex flex-col items-center justify-content">
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 mt-1 block w-full"
              >
                <option value="">Select a genre</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="hip-hop">Hip-Hop</option>
                <option value="electronic">Electronic</option>
              </select>
            </div>
          </div>
          <div>
            <Button
              color="light"
              type="submit"
              variant="outline"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-lg font-medium text-[#191414] transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Generate Playlist
            </Button>
          </div>
        </form>
      </div>

      {showList && (
        <div className="mt-12 w-full max-w-3xl space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {fetchedData.map((item, index) => (
              <div key={index} className="relative group">
                <a
                  href={item.link}
                  target="_blank"
                  className="absolute inset-0 z-10"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Listen on Spotify</span>
                </a>
                <div className="flex h-full flex-col items-center justify-center rounded-lg bg-white p-4 text-center transition-colors group-hover:bg-gray-200">
                  <div className="text-2xl font-bold text-[#191414]">
                    {item.track}
                  </div>
                  <div className="text-lg text-[#1DB954]">{item.artist}</div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={savePlaylist} className="mt-4" pill>
            Save Playlist
          </Button>
        </div>
      )}
    </main>
  );
}

export default PlaylistForm;
