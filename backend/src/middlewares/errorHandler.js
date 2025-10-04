import { CustomError } from '#utils'
import { config } from '#config'

export const errorHandler = (error, req, res, next) => {
  if (config.debug) {
    next(error)
    return
  }

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({ error: { message: error.message } })
  }

  res.status(500).json({ error: { message: 'Internal server error' } })
}
