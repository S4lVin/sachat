<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { ref, nextTick, computed } from 'vue'

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
      <button
        class="cursor-pointer rounded-xl p-2 text-neutral-500 transition-colors hover:text-neutral-400"
        type="button"
        aria-label="Cerca"
      >
        <feather-icons :size="20" name="search" />
      </button>

      <button
        @click="handleAction"
        :disabled="!canSend && !isGenerating"
        :class="[
          'cursor-pointer rounded-xl p-2 transition-colors',
          canSend || isGenerating
            ? 'bg-indigo-800 hover:bg-indigo-900'
            : 'cursor-not-allowed bg-neutral-700',
        ]"
        type="button"
        :aria-label="isGenerating ? 'Ferma generazione' : 'Invia messaggio'"
      >
        <feather-icons :name="buttonIcon" />
      </button>
    </div>
  </div>
</template>
