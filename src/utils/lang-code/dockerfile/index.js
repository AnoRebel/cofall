import { StreamLanguage } from "@codemirror/language";
import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile";

export default {
  language: () => StreamLanguage.define(dockerFile),
};
