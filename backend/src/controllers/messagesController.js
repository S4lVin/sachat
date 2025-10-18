import { messageService } from '#services'

export const messagesController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await messageService.findAllByChatId(chatId, req.user.id)
    res.json({ messages })
  },

  create: async (req, res) => {
    const { chatId } = req.params
    const { sender, content } = req.body

    const message = await messageService.create(chatId, req.user.id, { sender, content })
    res.status(201).json({ message })
  },
}
