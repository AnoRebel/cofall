import React from "react";
import { Container } from "react-bootstrap";

import "./noMatch.css";

const NoMatch = () => {
  return (
    <Container fluid={true}>
      <div id="notfound">
        <div className="notfound">
          <div className="notfound-404">
            <h1>
              4<span>0</span>4
            </h1>
          </div>
          <p>
            The page you are looking for doesn't seem to exist. CoFall has lots of pages, you sure
            you're in the right one?!
          </p>
          <a href="/">Home??</a>
        </div>
      </div>
    </Container>
  );
};

export default NoMatch;
