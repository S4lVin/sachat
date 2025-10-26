import { db } from '#providers'
import { NotFoundError } from '#core/errors/appErrors.js'

// Errors
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'

export const chatService = {
  findAll: async function ({ userId }) {
    return await db.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  find: async function ({ id, userId }) {
    return await db.chat.findUnique({
      where: { id, userId },
    })
  },

  create: async function ({ userId, title }) {
    return await db.chat.create({
      data: { title, userId },
    })
  },

  update: async function ({ id, userId, status, title }) {
    try {
      return await db.chat.update({
        where: { id, userId },
        data: { status, title },
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
