import 'dotenv/config'
import express from 'express'
import { apiRouter } from './apiRouter.js'
import { errorHandler, corsHandler, rateLimiter, httpLogger } from '#middlewares'
import { NotFoundError } from '#core/errors/appErrors.js'

const app = express()
app.use(rateLimiter)
app.use(corsHandler)
app.use(express.json())
app.use(httpLogger)
app.use('/api', apiRouter)
app.use(() => {
  throw new NotFoundError('Endpoint non trovato', 'ENDPOINT_NOT_FOUND')
})
app.use(errorHandler)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))
