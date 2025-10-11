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

    const isAccessTokenExpired = checkTokenExpired(accessToken.value)

    if (isAccessTokenExpired) {
      if (!refreshToken.value) return false

      const isRefreshTokenExpired = checkTokenExpired(refreshToken.value)
      if (isRefreshTokenExpired) return false
    }
    return true
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) return false

    const data = await api.post(
      'auth/refresh',
      {
        refreshToken: refreshToken.value,
      },
      { hasRetried: true },
    )

    if (!data?.accessToken) return false
    setAccessToken(data.accessToken)
    return true
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
  // #endregion

  // #region HELPERS
  const setAccessToken = (token) => {
    accessToken.value = token
    localStorage.setItem('accessToken', token)
  }

  const setRefreshToken = (token) => {
    refreshToken.value = token
    localStorage.setItem('refreshToken', token)
  }

  const checkTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token)

      const now = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < now) return true

      return false
    } catch {
      return true
    }
  }
  // #endregion

  return {
    // STATE
    accessToken,
    // ACTIONS
    hasValidTokenLocal,
    refreshAccessToken,
    clearTokens,
  }
})
