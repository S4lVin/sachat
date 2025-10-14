<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import ChatHistoryItem from '@/components/chat/ChatHistoryItem.vue'
import { router } from '@/router'
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

// Stores
const chatStore = useChatStore()
const { chats, selectedChat } = storeToRefs(chatStore)

// State
const collapsed = ref(false)

// Computed
const sidebarWidth = computed(() => (collapsed.value ? 'w-14' : 'w-64'))
const toggleIcon = computed(() => (collapsed.value ? 'chevron-right' : 'sidebar'))

// Actions
const isChatSelected = (chatId) => chatId === selectedChat.value?.id
const toggleSidebar = () => (collapsed.value = !collapsed.value)
const selectChat = (chatId) => router.push({ name: 'Chat', params: { chatId } })
const createAndSelectChat = async () => {
  const chat = await chatStore.createChat()
  if (chat?.id) selectChat(chat.id)
}
</script>

<template>
  <aside
    :class="[
      'relative flex flex-col border-r border-neutral-700 bg-neutral-800 shadow-lg/25',
      sidebarWidth,
    ]"
    :aria-label="collapsed ? 'Sidebar compressa' : 'Sidebar chat'"
  >
    <!-- Header -->
    <header class="flex items-center justify-between border-b-2 border-neutral-700 p-4">
      <h2 v-show="!collapsed" class="text-xl font-bold">Storico Chat</h2>
      <button
        @click="toggleSidebar"
        class="cursor-pointer transition-colors hover:text-neutral-300"
        :aria-label="collapsed ? 'Espandi sidebar' : 'Comprimi sidebar'"
        :aria-expanded="!collapsed"
      >
        <feather-icons :name="toggleIcon" />
      </button>
    </header>

    <!-- Chat List -->
    <div v-show="!collapsed" class="h-full overflow-y-auto p-4">
      <div class="mb-24" aria-label="Lista chat">
        <ChatHistoryItem
          v-for="chat in chats"
          :key="chat.id"
          :title="chat.title"
          :selected="isChatSelected(chat.id)"
          @select="selectChat(chat.id)"
        />

        <!-- Empty State -->
        <div v-if="chats.length === 0" class="mt-8 text-center text-neutral-400">
          <p class="text-sm">Nessuna chat presente</p>
        </div>
      </div>
    </div>

    <!-- New Chat Button DA MIGLIORARE -->
    <footer v-show="!collapsed" class="absolute bottom-0 w-full px-6 py-4">
      <button
        @click="createAndSelectChat"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-700 p-3 transition-colors hover:bg-neutral-600"
        aria-label="Crea nuova chat"
      >
        <feather-icons name="plus" :size="20" />
        <span class="text-lg">Nuova Chat</span>
      </button>
    </footer>
  </aside>
</template>
