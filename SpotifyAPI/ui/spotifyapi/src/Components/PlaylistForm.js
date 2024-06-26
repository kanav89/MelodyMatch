import React, { useState, useEffect } from "react";
import { Dropdown, TextInput, Button, Label } from "flowbite-react";
import { useLocation } from "react-router-dom";

function PlaylistForm() {
  const [artist_na, setArtist_na] = useState("");
  const [artist_na2, setArtist_na2] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [fetchedData, setFetchedData] = useState([]);
  const [showList, setShowList] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("access_token");

    if (accessToken) {
      console.log("Access Token:", accessToken);
      localStorage.setItem("access_token", accessToken);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Loading...");

    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken) {
      console.error("Access token or refresh token not found");
      return;
    }

    const apiUrl = `/recommendations?artist_na=${artist_na}&artist_na2=${artist_na2}&genre=${genre}&mood=${mood}`;
    console.log("API URL:", apiUrl);

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        alert(`HTTP error Status: ${res.status}`);
        return;
      }

      const data = await res.json();
      console.log("Data:", data);
      setFetchedData(data);
      setShowList(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#1DB954] to-[#191414] px-4 py-12 md:px-6 lg:py-18">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-6 text-center">
        <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl">
          Curate your own playlist!
        </h1>
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
          <div className="flex flex-col items-center justify-content">
            <Label htmlFor="mood" className="text-white">
              Your Mood
            </Label>
            <div className="">
              <Dropdown
                className="bg-white"
                size="lg"
                pill
                label="Select your mood"
                onSelect={(value) => setMood(value)}
                color="light"
              >
                <Dropdown.Item value="happy">Happy</Dropdown.Item>
                <Dropdown.Item value="sad">Sad</Dropdown.Item>
                <Dropdown.Item value="energetic">Energetic</Dropdown.Item>
                <Dropdown.Item value="relaxed">Relaxed</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
          <div>
            <Label htmlFor="genre" className="text-white">
              Favorite Genre
            </Label>
            <div className="flex flex-col items-center justify-content">
              <Dropdown
                color="light"
                size="lg"
                pill
                label="Select your favorite genre"
                onSelect={(value) => setGenre(value)}
              >
                <Dropdown.Item value="pop">Pop</Dropdown.Item>
                <Dropdown.Item value="rock">Rock</Dropdown.Item>
                <Dropdown.Item value="hip-hop">Hip-Hop</Dropdown.Item>
                <Dropdown.Item value="electronic">Electronic</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
          <div>
            <Button
              color="light"
              type="submit"
              variant="outline"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-lg font-medium text-[#191414] transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <AirplayIcon className="mr-2 h-6 w-6" />
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
          {/* <Button className="mt-4">Save Playlist</Button> */}
        </div>
      )}
    </main>
  );
}

function AirplayIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
      <path d="m12 15 5 6H7Z" />
    </svg>
  );
}

export default PlaylistForm;
