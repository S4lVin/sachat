<script setup>
import InputArea from '@/components/chat/InputArea.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import { watch, ref, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import ChatSidebar from '@/components/chat/sidebar/ChatSidebar.vue'
import { useMessageStore } from '@/stores/messageStore'

const chatStore = useChatStore()
const messageStore = useMessageStore()

const { chats, chatById, currentChatId, skipNextLoad } = storeToRefs(chatStore)
const { messages, activeMessages, activeGeneration, messagesByParent } = storeToRefs(messageStore)

// Constants
const BOTTOM_THRESHOLD = 100 // Quanto vicino al fondo consideriamo "in fondo" (in px)

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
  () => currentChatId.value,
  async (chatId) => {
    // Skip reload if navigating to a newly created chat (to preserve temporary messages)
    if (skipNextLoad.value) {
      skipNextLoad.value = false
      return
    }

    messageStore.resetMessages()
    await messageStore.loadMessages(chatId)
    isUserAtBottom.value = true
  },
  { immediate: true },
)

watch(
  () => activeGeneration.value,
  async (message) => {
    if (message && !message.local) {
      messageStore.processStream(message.id, message)
    }
  },
)

watch(
  () => messages.value?.map((msg) => msg.content),
  async () => {
    await scrollToBottomIfNeeded(true)
  },
)

// Callbacks
onMounted(async () => {
  chats.value = null
  await chatStore.loadChats()

  if (!chatById.value[currentChatId.value]) {
    // Redirect a /new se chat non esiste
    chatStore.selectChat('new')
  }
})
</script>

<template>
  <div class="flex w-screen text-neutral-200 h-[100dvh]">
    <!-- Sidebar -->
    <ChatSidebar />

    <div class="relative flex min-w-0 flex-1">
      <!-- Message Area -->
      <div
        ref="scrollerRef"
        class="w-full min-w-0 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-8"
        style="scrollbar-gutter: stable both-edges"
        @scroll="updateIsAtBottom"
      >
        <div class="mx-auto mb-36 max-w-5xl">
          <ChatMessage
            v-for="message in activeMessages"
            :key="message.id"
            :sender="message.sender"
            :content="message.content"
            :status="message.status"
            :self-id="message.id"
            :siblings="messagesByParent[message.parentId]"
            @select="(childId) => messageStore.selectMessageChild(message.parentId, childId)"
            @retry="
              () =>
                messageStore.regenerateReply({ messageId: message.id, parentId: message.parentId })
            "
            @edit="(content) => messageStore.sendMessage({ content, parentId: message.parentId })"
          />

          <!-- Empty State -->
          <div v-if="messages?.length === 0" class="mt-8 text-center text-neutral-400">
            <p class="text-sm">Nessun messaggio presente</p>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="absolute bottom-0 w-full px-4 py-4 sm:px-8">
        <InputArea class="mx-auto max-w-5xl" />
      </div>
    </div>
  </div>
</template>
