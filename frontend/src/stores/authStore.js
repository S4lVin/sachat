import { api } from '@/helpers/api'
import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // #region STATE
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const user = ref()
  // #endregion

  // #region ACTIONS
  const hasValidTokenLocal = () => {
    if (!accessToken.value) return false

    if (isTokenExpired(accessToken.value)) {
      if (!refreshToken.value) return false
      if (isTokenExpired(refreshToken.value)) return false
    }
    return true
  }

  const login = async (user) => {
    const data = await api.post('auth/login', {
      email: user.email,
      password: user.password,
    })

    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    return true
  }

  const register = async (user) => {
    const data = await api.post('auth/register', {
      email: user.email,
      password: user.password,
      name: user.name,
    })

    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    return true
  }

  const logout = async () => {
    await api.post('auth/logout', {
      refreshToken: refreshToken.value,
    })

    clearTokens()
    user.value = null
    router.push({ name: 'Auth' })
  }

  const refreshAccessToken = async () => {
    try {
      const data = await api.post(
        'auth/refresh',
        { refreshToken: refreshToken.value },
        { hasRetried: true },
      )

      setAccessToken(data.accessToken)
      return data.accessToken
    } catch (error) {
      clearTokens()
      throw error
    }
  }

  const clearTokens = () => {
    setAccessToken(null)
    setRefreshToken(null)
  }

  const fetchUser = async () => {
    const data = await api.get('users/me')
    user.value = data.user
  }

  const updateUser = async (userData) => {
    const data = await api.patch('users/me', {
      name: userData.name,
      settings: userData.settings,
    })
    user.value = data.user
  }
  // #endregion

  // #region HELPERS
  const setAccessToken = (token) => {
    accessToken.value = token
    if (token) localStorage.setItem('accessToken', token)
    else localStorage.removeItem('accessToken')
  }

  const setRefreshToken = (token) => {
    refreshToken.value = token
    if (token) localStorage.setItem('refreshToken', token)
    else localStorage.removeItem('refreshToken')
  }

  const isTokenExpired = (token) => {
    if (!token) return true
    try {
      const decoded = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)
      return !!decoded.exp && decoded.exp < now
    } catch {
      return true
    }
  }
  // #endregion

  return {
    // STATE
    accessToken,
    user,

    // ACTIONS
    login,
    register,
    logout,
    hasValidTokenLocal,
    refreshAccessToken,
    clearTokens,
    fetchUser,
    updateUser,
  }
})
