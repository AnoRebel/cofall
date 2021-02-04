import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import Prompt from "./prompt";

const Home = () => {
  const history = useHistory();

  const [username, setUsername] = useState("Anonymous");
  const [room, setRoom] = useState("General");
  const [show, setShow] = useState(true);

  return (
    <Container fluid={true}>
      <Prompt
        username={username}
        setName={setUsername}
        room={room}
        setRoom={setRoom}
        show={show}
        onHide={() => {
          sessionStorage.setItem("user", username);
          if (username === "") {
            setShow(true);
          } else {
            setShow(false);
          }
          history.push(`/rooms/${room}`);
        }}
      />
    </Container>
  );
};

export default Home;
