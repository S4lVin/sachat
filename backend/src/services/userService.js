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
  const { password, refreshToken, ...safe } = user
  return safe
}

export const userService = {
  findById: async (id) => {
    const user = await prisma.user.findUnique({ where: { id } })
    return toSafeUser(user)
  },

  updateById: async (id, userData) => {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          name: userData.name,
          settings: userData.settings,
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
