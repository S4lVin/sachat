import express from 'express'
import { validator } from '#middlewares'
import { chatController, messageController } from '#controllers'
import { chatSchemas, messageSchemas } from '#schemas'

export const router = express.Router()

router
  .route('/:chatId/messages/:messageId/')
  .get(messageController.get)
  .patch(validator(messageSchemas.update), messageController.update)
  .delete(messageController.delete)

router
  .route('/:chatId/messages')
  .get(messageController.getAll)
  .post(validator(messageSchemas.create), messageController.create)

router
  .route('/:chatId')
  .get(chatController.get)
  .patch(validator(chatSchemas.update), chatController.update)
  .delete(chatController.delete)

router
  .route('/')
  .get(chatController.getAll)
  .post(validator(chatSchemas.create), chatController.create)
