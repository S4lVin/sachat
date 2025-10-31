import pinoHttp from 'pino-http'
import { logger } from '../../services/index.js'

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
      userId: req?.user?.id,
      ip: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  redact: [
    'req.headers.authorization',
    'req.body.password',
    'req.body.accessToken',
    'req.body.refreshToken',
  ],
})
