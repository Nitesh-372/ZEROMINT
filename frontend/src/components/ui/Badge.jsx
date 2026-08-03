import React from 'react'

const statusMap = {
  verified: 'success',
  minted: 'success',
  available: 'success',
  approved: 'success',
  retired: 'success',
  listed: 'market',
  sold: 'market',
  open: 'market',
  'need more info': 'warning',
  assigned: 'info',
  pending: 'info',
  rejected: 'danger',
  failed: 'danger',
}

export default function Badge({ status, className = '' }) {
  const s = String(status || '').toLowerCase()
  const variant = statusMap[s] || 'neutral'
  return <span className={`badge ${variant} ${className}`}>{status}</span>
}
