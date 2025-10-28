<script setup>
import ChatHistoryItem from '../ChatHistoryItem.vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()
const { chats, chatById, currentChatId } = storeToRefs(chatStore)

// Helpers
const isChatSelected = (chatId) => chatId === currentChatId.value
const isChatGenerating = (chatId) => chatById[chatId]?.status === 'generating'
</script>

<template>
  <div class="flex flex-col gap-2">
    <ChatHistoryItem
      v-for="chat in chats"
      :key="chat.id"
      :title="chat.title"
      :selected="isChatSelected(chat.id)"
      :generating="isChatGenerating(chat.id)"
      @select="chatStore.selectChat(chat.id)"
      @rename="(title) => chatStore.renameChat(chat.id, title)"
      @delete="chatStore.deleteChat(chat.id)"
    />

    <!-- Empty State -->
    <div v-if="chats?.length === 0" class="mt-8 text-center text-neutral-400">
      <p class="text-sm">Nessuna chat presente</p>
    </div>
  </div>
</template>
