import { PrismaClient } from '@prisma/client'
import { CustomError } from '#utils'

const prisma = new PrismaClient()

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

    if (!chat) {
      throw new CustomError(404)
    }
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
    res.json({ chat })
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await prisma.chat.delete({
      where: { id: Number(chatId), userId: req.user.id },
    })
    res.status(204).end()
  },
}
