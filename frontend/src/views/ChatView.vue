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
const scrollerRef = ref(null)
const isUserAtBottom = ref(true)
const BOTTOM_THRESHOLD = 80 // Quanto vicino al fondo consideriamo "in fondo" (in px)

// Helpers
const updateIsAtBottom = () => {
  const el = scrollerRef.value
  if (!el) return
  isUserAtBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_THRESHOLD
}

const scrollToBottomIfNeeded = async (smooth = false) => {
  await nextTick()
  if (!isUserAtBottom.value) return
  const el = scrollerRef.value
  if (!el) return
  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

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
    isUserAtBottom.value = true
    chatStore.loadMessages(newChat.id)
  }
})

watch(
  () => messages.value.map((msg) => msg.content),
  async () => {
    await scrollToBottomIfNeeded(true)
  },
)
</script>

<template>
  <div class="flex h-screen w-screen text-neutral-200">
    <!-- Sidebar -->
    <TheSidebar />

    <div class="relative flex flex-1">
      <!-- Message Area -->
      <div
        ref="scrollerRef"
        class="w-full overflow-y-auto px-4 py-4 md:px-8"
        style="scrollbar-gutter: stable both-edges"
        @scroll="updateIsAtBottom"
      >
        <div class="mx-auto mb-36 max-w-5xl">
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            :sender="message.sender"
            :content="message.content"
          />
        </div>
      </div>

      <!-- Input Area -->
      <div class="absolute bottom-0 w-full px-4 py-4 md:px-8">
        <InputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
