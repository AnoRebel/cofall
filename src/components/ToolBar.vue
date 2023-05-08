<script setup lang="ts">
  import { reactive } from "vue";
  import Multiselect from "@vueform/multiselect";
  import { useConfigStore } from "@/stores/config";
  import languages from "@/utils/languages";
  import themes from "@/utils/themes";

const config = useConfigStore();
const sel_classes = reactive({
  container:
    "relative mx-auto w-full flex items-center justify-end box-border cursor-pointer border-2 border-gray-300 rounded bg-white text-base leading-snug outline-none",
  optionSelected: "text-white bg-slate-800",
  optionDisabled: "text-gray-300 cursor-not-allowed",
  optionSelectedPointed: "text-white bg-slate-800 opacity-90",
});
</script>

<template>
  <div class="w-full h-12 flex items-center justify-between text-sm bg-slate-800 rounded-t">
    <div class="w-full inline-flex items-center">
      <label for="language" class="block px-3 text-slate-50">Language:</label>
      <Multiselect
        id="language"
        v-model="config.language"
        placeholder="Select Language"
        :options="Object.keys(languages)"
        :searchable="true"
        :canClear="false"
        :autocomplete="false"
        :appendNewOption="false"
        :classes="sel_classes"
        required
      />
    </div>
    <div class="w-full inline-flex items-center">
      <label for="theme" class="block px-3 text-slate-50">Theme:</label>
      <Multiselect
        id="theme"
        v-model="config.theme"
        placeholder="Select Theme"
        :options="['default', ...Object.keys(themes)]"
        :searchable="true"
        :canClear="false"
        :appendNewOption="false"
        :classes="sel_classes"
        required
      />
    </div>
    <div class="inline-flex items-center">
      <label for="disabled" class="block px-3 text-slate-50">Disabled:</label>
      <input class="text-green-600" type="checkbox" id="disabled" v-model="config.disabled" />
    </div>
    <!-- <div class="w-full inline-flex items-center"> -->
    <!--   <label for="autofocus" class="block px-3 font-medium text-slate-700">autofocus:</label> -->
    <!--   <input class="text-green-600" type="checkbox" id="autofocus" v-model="config.autofocus" /> -->
    <!-- </div> -->
    <!-- <div class="inline-flex items-center"> -->
    <!--   <label for="indentWithTab" class="block px-3 font-medium text-slate-700">IndentWithTab:</label> -->
    <!--   <input class="text-green-600" -->
    <!--     type="checkbox" -->
    <!--     id="indentWithTab" -->
    <!--     v-model="config.indentWithTab" -->
    <!--   /> -->
    <!-- </div> -->
    <div class="w-full inline-flex items-center">
      <label for="tabSize" class="block px-3 text-slate-50">TabSize:</label>
      <Multiselect
        id="tabSize"
        v-model="config.tabSize"
        placeholder="Tabsize"
        :options="[2, 4, 6, 8]"
        :canClear="false"
        :appendNewOption="false"
        :classes="sel_classes"
        required
      />
    </div>
    <div class="w-full inline-flex items-center">
      <label for="height" class="block px-3 text-slate-50">Height:</label>
      <Multiselect
        id="height"
        v-model="config.height"
        placeholder="Choose Height"
        :options="['auto', '200px', '40em', '60vh']"
        :appendNewOption="false"
        :canClear="false"
        :classes="sel_classes"
        required
      />
    </div>
  </div>
</template>

<style lang="scss">
@import url("@vueform/multiselect/themes/tailwind.css");

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 3rem;
  padding: 0 1em;

  .item {
    display: inline-flex;
    align-items: center;

    label {
      display: inline-block;
      margin-right: 0.2em;
    }
  }

  input,
  button,
  select {
    margin: 0;
  }

  select {
    max-width: 3em;
    max-width: 8em;
  }
}
</style>
