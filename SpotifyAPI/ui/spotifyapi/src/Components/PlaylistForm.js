import React, { useState } from "react";
import { Card, Dropdown, TextInput, Button } from "flowbite-react";
import { useHistory } from "react-router-dom"; // Import useHistory

function PlaylistForm() {
  const [artist_na, setArtist_na] = useState("");
  const [artist_na2, setArtist_na2] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [data, setData] = useState([]);
  const [isResult, setIsResult] = useState(false);
  const history = useHistory();
  const handleSubmit = async () => {
    setData([]);
    console.log("Loading...");
    const apiUrl = `/recommendations?artist_na=${artist_na}&artist_na2=${artist_na2}&genre=${genre}&mood=${mood}`;
    console.log("API URL:", apiUrl);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        setIsResult(false);
        alert(`HTTP error Status: ${res.status}`);
        return;
      }
      const fetchedData = await res.json();
      console.log("Data:", fetchedData);
      setData(fetchedData);
      setIsResult(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center py-20">
      <h1 className="text-2xl font-titling-gothic-fb-wide font-sans text-white font-black">
        Enter the names of your favourite artists, what genre you feel like
        listening to, and your current mood!
      </h1>
      <p className="text-lg font-titling-gothic-fb-wide font-sans text-white">
        You will have a custom playlist of 20 songs.
      </p>
      <Card className="max-w-md bg-white border-green-500 border-2">
        <form className="flex flex-col gap-4">
          <TextInput
            color="info"
            type="text"
            value={artist_na}
            onChange={(e) => setArtist_na(e.target.value)}
            placeholder="Enter artist name"
          />
          <TextInput
            color="info"
            type="text"
            value={artist_na2}
            onChange={(e) => setArtist_na2(e.target.value)}
            placeholder="Enter artist name"
          />
          <TextInput
            color="info"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Enter genre"
          />
          <Dropdown label="How are you feeling?" value={mood}>
            <Dropdown.Item value="Happy">Happy</Dropdown.Item>
            <Dropdown.Item value="Sad">Sad</Dropdown.Item>
            <Dropdown.Item value="Dance">Dance</Dropdown.Item>
          </Dropdown>
          <Button onClick={[() => history.push("/results"), handleSubmit]}>
            Generate
          </Button>
        </form>
      </Card>
      <h1 className="text-lg font-titling-gothic-fb-wide font-sans text-white">
        You can generate a new playlist by clicking the button!
      </h1>
    </div>
  );
}

export default PlaylistForm;
