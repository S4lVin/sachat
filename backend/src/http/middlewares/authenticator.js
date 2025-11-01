import { jwtService } from '../../services/index.js'
import { UnauthorizedError } from '../../errors.js'

// Helpers
const MissingAccessToken = () =>
  new UnauthorizedError('Access token mancante', 'MISSING_ACCESS_TOKEN')
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

  const payload = jwtService.verifyAccessToken(token)
  // Per compatibilità
  req.user = { id: payload.userId, email: payload.email }
  req.userId = payload.userId
  next()
}
