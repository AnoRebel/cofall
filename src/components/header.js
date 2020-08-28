import React, { useState } from "react";
import Select from "react-select";
import { Navbar, Tooltip, OverlayTrigger } from "react-bootstrap";
import makeAnimated from "react-select/animated";
import useClippy from "use-clippy";
import { modeOptions, themeOptions } from "../utils/options";

const Header = props => {
  const animatedComponents = makeAnimated();

  const [clipboard, setClipboard] = useClippy();
  const [tooltip, setSetTooltip] = useState("Click to Copy Room Name.");

  const handleTheme = option => {
    props.setTheme(option.value);
  };

  const handleMode = option => {
    props.changeMode(option.value);
  };

  return (
    <Navbar bg="dark" variant="dark" className="w-100 justify-content-between">
      <div className="ml-5 mr-2 w-25">
        <Select
          defaultValue={props.theme}
          components={animatedComponents}
          onChange={handleTheme}
          isSearchable={true}
          placeholder={props.theme}
          name="theme"
          options={themeOptions}
        />
      </div>
      <div className="mx-3 w-25">
        <Select
          defaultValue={props.mode}
          components={animatedComponents}
          onChange={handleMode}
          isSearchable={true}
          placeholder={props.mode}
          name="mode"
          options={modeOptions}
        />
      </div>
      <OverlayTrigger
        key="bottom"
        placement="bottom"
        overlay={<Tooltip id="tooltip-bottom">{tooltip}</Tooltip>}
      >
        <div className="mx-2 btn text-white w-25">
          <span
            value={props.room}
            onClick={ev => {
              setClipboard(ev.target.value);
              setSetTooltip("Copied!");
            }}
          >
            {props.user} in {props.room}
          </span>
        </div>
      </OverlayTrigger>
      <div
        className={`ml-auto text-white ${
          props.connected ? "connected" : "disconnected"
        }`}
      >
      </div>
    </Navbar>
  );
};

export default Header;
