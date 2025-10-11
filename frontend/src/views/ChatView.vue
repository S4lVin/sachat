<script setup>
import TheSidebar from '@/components/chat/TheSidebar.vue'
import TheMessageArea from '@/components/chat/TheMessageArea.vue'
import InputArea from '@/components/chat/TheInputArea.vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const chatStore = useChatStore()
const { chats, selectedChat } = storeToRefs(chatStore)

watch(
  () => route.params.chatId,
  async (chatId) => {
    if (!chats.value.length) await chatStore.loadChats()
    const chat = chats.value.find((chat) => chat.id === Number(chatId))
    selectedChat.value = chat
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex h-screen w-screen overflow-clip text-neutral-200">
    <TheSidebar />
    <div class="relative flex flex-1">
      <TheMessageArea />
      <div class="absolute bottom-0 w-full px-4 py-4 md:px-8">
        <InputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
