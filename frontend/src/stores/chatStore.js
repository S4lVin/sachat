import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../helpers/axios'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const messages = ref([])
  const selectedChat = ref({})
  const sending = ref(false)

  const fetchChats = async () => {
    const response = await api.get('chats')
    console.log(response)
    chats.value = response.data.chats
  }

  const fetchMessages = async (chatId) => {
    const response = await api.get(`chats/${chatId}/messages`)
    console.log(response)
    messages.value = response.data.messages
  }

  const getResponse = async (content) => {
    // Revisionare la nomenclatura (fetch usa l'API e imposta variabili, get usa l'API ma ritorna senza impostare?)
    const response = await api.post(`completions`, {
      model: 'gpt-5',
      input: content,
    })
    return response.data
  }

  const addMessage = async (chatId, sender, content) => {
    const tempId = 'temp-' + Date.now()
    messages.value.push({ id: tempId, sender, content })

    const response = await api.post(`chats/${chatId}/messages`, {
      sender,
      content,
    })
    console.log(response)

    // Sostituisce il messaggio temporaneo con quello del database
    const index = messages.value.findIndex((m) => m.id === tempId)
    if (index !== -1) messages.value[index] = response.data.message
  }

  const addAiMessage = async () => {
    // Chiama getResponse e poi chiama addMessage
  }

  return {
    chats,
    messages,
    selectedChat,
    sending,
    fetchChats,
    fetchMessages,
    getResponse,
    addMessage,
    addAiMessage,
  } // Ritornare getResponse è inutile
})
