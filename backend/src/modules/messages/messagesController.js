import { messageService } from './messageService.js'

export const messagesController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await messageService.findAllByChat({
      chatId: Number(chatId),
      userId: req.userId,
    })
    res.json({ messages })
  },

  delete: async (req, res) => {
    const { messageId } = req.params

    await messageService.delete({
      id: Number(messageId),
      userId: req.userId,
    })
    res.status(204).end()
  },
}
