import { chatManager, messageManager, userManager } from '../managers/index.js'
import { aiService } from '../services/index.js'
import { BadRequestError, NotFoundError } from '../errors.js'

// Helpers
const MissingApiKey = () => new BadRequestError('API Key mancante', 'MISSING_API_KEY')
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')
const MessageNotFound = () => new NotFoundError('Messaggio non trovato', 'MESSAGE_NOT_FOUND')
const InvalidMessageSender = () =>
  new BadRequestError('Mittente del messaggio non valido', 'INVALID_MESSAGE_SENDER')

export const conversationActions = {
  send: async function* ({ parentId, chatId, userId, content }) {
    const chat = await chatManager.findOrCreate({ id: chatId, userId })
    yield { type: 'chat', data: { chat } }

    let parentMessage
    if (parentId) {
      parentMessage = await messageManager.find({ id: parentId, userId })
      if (parentMessage && parentMessage.sender !== 'assistant') throw InvalidMessageSender()
    }

    const userMessage = await messageManager.create({
      parentId: parentMessage?.id,
      chatId: chat.id,
      sender: 'user',
      content,
    })

    yield* this.generateAssistantReply({ userMessage, userId })
  },

  regenerate: async function* ({ parentId, userId }) {
    const userMessage = await messageManager.find({ id: parentId, userId })
    if (!userMessage) throw MessageNotFound()
    if (userMessage.sender !== 'user') throw InvalidMessageSender()

    yield* this.generateAssistantReply({ userMessage, userId })
  },

  generateAssistantReply: async function* ({ userMessage, userId }) {
    const apiKey = await userManager.getApiKey({ id: userId })
    const messages = await messageManager.getMessageChain({ id: userMessage.id, userId })

    await chatManager.update({ id: userMessage.chatId, userId, status: 'generating' })

    let response
    try {
      const stream = aiService.generateStream({ apiKey, messages })
      for await (const event of stream) {
        yield event
        if (event.type === 'completed') {
          response = event.data.response
        }
      }
    } finally {
      await chatManager.update({ id: userMessage.chatId, userId, status: null })
    }

    const assistantMessage = await messageManager.create({
      parentId: userMessage.id,
      chatId: userMessage.chatId,
      sender: 'assistant',
      content: response,
    })
  },
}
