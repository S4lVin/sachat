import { CustomError } from '#utils'

export const validator = (schema) => (req, res, next) => {
  const result = schema.validate(req.body)
  if (result.error || req.body === undefined) {
    return next(new CustomError('Invalid request', 400))
  }

  req.validatedBody = result.value
  next()
}
