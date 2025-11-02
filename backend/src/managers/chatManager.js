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

  find: async ({ id, userId }) => {
    return await db.chat.findUnique({
      where: { id, userId },
    })
  },

  findOrCreate: async ({ id, userId }) => {
    if (id) {
      const chat = await db.chat.findUnique({
        where: { id, userId },
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

  update: async ({ id, userId, title }) => {
    try {
      return await db.chat.update({
        where: { id, userId },
        data: { title },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },

  delete: async ({ id, userId }) => {
    try {
      await db.chat.delete({
        where: { id, userId },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },
}
