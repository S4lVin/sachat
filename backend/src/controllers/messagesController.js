import { messageService } from '#services'

export const messagesController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await messageService.findAllByChatId(chatId, req.user.id)
    res.json({ messages })
  },

  updateContent: async (req, res) => {
    const { chatId, messageId } = req.params
    const { content } = req.body

    const message = await messageService.update(messageId, chatId, req.user.id, { content }) //? Dovrebbe essere cambiato
    res.json({ message })
  },

  delete: async (req, res) => {
    const { chatId, messageId } = req.params

    await messageService.delete(messageId, chatId, req.user.id)
    res.status(204).end()
  },
}
