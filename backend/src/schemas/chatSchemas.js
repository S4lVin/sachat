import Joi from 'joi'
import { messageSchemas } from './messageSchemas.js'

export const chatSchemas = {
  createEmpty: Joi.object({
    title: Joi.string().min(1).max(100).required(),
  }),

  updateTitle: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
  }),

  ask: Joi.object({
    content: Joi.string().min(1).required(),
    options: Joi.object().optional(),
  }),
}
