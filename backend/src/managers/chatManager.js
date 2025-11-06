import db from '../db.js'
import { NotFoundError } from '../errors.js'

// Helpers
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')
const isNotFoundError = (err) => err?.code === 'P2025'

export const chatManager = {
  findAll: async ({ userId }) => {
    return await db.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  find: async ({ chatId, userId }) => {
    return await db.chat.findUnique({
      where: { id: chatId, userId },
    })
  },

  findOrCreate: async ({ chatId, userId }) => {
    if (chatId) {
      const chat = await db.chat.findUnique({
        where: { id: chatId, userId },
      })
      if (chat) return { chat, created: false }
    }

    const chat = await db.chat.create({
      data: {
        title: 'Nuova chat',
        userId,
      },
    })
    return { chat, created: true }
  },

  update: async ({ chatId, userId, title }) => {
    try {
      return await db.chat.update({
        where: { id: chatId, userId },
        data: { title },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },

  delete: async ({ chatId, userId }) => {
    try {
      await db.chat.delete({
        where: { id: chatId, userId },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },
}
