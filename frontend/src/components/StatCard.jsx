import React from 'react'
import { Leaf, Clock, CheckCircle2, XCircle } from 'lucide-react'
export default function StatCard({ label, value, sub, icon='leaf' }){
  const icons = { leaf:<Leaf className="w-5 h-5 text-emerald-600"/>, check:<CheckCircle2 className="w-5 h-5 text-emerald-600"/>, clock:<Clock className="w-5 h-5 text-yellow-500"/>, x:<XCircle className="w-5 h-5 text-red-500"/> }
  return <div className="card p-5"><div className="flex items-center justify-between"><div className="text-slate-500 text-sm">{label}</div>{icons[icon]}</div><div className="text-3xl font-bold mt-2">{value}</div>{sub && <div className="text-xs text-emerald-700 mt-1">{sub}</div>}</div>
}
