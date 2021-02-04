import React, { useState, useEffect } from "react";
import { Container, ListGroup, InputGroup, FormControl } from "react-bootstrap";

// const ENDPOINT = "http://127.0.0.1:5000";
const ENDPOINT = "https://cofall-signaling-server.herokuapp.com";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState("Anonymous");

  useEffect(() => {
    const name = sessionStorage.getItem("user");
    if (name !== null) {
      setUser(name);
      sessionStorage.setItem("user", user);
    }
    if (name === "") {
      setUser("Anonymous");
      sessionStorage.setItem("user", user);
    }
  }, []);

  useEffect(() => {
    fetch(ENDPOINT + "/info")
      .then(res => res.json())
      .then(data => {
        setRooms(data.rooms);
      });
  }, [rooms]);

  const roomList = Object.values(rooms).map(room => {
    return (
      <ListGroup.Item
        key={room}
        className="text-center bg-light"
        action
        href={user === "" ? "" : `rooms/${room}`}
      >
        {room}
      </ListGroup.Item>
    );
  });

  const onChange = e => {
    setUser(e.target.value);
    sessionStorage.setItem("user", user);
  };

  return (
    <Container>
      <div className="mt-5 text-center text-white h3">All Available Rooms</div>
      <div className="mt-1 text-center text-white h6">Username:</div>
      <InputGroup className="my-3">
        <FormControl required value={user} placeholder="Anonymous" onChange={onChange} />
      </InputGroup>
      <ListGroup className="d-flex w-50 mt-5 mx-auto">{roomList}</ListGroup>
    </Container>
  );
};

export default Rooms;
