import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="content-shell">
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="workspace">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
