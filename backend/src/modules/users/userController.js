import { userService } from './userService.js'

export const userController = {
  get: async (req, res) => {
    const user = await userService.findSafe({
      id: req.userId,
    })
    res.json({ user })
  },

  update: async (req, res) => {
    const { name, settings } = req.body

    const user = await userService.update({
      id: req.userId,
      name,
      settings,
    })
    res.json({ user })
  },

  delete: async (req, res) => {
    await userService.delete({
      id: req.userId,
    })
    res.status(204).end()
  },
}
