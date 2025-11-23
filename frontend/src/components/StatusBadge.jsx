import React from 'react'
export default function StatusBadge({ status }){
  const map={Verified:'bg-green-100 text-green-700', Pending:'bg-yellow-100 text-yellow-700', Rejected:'bg-red-100 text-red-700'}
  return <span className={`badge ${map[status]||'bg-slate-100 text-slate-700'}`}>{status}</span>
}
