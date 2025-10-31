<script setup>
import InputArea from '@/components/chat/InputArea.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import { watch, ref, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import ChatSidebar from '@/components/chat/sidebar/ChatSidebar.vue'

const chatStore = useChatStore()
const {
  chats,
  messages,
  selectedMessagePath,
  activeMessages,
  messagesByParent,
  chatById,
  currentChatId,
  skipNextLoad,
} = storeToRefs(chatStore)

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
  () => currentChatId.value,
  async (chatId) => {
    // Skip reload if navigating to a newly created chat (to preserve temporary messages)
    if (skipNextLoad.value) {
      skipNextLoad.value = false
      return
    }

    // Reset selection when changing chat
    selectedMessagePath.value = []

    if (chatId === 'new') {
      messages.value = []
      isUserAtBottom.value = true
      return
    }

    messages.value = null
    await chatStore.loadMessages(chatId)
    isUserAtBottom.value = true
  },
  { immediate: true },
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
  <div class="flex h-screen w-screen text-neutral-200">
    <!-- Sidebar -->
    <ChatSidebar />

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
            v-for="message in activeMessages"
            :key="message.id"
            :sender="message.sender"
            :content="message.content"
            :status="message.status"
            :self-id="message.id"
            :siblings="messagesByParent[message.parentId]"
            @select="(childId) => chatStore.selectMessageBranch(message.parentId, childId)"
            @retry="
              () => chatStore.regenerateReply({ messageId: message.id, parentId: message.parentId })
            "
            @edit="
              (content) =>
                chatStore.sendMessage({ content, parentId: message.parentId, edit: true })
            "
          />

          <!-- Empty State -->
          <div v-if="messages?.length === 0" class="mt-8 text-center text-neutral-400">
            <p class="text-sm">Nessun messaggio presente</p>
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
