import { userManager } from '../../managers/index.js'

export const userController = {
  get: async (req, res) => {
    const user = await userManager.findSafe({
      id: req.userId,
    })
    res.json({ user })
  },

  update: async (req, res) => {
    const { name, settings } = req.body

    const user = await userManager.update({
      id: req.userId,
      name,
      settings,
    })
    res.json({ user })
  },

  delete: async (req, res) => {
    await userManager.delete({
      id: req.userId,
    })
    res.status(204).end()
  },
}
