import express from 'express'
import { validator } from '#middlewares'
import { userController } from './userController.js'
import { userSchemas } from './userSchemas.js'

export const usersRouter = express.Router()

usersRouter.get('/me', userController.get)
usersRouter.patch('/me', validator(userSchemas.update), userController.update)
usersRouter.delete('/me', userController.delete)
