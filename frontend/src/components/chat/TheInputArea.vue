<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const chatStore = useChatStore()
const { isGenerating } = storeToRefs(chatStore)

const input = ref('')

const send = () => {
  const message = input.value.trim()
  if (!message || isGenerating.value) return
  chatStore.sendUserMessage(input.value)
  chatStore.requestAssistantReply()
  input.value = ''
}
</script>

<template>
  <div class="flex w-full gap-x-4">
    <input
      @keydown.enter.prevent="send"
      v-model="input"
      type="text"
      placeholder="Scrivi un messaggio..."
      class="w-full rounded-xl bg-neutral-700 px-6 py-4 shadow-lg/25 focus:outline-none"
    />
    <button
      @click="isGenerating ? chatStore.cancelAssistantReply() : send()"
      class="cursor-pointer rounded-xl bg-indigo-800 p-3 shadow-lg/25 hover:bg-indigo-900"
    >
      <feather-icons :size="32" :name="isGenerating ? 'stop-circle' : 'arrow-up'" />
    </button>
  </div>
</template>
