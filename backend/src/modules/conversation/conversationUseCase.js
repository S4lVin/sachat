import { chatService } from '#modules/chats/chatService.js'
import { messageService } from '#modules/messages/messageService.js'
import { userService } from '#modules/users/userService.js'
import { assistant } from '#providers'
import { BadRequestError, NotFoundError } from '#core/errors/appErrors.js'

const MissingApiKey = () => new BadRequestError('API Key mancante', 'MISSING_API_KEY')
const ChatNotFound = () => new NotFoundError('Chat non trovata', 'CHAT_NOT_FOUND')

// TODO: Add cancelReply

export const conversationUseCase = {
  sendMessage: async function* ({ parentId, chatId, userId, content }) {
    const chat = await this.findOrCreateChat({ chatId, userId })
    yield { type: 'chat', data: { chat } }

    const userMessage = await messageService.create({
      parentId,
      chatId: chat.id,
      sender: 'user',
      content,
    })
    yield { type: 'message', data: { message: userMessage } }

    const user = await userService.find({ id: userId })
    const apiKey = this.resolveApiKey({ user })
    const messages = await messageService.getMessageChain({ id: userMessage.id, userId })

    const stream = this.generateAssistantReply({
      parentId: userMessage.id,
      chatId: chat.id,
      userId,
      apiKey,
      messages,
    })
    for await (const event of stream) yield event
  },

  findOrCreateChat: async function ({ chatId, userId }) {
    if (!chatId) return await chatService.create({ userId, title: 'Nuova chat' })

    const chat = await chatService.find({ id: chatId, userId })
    if (!chat) throw ChatNotFound()
    return chat
  },

  resolveApiKey: function ({ user }) {
    const { role, settings } = user

    if (role === 'vip' && !settings.useApiKey) {
      return process.env.OPENAI_API_KEY
    }

    if (!settings.apiKey) throw MissingApiKey()
    return settings.apiKey
  },

  generateAssistantReply: async function* ({ parentId, chatId, userId, apiKey, messages }) {
    await chatService.update({ id: chatId, userId, status: 'generating' })

    let response
    try {
      const stream = assistant.generateStream({ apiKey, messages })
      for await (const event of stream) {
        yield event
        if (event.type === 'completed') {
          response = event.data.response
        }
      }
    } finally {
      await chatService.update({ id: chatId, userId, status: null })
    }

    const assistantMessage = await messageService.create({
      parentId,
      chatId,
      sender: 'assistant',
      content: response,
    })
    yield { type: 'message', data: { message: assistantMessage } }
  },
}
