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

  find: async ({ messageId, userId }) => {
    return await db.message.findUnique({
      where: { id: messageId, chat: { userId } },
    })
  },

  // TODO: IMPROVE EFFICIENCY (currently N queries)
  getMessageChain: async ({ messageId, userId }) => {
    const messageChain = []
    let message = await db.message.findUnique({
      where: { id: messageId, chat: { userId } },
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

  update: async ({ messageId, status, content }) => {
    await db.message.update({
      where: { id: messageId },
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

  delete: async ({ messageId }) => {
    await db.message.delete({
      where: { id: messageId },
    })
  },
}
