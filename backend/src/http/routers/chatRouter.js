import express from 'express'
import { validator } from '../middlewares/index.js'
import { chatController } from '../controllers/index.js'
import { messageRouter } from './messageRouter.js'
import { chatSchemas } from '../schemas/index.js'

export const chatRouter = express.Router()

chatRouter.use('/:chatId/messages', messageRouter)

chatRouter.patch('/:chatId', validator(chatSchemas.update), chatController.update)
chatRouter.delete('/:chatId', chatController.delete)
chatRouter.get('/', chatController.getAll)
