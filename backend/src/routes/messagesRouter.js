import express from 'express'
import { validator } from '#middlewares'
import { messagesController } from '#controllers'
import { messageSchemas } from '#schemas'

export const messagesRouter = express.Router({ mergeParams: true })

// Actions
messagesRouter.post('/:messageId/reply', validator(messageSchemas.reply), messagesController.reply)
messagesRouter.post(
  '/:messageId/cancel-reply',
  validator(messageSchemas.cancelReply),
  messagesController.cancelReply,
)

messagesRouter
  .route('/')
  .get(messagesController.getAll)
  .post(validator(messageSchemas.create), messagesController.create)
