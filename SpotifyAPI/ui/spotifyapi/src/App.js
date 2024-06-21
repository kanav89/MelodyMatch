import "./App.css";
import React, { useState } from "react";
import First from "./Components/First";
import {
  Badge,
  Card,
  Dropdown,
  TextInput,
  Button,
  Navbar,
  NavbarBrand,
} from "flowbite-react";
import { HiOutlineArrowRight } from "react-icons/hi";
import p from "./Spotify_App_Logo.svg.png";
import { HiExternalLink } from "react-icons/hi";
// import {
//     BrowserRouter as Router,
//     Switch,
//     Route,
// } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { AnimatePresence } from "framer-motion";

function App() {
  const [artist_na, setArtist_na] = useState("");
  const [artist_na2, setArtist_na2] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [data, setData] = useState([]);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isresult, setresult] = useState(false);
  const [login, islogin] = useState(false);
  const buttonHandler = async () => {
    setData([]);
    console.log("Loading...");
    const apiUrl = `/recommendations?artist_na=${artist_na}&artist_na2=${artist_na2}&genre=${genre}&mood=${mood}`;
    console.log("API URL:", apiUrl);
    try {
      const res = await fetch(apiUrl);
      console.log(res);
      setresult(true);
      if (!res.ok) {
        setresult(false);
        alert(`HTTP error! Status: ${res.status}`);
      }

      const jsonData = await res.json();
      console.log("Data:", jsonData);
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const buttonHandler2 = async () => {
    try {
      for (let i = 0; i < data.length; i++) {
        const playlistItem = data[i][0];
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data[i][0] }), // Assuming you want to send playlistItem as an object property
        };
        const response = await fetch("/save", requestOptions);
        if (!response.ok) {
          throw new Error("Failed to save playlist item");
        }
      }
      // Handle successful save of all playlist items
      alert("All playlist items saved successfully!");
    } catch (error) {
      console.error("Error saving playlist:", error);
      // Handle error
      alert("Failed to save playlist items");
    }
  };

  return (
    <div className="app">
      <Navbar class="nav">
        <NavbarBrand>
          <img
            src={p}
            className="mr-3 ml-2 my-1 h-4 sm:h-7"
            alt="Flowbite React Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white">
            MelodyMatch
          </span>
        </NavbarBrand>
      </Navbar>

      {isFirstPage ? (
        <div className="flex flex-col items-center justify-center">
          <First />
          <div className="h-32">
            <Button
              gradientDuoTone=""
              size="lg"
              onClick={() => setIsFirstPage(false)}
            >
              Let's Get Started
              <HiOutlineArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <body className="flex">
            <div className="flex max-w-md flex-col gap-4 py-20 mx-36">
              <h1 className="text-2xl font-titling-gothic-fb-wide font-sans text-white font-black">
                Enter the names of your favourite artists, what genre you feel
                like listening to, and your current mood!
              </h1>
              <p className="text-lg font-titling-gothic-fb-wide font-sans text-white">
                You will have a custom playslist of 20 songs.
              </p>
              <Card className="max-w-md bg-white  border-green-500 border-2">
                <form className="flex flex-col gap-4">
                  <TextInput
                    color="info"
                    type="text"
                    onChange={(e) => setArtist_na(e.target.value)}
                    placeholder="Enter artist name"
                  />
                  <TextInput
                    color="info"
                    type="text"
                    onChange={(e) => setArtist_na2(e.target.value)}
                    placeholder="Enter artist name"
                  />
                  <TextInput
                    color="info"
                    type="text"
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Enter genre"
                  />
                  <Dropdown label="How are you feeling?">
                    <Dropdown.Item onClick={() => setMood("Happy")}>
                      Happy
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setMood("Sad")}>
                      Sad
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setMood("Dance")}>
                      Dance
                    </Dropdown.Item>
                  </Dropdown>
                  <Button onClick={buttonHandler}>Generate</Button>
                </form>
              </Card>

              <h1 className="text-lg font-titling-gothic-fb-wide font-sans text-white">
                You can generate a new playlist by clicking the button!
              </h1>
            </div>

            <div className="my-36">
              {isresult && (
                <Card className="overflow-y-scroll max-h-96 mb-7 mt-16 border-black border-2">
                  {data.map((item, index) => (
                    <div key={index} style={{ fontFamily: "cursive" }}>
                      {item[0]}
                      <Badge className="max-w-7 " size="sm">
                        <a
                          href={item[1]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <HiExternalLink />
                        </a>
                      </Badge>
                      {console.log(isresult)}
                    </div>
                  ))}
                  <Button onClick={buttonHandler2}>Save</Button>
                </Card>
              )}
            </div>
          </body>
        </div>
      )}
    </div>
  );
}

export default App;
