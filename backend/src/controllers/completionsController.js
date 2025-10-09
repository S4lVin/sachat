import OpenAI from 'openai'
import { CustomError } from '#utils'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const streamResponse = async (res, asyncIterator) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.flushHeaders()

  const abortController = new AbortController();
  res.on('close', () => {
    res.aborted = true
    abortController.abort()
  })

  try {
    for await (const event of asyncIterator) {
      if (abortController.signal.aborted) break;
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }
  } catch (error) {
    throw new CustomError(error.status, error.error.message)
  } finally {
    res.end()
  }
}

export const completionController = {
  create: async (req, res) => {
    try {
      const stream = await client.responses.create({ ...req.body, stream: true })
      await streamResponse(res, stream)
    } catch (error) {
      throw new CustomError(error.status, error.error.message)
    }
  },
}
