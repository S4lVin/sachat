import db from '../db.js'
import { NotFoundError, ConflictError } from '../errors.js'

const UserNotFound = () => new NotFoundError('Utente non trovato', 'USER_NOT_FOUND')
const UserAlreadyExists = () => new ConflictError('Utente esiste già', 'USER_ALREADY_EXISTS')
const isNotFoundError = (err) => err?.code === 'P2025'
const isConflictError = (err) => err?.code === 'P2002'

export const userManager = {
  find: async ({ userId }) => {
    return await db.user.findUnique({
      where: { id: userId },
    })
  },

  findSafe: async ({ userId }) => {
    const user = await db.user.findUnique({
      where: { id: userId },
    })
    if (!user) return null

    const { password, refreshToken, ...safeUser } = user
    return safeUser
  },

  getApiKey: async ({ userId }) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { settings: true, role: true },
    })
    if (!user) return null

    if (user.role === 'vip' && !user.settings.useApiKey) {
      return process.env.OPENAI_API_KEY
    }

    return user.settings.apiKey
  },

  getSettings: async ({ userId }) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    })
    if (!user) return null

    return user.settings
  },

  findByEmail: async ({ email }) => {
    return await db.user.findUnique({
      where: { email },
    })
  },

  create: async ({ email, password, name }) => {
    try {
      return await db.user.create({
        data: { email, password, name },
      })
    } catch (err) {
      if (isConflictError(err)) throw UserAlreadyExists()
      throw err
    }
  },

  update: async ({ userId, name, role, settings, refreshToken }) => {
    try {
      return await db.user.update({
        where: { id: userId },
        data: { name, role, settings, refreshToken },
      })
    } catch (err) {
      if (isNotFoundError(err)) throw UserNotFound()
      throw err
    }
  },

  delete: async ({ userId }) => {
    try {
      await db.user.delete({ where: { id: userId } })
    } catch (err) {
      if (isNotFoundError(err)) throw UserNotFound()
      throw err
    }
  },
}
