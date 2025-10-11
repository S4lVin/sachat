<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import ChatHistoryItem from '@/components/chat/sidebar/ChatHistoryItem.vue'
import { router } from '@/router'
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const chatStore = useChatStore()
const { chats, selectedChat } = storeToRefs(chatStore)

const collapsed = ref(false)

const selectChat = (chatId) => {
  router.push({ name: 'Chat', params: { chatId } })
}
</script>

<template>
  <div :class="'relative bg-neutral-800 shadow-lg/25 ' + (collapsed ? 'w-14' : 'w-64')">
    <div class="flex items-center justify-between border-b-2 border-neutral-700 p-4">
      <div v-show="!collapsed" class="text-xl font-bold">Storico Chat</div>
      <button @click="collapsed = !collapsed" class="cursor-pointer hover:text-neutral-300">
        <feather-icons name="sidebar" />
      </button>
    </div>
    <div v-show="!collapsed" class="h-full overflow-y-auto p-4">
      <div class="mb-20">
        <ChatHistoryItem
          @select="selectChat(chat.id)"
          v-for="chat in chats"
          :key="chat.id"
          :title="chat.title"
          :selected="chat.id === selectedChat?.id"
        />
      </div>
    </div>
    <div v-show="!collapsed" class="absolute bottom-0 w-full px-6 py-4">
      <button
        @click="chatStore.createChat"
        class="w-full cursor-pointer rounded-lg bg-neutral-600 p-4 text-xl hover:bg-neutral-700"
      >
        <span class="text-lg">Nuova Chat</span>
      </button>
    </div>
  </div>
</template>
