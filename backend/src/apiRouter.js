import express from 'express'
import { authenticator } from '#middlewares'
import { authRouter } from '#modules/auth/authRouter.js'
import { conversationRouter } from '#modules/conversation/conversationRouter.js'
import { usersRouter } from '#modules/users/usersRouter.js'
import { chatsRouter } from '#modules/chats/chatsRouter.js'

export const apiRouter = express.Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/conversation', authenticator, conversationRouter)
apiRouter.use('/users', authenticator, usersRouter)
apiRouter.use('/chats', authenticator, chatsRouter)
