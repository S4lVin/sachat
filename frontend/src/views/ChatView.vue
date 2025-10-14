<script setup>
import TheSidebar from '@/components/chat/TheSidebar.vue'
import InputArea from '@/components/chat/InputArea.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import { watch, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const chatStore = useChatStore()
const { chats, selectedChat, messages } = storeToRefs(chatStore)

// State
const bottomRef = ref()

// Watchers
watch(
  () => route.params.chatId,
  async (chatId) => {
    if (!chats.value.length) await chatStore.loadChats()
    const chat = chats.value.find((chat) => chat.id === Number(chatId))
    selectedChat.value = chat
  },
  { immediate: true },
)
watch(selectedChat, async (newChat) => {
  if (newChat?.id) {
    messages.value = []
    chatStore.loadMessages(newChat.id)
  }
})
watch(
  () => messages.value.map((msg) => msg.content),
  async () => {
    await nextTick()
    bottomRef.value.scrollIntoView({ block: 'end' })
  },
)
</script>

<template>
  <div class="flex h-screen w-screen text-neutral-200">
    <!-- Sidebar -->
    <TheSidebar />
    <div class="relative flex flex-1">
      <!-- Message Area -->
      <div class="w-full overflow-y-auto px-4 py-4 md:px-8" style="scrollbar-gutter: stable both-edges">
        <div class="mx-auto mb-36 max-w-5xl">
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            :sender="message.sender"
            :content="message.content"
          />
        </div>
        <div ref="bottomRef"></div>
      </div>
      
      <!-- Input Area -->
      <div class="absolute bottom-0 w-full px-4 py-4 md:px-8">
        <InputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
