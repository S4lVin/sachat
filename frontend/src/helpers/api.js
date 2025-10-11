import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const backendUrl = import.meta.env.VITE_BACKEND_URL

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const getHeaders = (accessToken, extraHeaders) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return headers
}

const buildFetchOptions = (accessToken, options = {}) => {
  const { method = 'GET', body, signal, headers } = options
  return {
    method,
    signal,
    headers: getHeaders(accessToken, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }
}

export const request = async (path, options = {}) => {
  const authStore = useAuthStore()
  const { accessToken } = storeToRefs(authStore)

  const url = `${backendUrl}/api/${path}`.replace(/([^:]\/)\/+/g, '$1')
  const response = await fetch(url, buildFetchOptions(accessToken.value, options))

  // 401 -> tenta 1 refresh automatico
  if (response.status === 401 && !options.hasRetried) {
    const accessToken = await authStore.refreshAccessToken()
    if (accessToken) {
      return request(path, { ...options, hasRetried: true })
    }
  }

  if (!response.ok) {
    let payload = null
    try {
      payload = await response.json()
    } catch {
      // Ignora
    }
    throw new ApiError(payload?.error?.message, response.status, payload)
  }

  if (options.raw) return response
  if (response.status === 204) return null
  return response.json()
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
      body,
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body,
    }),

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body,
    }),

  delete: (path, options = {}) =>
    request(path, {
      ...options,
      method: 'DELETE',
    }),
}
