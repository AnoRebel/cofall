import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./components/home";
import Room from "./components/room";
import Rooms from "./components/rooms";
import NoMatch from "./components/noMatch";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/rooms/:room">
          <Room />
        </Route>
        <Route path="/rooms">
          <Rooms />
        </Route>
        <Route>
          <NoMatch />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
