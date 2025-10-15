import { messageService } from '#services'

// Controllers
export const messageController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await messageService.findAllByChatId(chatId, req.user.id)
    res.json({ messages })
  },

  get: async (req, res) => {
    const { chatId, messageId } = req.params

    const message = await messageService.findById(messageId, chatId, req.user.id)
    res.json({ message })
  },

  create: async (req, res) => {
    const { chatId } = req.params
    const { content, sender } = req.body

    const message = await messageService.create(chatId, req.user.id, { content, sender })
    res.status(201).json({ message })
  },

  update: async (req, res) => {
    const { chatId, messageId } = req.params
    const { sender, content } = req.body

    const message = await messageService.update(messageId, chatId, req.user.id, { sender, content })
    res.json({ message })
  },

  delete: async (req, res) => {
    const { chatId, messageId } = req.params

    await messageService.delete(messageId, chatId, req.user.id)
    res.status(204).end()
  },
}
