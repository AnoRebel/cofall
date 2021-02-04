import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import FileSaver from "file-saver";
import { fileExts as fileExtensions } from "./options";

const SaveButton = props => {
  const [text, setText] = useState(undefined);
  const [title, setTitle] = useState(undefined);
  const [lang, setLang] = useState(undefined);

  useEffect(() => {
    setText(props.text);
    setTitle(props.title);
    setLang(props.lang);
    return () => {
      setText(undefined);
      setTitle(undefined);
      setLang(undefined);
    };
  }, [props.text, props.title, props.lang]);

  const fileExtension = lang => fileExtensions[lang];

  const fileNameify = name => name.split(" ").join("_");

  const saveCode = e => {
    e.preventDefault();
    const code = text;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, `${fileNameify(title)}.${fileExtension(lang)}`);
  };

  return (
    <Button className="btn btn-success" onClick={saveCode}>
      Save
    </Button>
  );
};

export default SaveButton;
