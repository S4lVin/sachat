import OpenAI from 'openai'
import { chatService, messageService } from '#services'
import { InternalServerError, AppError } from '#errors'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Errors
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

const initializeStream = async (input, options) => {
  try {
    return await client.responses.create({
      input: input,
      model: options.model,
      stream: true,
    })
  } catch (error) {
    throw new AppError({
      message: error.error.message,
      statusCode: error.status,
      errorCode: 'OPENAI_ERROR',
    })
  }
}

export const chatReplyService = {
  reply: async function* (chatId, userId, options) {
    const key = `${chatId}-${userId}`
    activeReplies.set(key, { aborted: false })
    chatService.update(chatId, userId, { status: 'generating' })

    try {
      let assistantMessageContent = ''
      let totalTokenUsed = 0

      const input = await buildModelInput(chatId, userId)
      const stream = await initializeStream(input, options)

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
      chatService.update(chatId, userId, { status: null })
    }
  },

  cancelReply: (chatId, userId) => {
    const key = `${chatId}-${userId}`

    if (activeReplies.has(key)) {
      activeReplies.get(key).aborted = true
    }
  },
}
