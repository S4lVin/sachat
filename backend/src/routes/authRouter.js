import express from 'express'
import { authenticator, validator } from '#middlewares'
import { authController } from '#controllers'
import { authSchemas } from '#schemas'

export const authRouter = express.Router()

authRouter.post('/register', validator(authSchemas.register), authController.register)
authRouter.post('/login', validator(authSchemas.login), authController.login)
authRouter.post('/refresh', validator(authSchemas.refresh), authController.refresh)
authRouter.post('/logout', validator(authSchemas.refresh), authController.logout)
