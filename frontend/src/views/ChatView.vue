<script setup>
import TheSidebar from '@/components/sidebar/TheSidebar.vue'
import TheMessageArea from '@/components/chat/TheMessageArea.vue'
import InputArea from '@/components/chat/TheInputArea.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-clip text-neutral-200">
    <TheSidebar />
    <div class="relative flex flex-1">
      <!-- Central container -->
      <TheMessageArea />
      <div class="absolute bottom-0 w-full px-4 py-4 md:px-8">
        <InputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
