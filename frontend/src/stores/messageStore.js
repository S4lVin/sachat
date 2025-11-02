import { api } from '@/helpers/api'
import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { useChatStore } from './chatStore'

export const useMessageStore = defineStore('message', () => {
  // #region STATE
  const messages = ref(null)
  const messagesByParent = ref({})
  const selectedMessagePath = ref([])
  // #endregion

  // #region COMPUTED
  const messageById = computed(() => {
    if (!messages.value) return {}
    return Object.fromEntries(messages.value.map((msg) => [msg.id, msg]))
  })

  // Messages currently visible in the chat (based on selected path)
  const activeMessages = computed(() => {
    return selectedMessagePath.value.map((id) => messageById.value[id]).filter(Boolean)
  })

  const activeGeneration = computed(() => {
    return activeMessages.value.filter((message) => message.status === 'generating').at(-1)
  })

  const activeError = computed(() => {
    return activeMessages.value.filter((message) => message.status === 'failed').at(-1)
  })
  // #endregion

  // #region ACTIONS
  const loadMessages = async (chatId) => {
    if (chatId === 'new') {
      messages.value = []
      return
    }

    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages || []

    messagesByParent.value = buildMessagesByParent(messages.value)
    selectedMessagePath.value = buildMessagePath(null)
  }

  const resetMessages = () => {
    messages.value = null
    messagesByParent.value = {}
    selectedMessagePath.value = []
  }

  const processStream = async (messageId, localMessage) => {
    const chatStore = useChatStore()
    localMessage.realId = messageId
    const stream = await api.post('conversation/get-stream', {
      messageId,
    })

    for await (const event of stream) {
      if (event.type === 'done') break
      if (event.type === 'delta') {
        localMessage.content += event.data.delta
      }
    }

    loadMessages(chatStore.currentChatId)
  }

  const sendMessage = async ({ content, parentId }) => {
    const chatStore = useChatStore()
    const chatId = chatStore.currentChatId

    // Optimistic update
    const userMessage = addUserMessage({ content, parentId })
    const assistantMessage = addAssistantMessage({ parentId: userMessage.id })

    const data = await api.post('/conversation/send', {
      chatId: chatId === 'new' ? undefined : chatId,
      parentId: userMessage.parentId ?? undefined,
      content: userMessage.content,
    })

    if (data.chat) {
      chatStore.chats.unshift(data.chat)
      chatStore.skipNextLoad = true
      chatStore.selectChat(data.chat.id)
    }

    processStream(data.assistantMessage.id, assistantMessage)
  }

  const cancelReply = async ({ messageId }) => {
    await api.post('conversation/cancel', { messageId })
  }

  const regenerateReply = async ({ messageId, parentId }) => {
    // Optimistic update
    const assistantMessage = addAssistantMessage({ parentId })

    const data = await api.post('conversation/regenerate', {
      messageId,
    })

    processStream(data.assistantMessage.id, assistantMessage)
  }

  const selectMessageChild = (messageId, childId) => {
    const messageIndex = selectedMessagePath.value.indexOf(messageId)

    // Replace path from selected message onwards
    const pathPrefix = selectedMessagePath.value.slice(0, messageIndex + 1)
    const pathSuffix = buildMessagePath(childId)
    selectedMessagePath.value = [...pathPrefix, ...pathSuffix]
  }
  // #endregion

  // #region HELPERS
  const addUserMessage = ({ content, parentId }) => {
    return addTemporaryMessage({
      sender: 'user',
      content,
      parentId,
    })
  }

  const addAssistantMessage = ({ parentId }) => {
    return addTemporaryMessage({
      sender: 'assistant',
      content: '',
      status: 'generating',
      parentId,
    })
  }

  const addTemporaryMessage = ({ sender, content, parentId, status }) => {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`
    const message = reactive({
      id: tempId,
      sender,
      content,
      parentId,
      status: status ?? 'success',
      local: true,
    })

    messages.value.push(message)

    const parentMessages = (messagesByParent.value[parentId] ??= [])
    parentMessages.push(message)
    selectMessageChild(parentId, tempId)

    return message
  }

  const buildMessagesByParent = (messages) => {
    const map = {}

    for (const msg of messages) {
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
    messages,
    messagesByParent,
    selectedMessagePath,

    // COMPUTED
    messageById,
    activeMessages,
    activeGeneration,
    activeError,

    // ACTIONS
    loadMessages,
    resetMessages,
    processStream,
    selectMessageChild,
    sendMessage,
    cancelReply,
    regenerateReply,
  }
})
