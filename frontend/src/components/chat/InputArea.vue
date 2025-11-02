<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import AutoResizeTextarea from '../ui/AutoResizeTextarea.vue'
import { useMessageStore } from '@/stores/messageStore'

const messageStore = useMessageStore()

const { selectedMessagePath, activeGeneration, activeError } = storeToRefs(messageStore)

// State
const input = ref('')

// Computed
const isGenerating = computed(() => Boolean(activeGeneration.value))
const isError = computed(() => Boolean(activeError.value))
const canSend = computed(() => input.value.trim() && !isGenerating.value)
const buttonIcon = computed(() => (isGenerating.value ? 'stop-circle' : 'arrow-up'))

// Actions
const send = async () => {
  if (!canSend.value) return

  const content = input.value.trim()
  const parentId = selectedMessagePath.value.at(-1)
  input.value = ''

  await messageStore.sendMessage({ content, parentId })
}

const handleAction = () => {
  if (isGenerating.value) {
    messageStore.cancelReply({
      messageId: activeGeneration.value?.realId ?? activeGeneration.value.id,
    })
    return
  }
  send()
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
      :disabled="isGenerating || isError"
    />

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <BaseButton class="p-2 text-neutral-500 hover:text-neutral-400" icon="search" />

      <BaseButton
        @click="handleAction"
        :disabled="!canSend && !isGenerating || isError"
        variant="primary"
        :icon="buttonIcon"
        :icon-size="24"
      />
    </div>
  </div>
</template>
