<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import ChatHistoryItem from '@/components/chat/ChatHistoryItem.vue'
import { useChatStore } from '@/stores/chatStore.js'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import ContextMenu from '../ui/ContextMenu.vue'
import ChatSearchModal from './ChatSearchModal.vue'
import BaseButton from '../ui/BaseButton.vue'

// Stores
const chatStore = useChatStore()
const authStore = useAuthStore()
const { chats, currentChatId } = storeToRefs(chatStore)
const { user } = storeToRefs(authStore)

// State
const collapsed = ref(false)
const showMenu = ref(false)
const showSearch = ref(false)
const actions = [
  {
    label: "Impostazioni",
    icon: "settings",
  },
  {
    label: "Disconnettiti",
    icon: "log-out",
    class: "text-md text-red-500",
    handler: () => authStore.logout()
  },
]

// Computed
const reversedChats = computed(() => [...chats.value ?? []].reverse())

// Actions
const isChatSelected = (chatId) => chatId === currentChatId.value
const isChatGenerating = (chatId) => chatStore.findChat(chatId).status === 'generating'
const toggleSidebar = () => (collapsed.value = !collapsed.value)
const toggleMenu = () => {
  // Chiudi tutti gli altri menu prima di aprire questo
  if (!showMenu.value) document.dispatchEvent(new CustomEvent('close-all-menus'))
  showMenu.value = !showMenu.value
}
</script>

<template>
  <aside
    v-if="!collapsed"
    class="relative flex flex-col border-r w-64 border-neutral-700 bg-neutral-800 shadow-lg/25"
  >
    <!-- Header -->
    <header class="flex items-center justify-between border-b-2 border-neutral-700 p-4">
      <h2 class="text-xl font-bold">SaChat</h2>
      <BaseButton
        @click="toggleSidebar"
        variant="ghost"
        icon="sidebar"
        :icon-size="24"
      />
    </header>

    <div class="h-full overflow-y-auto p-4">

      <!-- Actions -->
      <div class="sticky top-0 z-10 mb-4 flex gap-2">
        <!-- New Chat button -->
        <BaseButton
          @click="chatStore.selectChat('new')"
          class="flex-1"
          variant="secondary"
          icon="plus"
        >
          Nuova Chat
        </BaseButton>

        <!-- Search button -->
        <BaseButton
          @click="showSearch = !showSearch"
          class="px-2.5"
          variant="secondary"
          icon="search"
        />

        <ChatSearchModal @close="showSearch = false" v-if="showSearch" />
      </div>

      <!-- Chat List -->
      <div>
        <ChatHistoryItem
          v-for="chat in reversedChats"
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
    <footer class="border-t-2 border-neutral-700 p-2 relative">
      <BaseButton
        @click.stop="toggleMenu"
        class="w-full p-3"
        variant="ghost"
        icon="user"
      >
      {{ user?.name }}
      </BaseButton>
    <ContextMenu :actions="actions" v-model="showMenu" class="absolute w-56 -mb-1 bottom-full left-2"/>
    </footer>
  </aside>
  <aside v-else class="relative flex flex-col border-r border-neutral-700 bg-neutral-800 shadow-lg/25 w-14">
    <!-- Header -->
    <header class="flex items-center justify-between border-b-2 border-neutral-700 p-4">
      <button
        @click="toggleSidebar"
        class="cursor-pointer transition-colors hover:text-neutral-300"
      >
        <feather-icons name="chevron-right" />
      </button>
    </header>

      <!-- Actions -->
    <div class="flex flex-col mt-2 gap-2 p-1">
      <button
        @click="chatStore.selectChat('new')"
        class="cursor-pointer rounded-xl border border-neutral-700 bg-neutral-800 p-3 transition-colors hover:bg-neutral-700"
      >
        <feather-icons name="plus" :size="20" />
      </button>

      <button
        @click="showSearch = !showSearch"
        class="cursor-pointer rounded-xl border border-neutral-700 bg-neutral-800 p-3 transition-colors hover:bg-neutral-700"
      >
        <feather-icons name="search" :size="20" />
      </button>

      <ChatSearchModal @close="showSearch = false" v-if="showSearch" />
    </div>

    <!-- Footer -->
    <footer class="border-t-2 mt-auto border-neutral-700 p-1 relative">
      <button
        @click.stop="toggleMenu"
        class="flex w-full cursor-pointer items-center gap-2 rounded-xl p-3 transition-colors hover:bg-neutral-700"
      >
      <feather-icons name="user" />
    </button>
    <ContextMenu :actions="actions" v-model="showMenu" class="absolute w-56 bottom-full left-1 z-10"/>
    </footer>
  </aside>
</template>
