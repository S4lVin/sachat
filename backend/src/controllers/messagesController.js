import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#utils'

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

    res.json({ messages })
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

    if (!message) throw new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')

    res.json({ message })
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

    if (!chat) throw new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

    const message = await prisma.message.create({
      data: {
        content,
        sender,
        chatId: Number(chatId),
      },
    })

    res.status(201).json({ message })
  },

  update: async (req, res) => {
    const { chatId, messageId } = req.params
    const { sender, content } = req.body

    try {
      const message = await prisma.message.update({
        where: { id: Number(messageId), chatId: Number(chatId), chat: { userId: req.user.id } },
        data: { sender, content },
      })
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
      throw error
    }

    res.json({ message })
  },

  delete: async (req, res) => {
    const { chatId, messageId } = req.params

    try {
      await prisma.message.delete({
        where: { id: Number(messageId), chatId: Number(chatId), chat: { userId: req.user.id } },
      })
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
      throw error
    }

    res.status(204).end()
  },
}
