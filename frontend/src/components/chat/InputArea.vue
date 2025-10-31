<script setup>
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import AutoResizeTextarea from '../ui/AutoResizeTextarea.vue'

const chatStore = useChatStore()
const { selectedMessagePath, currentChatStatus } = storeToRefs(chatStore)

// State
const input = ref('')

// Computed
const isGenerating = computed(() => currentChatStatus.value === 'generating')
const canSend = computed(() => input.value.trim() && !isGenerating.value)

// Actions
const send = async () => {
  if (!canSend.value) return

  const content = input.value.trim()
  const parentId = selectedMessagePath.value.at(-1)
  input.value = ''

  await chatStore.sendMessage({ content, parentId })
}
</script>

<template>
  <div
    class="flex w-full flex-col rounded-xl border border-neutral-700 bg-neutral-800 p-2 shadow-lg/25"
  >
    <!-- Text Area -->
    <AutoResizeTextarea
      v-model="input"
      @keydown.enter.prevent="send"
      placeholder="Scrivi un messaggio..."
      class="mb-4 w-full p-2"
      :disabled="isGenerating"
    />

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <BaseButton class="p-2 text-neutral-500 hover:text-neutral-400" icon="search" />

      <BaseButton
        @click="send"
        :disabled="!canSend"
        variant="primary"
        icon="arrow-up"
        :icon-size="24"
      />
    </div>
  </div>
</template>
