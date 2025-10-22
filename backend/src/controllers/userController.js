import { userService } from '#services'

export const userController = {
  get: async (req, res) => {
    const user = await userService.findById(req.user.id)
    res.json({ user })
  },

  update: async (req, res) => {
    const { name, settings } = req.body

    const user = await userService.updateById(req.user.id, {
      name,
      settings
    })
    res.json({ user })
  },

  delete: async (req, res) => {
    await userService.deleteById(req.user.id)
    res.status(204).end()
  }
}
