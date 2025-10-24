import { messageService, chatReplyService } from '#services'

export const messagesController = {
  // Actions
  reply: async (req, res) => {
    const { messageId } = req.params
    const { options } = req.body

    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let clientClosed = false
    req.on('close', () => (clientClosed = true))

    for await (const event of chatReplyService.reply(Number(messageId), req.user.id, options)) {
      if (clientClosed) return
      res.write(JSON.stringify(event) + '\n')
    }

    res.end()
  },

  cancelReply: (req, res) => {
    const { chatId } = req.params

    chatReplyService.cancelReply(Number(chatId), req.user.id)
    res.status(204).end()
  },

  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await messageService.getAllByChat(Number(chatId), req.user.id)
    res.json({ messages })
  },

  create: async (req, res) => {
    const { chatId } = req.params
    const { content, parentId } = req.body

    const message = await messageService.createForChat(Number(chatId), req.user.id, { content, parentId })
    res.status(201).json({ message })
  },

  delete: async (req, res) => {
    const { messageId } = req.params

    await messageService.delete(Number(messageId), req.user.id)
    res.status(204).end()
  }
}
