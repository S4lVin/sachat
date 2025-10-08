<script setup>
import TheSidebar from '@/components/sidebar/TheSidebar.vue'
import TheMessageArea from '@/components/chat/TheMessageArea.vue'
import InputArea from '@/components/chat/InputArea.vue'
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()

const { selectedChat } = storeToRefs(chatStore)

const sendMessage = async (input) => {
  await chatStore.addMessage(selectedChat.value.id, 'user', input)
  await chatStore.addAiMessage()
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-clip text-md text-neutral-200">
    <TheSidebar />
    <div class="relative flex flex-1">
      <!-- Central container -->
      <TheMessageArea />
      <div class="absolute bottom-0 w-full px-8 py-4">
        <InputArea @send="sendMessage" class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
