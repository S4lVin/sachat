<script setup>
import TheSidebar from '@/components/sidebar/TheSidebar.vue'
import TheMessageArea from '@/components/chat/TheMessageArea.vue'
import TheInputArea from '@/components/chat/TheInputArea.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-clip text-md text-neutral-200">
    <TheSidebar />
    <div class="relative flex flex-1">
      <!-- Central container -->
      <TheMessageArea />
      <div class="absolute bottom-0 w-full px-8 py-4">
        <TheInputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
