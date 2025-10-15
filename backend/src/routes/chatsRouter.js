import express from 'express'
import { messagesRouter } from './messagesRouter.js'
import { validator } from '#middlewares'
import { chatsController } from '#controllers'
import { chatSchemas } from '#schemas'

export const chatsRouter = express.Router()

chatsRouter.use('/:chatId/messages', messagesRouter)

chatsRouter.route('/:chatId/ask').post(validator(chatSchemas.ask), chatsController.ask)

chatsRouter
  .route('/:chatId')
  .get(chatsController.get)
  .patch(validator(chatSchemas.updateTitle), chatsController.updateTitle)
  .delete(chatsController.delete)

chatsRouter
  .route('/')
  .get(chatsController.getAll)
  .post(validator(chatSchemas.createEmpty), chatsController.createEmpty)
