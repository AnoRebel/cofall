import { StreamLanguage } from "@codemirror/language";
import { jinja2 } from "@codemirror/legacy-modes/mode/jinja2";

export default {
  language: () => StreamLanguage.define(jinja2),
};
