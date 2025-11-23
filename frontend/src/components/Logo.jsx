import React from 'react'
export default function Logo({ size=44 }){
  return (
    <div className="rounded-full bg-emerald-100 grid place-items-center" style={{width:size,height:size}}>
      <svg width={size*0.55} viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 5 5 9 5 12a7 7 0 0 0 14 0c0-3-2-7-7-9Z" stroke="#059669" strokeWidth="2"/>
        <path d="M12 3s1 6-5 9" stroke="#059669" strokeWidth="2"/>
      </svg>
    </div>
  )
}
