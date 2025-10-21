<script setup>
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { ref, nextTick, computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

// Stores
const chatStore = useChatStore()
const { currentChatStatus, currentChatId } = storeToRefs(chatStore)
const MAX_HEIGHT = 512 // Altezza massima della textarea (px)

// State
const input = ref('')
const textArea = ref(null)

// Computed
const isGenerating = computed(() => currentChatStatus.value === 'generating')
const canSend = computed(() => input.value.trim() && !isGenerating.value)
const buttonIcon = computed(() => (isGenerating.value ? 'stop-circle' : 'arrow-up'))

// Actions
const autoResize = () => {
  nextTick(() => {
    if (!textArea.value) return

    textArea.value.style.height = 'auto'
    textArea.value.style.height = Math.min(textArea.value.scrollHeight, MAX_HEIGHT) + 'px'
  })
}

const send = async () => {
  if (!canSend.value) return

  const message = input.value.trim()
  input.value = ''
  autoResize()

  await chatStore.sendMessage(message, currentChatId.value)
}

const handleAction = () => {
  if (isGenerating.value) {
    chatStore.cancelReply(currentChatId.value)
  } else {
    send()
  }
}
</script>

<template>
  <div
    class="flex w-full flex-col rounded-xl border border-neutral-700 bg-neutral-800 p-2 shadow-lg/25"
  >
    <!-- Text Area -->
    <textarea
      ref="textArea"
      v-model="input"
      @keydown.enter.prevent="send"
      @input="autoResize"
      rows="1"
      type="text"
      placeholder="Scrivi un messaggio..."
      class="mb-4 w-full resize-none p-2 focus:outline-none"
      :disabled="isGenerating"
    />

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <BaseButton class="p-2 text-neutral-500 hover:text-neutral-400" icon="search" />

      <BaseButton
        @click="handleAction"
        :disabled="!canSend && !isGenerating"
        variant="primary"
        :icon="buttonIcon"
        :icon-size="24"
      />
    </div>
  </div>
</template>
