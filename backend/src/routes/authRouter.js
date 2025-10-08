import express from 'express'
import { validator } from '#middlewares'
import { authController } from '#controllers'
import { authSchemas } from '#schemas'

export const router = express.Router()

router.post('/register', validator(authSchemas.register), authController.register)
router.post('/login', validator(authSchemas.login), authController.login)
router.post('/refresh', validator(authSchemas.refresh), authController.refresh)
router.post('/logout', validator(authSchemas.refresh, authController.logout))
