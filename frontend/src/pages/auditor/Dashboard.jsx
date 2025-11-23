import React from 'react'
import { fetchAuditorDashboard, approveProject, rejectProject } from '../../utils/api'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function AuditorDashboard(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchAuditorDashboard().then(d=>{ setData(d); setLoading(false) })
  }, [])

  if(loading) return <div>Loading...</div>

  return (
    <div className="space-y-5">
      <div className="text-2xl font-bold">Verification Dashboard</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStat label="Assigned Projects" value={data.assigned} />
        <CardStat label="Completed" value={data.completed} />
        <CardStat label="Pending Review" value={data.pending} />
      </div>

      <div className="card p-5">
        <div className="font-semibold mb-3">Projects Awaiting Verification</div>
        <div className="space-y-4">
          {data.projects.map(p => (
            <div key={p.id} className="border rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name} <span className="text-xs text-slate-500 ml-1">{p.id.toUpperCase()}</span></div>
                  <div className="text-slate-500 text-sm">{p.client}</div>
                  <div className="text-slate-500 text-sm">{p.type}</div>
                </div>
                <div className="text-sm text-slate-600">
                  <div>Expected Credits <span className="font-semibold">{p.credits}</span></div>
                  <div>Due <span className="font-semibold">{p.due}</span></div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={()=>approveProject(p.id)} className="btn bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4"/> Approve
                </button>
                <button onClick={()=>rejectProject(p.id)} className="btn bg-red-600 text-white hover:bg-red-700 inline-flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4"/> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CardStat({ label, value }){
  return (
    <div className="card p-5">
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}
