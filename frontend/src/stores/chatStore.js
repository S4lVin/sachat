import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../helpers/axios'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const messages = ref([])

  const fetchChats = async (sender, text) => {
    const response = await api.get('chats')
    chats.value = response.data.chats
    console.log(chats.value)
  }

  const addMessage = async (sender, text) => {
    messages.value.push({ sender, text, timestamp: new Date().toISOString() })
  }

  return { fetchChats, chats, messages, addMessage }
})
