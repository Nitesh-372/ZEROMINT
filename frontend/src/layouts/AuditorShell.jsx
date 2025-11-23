import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users, Store, LogOut } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuditorShell({ children }) {
  const { logout } = useAuth()

  const handleLogout = () => {
    try { logout() } catch {}
    window.location.replace('/login') // hard redirect
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 hidden md:flex flex-col border-r bg-white">
        <div className="p-4 flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-bold text-lg leading-tight">CarbonLedger</div>
            <div className="text-xs text-slate-500">Auditor Portal</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          <NavLink to="/auditor/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </NavLink>
          <NavLink to="/auditor/clients" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">My Clients</span>
          </NavLink>
          <NavLink to="/auditor/marketplace" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
            <Store className="w-5 h-5" />
            <span className="font-medium">Marketplace</span>
          </NavLink>
        </nav>
        <div className="mt-auto p-3">
          <button type="button" onClick={handleLogout} className="sidebar-link w-full">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
