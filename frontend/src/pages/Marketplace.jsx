import React from 'react'
import Topbar from '../components/Topbar.jsx'
const items=[
  { name:'GreenTech Solutions', type:'Solar Energy', available:50, price:0.50, total:25 },
  { name:'EcoForest Initiative', type:'Forestation', available:100, price:0.45, total:45 },
  { name:'WindPower Corp', type:'Wind Energy', available:75, price:0.47, total:35 },
  { name:'SolarFuture Ltd', type:'Solar Energy', available:120, price:0.46, total:55 },
  { name:'BiomassEnergy Inc', type:'Biomass', available:60, price:0.47, total:28 },
  { name:'HydroClean Energy', type:'Hydroelectric', available:90, price:0.47, total:42 },
]
export default function Marketplace(){
  return (<div className="space-y-5"><Topbar/><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{items.map((it,i)=>(<div key={i} className="card p-5"><div className="flex items-center justify-between"><div><div className="font-semibold">{it.name}</div><div className="text-slate-500 text-sm">{it.type}</div></div><span className="badge bg-green-100 text-green-700">Verified</span></div><div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4"><div className="text-sm text-slate-600 flex justify-between"><span>Credits Available</span><span className="font-semibold">{it.available}</span></div><div className="text-sm text-slate-600 flex justify-between"><span>Price per credit</span><span className="font-semibold">{it.price} tokens</span></div><div className="text-sm text-slate-600 flex justify-between"><span>Total Price</span><span className="font-semibold">{it.total} tokens</span></div></div><button className="btn btn-primary w-full mt-3">Buy Credits</button></div>))}</div></div>)
}
