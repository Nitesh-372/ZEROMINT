import React from 'react'
import Topbar from '../components/Topbar.jsx'
const auditors=[
  { name:'Dr. Sarah Mitchell', spec:'Solar & Wind Energy', years:12, projects:156, price:50, rating:4.8 },
  { name:'Prof. James Chen', spec:'Forestation Programs', years:15, projects:203, price:45, rating:4.8 },
  { name:'Emma Rodriguez', spec:'Renewable Energy', years:8, projects:89, price:40, rating:4.7 },
  { name:'Dr. Michael Park', spec:'Carbon Capture', years:10, projects:134, price:55, rating:4.9 },
]
export default function HireAuditor(){
  return (<div className="space-y-5"><Topbar/><div className="grid md:grid-cols-2 gap-4">{auditors.map((a,i)=>(<div key={i} className="card p-5 flex items-center justify-between"><div><div className="text-lg font-semibold">{a.name}</div><div className="text-slate-500">{a.spec}</div><div className="text-slate-500 text-sm mt-1">{a.years} years · {a.projects} projects</div></div><div className="text-right"><div className="font-semibold">{a.price} Tokens</div><div className="text-slate-500 text-xs mb-2">per verification</div><button className="btn btn-primary">Hire Auditor</button></div></div>))}</div></div>)
}
