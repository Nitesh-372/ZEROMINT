import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Shell from './layouts/Shell.jsx'
import AuditorShell from './layouts/AuditorShell.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddProject from './pages/AddProject.jsx'
import HireAuditor from './pages/HireAuditor.jsx'
import MyProjects from './pages/MyProjects.jsx'
import Marketplace from './pages/Marketplace.jsx'
import AuditorDashboard from './pages/auditor/Dashboard.jsx'
import AuditorClients from './pages/auditor/Clients.jsx'
import AuditorMarketplace from './pages/auditor/Marketplace.jsx'
import { RequireAuditor } from './routes/Protected.jsx'
import Register from './pages/Register.jsx'   // ✅ capital R

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />   {/* ✅ capital R here */}

      {/* User portal */}
      <Route element={<Shell><Outlet /></Shell>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/hire-auditor" element={<HireAuditor />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Route>

      {/* Auditor portal */}
      <Route element={
        <RequireAuditor>
          <AuditorShell><Outlet /></AuditorShell>
        </RequireAuditor>
      }>
        <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
        <Route path="/auditor/clients" element={<AuditorClients />} />
        <Route path="/auditor/marketplace" element={<AuditorMarketplace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
