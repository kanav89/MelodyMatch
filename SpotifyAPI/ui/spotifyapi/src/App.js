import React from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import First from "./Components/First";
import PlaylistForm from "./Components/PlaylistForm";

function App() {
  return (
    <Router>
      <div className="app">
        <Switch>
          <Route exact path="/" component={First} />
          <Route path="/form" component={PlaylistForm} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
