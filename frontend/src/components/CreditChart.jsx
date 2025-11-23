import React from 'react'
export default function CreditChart(){
  const points=[50,120,220,300,380,460,560], max=600, h=220, w=720, pad=30
  const stepX=(w-pad*2)/(points.length-1); const toY=v=>h-pad-(v/max)*(h-pad*2)
  const path=points.map((p,i)=>`${i===0?'M':'L'} ${pad+i*stepX} ${toY(p)}`).join(' ')
  return (<div className="card p-5"><div className="font-semibold text-lg mb-2">Credits Earned Over Time</div><svg viewBox={`0 0 ${w} ${h}`} className="w-full"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity="0.2"/><stop offset="100%" stopColor="#059669" stopOpacity="0"/></linearGradient></defs><path d={path} fill="none" stroke="#059669" strokeWidth="3"/><path d={`${path} L ${w-pad} ${h-pad} L ${pad} ${h-pad} Z`} fill="url(#g)"/><g fill="#059669">{points.map((p,i)=>(<circle key={i} cx={pad+i*stepX} cy={toY(p)} r="4"/>))}</g><g stroke="#E5E7EB">{[0,1,2,3,4].map(i=>(<line key={i} x1={pad} x2={w-pad} y1={pad+i*((h-pad*2)/4)} y2={pad+i*((h-pad*2)/4)}/>))}</g></svg></div>)
}
