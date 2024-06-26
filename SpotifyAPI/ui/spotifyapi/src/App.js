import React from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import First from "./Components/First";
import PlaylistForm from "./Components/PlaylistForm";
import { Navbar, NavbarBrand } from "flowbite-react";
import p from "./Spotify_App_Logo.svg.png";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar className="nav">
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
        <Switch>
          <Route exact path="/" component={First} />
          <Route path="/form" component={PlaylistForm} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
