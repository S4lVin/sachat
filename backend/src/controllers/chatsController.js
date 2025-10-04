import { PrismaClient } from '#prisma'

const prisma = new PrismaClient()

export const chatController = {
  getAll: async (req, res) => {
    const chats = await prisma.chat.findMany()
    res.json({ chats })
  },

  get: async (req, res, next) => {
    const { chatId } = req.params

    const chat = await prisma.chat.findUnique({
      where: { id: Number(chatId) },
      include: { messages: true },
    })

    if (!chat) {
      throw Object.assign(new Error(), { statusCode: 404 })
    }
    res.json(chat)
  },

  create: async (req, res) => {
    const { title, messages } = req.body

    const newChat = await prisma.chat.create({
      data: {
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
    res.status(201).json(newChat)
  },

  update: async (req, res) => {
    const { chatId } = req.params
    const { title, messages } = req.body

    const updatedChat = await prisma.chat.update({
      where: { id: Number(chatId) },
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
    res.json(updatedChat)
  },

  delete: async (req, res) => {
    const { chatId } = req.params

    await prisma.chat.delete({
      where: { id: Number(chatId) },
    })
    res.status(204).end()
  },
}
