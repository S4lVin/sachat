import { api } from '@/helpers/api'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { useRoute } from 'vue-router'
import { reactive, ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // #region STATE
  const route = useRoute()
  const chats = ref(null)
  const messages = ref(null)
  const messagesByParent = ref({})
  const selectedMessagePath = ref([])
  const skipNextLoad = ref(false)
  // #endregion

  // #region COMPUTED
  const chatById = computed(() => {
    if (!chats.value) return {}
    return Object.fromEntries(chats.value.map((chat) => [chat.id, chat]))
  })

  const messageById = computed(() => {
    if (!messages.value) return {}
    return Object.fromEntries(messages.value.map((msg) => [msg.id, msg]))
  })

  // Messages currently visible in the chat (based on selected path)
  const activeMessages = computed(() => {
    return selectedMessagePath.value.map((id) => messageById.value[id]).filter(Boolean)
  })

  const currentChatId = computed(() => {
    const chatId = route.params.chatId
    return chatId === 'new' ? 'new' : Number(chatId)
  })

  const currentChatStatus = computed(() => {
    return chatById.value[currentChatId.value]?.status
  })
  // #endregion

  // #region CHAT ACTIONS
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

  // #region MESSAGE ACTIONS
  const loadMessages = async (chatId) => {
    if (chatId === 'new') {
      messages.value = []
      messagesByParent.value = {}
      selectedMessagePath.value = []
      return
    }

    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages || []
    messagesByParent.value = buildMessagesByParent(messages.value)

    // Select the last message in the root thread
    const rootMessages = messagesByParent.value[null] || []
    const lastRootMessage = rootMessages[rootMessages.length - 1]

    if (lastRootMessage) {
      selectedMessagePath.value = buildMessagePath(lastRootMessage.id)
    } else {
      selectedMessagePath.value = []
    }
  }

  const selectMessageBranch = (messageId, childId) => {
    const messageIndex = selectedMessagePath.value.indexOf(messageId)

    // If message not in path, select from root
    if (messageIndex === -1) {
      selectedMessagePath.value = buildMessagePath(childId)
      return
    }

    // Replace path from selected message onwards
    const pathPrefix = selectedMessagePath.value.slice(0, messageIndex + 1)
    const pathSuffix = buildMessagePath(childId)
    selectedMessagePath.value = [...pathPrefix, ...pathSuffix]
  }

  const sendMessage = async ({ content, parentId, edit }) => {
    const userMessage = addTemporaryMessage({
      sender: 'user',
      content,
      parentId,
    })

    // If editing, navigate to the new branch
    if (edit) {
      selectMessageBranch(parentId, userMessage.id)
    }

    await processAssistantReply(userMessage)
  }

  const regenerateReply = async ({ messageId, parentId }) => {
    const assistantMessage = addTemporaryMessage({
      sender: 'assistant',
      content: '',
      parentId,
    })

    selectMessageBranch(parentId, assistantMessage.id)

    const eventStream = await api.post('/conversation/retry', { messageId })

    for await (const event of eventStream) {
      if (event.type === 'delta') {
        assistantMessage.content += event.data.delta
      }
    }

    // Reload messages to get server data
    await loadMessages(currentChatId.value)
  }
  // #endregion

  // #region HELPERS
  const addTemporaryMessage = ({ sender, content, parentId }) => {
    const tempId = `temp-${Date.now()}`
    const message = reactive({
      id: tempId,
      sender,
      content: content ?? '',
      parentId,
    })

    messages.value.push(message)

    // Initialize parent array if needed
    if (!messagesByParent.value[parentId]) {
      messagesByParent.value[parentId] = []
    }

    messagesByParent.value[parentId].push(message)
    selectedMessagePath.value.push(tempId)

    return message
  }

  const processAssistantReply = async (userMessage) => {
    const chatId = currentChatId.value === 'new' ? undefined : currentChatId.value
    const assistantMessage = addTemporaryMessage({
      sender: 'assistant',
      content: '',
      parentId: userMessage.id,
    })

    const eventStream = await api.post('/conversation/send', {
      chatId,
      parentId: userMessage.parentId ?? undefined,
      content: userMessage.content,
    })

    for await (const event of eventStream) {
      if (event.type === 'chat') {
        // New chat created - add it to the list and navigate to it
        const chat = event.data.chat
        if (!chatById.value[chat.id]) {
          chats.value.unshift(chat)
          skipNextLoad.value = true
          selectChat(chat.id)
        }
      }

      if (event.type === 'delta') {
        assistantMessage.content += event.data.delta
      }
    }

    // Reload messages to get server data (replace temporary messages)
    await loadMessages(currentChatId.value)
  }

  const buildMessagesByParent = (messagesList) => {
    const map = {}

    for (const msg of messagesList) {
      const parentId = msg.parentId ?? null
      if (!map[parentId]) {
        map[parentId] = []
      }
      map[parentId].push(msg)
    }

    return map
  }

  const buildMessagePath = (rootId) => {
    const path = [rootId]
    let currentId = rootId

    // Follow the last child of each message to build the path
    while (messagesByParent.value[currentId]?.length) {
      const children = messagesByParent.value[currentId]
      const lastChild = children[children.length - 1]
      path.push(lastChild.id)
      currentId = lastChild.id
    }

    return path
  }
  // #endregion

  return {
    // STATE
    chats,
    messages,
    messagesByParent,
    selectedMessagePath,
    skipNextLoad,

    // COMPUTED
    chatById,
    messageById,
    activeMessages,
    currentChatId,
    currentChatStatus,

    // ACTIONS
    loadChats,
    selectChat,
    renameChat,
    deleteChat,
    loadMessages,
    selectMessageBranch,
    sendMessage,
    regenerateReply,
  }
})
