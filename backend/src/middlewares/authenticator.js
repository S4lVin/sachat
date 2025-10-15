import jwt from 'jsonwebtoken'
import { MissingAccessToken, InvalidAccessToken } from '#errors'

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

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = { id: payload.userId, email: payload.email }
    next()
  } catch (error) {
    throw InvalidAccessToken()
  }
}
