<script setup>
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'
import ChatMessage from '@/components/chat/ChatMessage.vue'

const chatStore = useChatStore()

const { messages } = storeToRefs(chatStore)
</script>

<template>
  <div class="w-full overflow-y-auto p-4" style="scrollbar-gutter: stable both-edges">
    <div class="mx-auto mb-24 max-w-5xl text-xl">
      <ChatMessage
        v-for="message in messages"
        :key="message.timestamp"
        :sender="message.sender"
        :message="message.text"
      />
    </div>
  </div>
</template>
