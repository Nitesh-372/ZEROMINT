import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { apiGet } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'

export default function AuditorDashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAssigned() {
      try {
        setLoading(true)
        const res = await apiGet('/audit/assigned')
        setProjects(res.projects || [])
      } catch (err) {
        setError(err.message || 'Failed to load assigned projects')
      } finally {
        setLoading(false)
      }
    }
    loadAssigned()
  }, [])

  const stats = {
    totalAssigned: projects.length,
    pendingReview: projects.filter((p) => ['Assigned', 'Pending'].includes(p.status)).length,
    minted: projects.filter((p) => p.status === 'Minted').length,
    needInfoOrRejected: projects.filter((p) => ['Need More Info', 'Rejected'].includes(p.status)).length,
  }

  if (loading) {
    return <div className="workspace"><p>Loading auditor workspace...</p></div>
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="ACCREDITED AUDITOR WORKSPACE"
        title="Verification Dashboard"
        desc="Review carbon offset projects assigned to your auditor wallet, verify MRV methodology documentation, and approve ERC-1155 token minting."
        action={
          <Link to="/auditor/queue" className="btn btn-primary">
            <ClipboardCheck size={16} />
            <span>Go to Audit Queue</span>
          </Link>
        }
      />

      {error && <div className="error-text">{error}</div>}

      <div className="stats-grid">
        <StatCard
          icon={ClipboardCheck}
          label="Assigned Projects"
          value={stats.totalAssigned}
          help="Total assigned for verification"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Review"
          value={stats.pendingReview}
          help="Awaiting your verification decision"
        />
        <StatCard
          icon={CheckCircle2}
          label="Verified & Minted"
          value={stats.minted}
          help="Credits issued on-chain"
        />
        <StatCard
          icon={XCircle}
          label="Action Required / Rejected"
          value={stats.needInfoOrRejected}
          help="Information requested or rejected"
        />
      </div>

      <section className="panel">
        <div className="panel-title">
          <div className="panel-title-left">
            <ClipboardCheck size={18} />
            <h3>Assigned Projects Pending Verification</h3>
          </div>
          <span className="panel-meta">{projects.length} Total Assigned</span>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <ClipboardCheck size={40} />
            <strong>No assigned projects in queue</strong>
            <p>Project owners will assign their projects to your auditor profile for verification.</p>
          </div>
        ) : (
          <div className="queue">
            {projects.map((p) => (
              <Link
                key={p.projectId}
                to={`/auditor/review/${p.projectId}`}
                className="queue-card"
              >
                <div className="card-info">
                  <strong>{p.title}</strong>
                  <p>
                    {p.type} project in {p.location || 'N/A'} — Owner Wallet:{' '}
                    {p.ownerWallet?.slice(0, 8)}...
                  </p>
                </div>
                <Badge status={p.status} />
                <ChevronRight size={18} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
