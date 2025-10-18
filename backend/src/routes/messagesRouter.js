import express from 'express'
import { validator } from '#middlewares'
import { messagesController } from '#controllers'
import { messageSchemas } from '#schemas'

export const messagesRouter = express.Router({ mergeParams: true })

messagesRouter
  .route('/')
  .get(messagesController.getAll)
  .post(validator(messageSchemas.create), messagesController.create)
