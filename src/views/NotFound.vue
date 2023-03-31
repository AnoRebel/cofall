<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="container">
    <div class="row">
      <section class="error-container d-flex justify-content-center align-items-center">
        <span class="four"><span class="screen-reader-text">4</span></span>
        <span class="zero"><span class="screen-reader-text">0</span></span>
        <span class="four"><span class="screen-reader-text">4</span></span>
      </section>
      <h3 class="zoom-area text-capitalize">{{ t("not_found.description") }}</h3>

      <div class="link-container text-center">
        <router-link :to="{ name: 'Home' }" class="btn btn-primary py-3 px-5">{{
          t("not_found.not_found_btn")
        }}</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-container {
  margin-top: 162px;
  font-family: "Catamaran", sans-serif;
  font-weight: 800;
  /* margin: 70px 15px; */
}
.error-container > span {
  display: inline-block;
  position: relative;
}
.error-container > span.four {
  width: 114px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(
      140deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.07) 43%,
      transparent 44%,
      transparent 100%
    ),
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 40%,
      rgba(0, 0, 0, 0.06) 41%,
      rgba(0, 0, 0, 0.07) 76%,
      transparent 77%,
      transparent 100%
    ),
    linear-gradient(to right, #3e5f79, #529c85);
}
.error-container > span.four:before,
.error-container > span.four:after {
  content: "";
  display: block;
  position: absolute;
  border-radius: 999px;
}
.error-container > span.four:before {
  width: 43px;
  height: 156px;
  left: 60px;
  bottom: -43px;
  background: linear-gradient(
      128deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.07) 40%,
      transparent 41%,
      transparent 100%
    ),
    linear-gradient(
      116deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.07) 50%,
      transparent 51%,
      transparent 100%
    ),
    linear-gradient(to top, #61c0c3, #4c649a, #9abccc, #879e55, #45975c);
}
.error-container > span.four:after {
  width: 137px;
  height: 43px;
  transform: rotate(-49.5deg);
  left: -18px;
  bottom: 36px;
  background: linear-gradient(to right, #49368e, #97a5c3, #818549, #5a6291, #71b398);
}

.error-container > span.zero {
  vertical-align: text-top;
  width: 152px;
  height: 155px;
  border-radius: 999px;
  background: linear-gradient(
      -45deg,
      transparent 0%,
      rgba(0, 0, 0, 0.06) 50%,
      transparent 51%,
      transparent 100%
    ),
    linear-gradient(to top right, #5c55a0, #74949d, #95b8b7, #9db87c, #85bfd0, #86edb6, #ed8687);
  overflow: hidden;
  animation: bgshadow 5s infinite;
}
.error-container > span.zero:before {
  content: "";
  display: block;
  position: absolute;
  transform: rotate(45deg);
  width: 90px;
  height: 90px;
  background-color: transparent;
  left: 0px;
  bottom: 0px;
  background: linear-gradient(
      95deg,
      transparent 0%,
      transparent 8%,
      rgba(0, 0, 0, 0.07) 9%,
      transparent 50%,
      transparent 100%
    ),
    linear-gradient(
      85deg,
      transparent 0%,
      transparent 19%,
      rgba(0, 0, 0, 0.05) 20%,
      rgba(0, 0, 0, 0.07) 91%,
      transparent 92%,
      transparent 100%
    );
}
.error-container > span.zero:after {
  content: "";
  display: block;
  position: absolute;
  border-radius: 999px;
  width: 70px;
  height: 70px;
  left: 43px;
  bottom: 43px;
  background: #fdfaf5;
  box-shadow: -2px 2px 2px 0px rgba(0, 0, 0, 0.1);
}

.screen-reader-text {
  position: absolute;
  top: -9999em;
  left: -9999em;
}

@keyframes bgshadow {
  0% {
    box-shadow: inset -160px 160px 0px 5px rgba(0, 0, 0, 0.4);
  }
  45% {
    box-shadow: inset 0px 0px 0px 0px rgba(0, 0, 0, 0.1);
  }
  55% {
    box-shadow: inset 0px 0px 0px 0px rgba(0, 0, 0, 0.1);
  }
  100% {
    box-shadow: inset 160px -160px 0px 5px rgba(0, 0, 0, 0.4);
  }
}

/* demo stuff */
* {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
body {
  background-color: #fdfaf5;
  margin-bottom: 50px;
}
html,
button,
input,
select,
textarea {
  font-family: "Montserrat", Helvetica, sans-serif;
  color: #bbb;
}
h1 {
  text-align: center;
  margin: 30px 15px;
}
.zoom-area {
  max-width: 490px;
  margin: 30px auto 30px;
  font-size: 19px;
  text-align: center;
  color: #2a5377;
}
.link-container {
  text-align: center;
}
</style>
