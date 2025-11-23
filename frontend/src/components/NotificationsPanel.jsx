import React from 'react'
import { X, Bell, CheckCircle2 } from 'lucide-react'
import { useNotifications } from '../context/NotificationsContext.jsx'

export default function NotificationsPanel({ open, onClose }) {
  const { list, markRead } = useNotifications()

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40" />}
      <aside className={`fixed right-0 top-0 h-full w-[360px] bg-white border-l z-50 transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Bell className="w-5 h-5 text-emerald-600" />
            Notifications
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 space-y-3 overflow-auto h-[calc(100%-56px)]">
          {list.length === 0 && <div className="text-center text-slate-500 text-sm py-10">No notifications</div>}
          {list.map(n => (
            <div key={n.id} className="border rounded-xl p-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-slate-600">{n.body}</div>
                </div>
                {n.ok && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="text-xs text-slate-500 mt-1">{n.time}</div>
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="mt-2 text-xs text-emerald-700 underline">Mark as read</button>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
