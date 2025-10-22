import Joi from 'joi'
import { messageSchemas } from './messageSchemas.js'

const optionsSchema = {
  model: Joi.string().valid('gpt-5', 'gpt-5-mini', 'gpt-5-nano').optional(),
}

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
    options: Joi.object(optionsSchema).optional().unknown(false),
  }),

  cancelReply: Joi.object({}),
}
