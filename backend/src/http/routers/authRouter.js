import express from 'express'
import { validator, authenticator } from '../middlewares/index.js'
import { authController } from '../controllers/index.js'
import { authSchemas } from '../schemas/index.js'

export const authRouter = express.Router()

authRouter.post('/register', validator(authSchemas.register), authController.register)
authRouter.post('/login', validator(authSchemas.login), authController.login)
authRouter.post('/refresh', validator(authSchemas.refresh), authController.refresh)
authRouter.post('/logout', authenticator, authController.logout)
