import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/helpers/api'

export const useAuthStore = defineStore('auth', () => {
  // #region STATE
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  // #endregion
  
  // #region ACTIONS
  const refreshAccessToken = async () => {
    if (!refreshToken.value) return false
  
    const data = await api.post('auth/refresh', {
      refreshToken: refreshToken.value
    }, { noRetry: true })

    if (!data?.accessToken) return false
    setAccessToken(data.accessToken)
    return true
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
  // #endregion

  return {
    // STATE
    accessToken,
    // ACTIONS
    refreshAccessToken
  }
})