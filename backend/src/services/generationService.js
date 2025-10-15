import OpenAI from 'openai'
import { messageService } from '#services'
import { InternalServerError, AppError } from '#errors'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Errors
const ResponseNotGenerated = () => new InternalServerError('Nessuna risposta generata dal modello', 'NO_RESPONSE_GENERATED')

// Helpers
const formatMessagesForApi = (messages) => {
  return messages.map((msg) => ({
    role: msg.sender,
    content: msg.content,
  }))
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

export const generationService = {
  async *askAndStream(chatId, userId, content, options) {
    const userMessage = await messageService.create(chatId, userId, { content, sender: 'user' })

    const messages = await messageService.findAllByChatId(chatId, userId)
    const formattedMessages = formatMessagesForApi(messages)

    const stream = await initializeStream(formattedMessages, options)

    let assistantMessageContent = ''

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        const textChunk = event.delta || ''
        assistantMessageContent += textChunk
        yield { type: 'delta', data: { text: textChunk } }
      }

      if (event.type === 'response.complete') {
        //* Da utilizzare in futuro se necessario (ES: per ottenere il token usage)
      }
    }

    const assistantMessage = await messageService.create(chatId, userId, { sender: 'assistant', content: assistantMessageContent })
    yield { type: 'done', data: { userMessage, assistantMessage } }
  }
}