import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Leaf,
  Home,
  Plus,
  BriefcaseBusiness,
  UserCheck,
  Wallet,
  Store,
  ClipboardCheck,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth()
  const role = user?.role || 'user'

  const userNav = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/submit', label: 'Submit Project', icon: Plus },
    { to: '/projects', label: 'My Projects', icon: BriefcaseBusiness },
    { to: '/hire-auditor', label: 'Hire Auditor', icon: UserCheck },
    { to: '/wallet', label: 'Credits Wallet', icon: Wallet },
    { to: '/marketplace', label: 'Marketplace', icon: Store },
  ]

  const auditorNav = [
    { to: '/auditor', label: 'Auditor Overview', icon: Home },
    { to: '/auditor/queue', label: 'Auditor Queue', icon: ClipboardCheck },
    { to: '/marketplace', label: 'Marketplace', icon: Store },
  ]

  const navItems = role === 'auditor' ? auditorNav : userNav

  return (
    <>
      <div
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMobileOpen(false)}>
          <X size={18} />
        </button>

        <div className="brand">
          <div className="brand-icon">
            <Leaf size={22} />
          </div>
          <div>
            <h1>CarbonLedger</h1>
            <p>{role.toUpperCase()} WORKSPACE</p>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
