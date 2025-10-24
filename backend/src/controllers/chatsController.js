import { chatService } from '#services'

export const chatsController = {
  getAll: async (req, res) => {
    const chats = await chatService.getAll(req.user.id)
    res.json({ chats })
  },

  create: async (req, res) => {
    const { title, messages } = req.body

    const chat = await chatService.create(req.user.id, { title, messages })
    res.status(201).json({ chat })
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { status, title } = req.body

    const chat = await chatService.updateTitle(Number(chatId), req.user.id, { status, title })
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await chatService.delete(Number(chatId), req.user.id)
    res.status(204).end()
  },
}
