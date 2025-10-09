<script setup>
import TheSidebar from '@/components/sidebar/TheSidebar.vue'
import TheMessageArea from '@/components/chat/TheMessageArea.vue'
import InputArea from '@/components/chat/InputArea.vue'
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { sending } = storeToRefs(chatStore)

const sendMessage = async (input) => {
  sending.value = true
  await chatStore.createUserMessage(input)
  await chatStore.generateAiMessage()
  sending.value = false
}
</script>

<template>
  <div class="text-md flex h-screen w-screen overflow-clip text-neutral-200">
    <TheSidebar />
    <div class="relative flex flex-1">
      <!-- Central container -->
      <TheMessageArea />
      <div class="absolute bottom-0 w-full px-8 py-4">
        <InputArea :disabled="sending" @send="sendMessage" class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
