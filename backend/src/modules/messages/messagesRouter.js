import express from 'express'
import { messagesController } from './messagesController.js'

export const messagesRouter = express.Router({ mergeParams: true })

messagesRouter.delete('/:messageId', messagesController.delete)
messagesRouter.get('/', messagesController.getAll)
