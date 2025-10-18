import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

// Errors
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

// Helpers
const isNotFoundError = (error) => {
  if (error.code === 'P2025') return true
  return false
}

export const chatService = {
  findAll: async (userId, orderBy) => {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: orderBy || 'desc' },
    })
    return chats
  },

  findById: async (chatId, userId) => {
    const chat = await prisma.chat.findUnique({
      where: { id: Number(chatId), userId },
      include: { messages: true },
    })
    if (!chat) throw ChatNotFound()
    return chat
  },

  create: async (userId, chat) => {
    return await prisma.chat.create({
      data: {
        userId,
        status: chat.status,
        title: chat.title,
        messages: {
          create:
            chat.messages?.map((message) => ({
              sender: message.sender,
              content: message.content,
            })) || [],
        },
      },
      include: { messages: true },
    })
  },

  update: async (chatId, userId, chat) => {
    try {
      return await prisma.chat.update({
        where: { id: Number(chatId), userId },
        data: {
          status: chat.status,
          title: chat.title,
          messages: chat.messages
            ? {
                deleteMany: {},
                create: chat.messages?.map((message) => ({
                  sender: message.sender,
                  content: message.content,
                })),
              }
            : undefined,
        },
        include: { messages: true },
      })
    } catch (error) {
      if (isNotFoundError(error)) throw ChatNotFound()
      throw error
    }
  },

  delete: async (chatId, userId) => {
    try {
      await prisma.chat.delete({
        where: { id: Number(chatId), userId },
      })
    } catch (error) {
      if (isNotFoundError(error)) throw ChatNotFound()
      throw error
    }
  },
}
