import express from 'express'
import { messageController } from '../controllers/index.js'

export const messageRouter = express.Router({ mergeParams: true })

messageRouter.delete('/:messageId', messageController.delete)
messageRouter.get('/', messageController.getAll)
