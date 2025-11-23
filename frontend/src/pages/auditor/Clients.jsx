import React from 'react'
import { fetchAuditorClients } from '../../utils/api'

export default function AuditorClients(){
  const [clients, setClients] = React.useState([])
  React.useEffect(()=>{ fetchAuditorClients().then(setClients) },[])
  return (
    <div className="space-y-5">
      <div className="text-2xl font-bold">My Clients</div>
      <div className="grid md:grid-cols-2 gap-4">
        {clients.map(c => (
          <div key={c.id} className="card p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-slate-500 text-sm">{c.email}</div>
              <div className="text-slate-500 text-sm">{c.phone}</div>
              <div className="text-slate-500 text-sm mt-1">{c.projects} projects</div>
            </div>
            <span className="badge bg-green-100 text-green-700">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
