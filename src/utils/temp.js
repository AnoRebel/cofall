import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapse } from "react-bootstrap";
import {
  faChevronLeft,
  faChevronRight,
  faPaperPlane,
  faMicrophone,
  faMicrophoneSlash,
  faUserPlus,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import useEventListener from "./useEventListener";
import "./meyers.css";
import "./temp.css";

const ChatScreen = props => {
  const [open, setOpen] = useState(true);
  const [mic, setMic] = useState(faMicrophone);
  const [panel, setPanel] = useState(faChevronLeft);
  const [messages, setMessages] = useState([]);
  // Status Classes: [online, busy, away, '']
  // Activity Stats: [active, '']

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

  const toggleMic = () => {
    if (mic === faMicrophone) {
      setMic(faMicrophoneSlash);
    } else {
      setMic(faMicrophone);
    }
  };

  const handleProfile = () => {
    document.querySelector("#profile").classList.toggle("expanded");
    document.querySelector("#contacts").classList.toggle("expanded");
  };

  useEffect(() => {
    document.querySelector(".messages").scrollTo({
      behavior: "smooth",
      top: document.body.offsetTop,
    });
    let profImg = document.querySelector("#profile-img");
    // let expandBtn = document.querySelector(".expand-button");
    profImg.onclick = () => document.querySelector("#status-options").classList.toggle("active");
    // expandBtn.onclick = handleProfile;
  }, []);

  const handleStatus = el => {
    let profImg = document.querySelector("#profile-img");
    profImg.classList = "";
    document.querySelector("#status-online").classList.remove("active");
    document.querySelector("#status-offline").classList.remove("active");
    document.querySelector("#status-away").classList.remove("active");
    document.querySelector("#status-busy").classList.remove("active");
    el.classList.add("active");

    if (document.querySelector("#status-online").classList.contains("active")) {
      profImg.classList.add("online");
    } else if (document.querySelector("#status-away").classList.contains("active")) {
      profImg.classList.add("away");
    } else if (document.querySelector("#status-busy").classList.contains("active")) {
      profImg.classList.add("busy");
    } else if (document.querySelector("#status-offline").classList.contains("active")) {
      profImg.classList.add("offline");
    } else {
      profImg.classList.remove();
    }
    document.querySelector("#status-options").classList.remove("active");
  };

  const newMessage = () => {
    let message = document.querySelector(".message-input input").value;
    if (message.trim() === "") {
      return false;
    }
    let lnk = document.createElement("li");
    lnk.classList.add("sent");
    lnk.innerHTML =
      '<img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + "</p>";
    document.querySelector(".messages ul").append(lnk);
    document.querySelector(".message-input input").value = null;
    document.querySelector(".contact.active .preview").innerHTML = "<span>You: </span>" + message;
    document.querySelector(".messages").scrollTo({
      behavior: "smooth",
      top: document.body.offsetHeight,
    });
  };

  // useEventListener(
  //   "click",
  //   () => newMessage(),
  //   document.querySelector(".submit")
  // );
  useEffect(() => {
    let element = document.querySelector(".submit");
    element.addEventListener("click", () => newMessage());
    return () => {
      element.removeEventListener("click", () => newMessage());
    };
  }, [document.querySelector(".submit")]);

  useEventListener("keydown", e => {
    if (e.which === 13) {
      newMessage();
      return false;
    }
  });

  const userList = props.users.map((user, index) => {
    return (
      <li className="contact active" key={index}>
        <div className="wrap">
          <span className="contact-status online"></span>
          <img src="/avatar.png" alt="" />
          <div className="meta">
            <p className="name">{user}</p>
            <p className="preview">{user.message}</p>
          </div>
        </div>
      </li>
    );
  });

  const messageList = messages.map((message, index) => {
    return (
      <li className="replies" key={index}>
        <img src="/avatar.png" alt="" />
        <p>{message}</p>
      </li>
    );
  });

  const togglePanel = () => {
    let el = document.querySelector("#sidepanel");
    el.classList.toggle("shrink");
    if (panel === faChevronLeft) {
      setPanel(faChevronRight);
    } else {
      setPanel(faChevronLeft);
    }
  };

  return (
    <>
      <div id="frame">
        <Collapse in={open}>
          <div id="sidepanel">
            <div id="profile">
              <div className="wrap">
                <img id="profile-img" src="/avatar.png" className="online" alt="" />
                <p>Ano Rebel</p>
                <div className="expand-button" onClick={togglePanel}>
                  <FontAwesomeIcon icon={panel} />
                </div>
                <div id="status-options">
                  <ul>
                    <li
                      id="status-online"
                      className="active"
                      onClick={el => handleStatus(el.currentTarget)}
                    >
                      <span className="status-circle"></span> <p>Online</p>
                    </li>
                    <li id="status-away" onClick={el => handleStatus(el.currentTarget)}>
                      <span className="status-circle"></span> <p>Away</p>
                    </li>
                    <li id="status-busy" onClick={el => handleStatus(el.currentTarget)}>
                      <span className="status-circle"></span> <p>Busy</p>
                    </li>
                    <li id="status-offline" onClick={el => handleStatus(el.currentTarget)}>
                      <span className="status-circle"></span> <p>Offline</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div id="contacts">
              <ul>
                <li className="contact active">
                  <div className="wrap">
                    <span className="contact-status online"></span>
                    <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                    <div className="meta">
                      <p className="name">Harvey Specter</p>
                      <p className="preview">
                        Wrong. You take the gun, or you pull out a bigger one. Or, you call their
                        bluff. Or, you do any one of a hundred and forty six other things.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div id="bottom-bar">
              <button id="addcontact">
                <FontAwesomeIcon icon={faUserPlus} /> <span>Add contact</span>
              </button>
              <button id="settings">
                <FontAwesomeIcon icon={faCog} /> <span>Settings</span>
              </button>
            </div>
          </div>
        </Collapse>
        <div className="content">
          <div className="contact-profile">
            <img src="/avatar.png" alt="" />
            <p>Harvey Specter</p>
          </div>
          <div className="messages">
            <ul>
              <li className="replies">
                <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                <p>Excuses don't win championships.</p>
              </li>
              <li className="sent">
                <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                <p>Oh yeah, did Michael Jordan tell you that?</p>
              </li>
            </ul>
          </div>
          <div className="message-input">
            <div className="wrap">
              <input type="text" placeholder="Write your message..." />
              <FontAwesomeIcon onClick={toggleMic} icon={mic} className="attachment" />
              <button className="submit">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatScreen;
