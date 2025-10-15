import { api } from '@/helpers/api'
import { consumeStream } from '@/helpers/sse'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { reactive, ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // #region STATE
  const chats = ref()
  const selectedChat = ref()
  const messages = ref()
  const isGenerating = ref(false)
  const keepLocalOnNextSelection = ref(false)

  // #region ACTIONS
  const loadChats = async () => {
    const data = await api.get('chats')
    chats.value = data.chats || []
  }

  const createChat = async (title = 'Nuova chat') => {
    const data = await api.post('chats', { title })
    if (!Array.isArray(chats.value)) chats.value = []
    chats.value.unshift(data.chat)
    return data.chat
  }

  const selectChat = (chatId) => {
    router.push({ name: 'Chat', params: { chatId } })
  }

  const selectNewChat = () => {
    router.push({ name: 'NewChat' })
  }

  const loadMessages = async (chatId) => {
    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages || []
  }

  const sendMessage = async (content, chatId) => {
    const tempUserMessage = addTempMessage('user', content)
    const tempAssistantMessage = addTempMessage('assistant')

    // Se la chat è nuova (quindi non esiste ancora), la creiamo
    if (selectedChat.value === 'new') {
      const newChat = await createChat()
      keepLocalOnNextSelection.value = true
      selectChat(newChat.id)
    }

    const response = await api.post(`chats/${chatId}/ask`, {
      content,
      options: {
        model: 'gpt-5-mini',
      },
    })

    consumeStream(response, (event) => {
      if (event.type === 'delta') {
        tempAssistantMessage.content += event.data.text
      }
      if (event.type === 'done') {
        Object.assign(tempUserMessage, event.data.userMessage)
        Object.assign(tempAssistantMessage, event.data.assistantMessage)
      }
      // * Aggiungere error handling
    })
  }
  // #endregion

  // #region HELPERS
  const addTempMessage = (sender, content = '') => {
    const tempId = 'temp-' + Date.now()
    const message = reactive({ tempId, sender, content })
    messages.value.push(message)
    return message
  }

  const consumeStream = async (response, onEvent) => {
    //* Migliorare (scomporre, semplificare...)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() // ultima linea potrebbe essere incompleta

      for (const line of lines) {
        if (!line.trim()) continue

        try {
          const event = JSON.parse(line)
          onEvent(event)
        } catch (err) {
          console.error('Failed to parse NDJSON line:', line, err)
        }
      }
    }

    // Processa eventuale linea rimanente
    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer)
        onEvent(event)
      } catch (err) {
        console.error('Failed to parse final NDJSON line:', buffer, err)
      }
    }
  }
  // #endregion

  return {
    // STATE
    chats,
    messages,
    selectedChat,
    isGenerating,
    keepLocalOnNextSelection,

    // ACTIONS
    loadChats,
    createChat,
    selectChat,
    selectNewChat,
    loadMessages,
    sendMessage,
  }
})
