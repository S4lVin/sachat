import { messageManager } from '../../managers/index.js'

export const messageController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await messageManager.findAllByChat({
      chatId: Number(chatId),
      userId: req.userId,
    })
    res.json({ messages })
  },

  delete: async (req, res) => {
    const { messageId } = req.params

    await messageManager.delete({
      id: Number(messageId),
      userId: req.userId,
    })
    res.status(204).end()
  },
}
