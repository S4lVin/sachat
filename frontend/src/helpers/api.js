import { router } from "@/router"
import { useAuthStore } from "@/stores/authStore"
import { storeToRefs } from "pinia"

const backendUrl = import.meta.env.VITE_BACKEND_URL

const getHeaders = (accessToken) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
}

const buildFetchOptions = (accessToken, options) => ({
  headers: getHeaders(accessToken),
  ...options,
  body: options.body ? JSON.stringify(options.body) : undefined,
})

const parseResponse = async (response, options) => {
  if (options.raw) return response
  if (response.status === 204) return null
  return response.json()
}

const handleErrorResponse = async (response, path, options) => {
  const data = await response.json()
  console.error(`(${response.status}) ${data.error.message}`)

  if (response.status === 401 && !options.hasRetried) {
    const authStore = useAuthStore()

    const success = await authStore.refreshAccessToken()
    if (success) return request(path, { ...options, hasRetried: true })

    authStore.clearTokens()
    return router.push('/')
  }

  return null
}

export const request = async (path, options = {}) => {
  const authStore = useAuthStore()
  const { accessToken } = storeToRefs(authStore)

  const response = await fetch(`${backendUrl}/api/${path}`, buildFetchOptions(accessToken.value, options))
  if (!response.ok) return handleErrorResponse(response, path, options)

  return parseResponse(response, options)
}


export const api = {
  get: (path, options = {}) =>
    request(path, {
      ...options,
      method: 'GET',
    }),

  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'POST',
      body
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body
    }),

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body
    }),

  delete: (path, options = {}) =>
    request(path, {
      ...options,
      method: 'DELETE',
    }),
}
