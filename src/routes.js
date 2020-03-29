import React from "react";
import { Route, Link, Switch } from "react-router-dom";
import { Container, Card } from "react-bootstrap";

import App from "./App";
import Home from "./components/home";
import Room from "./components/room";

export default (
  <Switch>
    <App>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/rooms/:room">
        <Room />
      </Route>
      <Route path="/rooms">
        <Container>Rooms</Container>
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </App>
  </Switch>
);
