import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/helpers/api'
import { consumeSseJson } from '@/helpers/sse'

export const useChatStore = defineStore('chat', () => {
  // #region STATE
  const chats = ref([])
  const selectedChat = ref()
  const messages = ref([])
  const isGenerating = ref(false)
  const sseController = ref(null)
  // #endregion

  // #region ACTIONS
  const loadChats = async () => {
    const data = await api.get('chats')
    chats.value = data.chats
  }

  const createChat = async (chat) => {
    const data = await api.post('chats', {
      title: chat?.title ?? 'Nuova chat',
      messages: chat?.messages ?? [],
    })
    chats.value.unshift(data.chat)
    selectedChat.value = data.chat
    return data.chat
  }

  const loadMessages = async (chatId) => {
    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages
  }

  const sendUserMessage = async (content) => {
    const tempMessage = appendTemporaryMessage('user', content)
    await persistMessage(selectedChat.value.id, tempMessage)
  }

  const requestAssistantReply = async () => {
    if (isGenerating.value || !selectedChat.value?.id) return

    const input = buildModelInput()
    const tempMessage = appendTemporaryMessage('assistant', '')
    isGenerating.value = true

    const controller = new AbortController()
    sseController.value = controller

    try {
      const ok = await streamCompletionIntoMessage(input, tempMessage, controller.signal)
      if (!ok) {
        removeMessageById(tempMessage.id)
        return
      }
      await persistMessage(selectedChat.value.id, tempMessage)
    } finally {
      isGenerating.value = false
      sseController.value = null
    }
  }

  const cancelAssistantReply = () => {
    isGenerating.value = false
  }
  // #endregion

  // #region HELPERS
  const appendTemporaryMessage = (sender, content = '') => {
    const id = 'tempMessage-' + Date.now()
    const message = reactive({ id, sender, content })
    messages.value.push(message)
    return message
  }

  const removeMessageById = (id) => {
    const i = messages.value.findIndex((m) => m.id === id)
    if (i !== -1) messages.value.splice(i, 1)
  }

  const persistMessage = async (chatId, message) => {
    const data = await api.post(`chats/${chatId}/messages`, {
      sender: message.sender,
      content: message.content,
    })

    Object.assign(message, data.message)
  }

  const buildModelInput = () => {
    return messages.value.map((msg) => ({
      role: msg.sender,
      content: msg.content,
    }))
  }

  const streamCompletionIntoMessage = async (inputMessages, tempMessage, signal) => {
    let receivedText = false

    const response = await api.post(
      'response',
      {
        model: 'gpt-5-nano',
        input: inputMessages,
      },
      { raw: true, signal },
    )

    const reader = response.body.getReader()

    await consumeSseJson(reader, {
      onJson: (json) => {
        if (json.type === 'response.output_text.delta' && json.delta) {
          tempMessage.content += json.delta
          receivedText = true
        }
      },
      shouldBreak: () => !isGenerating.value,
    })

    return receivedText
  }
  // #endregion

  return {
    // STATE
    chats,
    messages,
    selectedChat,
    isGenerating,

    // ACTIONS
    loadChats,
    createChat,
    loadMessages,
    sendUserMessage,
    requestAssistantReply,
    cancelAssistantReply,
  }
})
