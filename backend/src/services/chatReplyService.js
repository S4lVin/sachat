import OpenAI, { APIError } from 'openai'
import { chatService, messageService, userService } from '#services'
import { AppError, NotFoundError, InternalServerError } from '#errors'

// Errors
const NoApiKeyProvided = () => new NotFoundError('Nessun API key impostata', 'API_KEY_NOT_SET')
const ResponseNotGenerated = () =>
  new InternalServerError('Nessuna risposta generata dal modello', 'NO_RESPONSE_GENERATED')

// State
const activeReplies = new Map()

// Helpers
const formatMessagesForApi = (messages) => {
  return messages.map((msg) => ({
    role: msg.sender,
    content: msg.content,
  }))
}

const buildModelInput = async (chatId, userId) => {
  const messages = await messageService.findAllByChatId(chatId, userId)
  return formatMessagesForApi(messages)
}

const getApiKey = async (userId, userRole) => {
  if (userRole === 'vip') {
    return process.env.OPENAI_API_KEY
  }

  const user = await userService.findById(userId, { sensitive: true })
  if (!user.apiKey) throw NoApiKeyProvided()
  return user.apiKey
}

const initializeStream = async (input, userId, userRole, options) => {
  const apiKey = await getApiKey(userId, userRole)
  const client = new OpenAI({ apiKey })

  try {
    return await client.responses.create({
      input: input,
      model: options?.model ?? 'gpt-5-mini',
      stream: true,
    })
  } catch (err) {
    if (err instanceof APIError) {
      throw new AppError({
        message: err.error.message,
        statusCode: err.status,
        errorCode: 'OPENAI_ERROR',
      })
    }
    throw err
  }
}

export const chatReplyService = {
  reply: async function* (chatId, userId, userRole, options) {
    const key = `${chatId}-${userId}`
    activeReplies.set(key, { aborted: false })
    await chatService.updateById(chatId, userId, { status: 'generating' })

    try {
      let assistantMessageContent = ''
      let totalTokenUsed = 0

      const input = await buildModelInput(chatId, userId)
      const stream = await initializeStream(input, userId, userRole, options)

      for await (const event of stream) {
        if (activeReplies.get(key)?.aborted) break

        // Delta
        if (event.type === 'response.output_text.delta') {
          const textChunk = event.delta || ''
          assistantMessageContent += textChunk

          yield { type: 'delta', data: { text: textChunk } }
        }

        // Completed
        if (event.type === 'response.completed') {
          totalTokenUsed = event.response.usage.total_tokens
        }
      }

      if (!assistantMessageContent) throw ResponseNotGenerated()
      const assistantMessage = await messageService.create(chatId, userId, {
        sender: 'assistant',
        content: assistantMessageContent,
      })

      yield { type: 'done', data: { assistantMessage, info: { totalTokenUsed } } }
    } finally {
      activeReplies.delete(key)
      chatService.updateById(chatId, userId, { status: null })
    }
  },

  cancelReply: (chatId, userId) => {
    const key = `${chatId}-${userId}`

    if (activeReplies.has(key)) {
      activeReplies.get(key).aborted = true
    }
  },
}
