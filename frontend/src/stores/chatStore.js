import { api } from '@/helpers/api'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // #region STATE
  const route = useRoute()
  const chats = ref(null)
  const skipNextLoad = ref(false)
  // #endregion

  // #region COMPUTED
  const chatById = computed(() => {
    if (!chats.value) return {}
    return Object.fromEntries(chats.value.map((chat) => [chat.id, chat]))
  })

  const currentChatId = computed(() => {
    const chatId = route.params.chatId
    return chatId === 'new' ? 'new' : Number(chatId)
  })
  // #endregion

  // #region ACTIONS
  const loadChats = async () => {
    const data = await api.get('chats')
    chats.value = data.chats || []
  }

  const selectChat = (chatId) => {
    router.push({ name: 'Chat', params: { chatId } })
  }

  const renameChat = async (chatId, title) => {
    // Optimistic update
    const chat = chatById.value[chatId]
    if (chat) chat.title = title

    await api.patch(`chats/${chatId}`, { title })
  }

  const deleteChat = async (chatId) => {
    // Optimistic update
    chats.value = chats.value.filter((chat) => chat.id !== chatId)

    // Navigate to new chat if current chat was deleted
    if (currentChatId.value === chatId) {
      selectChat('new')
    }

    await api.delete(`chats/${chatId}`)
  }
  // #endregion

  return {
    // STATE
    chats,
    skipNextLoad,

    // COMPUTED
    chatById,
    currentChatId,

    // ACTIONS
    loadChats,
    selectChat,
    renameChat,
    deleteChat,
  }
})
