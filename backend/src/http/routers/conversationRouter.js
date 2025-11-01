import express from 'express'
import { validator } from '../middlewares/index.js'
import { conversationController } from '../controllers/index.js'
import { conversationSchemas } from '../schemas/index.js'

export const conversationRouter = express.Router()

conversationRouter.post('/send', validator(conversationSchemas.send), conversationController.send)
conversationRouter.post('/regenerate', validator(conversationSchemas.regenerate), conversationController.regenerate)
// conversationRouter.post('/cancel', validator(conversationSchemas.cancel), conversationController.cancelReply)
