import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

export const chatController = {
  getAll: async (req, res) => {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ chats })
  },

  get: async (req, res) => {
    const { chatId } = req.params

    const chat = await prisma.chat.findUnique({
      where: { id: Number(chatId), userId: req.user.id },
      include: { messages: true },
    })
    if (!chat) throw ChatNotFound()

    res.json({ chat })
  },

  create: async (req, res) => {
    const { title, messages } = req.body

    const chat = await prisma.chat.create({
      data: {
        userId: req.user.id,
        title,
        messages: {
          create:
            messages?.map((message) => ({
              sender: message.sender,
              content: message.content,
            })) || [],
        },
      },
      include: { messages: true },
    })

    res.status(201).json({ chat })
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { title, messages } = req.body

    try {
      const chat = await prisma.chat.update({
        where: { id: Number(chatId), userId: req.user.id },
        data: {
          title,
          messages: messages
            ? {
                deleteMany: {},
                create: messages?.map((message) => ({
                  sender: message.sender,
                  content: message.content,
                })),
              }
            : undefined,
        },
        include: { messages: true },
      })
    } catch (error) {
      if (error.code === 'P2025') throw ChatNotFound()
      throw error
    }

    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    try {
      await prisma.chat.delete({
        where: { id: Number(chatId), userId: req.user.id },
      })
    } catch (error) {
      if (error.code === 'P2025') throw ChatNotFound()
      throw error
    }

    res.status(204).end()
  },
}
