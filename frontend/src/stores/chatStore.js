import { api } from '@/helpers/api'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { useRoute } from 'vue-router'
import { reactive, ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // #region STATE
  const route = useRoute()
  const chats = ref()
  const messages = ref()
  const keepLocalOnNextSelection = ref(false)
  // #endregion

  // Computed
  const currentChatId = computed(() => Number(route.params.chatId) || route.params.chatId)
  const currentChatStatus = computed(() => findChat(currentChatId.value)?.status)

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

  const renameChat = async (chatId, title) => {
    const chat = findChat(chatId)
    chat.title = title

    await api.patch(`chats/${chatId}`, { title })
  }

  const deleteChat = async (chatId) => {
    chats.value = chats.value.filter((chat) => chat.id !== chatId)
    if (currentChatId.value === chatId) selectChat('new')

    await api.delete(`chats/${chatId}`)
  }

  const selectChat = (chatId) => {
    router.push({ name: 'Chat', params: { chatId } })
  }

  const findChat = (chatId) => {
    return chats.value?.find((chat) => chat.id === chatId)
  }

  const loadMessages = async (chatId) => {
    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages || []
  }

  const sendMessage = async (content, chatId) => {
    const tempUserMessage = addTempMessage('user', content)
    chatId = await ensureChat(chatId)

    const data = await api.post(`chats/${chatId}/messages`, {
      sender: 'user',
      content,
    })
    Object.assign(tempUserMessage, data.message)

    await createReply(chatId)
  }

  const createReply = async (chatId) => {
    setChatStatus(chatId, 'generating')

    const tempAssistantMessage = addTempMessage('assistant', '')

    const stream = await api.post(`chats/${chatId}/reply`)

    for await (const event of stream) {
      if (event.type === 'delta') {
        tempAssistantMessage.content += event.data.text
      }
      if (event.type === 'done') {
        Object.assign(tempAssistantMessage, event.data.assistantMessage)
      }
      if (event.type === 'error') {
        tempAssistantMessage.status = 'error'
        tempAssistantMessage.content = event.data.error.message
      }
    }

    setChatStatus(chatId, null)
  }

  const retryReply = async (chatId) => {
    const lastMessage = messages.value.at(-1)
    if (lastMessage.sender !== 'user') messages.value.pop()
    await createReply(chatId)
  }

  const cancelReply = async (chatId) => {
    await api.post(`chats/${chatId}/cancel-reply`)
    setChatStatus(chatId, null)
  }
  // #endregion

  // #region HELPERS
  const ensureChat = async (chatId) => {
    if (chats.value.find((chat) => chat.id === chatId)) return chatId

    const newChat = await createChat()
    keepLocalOnNextSelection.value = true
    selectChat(newChat.id)
    return newChat.id
  }

  const addTempMessage = (sender, content = '', status) => {
    const tempId = 'temp-' + Date.now()
    const message = reactive({ tempId, sender, content, status })
    messages.value.push(message)
    return message
  }

  const setChatStatus = (chatId, status) => {
    const chat = findChat(chatId)
    chat.status = status
  }
  // #endregion

  return {
    // STATE
    chats,
    messages,
    currentChatId,
    currentChatStatus,
    keepLocalOnNextSelection,

    // ACTIONS
    loadChats,
    createChat,
    renameChat,
    deleteChat,
    selectChat,
    findChat,
    loadMessages,
    sendMessage,
    createReply,
    retryReply,
    cancelReply,
  }
})
