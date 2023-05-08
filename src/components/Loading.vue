<template>
  <div class="loading w-full h-full relative flex flex-col justify-center items-center select-none">
    <div class="animation">
      <div v-for="item in 5" :key="item"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:math";
// gaps
$gap: 1rem; // ~14px
$sm-gap: $gap * 0.618; // ~8.6px
$xs-gap: math.div($sm-gap, 2); // ~4.4px

.animation {
  display: flex;

  @keyframes animation {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  div {
    width: 18px;
    height: 18px;
    margin: 0 $xs-gap;
    border-radius: 2px;
    background: var(--theme-body);
    animation: animation 2s linear infinite;
  }
  div:nth-child(1) {
    animation-delay: 0s;
  }
  div:nth-child(2) {
    animation-delay: -0.4s;
  }
  div:nth-child(3) {
    animation-delay: -0.8s;
  }
  div:nth-child(4) {
    animation-delay: -0.4s;
  }
  div:nth-child(5) {
    animation-delay: -0.8s;
  }
  div:nth-child(6) {
    animation-delay: -1.2s;
  }
}
</style>
