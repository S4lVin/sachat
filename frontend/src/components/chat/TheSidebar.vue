<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import ChatHistoryItem from '@/components/chat/ChatHistoryItem.vue'
import { useChatStore } from '@/stores/chatStore.js'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

// Stores
const chatStore = useChatStore()
const { chats, currentChatId } = storeToRefs(chatStore)

// State
const collapsed = ref(false)

// Computed
const sidebarWidth = computed(() => (collapsed.value ? 'w-14' : 'w-64'))
const toggleIcon = computed(() => (collapsed.value ? 'chevron-right' : 'sidebar'))

// Actions
const isChatSelected = (chatId) => chatId === currentChatId.value
const isChatGenerating = (chatId) => chatStore.findChat(chatId).status === 'generating'
const toggleSidebar = () => (collapsed.value = !collapsed.value)
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
      <h2 v-show="!collapsed" class="text-xl font-bold">SaChat</h2>
      <button
        @click="toggleSidebar"
        class="cursor-pointer transition-colors hover:text-neutral-300"
        :aria-label="collapsed ? 'Espandi sidebar' : 'Comprimi sidebar'"
        :aria-expanded="!collapsed"
      >
        <feather-icons :name="toggleIcon" />
      </button>
    </header>

    <div v-show="!collapsed" class="h-full overflow-y-auto p-4">
      <div class="sticky top-0 z-10 flex gap-2">
        <button
          @click="chatStore.selectChat('new')"
          class="mb-4 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 p-2 transition-colors hover:bg-neutral-700"
        >
          <feather-icons name="plus" :size="20" />
          Nuova Chat
        </button>
        <button
          class="mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 p-2 transition-colors hover:bg-neutral-700"
        >
          <feather-icons name="search" :size="20" />
        </button>
      </div>
      <div aria-label="Lista chat">
        <!-- New Chat Button -->

        <!-- Chat List -->
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
    </div>

    <!-- Footer -->
    <footer v-show="!collapsed" class="border-t-2 border-neutral-700 p-2">
      <button
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl p-3 transition-colors hover:bg-neutral-700"
        aria-label="Crea nuova chat"
      >
        <feather-icons name="user" />
        Nome Utente
      </button>
    </footer>
  </aside>
</template>
