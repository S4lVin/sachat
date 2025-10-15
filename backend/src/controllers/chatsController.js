import { chatService, generationService, messageService } from '#services'

export const chatsController = {
  getAll: async (req, res) => {
    const chats = await chatService.findAll(req.user.id)
    res.json({ chats })
  },

  get: async (req, res) => {
    const { chatId } = req.params

    const chat = await chatService.findById(chatId, req.user.id)
    res.json({ chat })
  },

  createEmpty: async (req, res) => {
    const { title } = req.body

    const chat = await chatService.create(req.user.id, { title, messages: [] })
    res.status(201).json({ chat })
  },

  updateTitle: async (req, res) => {
    const { chatId } = req.params
    const { title } = req.body

    const chat = await chatService.update(chatId, req.user.id, { title })
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await chatService.delete(chatId, req.user.id)
    res.status(204).end()
  },

  ask: async (req, res) => {
    const { chatId } = req.params
    const { content, options } = req.body

    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    for await (const event of generationService.askAndStream(
      chatId,
      req.user.id,
      content,
      options,
    )) {
      //? Cosa succede quando il client chiude la connessione?
      res.write(JSON.stringify(event) + '\n')
    }

    res.end()
  },
}
