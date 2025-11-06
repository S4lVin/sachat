import OpenAI, { APIError } from 'openai'
import { AppError } from '../errors.js'

const aiConfig = await import('../configs/aiConfig.json', {
  with: { type: 'json' },
}).then((m) => m.default)

// Helpers
function formatMessagesForApi(messages) {
  return messages.map((msg) => ({
    role: msg.sender,
    content: msg.content,
  }))
}

export const aiService = {
  config: aiConfig,

  generateStream: async function* ({ apiKey, messages, options, settings }) {
    const input = formatMessagesForApi(messages)
    const stream = await this.initializeResponse({ apiKey, input, options, settings })

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

  initializeResponse: async function ({ apiKey, input, options, settings }) {
    const { default_reasoning, default_model, system_prompt, max_messages } = this.config
    const client = new OpenAI({ apiKey: apiKey ?? '' })
    const effort = options?.reasoning || default_reasoning
    const model = options?.model ?? default_model
    const systemPrompt = system_prompt

    try {
      return await client.responses.create({
        model,
        reasoning: { effort },
        stream: true,
        tools: [{ type: 'web_search' }],
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'developer', content: settings?.customPrompt ?? '' },
          ...input.slice(-max_messages),
        ],
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
