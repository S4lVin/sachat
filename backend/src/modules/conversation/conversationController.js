import { conversationUseCase } from './conversationUseCase.js'

export const conversationController = {
  sendMessage: async (req, res) => {
    const { parentId, chatId, content } = req.body

    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const eventStream = conversationUseCase.sendMessage({
      parentId,
      chatId,
      userId: req.userId,
      content,
    })

    for await (const event of eventStream) res.write(JSON.stringify(event) + '\n')
    res.end()
  },
}
