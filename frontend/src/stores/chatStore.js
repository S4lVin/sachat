import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/helpers/api'
import { streamToJson } from '@/utils'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const messages = ref([])
  const selectedChat = ref({})
  const sending = ref(false)

  const fetchChats = async () => {
    const data = await api.get('chats')
    console.log(data)
    chats.value = data.chats
  }

  const fetchMessages = async (chatId) => {
    const data = await api.get(`chats/${chatId}/messages`)
    console.log(data)
    messages.value = data.messages
  }

  const sendMessage = async (chatId, message) => {
    const data = await api.post(`chats/${chatId}/messages`, {
      sender: message.sender,
      content: message.content,
    })

    Object.assign(message, data.message)
  }

  const addMessage = (sender, content) => {
    const tempId = 'temp-' + Date.now()
    const message = reactive({ id: tempId, sender, content })
    messages.value.push(message)
    return message
  }

  const addUserMessage = async (content) => {
    const message = addMessage('user', content)
    await sendMessage(selectedChat.value.id, message)
  }

  const addAiMessage = async () => {
    const filteredMessages = messages.value.map((msg) => {
      return { role: msg.sender, content: msg.content }
    })

    const response = await api.stream(`completions`, {
      model: 'gpt-5-nano',
      input: filteredMessages,
    })
    const reader = response.body.getReader()
    const message = addMessage('assistant', '')

    await streamToJson(reader, (json) => {
      if (json.type === 'response.output_text.delta' && json.delta) {
        message.content += json.delta
      }
    })

    await sendMessage(selectedChat.value.id, message)
  }

  return {
    chats,
    messages,
    selectedChat,
    sending,
    fetchChats,
    fetchMessages,
    addUserMessage,
    addAiMessage,
  }
})
