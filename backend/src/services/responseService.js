import OpenAI from 'openai'
import { messageService } from '#services'
import { AppError } from '#errors'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Helpers
const formatMessagesForApi = (messages) => {
  return messages.map((msg) => ({
    role: msg.sender,
    content: msg.content,
  }))
}

export const responseService = {
  initializeStream: async (chatId, userId, model) => {
    const messages = await messageService.findAllByChatId(chatId, userId)
    const formattedMessages = formatMessagesForApi(messages)

    try {
      const stream = await client.responses.create({
        model,
        input: formattedMessages,
        stream: true,
      })
      return stream
    } catch (error) {
      throw new AppError({
        message: error.error.message,
        statusCode: error.status,
        errorCode: 'OPENAI_ERROR',
      })
    }
  },
}
