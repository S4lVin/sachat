import OpenAI from 'openai'
import { CustomError } from '#utils'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const completionController = {
  create: async (req, res) => {
    try {
      const response = await client.responses.create(req.body)
      res.json(response)
    } catch (error) {
      throw new CustomError(error.status, error.error.message)
    }
  },
}
