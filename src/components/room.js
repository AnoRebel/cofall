import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

import Header from "./header";
import CodeScreen from "./codeScreen";
import ChatScreen from "./chatScreen";
import SaveButton from "../utils/saveButton";
import StatusBar from "./statusBar";

const ENDPOINT = "http://127.0.0.1:5000";
// const ENDPOINT = "https://cofall-signaling-server.herokuapp.com";
const socket = io(ENDPOINT);
let user;

const Room = () => {
  const { room } = useParams();

  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [mode, setMode] = useState("javascript");
  const [theme, setTheme] = useState("material");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("none");
  const [isFull, setFull] = useState(false);
  
  socket.on("load", () => sendCode());

  useEffect(() => {
    user  = sessionStorage.getItem("user");
    setConnected(true);
    socket.on('connect', () => {
      setConnected(socket.connected);
    });
    socket.emit("room", { room, user });
    socket.on("room:data", ({ users }) => {
      setUsers(users);
    });
    return () => {
      setConnected(false);
      socket.emit("room:left", { room, user });
    };
  }, [ENDPOINT]);

  const updateCodeInState = data => {
    setCode(data.code);
    setTyping(data.typing);
    setStatus(data.status);
  };

  const clearCode = e => {
    e.preventDefault();
    setCode("");
    socket.emit("code", { code, room, typing, status: "none" });
  };
  
  const sendCode = () => {
    socket.emit("send:code", { room, code });
  };

  const codeIsHappening = code => {
    setCode(code);
    setTyping(user);
    socket.emit("code", { code, room, typing, status });
  };

  const changeMode = mode => {
    setMode(mode);
    socket.emit("code:mode", { mode, room });
  };

  socket.on("code:mode_change", mode => setMode(mode));
  
  useEffect(() => {
    socket.on("code:init", data => updateCodeInState(data));
    socket.on("receive:code", data => setCode(data.code));
  }, []);

  // Helper Functions
  const activateFullscreen = element => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
    else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
    }
    else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
    else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const deactivateFullscreen = element => {
    if (element.exitFullscreen) {
      element.exitFullscreen();
    }
    else if (element.mozCancelFullscreen) {
      element.mozCancelFullscreen();
    }
    else if (element.webkitExitFullscreen) {
      element.webkitExitFullscreen();
    }
  };

  const toggleScreen = () => {
    let container = document.querySelector("#chatform");
    console.log(container);
    if (isFull) {
      activateFullscreen(container);
      setFull(true);
    }
    else {
      deactivateFullscreen(container);
      setFull(false);
    }
  };

  return (
    <>
      <Header
        setTheme={setTheme}
        changeMode={changeMode}
        theme={theme}
        mode={mode}
        connected={connected}
        room={room}
        user={user}
      />
      <div className="d-flex w-100 align-items-center mt-3">
        <span className="w-10 ml-3">
          <SaveButton text={code} lang={mode} title={room} />
        </span>
        <span className="w-100">
        <StatusBar user={typing} status={status} />
        </span>
        <span className="w-10 mr-3">
          <Button className="btn btn-info" onClick={clearCode}>Clear</Button>
        </span>
      </div>
      <Row className="d-flex justify-content-center align-items-center">
        <Col md={7} lg={7}>
          <CodeScreen
            theme={theme}
            mode={mode}
            code={code}
            onChange={codeIsHappening}
            onKey={setStatus}
          />
        </Col>
        <Col md={5} lg={5}>
          <ChatScreen room={room} users={users} socket={socket} />
        </Col>
      </Row>
    </>
  );
};

export default Room;
