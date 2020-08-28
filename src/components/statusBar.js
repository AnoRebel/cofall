import React from "react";
import { Container, Card } from "react-bootstrap";

const textGlow = {
  textShadow: "#6AD8C9 0 0 10px"
};

const typing = {
  fontSize: "14px",
  fontStyle: "italic",
  opacity: ".5"
};

const StatusBar = props => {
  const user  = sessionStorage.getItem("user");
  return (
    <Container className="w-100 text-white align-items-center mb-3">
      <Card className="bg-transparent border-0">
        <Card.Body>
          <span style={{ ...textGlow, display: props.status }}>
            {
              user === props.user
              ? (<div>You <span style={typing}>are coding...</span></div>)
              : (<div>{props.user || 'CoFall'} <span style={typing}>coding...</span></div>)
            }
          </span>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StatusBar;
