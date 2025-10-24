import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

// Errors
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'

export const chatService = {
  getAll: async (userId) => {
    return await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  create: async (userId, chat) => {
    return await prisma.chat.create({
      data: {
        userId,
        title: chat.title,
        messages: chat.messages ?? [],
      },
    })
  },

  update: async (id, userId, chat) => {
    try {
      return await prisma.chat.update({
        where: { id, userId },
        data: {
          status: chat.status,
          title: chat.title,
        },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },

  delete: async (id, userId) => {
    try {
      await prisma.chat.delete({
        where: { id, userId },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },
}
