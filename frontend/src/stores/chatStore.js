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

  const sendMessage = async (content, chatId, parentId) => {
    chatId = Number(chatId) || undefined
    const tempUserMessage = addTempMessage('user', content)
    const tempAssistantMessage = addTempMessage('assistant', '')

    const eventStream = await api.post('/conversation/send', {
      parentId,
      chatId,
      content,
    })

    for await (const event of eventStream) {
      if (event.type === 'chat') {
        const chat = event.data.chat
        const localChat = findChat(chat.id)
        if (localChat) continue

        chats.value.unshift(event.data.chat)
        keepLocalOnNextSelection.value = true
        selectChat(event.data.chat.id)
      }
      if (event.type === 'message') {
        const message = event.data.message

        if (message.sender === 'user') {
          Object.assign(tempUserMessage, message)
          continue
        }

        Object.assign(tempAssistantMessage, message)
      }
      if (event.type === 'delta') {
        const delta = event.data.delta
        tempAssistantMessage.content += delta
      }
    }
  }
  // #endregion

  // #region HELPERS
  const addTempMessage = (sender, content = '', status) => {
    const tempId = 'temp-' + Date.now()
    const message = reactive({ tempId, sender, content, status })
    messages.value.push(message)
    return message
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
    renameChat,
    deleteChat,
    selectChat,
    findChat,
    loadMessages,
    sendMessage,
  }
})
