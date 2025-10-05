import Joi from 'joi'
import { messageSchemas } from './messagesSchema.js'

export const chatSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    messages: Joi.array().items(messageSchemas.create).required(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    messages: Joi.array().items(messageSchemas.create).optional(),
  }),
}
