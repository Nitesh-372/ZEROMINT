import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="login-page">
        <p className="auth-subtitle">Loading session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role && user?.role !== role && user?.role !== 'admin') {
    // If auditor trying to access user page or user trying to access auditor page
    const defaultPath = user?.role === 'auditor' ? '/auditor' : '/dashboard'
    return <Navigate to={defaultPath} replace />
  }

  return children
}
