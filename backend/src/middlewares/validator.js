import { CustomError } from '#utils'

export const validator = (schema) => (req, res, next) => {
  const result = schema.validate(req.body)
  if (result.error || req.body === undefined) {
    throw new CustomError(400, result.error.message)
  }

  req.validatedBody = result.value
  next()
}
