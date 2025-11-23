import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import NotificationsPanel from '../components/NotificationsPanel.jsx'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { fetchNotifications, markAllNotificationsRead } from '../utils/api.js'

export default function Shell({ children }){
  const [open, setOpen] = React.useState(false)
  const { setAll, markAllRead } = useNotifications()

  React.useEffect(() => {
    fetchNotifications().then(setAll).catch(()=>{})
  }, [setAll])

  React.useEffect(() => {
    if(open){
      markAllRead()
      markAllNotificationsRead().catch(()=>{})
    }
  }, [open, markAllRead])

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <NotificationsPanel open={open} onClose={() => setOpen(false)} />
      <EventBridge setOpen={setOpen} />
    </div>
  )
}

function EventBridge({ setOpen }){
  React.useEffect(() => {
    const toggle = () => setOpen(prev => !prev)
    const close = () => setOpen(false)

    window.addEventListener('open-notifications', toggle)
    window.addEventListener('close-notifications', close)

    return () => {
      window.removeEventListener('open-notifications', toggle)
      window.removeEventListener('close-notifications', close)
    }
  }, [setOpen])
  return null
}
