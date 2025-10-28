import express from 'express'
import { validator, authenticator } from '#middlewares'
import { authController } from './authController.js'
import { authSchemas } from './authSchemas.js'

export const authRouter = express.Router()

authRouter.post('/register', validator(authSchemas.register), authController.register)
authRouter.post('/login', validator(authSchemas.login), authController.login)
authRouter.post('/refresh', validator(authSchemas.refresh), authController.refresh)
authRouter.post('/logout', authenticator, authController.logout)
