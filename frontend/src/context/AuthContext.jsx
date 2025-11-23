import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginAuditorAPI, setAuthToken, clearAuthToken } from '../utils/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null) // {role, email, name}
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('auth_v1')
    if(saved){
      try {
        const { token, user } = JSON.parse(saved)
        setToken(token); setUser(user); setAuthToken(token)
      } catch {}
    }
  }, [])

  const loginAuditor = async ({ email, password }) => {
    const { token, profile } = await loginAuditorAPI({ email, password })
    const u = { role: 'auditor', email: profile?.email || email, name: profile?.name || 'Auditor' }
    setToken(token); setUser(u); setAuthToken(token)
    localStorage.setItem('auth_v1', JSON.stringify({ token, user: u }))
    return u
  }

  const logout = () => {
    setUser(null); setToken(null); clearAuthToken()
    localStorage.removeItem('auth_v1')
  }

  const value = useMemo(() => ({
    user, token, isAuthed: !!token, role: user?.role || null,
    loginAuditor, logout
  }), [user, token])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthCtx)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
