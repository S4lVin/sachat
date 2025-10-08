<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import ChatHistoryItem from '@/components/sidebar/ChatHistoryItem.vue'
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'

onMounted(() => {
  console.log("Fetching chats")
  chatStore.fetchChats()
})
const chatStore = useChatStore()

const { chats } = storeToRefs(chatStore)

const collapsed = ref(false)
</script>

<template>
  <div :class="'relative bg-neutral-800 shadow-lg/25 ' + (collapsed ? 'w-14' : 'w-64')">
    <div class="flex items-center justify-between border-b-2 border-neutral-700 p-4">
      <div v-show="!collapsed" class="text-xl font-bold">Storico Chat</div>
      <button @click="collapsed = !collapsed" class="cursor-pointer hover:text-neutral-300">
        <feather-icons class="h-8 w-8" name="sidebar" />
      </button>
    </div>
    <div v-show="!collapsed" class="h-full overflow-y-auto p-4">
      <div class="mb-20">
        <ChatHistoryItem v-for="chat in chats" :title="chat.title"/>
      </div>
    </div>
    <div v-show="!collapsed" class="absolute bottom-0 w-full px-6 py-4">
      <button
        class="w-full cursor-pointer rounded-lg bg-neutral-600 p-4 text-xl hover:bg-neutral-700"
      >
        <span class="text-lg">Nuova Chat</span>
      </button>
    </div>
  </div>
</template>
