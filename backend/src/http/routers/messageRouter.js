import express from 'express'
import { messageController } from '../controllers/index.js'

export const messageRouter = express.Router({ mergeParams: true })

messageRouter.get('/', messageController.getAll)
