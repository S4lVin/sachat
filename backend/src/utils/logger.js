import pino from 'pino'
import pinoHttp from 'pino-http'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: process.env.LOG_STACK === 'false' ? ['err.stack'] : [],
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
      userId: req.user?.id,
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
