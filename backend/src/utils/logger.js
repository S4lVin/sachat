import pino from 'pino'
import pinoHttp from 'pino-http'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
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
  redact: [
    'req.headers', // nasconde tutti gli headers della request
    'res.headers', // nasconde tutti gli headers della response
  ],
})
