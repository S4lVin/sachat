import onFinished from 'on-finished'
import { logger } from '#logger'

export const requestLogger = (req, res, next) => {
  const start = Date.now()

  onFinished(res, (err, finalRes) => {
    const duration = Date.now() - start
    const logDetails = {
      request: { method: req.method, url: req.originalUrl },
      response: { statusCode: finalRes.statusCode },
      duration_ms: duration,
    }

    if (finalRes.statusCode >= 500) {
      logger.error({ log: logDetails }, 'Request completed with server error')
    } else if (finalRes.statusCode >= 400) {
      logger.warn({ log: logDetails }, 'Request completed with client error')
    } else if (finalRes.aborted) {
      logger.warn({ log: logDetails }, 'Request aborted by client')
    } else {
      logger.info({ log: logDetails }, 'Request completed')
    }
  })

  next()
}
