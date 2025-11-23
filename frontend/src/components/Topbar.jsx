import React from 'react'
import { Bell, Wallet } from 'lucide-react'
import { useNotifications } from '../context/NotificationsContext.jsx'

export default function Topbar({ title='Welcome Back', subtitle='Manage your carbon credits efficiently' }){
  const { unread } = useNotifications()
  return (
    <div className="flex items-center justify-between py-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))} className="w-10 h-10 grid place-items-center rounded-full bg-white border">
            <Bell className="w-5 h-5" />
          </button>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <div>
            <div className="text-xs leading-tight">Balance</div>
            <div className="font-semibold text-sm">1,250 Tokens</div>
          </div>
        </div>
      </div>
    </div>
  )
}
