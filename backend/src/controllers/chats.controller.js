import { PrismaClient } from '#prisma'
import { CustomError } from '#utils'

const prisma = new PrismaClient()

export const chatController = {
  getAllChats: async (req, res) => {
    const chats = await prisma.chat.findMany()
    res.json({ chats })
  },

  createChat: async (req, res) => {
    const { title } = req.body
    const newChat = await prisma.chat.create({
      data: { title },
    })
    res.status(201).json(newChat)
  },

  getChat: async (req, res, next) => {
    const { id } = req.params
    const chat = await prisma.chat.findUnique({
      where: { id: Number(id) },
    })

    if (!chat) {
      throw Object.assign(new Error(), { statusCode: 404 })
    }
    res.json(chat)
  },

  updateChatTitle: async (req, res) => {
    const { id } = req.params
    const { title } = req.body

    const updatedChat = await prisma.chat.update({
      where: { id: Number(id) },
      data: { title },
    })
    res.json(updatedChat)
  },

  deleteChat: async (req, res) => {
    const { id } = req.params

    await prisma.chat.delete({
      where: { id: Number(id) },
    })
    res.status(204).end()
  },
}
