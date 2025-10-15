import { responseService, messageService } from '#services'
import { InternalServerError } from '#errors'

// Errors
const ResponseNotGenerated = () =>
  new InternalServerError('Nessuna risposta generata dal modello', 'NO_RESPONSE_GENERATED')

// Controllers
export const responseController = {
  create: async (req, res) => {
    const { chatId, model } = req.body

    const stream = await responseService.initializeStream(chatId, req.user.id, model)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let responseText = ''

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        const textChunk = event.delta || ''

        responseText += textChunk
        res.write(JSON.stringify({ text: textChunk }) + '\n')
      }
    }

    if (!responseText) throw ResponseNotGenerated()

    await messageService.create(chatId, req.user.id, {
      sender: 'assistant',
      content: responseText,
    })

    res.end()
  },
}
