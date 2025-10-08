<script setup>
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'

const chatStore = useChatStore()

const { selectedChat, messages } = storeToRefs(chatStore)

watch(selectedChat, async (newChat) => {
  if (newChat) {
    messages.value = [] // Resetto messages per feedback visivo istantaneo
    await chatStore.fetchMessages(newChat.id)
  }
})
</script>

<template>
  <div class="w-full overflow-y-auto p-4" style="scrollbar-gutter: stable both-edges">
    <div class="mx-auto mb-24 max-w-5xl">
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :sender="message.sender"
        :message="message.content"
      />
    </div>
  </div>
</template>
