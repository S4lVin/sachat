import express from 'express'
import { validator } from '#middlewares'
import { userController } from '#controllers'
import { userSchemas } from '#schemas'

export const userRouter = express.Router()

userRouter.route('/me')
  .get(userController.get)
  .patch(validator(userSchemas.update), userController.update)
  .delete(userController.delete)