import { chatManager } from '../../managers/index.js'

export const chatController = {
  getAll: async (req, res) => {
    const chats = await chatManager.findAll({
      userId: req.userId,
    })
    res.json({ chats })
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { title } = req.body

    const chat = await chatManager.update({
      chatId: Number(chatId),
      userId: req.userId,
      title,
    })
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await chatManager.delete({
      chatId: Number(chatId),
      userId: req.userId,
    })
    res.status(204).end()
  },
}
