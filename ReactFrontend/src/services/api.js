import axios from 'axios'

/**
 * All requests in the app go through this one instance.
 * Components never import axios directly.
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const TOKEN_KEY = 'taskmanager.token'

let onUnauthorized = null

/** AuthContext registers a callback here so a 401 can update React state. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Request interceptor: attach the JWT to every authenticated request.
api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Response interceptor: pass successful responses through, and handle 401s.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthRequest) {
      const hadToken = Boolean(getStoredToken())
      clearStoredToken()

      // Only react once, even if several requests fail at the same time.
      if (hadToken && onUnauthorized) {
        onUnauthorized()
      }
    }

    // A 403 is not a logout: the request was understood but not allowed.
    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
export default api
