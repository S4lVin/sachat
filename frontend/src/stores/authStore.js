import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/helpers/api'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  // #region STATE
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
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

    return await login(data.user)
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
    // ACTIONS
    login,
    register,
    hasValidTokenLocal,
    refreshAccessToken,
    clearTokens,
  }
})
