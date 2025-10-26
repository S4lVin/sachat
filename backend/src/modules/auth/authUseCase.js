import { userService } from '#modules/users/userService.js'
import { jwtoken, hasher } from '#providers'
import { AuthFailed, InvalidRefreshToken } from '#core/errors/index.js'

export const authUseCase = {
  async register({ email, password, name }) {
    const hashedPassword = await hasher.hash(password)
    const user = await userService.create({ email, password: hashedPassword, name })

    return await this.issueAuthTokens(user)
  },

  async login({ email, password }) {
    const user = await userService.findByEmail({ email })
    if (!user) throw AuthFailed()

    const validPassword = await hasher.verify(password, user.password)
    if (!validPassword) throw AuthFailed()

    return await this.issueAuthTokens(user)
  },

  async refresh({ refreshToken }) {
    const payload = jwtoken.verifyRefreshToken(refreshToken)
    const user = await userService.find({ id: payload.userId })
    if (!user) throw InvalidRefreshToken()

    const validRefreshToken = await hasher.verify(refreshToken, user.refreshToken)
    if (!validRefreshToken) throw InvalidRefreshToken()

    return await this.issueAuthTokens(user)
  },

  async logout({ userId }) {
    await userService.update({ id: userId, refreshToken: null })
  },

  async issueAuthTokens(user) {
    const payload = { userId: user.id, email: user.email }
    const accessToken = jwtoken.signAccessToken(payload)
    const refreshToken = jwtoken.signRefreshToken(payload)

    const hashedRefreshToken = await hasher.hash(refreshToken)
    await userService.update({ id: user.id, refreshToken: hashedRefreshToken })
    return { accessToken, refreshToken }
  },
}
