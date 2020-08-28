import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

require("../utils/requires.js");

require("codemirror/lib/codemirror.css");
require("codemirror/keymap/sublime.js");

require("codemirror/addon/edit/closetag.js");
require("codemirror/addon/edit/matchtags.js");
require("codemirror/addon/edit/closebrackets.js");
require("codemirror/addon/hint/show-hint.js");
require("codemirror/addon/hint/anyword-hint.js");
require("codemirror/addon/hint/show-hint.css");
require("codemirror/addon/search/match-highlighter.js");
require("codemirror/addon/selection/active-line.js");

require("codemirror/addon/lint/lint.css");
require("codemirror/addon/lint/lint.js");
require("codemirror/addon/lint/css-lint.js");
// require("codemirror/addon/lint/html-lint.js");
require("codemirror/addon/lint/javascript-lint.js");
require("codemirror/addon/lint/json-lint.js");
require("codemirror/addon/lint/yaml-lint.js");

require("codemirror/addon/display/fullscreen.css");
require("codemirror/addon/display/fullscreen.js");

require("codemirror/addon/display/panel.js");

require("codemirror/addon/scroll/simplescrollbars.css");
require("codemirror/addon/scroll/simplescrollbars.js");

let timeout;
let mirror;

const CodeScreen = props => {
  const numPanels = 0;
  const panels = {};

  const timeoutFunction = () => {
    props.onKey("none");
  };

  const handleKeypress = () => {
    props.onKey("block");
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 2000);
  };

  const makeMarker = () => {
    let marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "●";
    return marker;
  };

  const makePanel = (where, text) => {
    let node = document.createElement("div");
    let id = ++numPanels;
    let widget, close, label;

    node.id = "panel-" + id;
    node.className = "panel " + where;
    close = node.appendChild(document.createElement("a"));
    close.setAttribute("title", "Remove me!");
    close.setAttribute("class", "remove-panel");
    close.textContent = "✖";
    CodeMirror.on(close, "mousedown", e => {
      e.preventDefault();
      panels[node.id].clear();
    });
    label = node.appendChild(document.createElement("span"));
    label.textContent = text;
    return node;
  };

  const addPanel = (where, text) => {
    let node = makePanel(where, text);
    panels[node.id] = mirror.addPanel(node, { position: where, stable: true });
  };

  // addPanel("top");
  // addPanel("bottom");

  const replacePanel = form => {
    let id = form.elements.panel_id.value;
    let panel = panels["panel-" + id];
    let node = makePanel("");

    panels[node.id] = mirror.addPanel(node, {
      replace: panel,
      position: "after-top",
      stable: true,
    });
    return false;
  };

  const options = {
    mode: props.mode,
    theme: props.theme,
    lineNumbers: true,
    matchTags: { bothTags: true },
    autoCloseTags: true,
    styleActiveLine: true,
    autoCloseBrackets: true,
    highlightSelectionMatches: true,
    scrollbarStyle: "simple",
    gutters: ["CodeMirror-lint-markers", "breakpoints"],
    lint: true,
    keyMap: "sublime",
    extraKeys: {
      "Ctrl-Space": "autocomplete",
      "Ctrl-J": "toMatchingTag",
      "Ctrl-K Z": cm => {
        cm.setOption("fullscreen", !cm.getOption("fullscreen"));
      },
      "Esc": cm => {
        if (cm.getOption("fullscreen")) cm.setOption("fullscreen", false);
      },
    },
  };

  return (
    <div>
      <CodeMirror
        value={props.code}
        options={options}
        editorDidMount={editor => {
          mirror = editor;
          editor.setSize("100%", "80vh");
          editor.on("gutterClick", (cm, n) => {
            let info = cm.lineInfo(n);
            cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
          });
        }}
        onBeforeChange={(editor, data, value) => {
          props.onChange(value);
        }}
        onKeyPress={handleKeypress}
      />
    </div>
  );
};

export default CodeScreen;
