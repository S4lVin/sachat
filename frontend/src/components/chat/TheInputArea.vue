<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { ref, nextTick } from 'vue'

const chatStore = useChatStore()
const { isGenerating } = storeToRefs(chatStore)

const input = ref('')
const textArea = ref()

const send = () => {
  const message = input.value.trim()
  if (!message || isGenerating.value) return
  chatStore.sendUserMessage(input.value)
  chatStore.requestAssistantReply()
  autoResize()
  input.value = ''
}

const autoResize = () => {
  nextTick(() => {
    if (textArea.value) {
      const maxHeight = 512
      textArea.value.style.height = 'auto'
      textArea.value.style.height = Math.min(textArea.value.scrollHeight, maxHeight) + 'px'
    }
  })
}
</script>

<template>
  <div class="flex w-full gap-x-4">
    <textarea
      @keydown.enter.prevent="send"
      @input="autoResize"
      rows="1"
      ref="textArea"
      v-model="input"
      type="text"
      placeholder="Scrivi un messaggio..."
      class="w-full resize-none rounded-xl bg-neutral-700 px-6 py-4 shadow-lg/25 focus:outline-none"
    />
    <button
      @click="isGenerating ? chatStore.cancelAssistantReply() : send()"
      class="cursor-pointer rounded-xl bg-indigo-800 p-3 shadow-lg/25 hover:bg-indigo-900"
      type="button"
    >
      <feather-icons :size="32" :name="isGenerating ? 'stop-circle' : 'arrow-up'" />
    </button>
  </div>
</template>
