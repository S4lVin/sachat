import { PrismaClient } from '@prisma/client'
import { CustomError } from '#utils'

const prisma = new PrismaClient()

export const messageController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await prisma.message.findMany({
      where: {
        chatId: Number(chatId),
        chat: { userId: req.user.id },
      },
      orderBy: { createdAt: 'asc' },
    })
    res.json(messages)
  },

  get: async (req, res) => {
    const { chatId, messageId } = req.params

    const message = await prisma.message.findUnique({
      where: {
        id: Number(messageId),
        chatId: Number(chatId),
        chat: { userId: req.user.id },
      },
    })

    if (!message) {
      throw new CustomError(404)
    }
    res.json(message)
  },

  create: async (req, res) => {
    const { chatId } = req.params
    const { content, sender } = req.body

    // Verifica che la chat esista e appartenga all'utente
    const chat = await prisma.chat.findUnique({
      where: {
        id: Number(chatId),
        userId: req.user.id,
      },
    })

    if (!chat) {
      throw new CustomError(404)
    }

    const message = await prisma.message.create({
      data: {
        content,
        sender,
        chatId: Number(chatId),
      },
    })
    res.status(201).json(message)
  },

  update: async (req, res) => {
    const { chatId, messageId } = req.params
    const { sender, content } = req.body

    const message = await prisma.message.update({
      where: { id: Number(messageId), chatId: Number(chatId), chat: { userId: req.user.id } },
      data: { sender, content },
    })
    res.json(message)
  },

  delete: async (req, res) => {
    const { chatId, messageId } = req.params

    await prisma.message.delete({
      where: { id: Number(messageId), chatId: Number(chatId), chat: { userId: req.user.id } },
    })
    res.status(204).end()
  },
}
