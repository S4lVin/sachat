import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

// Errors
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')

export const messageService = {
  findAllByChatId: async (chatId, userId, orderBy) => {
    const messages = await prisma.message.findMany({
      where: {
        chatId: Number(chatId),
        chat: { userId },
      },
      orderBy: { createdAt: orderBy || 'asc' },
    })
    return messages
  },

  findById: async (messageId, chatId, userId) => {
    const message = await prisma.message.findUnique({
      where: {
        id: Number(messageId),
        chatId: Number(chatId),
        chat: { userId },
      },
    })
    if (!message) throw MessageNotFound()
    return message
  },

  create: async (chatId, userId, message) => {
    // Verifica che la chat esista e appartenga all'utente
    const chat = await prisma.chat.findUnique({
      where: {
        id: Number(chatId),
        userId,
      },
    })
    if (!chat) throw MessageNotFound()

    return await prisma.message.create({
      data: {
        content: message.content,
        sender: message.sender,
        chatId: Number(chatId),
      },
    })
  },

  update: async (messageId, chatId, userId, message) => {
    try {
      return await prisma.message.update({
        where: { id: Number(messageId), chatId: Number(chatId), chat: { userId } },
        data: { sender: message.sender, content: message.content },
      })
    } catch (error) {
      if (error.code === 'P2025') throw MessageNotFound()
      throw error
    }
  },

  delete: async (messageId, chatId, userId) => {
    try {
      await prisma.message.delete({
        where: { id: Number(messageId), chatId: Number(chatId), chat: { userId } },
      })
    } catch (error) {
      if (error.code === 'P2025') throw MessageNotFound()
      throw error
    }
  },
}
