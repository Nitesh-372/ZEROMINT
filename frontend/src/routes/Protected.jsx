import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function RequireAuditor({ children }){
  const { isAuthed, role } = useAuth()
  if(!isAuthed) return <Navigate to="/login" replace />
  if(role !== 'auditor') return <Navigate to="/dashboard" replace />
  return children
}
