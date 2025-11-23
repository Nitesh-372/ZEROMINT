import React from 'react'
import Topbar from '../components/Topbar.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
const projects=[
  { name:'Solar Farm Installation', type:'Solar Energy', credits:150, submitted:'2024-01-15', verified:'2024-01-20', status:'Verified' },
  { name:'Reforestation Program', type:'Forestation', credits:200, submitted:'2024-01-18', verified:null, status:'Pending' },
  { name:'Wind Energy Project', type:'Wind Energy', credits:120, submitted:'2024-01-10', verified:'2024-01-16', status:'Verified' },
  { name:'Biomass Energy Plant', type:'Biomass', credits:0, submitted:'2024-01-05', verified:'2024-01-12', status:'Rejected', reason:'Insufficient documentation' },
]
export default function MyProjects(){
  return (<div className="space-y-5"><Topbar/><div className="space-y-3">{projects.map((p,i)=>(<div key={i} className="card p-5"><div className="flex items-start justify-between gap-4"><div><div className="text-lg font-semibold">{p.name}</div><div className="text-slate-500 text-sm">{p.type}</div><div className="mt-1 text-sm text-slate-500">Credits <span className="font-semibold text-slate-700">{p.credits}</span></div></div><div className="text-right text-sm text-slate-500"><div>Submitted <span className="text-slate-700">{p.submitted}</span></div><div>{p.status==='Verified'?'Verified':p.status==='Pending'?'—':'Rejected'} <span className="text-slate-700">{p.verified||''}</span></div><div className="mt-1"><StatusBadge status={p.status}/></div></div></div>{p.status==='Rejected'&&(<div className="mt-3 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-xl">Reason: {p.reason}</div>)}<div className="mt-3"><button className="btn border w-full md:w-auto">View Details</button></div></div>))}</div></div>)
}
