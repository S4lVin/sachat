import Joi from 'joi'

export const messageSchemas = {
  create: Joi.object({
    sender: Joi.string().valid('user', 'ai').required(),
    content: Joi.string().min(1).required(),
  }),

  update: Joi.object({
    sender: Joi.string().valid('user', 'ai').optional(),
    content: Joi.string().min(1).optional(),
  }),
}
