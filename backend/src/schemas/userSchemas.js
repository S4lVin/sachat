import Joi from 'joi'

const settingsSchema = {
  apiKey: Joi.string().optional(),
  useApiKey: Joi.boolean().optional(),
  customPrompt: Joi.string().optional(),
}

export const userSchemas = {
  update: Joi.object({
    name: Joi.string().min(3).max(50).optional(),
    settings: Joi.object(settingsSchema).optional().unknown(false),
  }),
}
