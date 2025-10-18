import Joi from 'joi'
import { messageSchemas } from './messageSchemas.js'

export const chatSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    messages: Joi.array().items(messageSchemas.create).optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    messages: Joi.array().items(messageSchemas.create).optional(),
  }),

  reply: Joi.object({
    options: Joi.object().optional(),
  }),

  cancelReply: Joi.object({}),
}
