import React from 'react'

export default function StatCard({ icon: Icon, label, value, help }) {
  return (
    <section className="stat-card">
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      {help && <span className="stat-help">{help}</span>}
    </section>
  )
}
