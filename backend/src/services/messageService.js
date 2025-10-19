import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

// Errors
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'

export const messageService = {
  findAllByChatId: async (chatId, userId, { orderBy = 'asc' } = {}) => {
    const messages = await prisma.message.findMany({
      where: { chatId, chat: { userId } },
      orderBy: { createdAt: orderBy },
    })
    return messages
  },

  findById: async (id, chatId, userId) => {
    const message = await prisma.message.findUnique({
      where: {
        id,
        chatId,
        chat: { userId },
      },
    })
    if (!message) throw MessageNotFound()
    return message
  },

  create: async (chatId, userId, messageData) => {
    // Verifica che la chat appartenga all'utente
    const chat = await prisma.chat.findUnique({
      where: { id: chatId, userId },
    })
    if (!chat) throw MessageNotFound()

    const message = await prisma.message.create({
      data: {
        chatId,
        sender: messageData.sender,
        content: messageData.content,
      },
    })
    return message
  },

  updateById: async (id, chatId, userId, messageData) => {
    try {
      const message = await prisma.message.update({
        where: { id, chatId, chat: { userId } },
        data: {
          sender: messageData.sender,
          content: messageData.content,
        },
      })
      return message
    } catch (err) {
      if (isNotFoundError(err)) throw MessageNotFound()
      throw err
    }
  },

  deleteById: async (id, chatId, userId) => {
    try {
      await prisma.message.delete({
        where: { id, chatId, chat: { userId } },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw MessageNotFound()
      throw err
    }
  },
}
