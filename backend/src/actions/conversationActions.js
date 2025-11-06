import { chatManager, messageManager, userManager } from '../managers/index.js'
import { aiService } from '../services/index.js'
import { BadRequestError, NotFoundError } from '../errors.js'
import { EventEmitter, on } from 'events'

// Helpers
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
const GenerationNotFound = () =>
  new NotFoundError('Generazione non trovata', 'GENERATION_NOT_FOUND')
const InvalidMessageSender = () =>
  new BadRequestError('Mittente del messaggio non valido', 'INVALID_MESSAGE_SENDER')

// State
const activeGenerations = new Map()

// Stream
const streamResponse = async ({ apiKey, messages, messageId, session, options, settings }) => {
  try {
    const stream = aiService.generateStream({ apiKey, messages, options, settings })
    for await (const event of stream) {
      if (!activeGenerations.has(messageId)) break
      session.content += event.data.delta || ''
      session.emitter.emit('event', event.type, event.data)
    }

    await messageManager.update({
      messageId,
      content: session.content,
      status: 'success',
    })
  } catch (err) {
    await messageManager.update({
      messageId,
      content: err.message,
      status: 'failed',
    })
    throw err
  } finally {
    session.emitter.emit('event', 'done')
    activeGenerations.delete(messageId)
  }
}

export const conversationActions = {
  getStream: async function* ({ messageId, userId }) {
    const session = activeGenerations.get(messageId)
    if (!session || session.userId !== userId) throw GenerationNotFound()

    if (session.content) {
      yield { type: 'delta', data: { delta: session.content } }
    }

    let error
    for await (const [type, data] of on(session.emitter, 'event')) {
      yield { type, data }
      if (type === 'error') error = data.err
      if (type === 'done') break
    }

    if (error) throw error
  },

  send: async function ({ parentId, chatId, userId, content, options }) {
    const { chat, created } = await chatManager.findOrCreate({ chatId, userId })

    let parentMessage
    if (parentId) {
      parentMessage = await messageManager.find({ messageId: parentId, userId })
      if (parentMessage && parentMessage.sender !== 'assistant') throw InvalidMessageSender()
    }

    const userMessage = await messageManager.create({
      parentId: parentMessage?.id,
      chatId: chat.id,
      sender: 'user',
      content,
    })

    const assistantMessage = await this.createAssistantReply({ userMessage, userId, options })
    if (created) return { chat, assistantMessage }
    return { assistantMessage }
  },

  regenerate: async function ({ messageId, userId, options }) {
    const assistantMessage = await messageManager.find({ messageId, userId })
    if (!assistantMessage) throw MessageNotFound()
    if (assistantMessage.sender !== 'assistant') throw InvalidMessageSender()

    if (assistantMessage.status === 'failed') {
      await messageManager.delete({ messageId })
    }

    const userMessage = await messageManager.find({ messageId: assistantMessage.parentId, userId })
    return await this.createAssistantReply({ userMessage, userId, options })
  },

  cancel: async function ({ messageId, userId }) {
    const message = await messageManager.find({ messageId, userId })
    if (!message) throw MessageNotFound()

    activeGenerations.delete(messageId)
  },

  createAssistantReply: async function ({ userMessage, userId, options }) {
    const apiKey = await userManager.getApiKey({ userId })
    const settings = await userManager.getSettings({ userId })
    const messages = await messageManager.getMessageChain({ messageId: userMessage.id, userId })

    const assistantMessage = await messageManager.create({
      parentId: userMessage.id,
      chatId: userMessage.chatId,
      sender: 'assistant',
      content: '',
      status: 'generating',
    })

    const emitter = new EventEmitter()
    const session = { emitter, content: '', userId }
    activeGenerations.set(assistantMessage.id, session)

    streamResponse({ apiKey, messages, messageId: assistantMessage.id, session, options, settings }).catch(
      async (err) => {
        session.emitter.emit('event', 'error', { err })
      },
    )
    return assistantMessage
  },
}
