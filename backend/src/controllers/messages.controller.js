import { PrismaClient } from '#prisma'

const prisma = new PrismaClient()

export const messageController = {
  getAll: async (req, res) => {
    const { chatId } = req.params

    const messages = await prisma.message.findMany({
      where: { chatId: Number(chatId) },
      orderBy: { createdAt: 'asc' },
    })
    res.json(messages)
  },

  get: async (req, res) => {
    const { messageId } = req.params

    const message = await prisma.message.findUnique({
      where: { id: Number(messageId) },
    })

    if (!message) {
      throw Object.assign(new Error(), { statusCode: 404 })
    }
    res.json(message)
  },

  create: async (req, res) => {
    const { chatId } = req.params
    const { content, sender } = req.body

    const message = await prisma.message.create({
      data: { content, sender, chatId: Number(chatId) },
    })
    res.status(201).json(message)
  },

  update: async (req, res) => {
    const { messageId } = req.params
    const { sender, content } = req.body

    const message = await prisma.message.update({
      where: { id: Number(messageId) },
      data: {
        sender,
        content,
      },
    })
    res.json(message)
  },

  delete: async (req, res) => {
    const { messageId } = req.params

    await prisma.message.delete({
      where: { id: Number(messageId) },
    })
    res.status(204).end()
  },
}
