import { db } from '#providers'
import { NotFoundError, BadRequestError } from '#core/errors/appErrors.js'

// Errors
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
const ParentNotFound = () => new NotFoundError('Messaggio parent non trovato', 'PARENT_NOT_FOUND')
const ParentRequired = () =>
  new BadRequestError('Parent richiesto per messaggi non-root', 'PARENT_REQUIRED')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'
const isReferenceError = (err) => err?.code === 'P2003'

export const messageService = {
  findAllByChat: async function ({ chatId, userId }) {
    return await db.message.findMany({
      where: { chatId, chat: { userId } },
    })
  },

  find: async function ({ id, userId }) {
    return await db.message.findUnique({
      where: { id, chat: { userId } },
    })
  },

  getMessageChain: async function ({ id, userId }) {
    const messageChain = []
    let message = await this.find({ id, userId })

    while (true) {
      messageChain.unshift(message)
      if (!message.parentId) break
      message = await this.find({ id: message.parentId, userId })
    }

    return messageChain
  },

  create: async function ({ parentId, chatId, sender, content }) {
    if (!parentId) {
      const count = await db.message.count({ where: { chatId } })
      if (count > 0) throw ParentRequired()
    }

    try {
      return await db.message.create({
        data: { sender, content, parentId, chatId },
      })
    } catch (err) {
      if (isReferenceError(err)) throw ParentNotFound()
      throw err
    }
  },

  delete: async function ({ id, userId }) {
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
