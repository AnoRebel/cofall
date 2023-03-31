<!-- eslint-disable no-undef -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const isTop = ref(true);

onMounted(() => {
  window.addEventListener("scroll", () => {
    let top = window.scrollY;
    if (top >= 110) {
      isTop.value = false;
    } else {
      isTop.value = true;
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", () => {
    let top = window.scrollY;
    if (top >= 110) {
      isTop.value = false;
    } else {
      isTop.value = true;
    }
  });
});
</script>

<template>
  <button
    class="scroll-top scroll-to-target btn-anim rounded shadow-lg"
    :class="{ open: !isTop }"
    data-target="html"
  >
    <span class="fal fa-angle-up"></span>
  </button>
</template>
