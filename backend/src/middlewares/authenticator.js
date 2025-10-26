import { jwtoken } from '#providers'
import { MissingAccessToken } from '#core/errors/authErrors.js'

// Helpers
const extractTokenFromHeader = (req) => {
  const auth = req.headers['authorization']
  if (!auth) return null

  const parts = auth.split(' ')
  if (parts.length !== 2) return null

  const [scheme, token] = parts
  if (!/^Bearer$/i.test(scheme)) return null

  return token
}

export const authenticator = (req, res, next) => {
  const token = extractTokenFromHeader(req)
  if (!token) throw MissingAccessToken()

  const payload = jwtoken.verifyAccessToken(token)
  req.userId = payload.userId
  next()
}
