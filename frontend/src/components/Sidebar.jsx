import React from 'react'
import { LayoutGrid, PlusCircle, Users, FolderKanban, Store, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { logout } = useAuth()

  const handleLogout = () => {
    try { logout() } catch {}
    window.location.replace('/login') // hard redirect
  }

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r bg-white">
      <div className="p-4 flex items-center gap-3">
        <Logo />
        <div>
          <div className="font-bold text-lg leading-tight">Zeromint</div>
          <div className="text-xs text-slate-500">User Portal</div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        <NavLink to="/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600"><LayoutGrid className="w-5 h-5" /></span>
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/add-project" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600"><PlusCircle className="w-5 h-5" /></span>
          <span className="font-medium">Add Project</span>
        </NavLink>
        <NavLink to="/hire-auditor" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600"><Users className="w-5 h-5" /></span>
          <span className="font-medium">Hire Auditor</span>
        </NavLink>
        <NavLink to="/my-projects" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600"><FolderKanban className="w-5 h-5" /></span>
          <span className="font-medium">My Projects</span>
        </NavLink>
        <NavLink to="/marketplace" className={({isActive}) => `sidebar-link ${isActive ? 'bg-emerald-600 text-white' : ''}`}>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600"><Store className="w-5 h-5" /></span>
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
  )
}
