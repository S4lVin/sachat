import Joi from 'joi'
import { messageSchemas } from './messages.schema.js'

export const chatSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).required(),
    messages: Joi.array().items(messageSchemas.create).required(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).optional(),
    messages: Joi.array().items(messageSchemas.create).optional(),
  }),
}
