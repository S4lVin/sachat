import { chatService } from './chatService.js'

export const chatsController = {
  getAll: async (req, res) => {
    const chats = await chatService.findAll({
      userId: req.userId,
    })
    res.json({ chats })
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { title } = req.body

    const chat = await chatService.update({
      id: Number(chatId),
      userId: req.userId,
      title,
    })
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await chatService.delete({
      id: Number(chatId),
      userId: req.userId,
    })
    res.status(204).end()
  },
}
