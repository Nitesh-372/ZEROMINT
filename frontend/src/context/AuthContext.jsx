import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiPost, apiGet, setAuthToken, getStoredSession, storeSession, clearSession } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState(null)

  // Restore session on mount
  useEffect(() => {
    const saved = getStoredSession()
    if (saved?.token) {
      setAuthToken(saved.token)
      setToken(saved.token)
      setUser(saved.user)
    }
    setLoading(false)
  }, [])

  // Fetch health status whenever token changes
  useEffect(() => {
    if (token) {
      apiGet('/health').then(setHealth).catch(() => setHealth(null))
    }
  }, [token])

  const login = useCallback(async (body) => {
    const data = await apiPost('/auth/login', body)
    storeSession(data)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (body) => {
    const data = await apiPost('/auth/register', body)
    storeSession(data)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
    setHealth(null)
  }, [])

  const refreshHealth = useCallback(async () => {
    try {
      const h = await apiGet('/health')
      setHealth(h)
    } catch {
      setHealth(null)
    }
  }, [])

  const value = {
    user,
    token,
    loading,
    health,
    login,
    register,
    logout,
    refreshHealth,
    isAuthenticated: Boolean(token && user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
