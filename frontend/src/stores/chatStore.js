import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/helpers/api'
import { streamToJson } from '@/utils'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const selectedChat = ref({})
  const messages = ref([])
  const sending = ref(false)

  const fetchChats = async () => {
    const data = await api.get('chats')
    chats.value = data.chats
  }

  const createChat = async (chat) => {
    const data = await api.post(`chats`, {
      title: chat?.title ?? "Nuova chat",
      messages: chat?.messages ?? []
    })

    chats.value.unshift(data.chat)
    selectedChat.value = data.chat
  }

  const fetchMessages = async (chatId) => {
    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages
  }

  const postMessage = async (chatId, message) => {
    const data = await api.post(`chats/${chatId}/messages`, {
      sender: message.sender,
      content: message.content,
    })

    Object.assign(message, data.message)
  }

  const addTempMessage = (sender, content) => {
    const id = 'temp-' + Date.now()
    const message = reactive({ id, sender, content })
    messages.value.push(message)
    return message
  }

  const createUserMessage = async (content) => {
    const tempMessage = addTempMessage('user', content)
    await postMessage(selectedChat.value.id, tempMessage)
  }

  const generateAiMessage = async () => {
    const filteredMessages = messages.value.map((msg) => {
      return { role: msg.sender, content: msg.content }
    })

    const response = await api.stream(`completions`, {
      model: 'gpt-5-nano',
      input: filteredMessages,
    })
    const reader = response.body.getReader()
    const tempMessage = addTempMessage('assistant', '')

    await streamToJson(reader, (json) => {
      if (json.type === 'response.output_text.delta' && json.delta) {
        tempMessage.content += json.delta
      }
    })

    await postMessage(selectedChat.value.id, tempMessage)
  }

  return {
    chats,
    messages,
    selectedChat,
    sending,
    fetchChats,
    createChat,
    fetchMessages,
    createUserMessage,
    generateAiMessage,
  }
})
