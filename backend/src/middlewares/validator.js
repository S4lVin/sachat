import { CustomError } from '#utils'

export const validator = (schema) => (req, res, next) => {
  const result = schema.validate(req.body)
  if (result.error || req.body === undefined) {
    return next(new CustomError(400, 'Invalid request'))
  }

  req.validatedBody = result.value
  next()
}
