import express from 'express'
import { validator } from '#middlewares'
import { chatController, messageController } from '#controllers'
import { chatSchemas, messageSchemas } from '#schemas'

export const chatsRouter = express.Router()

chatsRouter
  .route('/:chatId/messages/:messageId/')
  .get(messageController.get)
  .patch(validator(messageSchemas.update), messageController.update)
  .delete(messageController.delete)

chatsRouter
  .route('/:chatId/messages')
  .get(messageController.getAll)
  .post(validator(messageSchemas.create), messageController.create)

chatsRouter
  .route('/:chatId')
  .get(chatController.get)
  .patch(validator(chatSchemas.update), chatController.update)
  .delete(chatController.delete)

chatsRouter
  .route('/')
  .get(chatController.getAll)
  .post(validator(chatSchemas.create), chatController.create)
