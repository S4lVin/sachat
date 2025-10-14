import { api } from '@/helpers/api'
import { consumeSseJson } from '@/helpers/sse'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { reactive, ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // #region CONSTANTS
  const TEMP_ID_PREFIX = 'temp-'
  const NEW_SENTINEL = 'new' // per coerenza, stessa stringa usata in ChatView
  // #endregion

  // #region STATE
  const chats = ref() // verrà popolato da loadChats
  const selectedChat = ref()
  const messages = ref() // null, [] o array
  const isGenerating = ref(false)

  // Flow flags
  const keepLocalOnNextSelection = ref(false) // evita reset quando promuovo la chat
  const ensuringChat = ref(null) // Promise in-flight per evitare conflitti

  // Streaming
  const sseController = ref(null)
  // #endregion

  // #region ACTIONS
  const loadChats = async () => {
    const data = await api.get('chats')
    chats.value = data.chats || []
  }

  const createChat = async (chat) => {
    const data = await api.post('chats', {
      title: chat?.title ?? 'Nuova chat',
      messages: chat?.messages ?? [],
    })
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

  // Non blocca la UI: crea un temp e programma la persistenza quando la chat è pronta
  const sendUserMessage = (content) => {
    const tempMessage = appendTemporaryMessage('user', content)
    ensureChat()
      .then((chatId) => persistMessage(chatId, tempMessage))
      .catch(() => markMessageAsFailed(tempMessage)) // opzionale: flag visivo
    return tempMessage
  }

  // Avvia subito lo streaming, in parallelo assicura che la chat esista
  const requestAssistantReply = async () => {
    if (isGenerating.value) return

    const input = buildModelInput()
    const tempMessage = appendTemporaryMessage('assistant', '')
    isGenerating.value = true

    const controller = new AbortController()
    sseController.value = controller
    const chatIdPromise = ensureChat()

    let receivedText = false
    try {
      receivedText = await streamCompletionIntoMessage(input, tempMessage, controller.signal)
    } catch {
      receivedText = false
    }

    console.log('streaming finished, receivedText=', receivedText)

    try {
      const chatId = await chatIdPromise
      // Ordine garantito: prima gli user temporanei, poi l'assistente
      await persistPendingUserMessages(chatId)
      console.log('user messages persisted')

      if (receivedText && tempMessage.content.length > 0) {
        console.log('assistant persisting')
        await persistMessage(chatId, tempMessage)
      } else {
        // Nessun token ricevuto o errore → rimuovo il messaggio assistant temporaneo
        removeMessageById(tempMessage.id)
      }
    } finally {
      isGenerating.value = false
      sseController.value = null
    }
  }

  const cancelAssistantReply = () => {
    isGenerating.value = false
    sseController.value?.abort() // interrompe realmente lo stream
  }
  // #endregion

  // #region HELPERS
  const ensureChat = () => {
    if (selectedChat.value?.id) return Promise.resolve(selectedChat.value.id)
    if (ensuringChat.value) return ensuringChat.value

    ensuringChat.value = (async () => {
      const newChat = await createChat()
      keepLocalOnNextSelection.value = true
      selectChat(newChat.id) // promuove la chat
      return newChat.id
    })().finally(() => {
      ensuringChat.value = null
    })

    return ensuringChat.value
  }

  const ensureMessagesArray = () => {
    if (!Array.isArray(messages.value)) messages.value = []
  }

  const generateTempId = () =>
    `${TEMP_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const appendTemporaryMessage = (sender, content = '') => {
    ensureMessagesArray()
    const id = generateTempId()
    const message = reactive({ id, sender, content })
    messages.value.push(message)
    return message
  }

  const removeMessageById = (id) => {
    const i = Array.isArray(messages.value) ? messages.value.findIndex((m) => m.id === id) : -1
    if (i !== -1) messages.value.splice(i, 1)
  }

  const isTempMessage = (message) =>
    typeof message?.id === 'string' && message.id.startsWith(TEMP_ID_PREFIX)

  const markMessageAsFailed = (message) => {
    // opzionale: utile per UI (badge "non inviato", retry, ecc.)
    message.failed = true
  }

  const persistPendingUserMessages = async (chatId) => {
    if (!Array.isArray(messages.value)) return
    const pendingUsers = messages.value.filter(
      (m) => m.sender === 'user' && isTempMessage(m),
    )
    for (const m of pendingUsers) {
      await persistMessage(chatId, m)
    }
  }

  // Nota: NON crea la chat qui. Se manca l'id → è un errore d'uso (deve pensarci ensureChat).
  const persistMessage = async (chatId, message) => {
    if (!chatId) throw new Error('persistMessage requires chatId')

    const data = await api.post(`chats/${chatId}/messages`, {
      sender: message.sender,
      content: message.content,
    })

    Object.assign(message, data.message) // sostituisce id/temp con quello reale
  }

  const buildModelInput = () => {
    if (!Array.isArray(messages.value)) return []
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
        console.log('SSE JSON:', json)
        if (json.type === 'response.output_text.delta' && json.delta) {
          tempMessage.content += json.delta
          receivedText = true
        }
      },
      shouldBreak: () => signal.aborted || !isGenerating.value,
    })

    console.log('streamCompletionIntoMessage done, receivedText=', receivedText)

    return receivedText
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
    sendUserMessage,
    requestAssistantReply,
    cancelAssistantReply,
  }
})