import express from 'express'
import { validator } from '#middlewares'
import { messagesController } from '#controllers'
import { messageSchemas } from '#schemas'

export const messagesRouter = express.Router({ mergeParams: true })

messagesRouter
  .route('/:messageId')
  .patch(validator(messageSchemas.updateContent), messagesController.updateContent)
  .delete(messagesController.delete)

messagesRouter
  .route('/')
  .get(messagesController.getAll)
