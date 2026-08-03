import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Public Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// User Pages
import Dashboard from './pages/user/Dashboard'
import SubmitProject from './pages/user/SubmitProject'
import MyProjects from './pages/user/MyProjects'
import ProjectDetails from './pages/user/ProjectDetails'
import HireAuditor from './pages/user/HireAuditor'
import CreditsWallet from './pages/user/Wallet'
import Marketplace from './pages/user/Marketplace'

// Auditor Pages
import AuditorDashboard from './pages/auditor/AuditorDashboard'
import AuditorQueue from './pages/auditor/AuditorQueue'
import ReviewProject from './pages/auditor/ReviewProject'

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'auditor') return <Navigate to="/auditor" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* User Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitProject />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/hire-auditor" element={<HireAuditor />} />
          <Route path="/wallet" element={<CreditsWallet />} />
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Auditor Routes */}
          <Route
            path="/auditor"
            element={
              <ProtectedRoute role="auditor">
                <AuditorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditor/queue"
            element={
              <ProtectedRoute role="auditor">
                <AuditorQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditor/review/:projectId"
            element={
              <ProtectedRoute role="auditor">
                <ReviewProject />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Root and Fallback */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </AuthProvider>
  )
}
