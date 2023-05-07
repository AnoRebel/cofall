<script setup lang="ts">
  import { useConfigStore } from "@/stores/config";
  import languages from "@/utils/languages";
  import themes from "@/utils/themes";

const config = useConfigStore();
</script>

<template>
  <div class="toolbar">
    <div class="item">
      <label for="language">language:</label>
      <select
        name="language"
        id="language"
        v-model="config.language"
      >
        <option :value="option" :key="option" v-for="option in Object.keys(languages)">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="item">
      <label for="theme">theme:</label>
      <select name="theme" id="theme" v-model="config.theme">
        <option :value="option" :key="option" v-for="option in ['default', ...Object.keys(themes)]">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="item">
      <label for="disabled">disabled:</label>
      <input type="checkbox" id="disabled" v-model="config.disabled" />
    </div>
    <div class="item">
      <label for="autofocus">autofocus:</label>
      <input type="checkbox" id="autofocus" v-model="config.autofocus" />
    </div>
    <div class="item">
      <label for="indentWithTab">indentWithTab:</label>
      <input
        type="checkbox"
        id="indentWithTab"
        v-model="config.indentWithTab"
      />
    </div>
    <div class="item">
      <label for="tabSize">tabSize:</label>
      <select name="tabSize" id="tabSize" v-model.number="config.tabSize">
        <option :value="option" :key="option" v-for="option in [2, 4, 6, 8]">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="item">
      <label for="height">height:</label>
      <select name="height" id="height" v-model="config.height">
        <option :value="option" :key="option" v-for="option in ['auto', '200px', '40em', '60vh']">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
