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
  const activeMessagePath = ref([])
  const childrenByMessage = ref()
  const keepLocalOnNextSelection = ref(false)
  // #endregion

  // #region COMPUTED
  const chatById = computed(() => Object.fromEntries(chats.value ? chats.value.map(chat => [chat.id, chat]) : []))
  const messageById = computed(() => Object.fromEntries(messages.value ? messages.value.map(msg => [msg.id, msg]) : []))
  const activeMessages = computed(() => activeMessagePath.value.map(id => messageById.value[id]).filter(Boolean))
  const currentChatId = computed(() => Number(route.params.chatId) || route.params.chatId)
  const currentChatStatus = computed(() => chatById.value[currentChatId.value]?.status)
  // #endregion

  // #region ACTIONS
  const loadChats = async () => {
    const data = await api.get('chats')
    chats.value = data.chats || []
  }

  const renameChat = async (chatId, title) => {
    chatById.value[chatId].title = title

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

  const loadMessages = async (chatId) => {
    const data = await api.get(`chats/${chatId}/messages`)
    messages.value = data.messages || []
    childrenByMessage.value = buildMessageMap(messages.value)

    const root = childrenByMessage.value[null]?.[0]
    activeMessagePath.value = root ? buildMessagePathFrom(root.id) : []
  }

  const selectMessageChild = async (messageId, childId) => {
    const idx = activeMessagePath.value.indexOf(messageId)
    if (idx === -1) return

    const head = activeMessagePath.value.slice(0, idx + 1)
    const tail = buildMessagePathFrom(childId)
    activeMessagePath.value = head.concat(tail)
  }

  const sendMessage = async ({ content, parentId }) => {
    const tempUserMessage = addLocalMessage({
      sender: 'user',
      content,
      parentId
    })

    createReplyFor(tempUserMessage)
  }
  // #endregion

  // #region HELPERS
  const addLocalMessage = ({ sender, content, parentId }) => {
    const tempId = 'temp-' + Date.now()
    const msg = reactive({ id: tempId, sender, content: content ?? '', parentId })

    messages.value.push(msg)
    if (!childrenByMessage.value?.[parentId]) {
      childrenByMessage.value[parentId] = []
    }

    childrenByMessage.value[parentId].push(msg)
    activeMessagePath.value.push(tempId)
    return msg
  }

  const createReplyFor = async (localUserMessage) => {
    const chatId = currentChatId.value === 'new' ? undefined : currentChatId.value
    const localAssistantMessage = addLocalMessage({
      sender: 'assistant',
      content: '',
      parentId: localUserMessage.id
    })

    const eventStream = await api.post('/conversation/send', {
      chatId,
      parentId: localUserMessage.parentId,
      content: localUserMessage.content,
    })

    for await (const event of eventStream) {
      if (event.type === 'chat') {
        const chat = event.data.chat
        const localChat = chatById.value[chat.id]
        if (localChat) continue

        chats.value.unshift(event.data.chat)
        keepLocalOnNextSelection.value = true
        selectChat(event.data.chat.id)
      }
      if (event.type === 'delta') {
        const delta = event.data.delta
        localAssistantMessage.content += delta
      }
    }

    //? È veramente utile? Si potrebbe togliere?
    loadMessages(currentChatId.value)
  }

  const buildMessageMap = (messages) => {
    const map = {}

    for (const msg of messages) {
      const parent = msg?.parentId;
      if (!map[parent]) map[parent] = [];
      map[parent].push(msg);
    }
    
    return map
  }

  const buildMessagePathFrom = (rootId) => {
    const path = [rootId]
    let current = rootId

    while (childrenByMessage.value[current]?.length) {
      const firstChild = childrenByMessage.value[current].at(-1)
      path.push(firstChild.id)
      current = firstChild.id
    }
    return path
  }
  // #endregion

  return {
    // STATE
    chats,
    messages,
    activeMessagePath,
    childrenByMessage,
    chatById,
    messageById,
    activeMessages,
    currentChatId,
    currentChatStatus,
    keepLocalOnNextSelection,

    // ACTIONS
    loadChats,
    renameChat,
    deleteChat,
    selectChat,
    loadMessages,
    sendMessage,
    selectMessageChild,
  }
})
