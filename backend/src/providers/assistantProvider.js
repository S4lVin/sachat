import OpenAI, { APIError } from 'openai'
import { AppError } from '#core/errors/appErrors.js'

// Helpers
function formatMessagesForApi(messages) {
  return messages.map((msg) => ({
    role: msg.sender,
    content: msg.content,
  }))
}

export const assistant = {
  generateStream: async function* ({ apiKey, messages }) {
    const input = formatMessagesForApi(messages)
    const stream = await this.initializeResponse({ apiKey, input })

    let response = ''
    let usage
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        const delta = event.delta || ''
        response += delta

        yield { type: 'delta', data: { delta } }
      }

      if (event.type === 'response.completed') {
        usage = event.response.usage
      }
    }

    yield { type: 'completed', data: { response, usage } }
  },

  initializeResponse: async function ({ apiKey, input }) {
    const client = new OpenAI({ apiKey })

    try {
      return await client.responses.create({
        input,
        model: 'gpt-5-mini',
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
  },
}
