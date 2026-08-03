import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BriefcaseBusiness,
  Coins,
  Store,
  Recycle,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { apiGet } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [credits, setCredits] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [pRes, cRes, lRes] = await Promise.all([
          apiGet('/projects'),
          apiGet('/market/credits'),
          apiGet('/market/listings'),
        ])
        setProjects(pRes.projects || [])
        setCredits(cRes.credits || [])
        setListings(lRes.listings || [])
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = {
    totalProjects: projects.length,
    active: projects.filter((p) =>
      ['Pending', 'Assigned', 'Need More Info'].includes(p.status)
    ).length,
    minted: projects.filter((p) => p.status === 'Minted').length,
    creditsIssued: credits.reduce((s, c) => s + (c.amount || 0), 0),
    creditsListed: listings.reduce((s, l) => s + (l.amount || 0), 0),
    creditsRetired: credits.reduce((s, c) => s + (c.retired || 0), 0),
  }

  if (loading) {
    return <div className="workspace"><p>Loading workspace dashboard...</p></div>
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="INSTITUTIONAL DASHBOARD"
        title="Carbon Registry Workspace"
        desc="Real-time status of on-chain project submissions, MRV verification states, and ERC-1155 credit holdings."
        action={
          <Link to="/submit" className="btn btn-primary">
            <Plus size={16} />
            <span>Submit Project</span>
          </Link>
        }
      />

      {error && <div className="error-text">{error}</div>}

      <div className="stats-grid">
        <StatCard
          icon={BriefcaseBusiness}
          label="Total Registered Projects"
          value={stats.totalProjects}
          help={`${stats.active} under active audit`}
        />
        <StatCard
          icon={Coins}
          label="Credits Issued"
          value={fmt(stats.creditsIssued)}
          help={`${stats.minted} minted projects`}
        />
        <StatCard
          icon={Store}
          label="Market Listings"
          value={fmt(stats.creditsListed)}
          help={`${listings.length} active market listings`}
        />
        <StatCard
          icon={Recycle}
          label="Credits Retired"
          value={fmt(stats.creditsRetired)}
          help="On-chain burned certificates"
        />
      </div>

      <div className="grid">
        <section className="panel span-8">
          <div className="panel-title">
            <div className="panel-title-left">
              <Sparkles size={18} />
              <h3>Project Lifecycle Activity</h3>
            </div>
            <span className="panel-meta">{projects.length} Total</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <BriefcaseBusiness size={40} />
              <strong>No projects registered</strong>
              <p>Submit your first project to register it on MongoDB and the EVM Carbon Registry.</p>
            </div>
          ) : (
            <div className="timeline">
              {projects.slice(0, 5).map((p) => (
                <Link
                  key={p.projectId}
                  to={`/projects/${p.projectId}`}
                  className="timeline-item"
                >
                  <span className="timeline-dot" />
                  <div className="item-info">
                    <strong>{p.title}</strong>
                    <p>
                      {p.lastComment || `${p.type} project in ${p.location}`}
                    </p>
                  </div>
                  <Badge status={p.status} />
                  <ChevronRight size={16} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel span-4">
          <div className="panel-title">
            <div className="panel-title-left">
              <Coins size={18} />
              <h3>Credit Summary</h3>
            </div>
            <span className="panel-meta">Holdings</span>
          </div>

          <div className="stack" style={{ gap: '12px' }}>
            <div className="metric">
              <span className="metric-label">Available for Sale / Transfer</span>
              <div className="metric-value">
                {fmt(credits.reduce((s, c) => s + (c.available || 0), 0))} Credits
              </div>
            </div>
            <div className="metric">
              <span className="metric-label">Currently Listed</span>
              <div className="metric-value">
                {fmt(stats.creditsListed)} Credits
              </div>
            </div>
            <div className="metric">
              <span className="metric-label">Permanently Retired</span>
              <div className="metric-value">
                {fmt(stats.creditsRetired)} Credits
              </div>
            </div>
            <Link to="/wallet" className="btn btn-secondary btn-full">
              View Credits Wallet
            </Link>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-title">
          <div className="panel-title-left">
            <Coins size={18} />
            <h3>Recent Issued Credit Batches</h3>
          </div>
          <span className="panel-meta">{credits.length} Batches</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Credit ID</th>
                <th>Token ID</th>
                <th>Project</th>
                <th>Issued</th>
                <th>Available</th>
                <th>Listed</th>
                <th>Retired</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {credits.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <strong>No credits issued yet</strong>
                      <p>Credits are minted on-chain after an auditor verifies and approves a project.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                credits.map((c) => (
                  <tr key={c.creditId}>
                    <td>
                      <code className="mono">{c.creditId}</code>
                    </td>
                    <td>
                      <span className="mono">Token #{c.tokenId}</span>
                    </td>
                    <td>
                      <strong>{c.project?.title || c.project?.projectId || 'Project'}</strong>
                    </td>
                    <td>{fmt(c.amount)}</td>
                    <td>{fmt(c.available)}</td>
                    <td>{fmt(c.listed)}</td>
                    <td>{fmt(c.retired)}</td>
                    <td>
                      <Badge status={c.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
