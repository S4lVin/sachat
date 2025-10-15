import { chatService } from '#services'

// Controllers
export const chatController = {
  getAll: async (req, res) => {
    const chats = await chatService.findAll(req.user.id)
    res.json({ chats })
  },

  get: async (req, res) => {
    const { chatId } = req.params

    const chat = await chatService.findById(chatId, req.user.id)
    res.json({ chat })
  },

  create: async (req, res) => {
    const { title, messages } = req.body

    const chat = await chatService.create(req.user.id, { title, messages })
    res.status(201).json({ chat })
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { title, messages } = req.body

    const chat = await chatService.update(chatId, req.user.id, { title, messages })
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await chatService.delete(chatId, req.user.id)
    res.status(204).end()
  },
}
