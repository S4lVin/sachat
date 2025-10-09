const backendUrl = import.meta.env.VITE_BACKEND_URL

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const request = async (path, options = {}, raw = false) => {
  const response = await fetch(`${backendUrl}/api/${path}`, {
    headers: getHeaders(),
    ...options
  })

  if (response.status === 204) return null;
  if (!response.ok) {
    const data = await response.json()
    const errorText = data.error.message
    console.error(`(${response.status}) ${errorText}`)
    return null
  }

  if (raw) return response

  return await response.json()
}

export const api = {
  get: (path, options = {}) => request(path, {
    ...options,
    method: "GET"
  }),

  post: (path, body, options = {}) => request(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body)
  }),

  put: (path, body, options = {}) => request(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body)
  }),

  patch: (path, body, options = {}) => request(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body)
  }),

  delete: (path, options = {}) => request(path, {
    ...options,
    method: "DELETE"
  }),

  stream: (path, body, options = {}) => request(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body)
  }, true)
};
