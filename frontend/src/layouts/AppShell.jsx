import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
export default function AppShell({ children }){
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6"><div className="max-w-7xl mx-auto">{children}</div></main>
    </div>
  )
}
