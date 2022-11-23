<script setup>
import { VideoCameraIcon, CodeBracketIcon } from "@heroicons/vue/24/solid";

import { SideLink } from "@/components";
</script>

<template>
  <aside>
    <nav class="h-full p-2 rounded bg-gray-700 shadow">
      <ul class="flex flex-col space-y-4">
        <li class="group">
          <SideLink to="#" name="Link 1">
            <VideoCameraIcon class="ml-0 sm:ml-4 h-6 w-6" />
          </SideLink>
        </li>
        <li class="group">
          <SideLink to="#" name="Link 2">
            <CodeBracketIcon class="ml-0 sm:ml-4 h-6 w-6" />
          </SideLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style lang="scss"></style>
