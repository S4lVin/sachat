import db from '../db.js'
import { NotFoundError, BadRequestError } from '../errors.js'

// Helpers
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
const MessageParentNotFound = () =>
  new NotFoundError('Messaggio parent non trovato', 'MESSAGE_PARENT_NOT_FOUND')
const isNotFoundError = (err) => err?.code === 'P2025'
const isReferenceError = (err) => err?.code === 'P2003'

export const messageManager = {
  findAllByChat: async ({ chatId, userId }) => {
    return await db.message.findMany({
      where: { chatId, chat: { userId } },
      orderBy: { createdAt: 'asc' },
    })
  },

  find: async ({ id, userId }) => {
    return await db.message.findUnique({
      where: { id, chat: { userId } },
    })
  },

  findByParent: async ({ parentId, userId }) => {
    return await db.message.findUnique({
      where: { parentId, chat: { userId } },
    })
  },

  findLastOfChat: async ({ chatId, userId }) => {
    return await db.message.findFirst({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
    })
  },

  getMessageChain: async ({ id, userId }) => {
    const messageChain = []
    let message = await db.message.findUnique({
      where: { id, chat: { userId } },
    })

    while (message) {
      messageChain.unshift(message)
      if (!message.parentId) break
      message = await db.message.findUnique({
        where: { id: message.parentId, chat: { userId } },
      })
    }

    return messageChain
  },

  create: async ({ parentId, chatId, sender, content }) => {
    try {
      return await db.message.create({
        data: { sender, content, parentId, chatId },
      })
    } catch (err) {
      if (isReferenceError(err)) throw MessageParentNotFound()
      throw err
    }
  },

  delete: async ({ id, userId }) => {
    try {
      await db.message.delete({
        where: { id, chat: { userId } },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw MessageNotFound()
      throw err
    }
  },
}
