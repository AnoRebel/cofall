import React from "react";
import { Modal, InputGroup, FormControl, Button } from "react-bootstrap";

const Prompt = props => {
  return (
    <Modal {...props} size="sm" aria-labelledby="modal" backdrop="static" centered>
      <Modal.Header>
        <Modal.Title id="modal">Welcome</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Create/Join Room:</h6>
        <InputGroup className="my-3">
          <FormControl
            required
            value={props.room}
            placeholder="Anonymous"
            onChange={e => props.setRoom(e.target.value)}
          />
        </InputGroup>
        <h6>Username:</h6>
        <InputGroup className="my-3">
          <FormControl
            required
            value={props.username}
            placeholder="Anonymous"
            onChange={e => props.setName(e.target.value)}
          />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Start</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Prompt;
