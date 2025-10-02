<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { useChatStore } from '@/stores/chatStore.js'
import { ref } from 'vue'

const chatStore = useChatStore()

const input = ref('')

const { addMessage } = chatStore

const sendMessage = () => {
  if (input.value.trim() === '') return
  addMessage('user', input.value)
  input.value = ''
}
</script>

<template>
  <div class="flex w-full gap-x-4">
    <input
      @keydown.enter="sendMessage"
      v-model="input"
      type="text"
      placeholder="Scrivi un messaggio..."
      class="w-full rounded-xl bg-neutral-700 px-6 py-4 shadow-lg/25 focus:outline-none"
    />
    <button
      @click="sendMessage"
      class="cursor-pointer rounded-xl bg-indigo-800 p-3 shadow-lg/25 hover:bg-indigo-900"
    >
      <feather-icons class="h-8 w-8" name="send" />
    </button>
  </div>
</template>
