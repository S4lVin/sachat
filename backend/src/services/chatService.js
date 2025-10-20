import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

// Errors
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'

export const chatService = {
  findAll: async (userId, { orderBy = 'asc' } = {}) => {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: orderBy },
    })
    return chats
  },

  findById: async (id, userId) => {
    const chat = await prisma.chat.findFirst({
      where: { id, userId },
    })
    if (!chat) throw ChatNotFound()
    return chat
  },

  create: async (userId, chatData) => {
    const chat = await prisma.chat.create({
      data: {
        userId,
        status: chatData.status,
        title: chatData.title,
        messages: chatData.messages
          ? {
              create: chatData.messages.map((msg) => ({
                sender: msg.sender,
                content: msg.content,
              })),
            }
          : undefined,
      },
    })
    return chat
  },

  updateById: async (id, userId, chatData) => {
    try {
      const chat = await prisma.chat.update({
        where: { id, userId },
        data: {
          status: chatData.status,
          title: chatData.title,
          ...(chatData.messages && {
            messages: {
              deleteMany: {}, // reset messaggi
              create: chatData.messages.map((msg) => ({
                sender: msg.sender,
                content: msg.content,
              })),
            },
          }),
        },
      })
      return chat
    } catch (err) {
      if (isNotFoundError(err)) throw ChatNotFound()
      throw err
    }
  },

  deleteById: async (id, userId) => {
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
