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
const { chats, selectedChat, messages, keepLocalOnNextSelection } = storeToRefs(chatStore)

// Constants
const BOTTOM_THRESHOLD = 80 // Quanto vicino al fondo consideriamo "in fondo" (in px)

// State
const scrollerRef = ref(null)
const isUserAtBottom = ref(true)

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
  () => [route.name, route.params.chatId],
  async ([routeName, chatId]) => {
    if (!chats.value) await chatStore.loadChats()

    if (routeName === 'NewChat') {
      selectedChat.value = 'new'
    } else if (routeName === 'Chat' && chatId) {
      const chat = chats.value.find((chat) => chat.id === Number(chatId))
      chat ? (selectedChat.value = chat) : chatStore.selectNewChat()
    }
  },
  { immediate: true },
)

watch(selectedChat, async (newChat) => {
  // Se stiamo selezionando la chat appena creata, NON resettare i messaggi locali
  if (keepLocalOnNextSelection.value) {
    keepLocalOnNextSelection.value = false
    return
  }

  messages.value = null
  isUserAtBottom.value = true
  newChat !== 'new' ? chatStore.loadMessages(newChat.id) : (messages.value = [])
})

watch(
  () => messages.value?.map((msg) => msg.content),
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

          <!-- Empty State -->
          <div v-if="messages?.length === 0" class="mt-8 text-center text-neutral-400">
            <p class="text-sm">Nessun messaggio presesnte</p>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="absolute bottom-0 w-full px-4 py-4 md:px-8">
        <InputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
