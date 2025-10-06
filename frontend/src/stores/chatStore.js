import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])

  const addMessage = async (sender, text) => {
    messages.value.push({ sender, text, timestamp: new Date().toISOString() })
  }

  return { messages, addMessage }
})
