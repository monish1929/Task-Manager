import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ToastProvider, useToast } from './ToastContext'
import * as authService from '../services/authService'
import {
  clearStoredToken,
  setUnauthorizedHandler,
  storeToken,
} from '../services/api'
import { decodeToken, readSession } from '../utils/jwt'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // The token is the source of truth. "session" adds the username and expiry
  // that we read from the JWT so the interface can show who is signed in.
  const [session, setSession] = useState(() => {
    const stored = readSession()

    if (!stored) {
      clearStoredToken()
    }

    return stored
  })

  const { showToast } = useToast()

  const user = session ? { username: session.username } : null
  const isAuthenticated = Boolean(session)

  const clearSession = useCallback(() => {
    clearStoredToken()
    setSession(null)
  }, [])

  const login = useCallback(async (username, password) => {
    const token = await authService.login(username, password)
    const claims = decodeToken(token)

    storeToken(token)
    setSession({
      token,
      username: claims?.sub || username,
      expiresAt: claims?.exp ? claims.exp * 1000 : null,
    })
  }, [])

  const register = useCallback(async (username, password) => {
    return authService.register(username, password)
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  // A 401 from Axios means the token is no longer accepted. ProtectedRoute
  // sends the user to the login page as soon as the session is cleared.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      showToast('Your session has ended. Sign in again to continue.', 'error')
    })

    return () => setUnauthorizedHandler(null)
  }, [clearSession, showToast])

  // The backend issues short-lived tokens (jwt.expiration is 300000 ms).
  // End the session on the client at the same moment so the interface does
  // not keep showing a signed-in state that the API will reject.
  useEffect(() => {
    if (!session?.expiresAt) return

    const remaining = session.expiresAt - Date.now()

    if (remaining <= 0) {
      clearSession()
      showToast('Your session expired. Sign in again.', 'error')
      return
    }

    const timer = setTimeout(
      () => {
        clearSession()
        showToast('Your session expired. Sign in again.', 'error')
      },
      Math.min(remaining, 2147483647),
    )

    return () => clearTimeout(timer)
  }, [session, clearSession, showToast])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

// Keep the provider order explicit for readers: toasts are available while
// the auth provider handles session messages.
export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  )
}
