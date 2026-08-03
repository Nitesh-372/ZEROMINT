import React from 'react'

export default function PageHeader({ eyebrow, title, desc, action }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  )
}
