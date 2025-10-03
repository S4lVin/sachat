import { PrismaClient } from '#prisma';

const prisma = new PrismaClient();

export const chatController = {
  getAllChats: async (req, res) => {
    const chats = await prisma.chat.findMany();
    res.json({ chats });
  },

  createChat: async (req, res) => {
    const { title } = req.body;
    const newChat = await prisma.chat.create({
      data: { title },
    });
    res.status(201).json(newChat);
  },

  getChat: async (req, res) => {
    const { id } = req.params;
    const chat = await prisma.chat.findUnique({
      where: { id: Number(id) },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  },

  updateChat: async (req, res) => {
    const { id } = req.params;
    const { title, messages } = req.body;

    const updatedChat = await prisma.chat.update({
      where: { id: Number(id) },
      data: { title, messages },
    });
    res.json(updatedChat);
  },

  deleteChat: async (req, res) => {
    const { id } = req.params;
    
    await prisma.chat.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  }
}