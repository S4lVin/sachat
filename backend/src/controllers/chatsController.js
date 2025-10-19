import { chatService, chatReplyService } from '#services'

export const chatsController = {
  // Actions
  reply: async (req, res) => {
    const { chatId } = req.params
    const { options } = req.body

    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let clientClosed = false
    req.on('close', () => (clientClosed = true))

    for await (const event of chatReplyService.reply(
      Number(chatId),
      req.user.id,
      req.user.role,
      options,
    )) {
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

  // CRUD
  getAll: async (req, res) => {
    const chats = await chatService.findAll(req.user.id)
    res.json({ chats })
  },

  get: async (req, res) => {
    const { chatId } = req.params

    const chat = await chatService.findById(Number(chatId), req.user.id)
    res.json({ chat })
  },

  create: async (req, res) => {
    const { title, messages } = req.body

    const chat = await chatService.create(req.user.id, { title, messages: messages ?? [] })
    res.status(201).json({ chat })
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { title, messages } = req.body

    const chat = await chatService.updateById(Number(chatId), req.user.id, { title, messages })
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await chatService.deleteById(Number(chatId), req.user.id)
    res.status(204).end()
  },
}
