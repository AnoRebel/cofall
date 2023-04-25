<script lang="ts" setup>
// import { useSocket } from "@/utils";
  import { io } from "socket.io-client";
import { onMounted } from "vue";

onMounted(() => {
  console.log(io("http://localhost:5000"));
});
</script>

<template>
  <div>Test</div>
</template>
