import React, { useState } from "react";
import { Toast } from "react-bootstrap";

const CustomToast = props => {
  const [show, setShow] = useState(true);

  return (
    {/*<div style={{
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 1
  }} ></div>*/}
    <Toast
      onClose={() => setShow(false)}
      show={show}
      delay={3000}
      autohide
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 1
      }}
    >
      <Toast.Header>
        <strong className="me-auto">{props.title}</strong>
        {/* <small>11 mins ago</small> */}
      </Toast.Header>
      <Toast.Body>{props.body}</Toast.Body>
    </Toast>
  );
};

export default CustomToast;
