import express from 'express'
import { validator } from '#middlewares'
import { chatsController } from './chatsController.js'
import { messagesRouter } from '#modules/messages/messagesRouter.js'
import { chatSchemas } from './chatSchemas.js'

export const chatsRouter = express.Router()

chatsRouter.use('/:chatId/messages', messagesRouter)

chatsRouter.patch('/:chatId', validator(chatSchemas.update), chatsController.update)
chatsRouter.delete('/:chatId', chatsController.delete)
chatsRouter.get('/', chatsController.getAll)
