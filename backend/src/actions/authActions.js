import { userManager } from '../managers/index.js'
import { jwt as jwtoken, hasher } from '../services/index.js'
import { UnauthorizedError } from '../errors.js'

// Helpers
const AuthFailed = () => new UnauthorizedError('Credenziali non valide', 'AUTH_FAILED')
const InvalidRefreshToken = () =>
  new UnauthorizedError('Refresh token non valido', 'INVALID_REFRESH_TOKEN')

export const authActions = {
  async register({ email, password, name }) {
    const hashedPassword = await hasher.hash(password)
    const user = await userManager.create({ email, password: hashedPassword, name })

    return await this.issueAuthTokens(user)
  },

  async login({ email, password }) {
    const user = await userManager.findByEmail({ email })
    if (!user) throw AuthFailed()

    const validPassword = await hasher.verify(password, user.password)
    if (!validPassword) throw AuthFailed()

    return await this.issueAuthTokens(user)
  },

  async refresh({ refreshToken }) {
    const payload = jwtoken.verifyRefreshToken(refreshToken)
    const user = await userManager.find({ id: payload.userId })
    if (!user) throw InvalidRefreshToken()

    const validRefreshToken = await hasher.verify(refreshToken, user.refreshToken)
    if (!validRefreshToken) throw InvalidRefreshToken()

    return await this.issueAuthTokens(user)
  },

  async logout({ userId }) {
    await userManager.update({ id: userId, refreshToken: null })
  },

  async issueAuthTokens(user) {
    const payload = { userId: user.id, email: user.email }
    const accessToken = jwtoken.signAccessToken(payload)
    const refreshToken = jwtoken.signRefreshToken(payload)

    const hashedRefreshToken = await hasher.hash(refreshToken)
    await userManager.update({ id: user.id, refreshToken: hashedRefreshToken })
    return { accessToken, refreshToken }
  },
}
