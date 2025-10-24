import express from 'express'
import { messagesRouter } from './messagesRouter.js'
import { validator } from '#middlewares'
import { chatsController } from '#controllers'
import { chatSchemas } from '#schemas'

export const chatsRouter = express.Router()

// Messages
chatsRouter.use('/:chatId/messages', messagesRouter)

// CRUD
chatsRouter
  .route('/:chatId')
  .patch(validator(chatSchemas.update), chatsController.update)
  .delete(chatsController.delete)

chatsRouter
  .route('/')
  .get(chatsController.getAll)
  .post(validator(chatSchemas.create), chatsController.create)
