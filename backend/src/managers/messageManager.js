import db from '../db.js'
import { NotFoundError } from '../errors.js'

// Helpers
const MessageParentNotFound = () =>
  new NotFoundError('Messaggio parent non trovato', 'MESSAGE_PARENT_NOT_FOUND')
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

  // TODO: IMPROVE EFFICIENCY (currently N queries)
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

  update: async ({ id, status, content }) => {
    await db.message.update({
      where: { id },
      data: { status, content },
    })
  },

  create: async ({ parentId, chatId, sender, content, status }) => {
    try {
      return await db.message.create({
        data: { sender, content, status, parentId, chatId },
      })
    } catch (err) {
      if (isReferenceError(err)) throw MessageParentNotFound()
      throw err
    }
  },

  delete: async ({ id }) => {
    await db.message.delete({
      where: { id }
    })
  }
}
