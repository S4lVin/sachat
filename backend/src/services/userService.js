// userService.js
import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '#errors'

const prisma = new PrismaClient()

// Errors
const UserNotFound = () => new NotFoundError('Utente non trovato', 'USER_NOT_FOUND')

// Helpers
const isNotFoundError = (err) => err?.code === 'P2025'

const toSafeUser = (user) => {
  if (!user) return null
  const { password, refreshToken, apiKey, ...safe } = user
  return safe
}

export const userService = {
  findAll: async () => {
    const users = await prisma.user.findMany()
    return users.map(toSafeUser)
  },

  findById: async (id, { sensitive = false } = {}) => {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw UserNotFound()
    return sensitive ? user : toSafeUser(user)
  },

  findByEmail: async (email, { sensitive = false } = {}) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw UserNotFound()
    return sensitive ? user : toSafeUser(user)
  },

  findByRefreshToken: async (refreshToken, { sensitive = false } = {}) => {
    const user = await prisma.user.findUnique({ where: { refreshToken } })
    if (!user) throw UserNotFound()
    return sensitive ? user : toSafeUser(user)
  },

  create: async (userData) => {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        apiKey: userData.apiKey,
        refreshToken: userData.refreshToken,
      },
    })
    return toSafeUser(user)
  },

  updateById: async (id, userData) => {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role,
          apiKey: userData.apiKey,
          refreshToken: userData.refreshToken,
        },
      })
      return toSafeUser(user)
    } catch (err) {
      if (isNotFoundError(err)) throw UserNotFound()
      throw err
    }
  },

  deleteById: async (id) => {
    try {
      await prisma.user.delete({ where: { id } })
    } catch (err) {
      if (isNotFoundError(err)) throw UserNotFound()
      throw err
    }
  },
}
