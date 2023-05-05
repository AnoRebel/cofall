import { defineStore } from "pinia";
import { Theme, useTheme } from "@/composables/theme";
import type { ConfigProps } from "@/components/codemirror/props";

export const useConfigStore = defineStore("config", {
  state: (): ConfigProps => {
    return {
      disabled: false,
      indentWithTab: true,
      tabSize: 2,
      autofocus: true,
      height: "auto",
      language: "javascript",
      theme: useTheme().theme.value === Theme.Light ? "default" : "oneDark",
    };
  },
  actions: {},
  getters: {},
});
