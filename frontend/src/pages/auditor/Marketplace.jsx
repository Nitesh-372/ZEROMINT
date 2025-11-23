import React from 'react'
import { fetchMarketplace } from '../../utils/api'

export default function AuditorMarketplace(){
  const [items, setItems] = React.useState([])
  React.useEffect(()=>{ fetchMarketplace().then(setItems) },[])
  return (
    <div className="space-y-5">
      <div className="text-2xl font-bold">Carbon Credit Marketplace</div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.id} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-slate-500 text-sm">{it.type}</div>
              </div>
              <span className="badge bg-green-100 text-green-700">Verified</span>
            </div>
            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-sm text-slate-600 flex justify-between"><span>Credits Available</span><span className="font-semibold">{it.available}</span></div>
              <div className="text-sm text-slate-600 flex justify-between"><span>Price per credit</span><span className="font-semibold">{it.price} tokens</span></div>
              <div className="text-sm text-slate-600 flex justify-between"><span>Total Price</span><span className="font-semibold">{it.total} tokens</span></div>
            </div>
            <button className="btn btn-primary w-full mt-3">Buy Credits</button>
          </div>
        ))}
      </div>
    </div>
  )
}
