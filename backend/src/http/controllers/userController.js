import { userManager } from '../../managers/index.js'

export const userController = {
  get: async (req, res) => {
    const user = await userManager.findSafe({
      userId: req.userId,
    })
    res.json({ user })
  },

  update: async (req, res) => {
    const { name, settings } = req.body

    const user = await userManager.update({
      userId: req.userId,
      name,
      settings,
    })
    res.json({ user })
  },

  delete: async (req, res) => {
    await userManager.delete({
      userId: req.userId,
    })
    res.status(204).end()
  },
}
