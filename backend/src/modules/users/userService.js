import { db } from '#providers'
import { NotFoundError, ConflictError } from '#core/errors/appErrors.js'

// Errors
const UserNotFound = () => new NotFoundError('Utente non trovato', 'USER_NOT_FOUND')
const UserAlreadyExists = () => new ConflictError('Utente esiste già', 'USER_ALREADY_EXISTS')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'
const isConflictError = (err) => err?.code === 'P2002'

export const userService = {
  async find({ id }) {
    return await db.user.findUnique({
      where: { id },
    })
  },

  async findSafe({ id }) {
    const user = await this.find({ id })
    if (!user) return null

    const { password, refreshToken, ...safeUser } = user
    return safeUser
  },

  async findByEmail({ email }) {
    return await db.user.findUnique({
      where: { email },
    })
  },

  async create({ email, password, name }) {
    try {
      return await db.user.create({
        data: { email, password, name },
      })
    } catch (err) {
      if (isConflictError(err)) throw UserAlreadyExists()
      throw err
    }
  },

  async update({ id, name, role, settings, refreshToken }) {
    try {
      return await db.user.update({
        where: { id },
        data: { name, role, settings, refreshToken },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw UserNotFound()
      throw err
    }
  },

  async delete({ id }) {
    try {
      await db.user.delete({ where: { id } })
    } catch (err) {
      if (isNotFoundError(err)) throw UserNotFound()
      throw err
    }
  },
}
