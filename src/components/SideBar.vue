<script setup>
import { VideoCameraIcon, CodeBracketIcon } from "@heroicons/vue/24/solid";

import { SideLink } from "@/components";
</script>

<template>
  <aside>
    <nav class="h-full rounded bg-gray-700 p-2 shadow">
      <ul class="flex flex-col space-y-4">
        <li class="group">
          <SideLink :to="{ name: 'Code' }" name="Link 2">
            <CodeBracketIcon class="ml-0 h-6 w-6 sm:ml-4" />
          </SideLink>
        </li>
        <li class="group">
          <SideLink :to="{ name: 'Calls' }" name="Link 1">
            <VideoCameraIcon class="ml-0 h-6 w-6 sm:ml-4" />
          </SideLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style lang="scss"></style>
