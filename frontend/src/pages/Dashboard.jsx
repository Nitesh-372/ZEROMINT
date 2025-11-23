import React from 'react'
import Topbar from '../components/Topbar.jsx'
import StatCard from '../components/StatCard.jsx'
import CreditChart from '../components/CreditChart.jsx'

export default function Dashboard(){
  return (
    <div className="space-y-5">
      <Topbar />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Credits" value="520" sub="+12.5% from last month" icon="leaf" />
        <StatCard label="Verified" value="8" icon="check" />
        <StatCard label="Pending" value="3" icon="clock" />
        <StatCard label="Rejected" value="1" icon="x" />
      </div>
      <CreditChart />
    </div>
  )
}
