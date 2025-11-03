import express from 'express'
import {
  authRouter,
  chatRouter,
  conversationRouter,
  messageRouter,
  userRouter,
} from './routers/index.js'
import {
  errorHandler,
  corsHandler,
  rateLimiter,
  httpLogger,
  authenticator,
} from './middlewares/index.js'
import { NotFoundError } from '../errors.js'

export const server = express()
server.set('trust proxy', 1)

// Middlewares
server.use(rateLimiter)
server.use(corsHandler)
server.use(express.json())
server.use(httpLogger)

// RPC
server.use('/api/auth', authRouter)
server.use('/api/conversation', authenticator, conversationRouter)

// REST
server.use('/api/users', authenticator, userRouter)
server.use('/api/chats', authenticator, chatRouter)
server.use('/api/messages', authenticator, messageRouter)

// Default
server.use(() => {
  throw new NotFoundError('Endpoint non trovato', 'ENDPOINT_NOT_FOUND')
})

// Error Handler
server.use(errorHandler)
