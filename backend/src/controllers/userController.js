import { userService } from '#services'

export const userController = {
  get: async (req, res) => {
    const user = await userService.findById(req.user.id)
    res.json({ user })
  },
}
