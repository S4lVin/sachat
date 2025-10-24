import { PrismaClient } from '@prisma/client'
import { NotFoundError, BadRequestError } from '#errors'

const prisma = new PrismaClient()

// Errors
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')
const MessageParentNotFound = () => new NotFoundError('Messaggio padre non trovato', 'MESSAGE_PARENT_NOT_FOUND')
const SameParentSender = () => new BadRequestError('Mittente del messaggio uguale al mittente del messaggio padre', 'SAME_PARENT_SENDER')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'
const isReferenceError = (err) => err?.code === 'P2003'

export const messageService = {
  getAllByChat: async (chatId, userId) => {
    return await prisma.message.findMany({
      where: { chatId, chat: { userId } },
    })
  },

  createForChat: async (chatId, userId, message) => {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } })
    if (!chat || chat.userId !== userId) throw ChatNotFound()
    
    try {
      return await prisma.message.create({
        data: {
          sender: 'user',
          content: message.content,
          parentId: message.parentId,
          chatId
        }
      })
    } catch (err) {
      if (isReferenceError(err)) throw MessageParentNotFound()
      throw err
    }
  },

  delete: async (id, userId) => {
    try {
      await prisma.message.delete({
        where: { id, chat: { userId } },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw MessageNotFound()
      throw err
    }
  },
}
