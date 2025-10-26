import express from 'express'
import { validator } from '#middlewares'
import { conversationController } from './conversationController.js'
import { conversationSchemas } from './conversationSchemas.js'

export const conversationRouter = express.Router()

conversationRouter.post(
  '/send',
  validator(conversationSchemas.send),
  conversationController.sendMessage,
)
// conversationRouter.post('/cancel', validator(conversationSchemas.cancel), conversationController.cancelReply)
