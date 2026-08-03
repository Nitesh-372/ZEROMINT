import React, { useEffect, useState } from 'react'
import { Coins, Menu, RefreshCw, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiGet } from '../utils/api'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

export default function Topbar({ setMobileOpen }) {
  const { user, health, refreshHealth } = useAuth()
  const [creditBalance, setCreditBalance] = useState(0)

  const walletAddr = user?.walletAddress || ''
  const truncatedWallet = walletAddr
    ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`
    : 'No Wallet'

  const isChainOnline = Boolean(health?.blockchain)

  useEffect(() => {
    let alive = true

    async function loadBalance() {
      try {
        const res = await apiGet('/market/credits')
        const available = (res.credits || []).reduce((sum, credit) => sum + (credit.available || 0), 0)
        if (alive) setCreditBalance(available)
      } catch {
        if (alive) setCreditBalance(0)
      }
    }

    if (user) loadBalance()
    return () => {
      alive = false
    }
  }, [user])

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle"
          onClick={() => setMobileOpen(true)}
          title="Open menu"
        >
          <Menu size={20} />
        </button>
        <span
          className={`health-badge ${isChainOnline ? 'online' : 'offline'}`}
          title={
            isChainOnline
              ? 'Connected to local EVM Blockchain'
              : 'Blockchain node disconnected'
          }
        >
          <span className="health-dot" />
          {isChainOnline ? 'CHAIN READY' : 'CHAIN OFFLINE'}
        </span>
      </div>

      <div className="topbar-actions">
        <button
          className="btn btn-ghost"
          onClick={refreshHealth}
          title="Refresh health status"
        >
          <RefreshCw size={16} />
        </button>

        {walletAddr && (
          <div className="wallet-chip">
            <Wallet size={15} />
            <span>{truncatedWallet}</span>
          </div>
        )}

        <div className="wallet-chip">
          <Coins size={15} />
          <span>{fmt(creditBalance)} Credits</span>
        </div>

        <div className="avatar" title={`${user?.name} (${user?.role})`}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
