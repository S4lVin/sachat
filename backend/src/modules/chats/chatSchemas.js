import Joi from 'joi'

export const chatSchemas = {
  update: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
  }),
}
