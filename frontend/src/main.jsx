import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { fetchNotifications } from './utils/api.js'

async function start(){
  const initial = await fetchNotifications().catch(()=>[])
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider initial={initial}>
            <App />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
start()
