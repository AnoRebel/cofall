import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faMicrophone } from "@fortawesome/free-solid-svg-icons";
// import Notification from "react-web-notification";
import Notifier from "react-desktop-notification";
import useEventListener from "../utils/useEventListener";
import { applyColor } from "../utils/colors";
import "./chatScreen.css";

const ChatScreen = props => {
  const user = sessionStorage.getItem("user");
  const [title, setTitle] = useState("");
  const [ignore, setIgnore] = useState(true);
  const [options, setOptions] = useState({});

  let form;
  let messagesElement;

  useEffect(() => {
    props.socket.on("chat:new", data => {
      document.querySelector("#feedback").innerText = "";
      newMessage(data);
      applyColor(document.querySelectorAll("#received .message"));
      applyColor(document.querySelectorAll("#sent .message"));
    });
    props.socket.on("user:typing", data => {
      document.querySelector("#feedback").innerText = `${data.user} is typing..`;
    });
  }, []);

  useEffect(() => {
    applyColor(document.querySelectorAll("#received .message"));
    applyColor(document.querySelectorAll("#sent .message"));
    messagesElement = document.querySelector("#messages");
    messagesElement.scrollTo({
      behavior: "smooth",
      top: document.body.offsetTop,
    });
  }, []);

  const handlePermissionGranted = () => {
    console.log("Permission Granted");
    setIgnore(false);
    console.log(ignore);
  };
  const handlePermissionDenied = () => {
    console.log("Permission Denied");
    setIgnore(true);
  };
  const handleNotSupported = () => {
    console.log("Web Notification not Supported");
    setIgnore(true);
  };

  const handleNotificationOnClick = (e, tag) => {
    console.log(e, "Notification clicked tag:" + tag);
  };

  const handleNotificationOnError = (e, tag) => {
    console.log(e, "Notification error tag:" + tag);
  };

  const handleNotificationOnClose = (e, tag) => {
    setTitle(undefined);
    console.log(e, "Notification closed tag:" + tag);
  };

  const handleNotificationOnShow = (e, tag) => {
    playSound();
    console.log(e, "Notification shown tag:" + tag);
  };

  const playSound = filename => {
    document.getElementById("sound").play();
  };

  const handleButtonClick = data => {
    let notifyMsg;
    if (data.message.length >= 80) {
      notifyMsg = `${data.message.substring(0, 77)}...`;
    } else {
      notifyMsg = data.message;
    }

    const now = Date.now();

    setTitle(`(Cofall) Message from ${data.user}`);

    // Available options
    // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
    setOptions({
      tag: `${data.user}-${now}`,
      body: notifyMsg,
      badge: "/favicon.png",
      icon: "/icon.png",
      vibrate: window.navigator.vibrate([200, 100]),
      renotify: true,
      lang: "en",
      dir: "ltr",
      sound: "/sound.mp3", // no browsers supported https://developer.mozilla.org/en/docs/Web/API/notification/sound#Browser_compatibility
    });

    Notifier.focus(`(Cofall) Message from ${data.user}`, notifyMsg, "", "/icon.png");
    // new window.Notification(`(Cofall) Message from ${data.user}`, options);
  };

  const newMessage = data => {
    if (user !== data.user) {
      playSound();
      handleButtonClick(data);
    }

    messagesElement = document.querySelector("#messages");

    let div = document.createElement("div");
    div.classList.add("w-75", "my-1", user === data.user ? "ml-auto" : "mr-auto");
    div.id = user === data.user ? "sent" : "recieved";

    let div2 = document.createElement("div");
    div2.classList.add(
      "card",
      "d-flex",
      "flex-row",
      "bg-transparent",
      "border-0",
      "w-100",
      "p-2",
      "h-100"
    );

    let div3 = document.createElement("div");
    div3.classList.add("message", "card-body", "rounded", "py-2", "w-100", "overflow-hidden");

    let span = document.createElement("span");
    span.classList.add("message-sender", "card-title", "font-weight-bold");
    span.innerText = user === data.user ? "You" : data.user;

    let span2 = document.createElement("span");
    span2.classList.add("message-body", "card-text");
    span2.innerText = data.message;

    let br = document.createElement("br");

    div3.appendChild(span);
    div3.appendChild(br);
    div3.appendChild(span2);
    div2.appendChild(div3);
    div.appendChild(div2);
    messagesElement.appendChild(div);

    messagesElement.scrollTo({
      behavior: "smooth",
      top: document.body.offsetHeight,
    });
  };

  useEventListener(
    "submit",
    event => {
      event.preventDefault();
      form = document.querySelector("#chatform");
      let message = form["chat-text"].value;
      if (message.toString().trim() === "") return false;
      props.socket.emit("chat", {
        room: props.room,
        user,
        message,
      });
      form.reset();
    },
    document.querySelector("#chatform")
  );

  useEventListener(
    "keypress",
    () => {
      props.socket.emit("chat:typing", {
        room: props.room,
        user,
      });
    },
    document.querySelector("#chat-text")
  );

  const userList = props.users.map((user, index) => {
    // bg-warning, bg-danger
    return (
      <div key={index} className="users d-flex align-items-center w-100 my-1 mx-3">
        <div className="status bg-success rounded-circle"></div>
        <div className="status-title text-white mx-1">{user.name}</div>
      </div>
    );
  });

  return (
    <div id="container" className="text-white w-100">
      <audio id="sound" preload="auto">
        <source src="/sound.mp3" type="audio/mpeg" />
        <source src="/sound.ogg" type="audio/ogg" />
        <embed hidden={true} autostart="false" loop={false} src="/sound.mp3" />
      </audio>
      {/* <Notification
        ignore={ignore && title !== ""}
        askAgain={true}
        disableActiveWindow={true}
        notSupported={handleNotSupported}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onShow={handleNotificationOnShow}
        onClick={props.handleNotificationOnClick}
        onClose={handleNotificationOnClose}
        onError={handleNotificationOnError}
        timeout={8000}
        title={title}
        options={options}
      /> */}
      <div className="d-flex flex-column w-75 h-100 float-left rounded-left">
        <div id="messages" className="d-flex flex-column flex-grow-1 w-100">
          <span id="feedback" className="mx-3 mt-1 text-muted text-monospace font-italic"></span>
        </div>
        <form id="chatform" className="w-100 d-flex flex-row flex-nowrap form-inline">
          <input
            type="text"
            className="w-100 form-control form-control-lg text-white border-0 rounded-0"
            id="chat-text"
            name="chat-text"
            placeholder="Text Message"
          />
          <button className="btn btn-lg btn-info rounded-0">
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
          <button type="submit" className="btn btn-lg btn-success rounded-0">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
      <div id="user-list" className="h-100 w-25 float-right rounded-right">
        <p className="text-center m-0 p-3">Users Online</p>
        {userList}
      </div>
    </div>
  );
};

export default ChatScreen;
