import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ChevronRight, BriefcaseBusiness } from 'lucide-react'
import { apiGet } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        const res = await apiGet('/projects')
        setProjects(res.projects || [])
      } catch (err) {
        setError(err.message || 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q) ||
      p.projectId?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="stack">
      <PageHeader
        eyebrow="PROJECT PORTFOLIO"
        title="My Registered Projects"
        desc="All carbon credit projects registered under your account, fetched directly from MongoDB and mapped to on-chain IDs."
        action={
          <Link to="/submit" className="btn btn-primary">
            <Plus size={16} />
            <span>New Project</span>
          </Link>
        }
      />

      {error && <div className="error-text">{error}</div>}

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by title, status, location, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Showing {filteredProjects.length} of {projects.length} Projects
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>On-Chain ID</th>
                <th>Type / Location</th>
                <th>Credits</th>
                <th>Assigned Auditor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    Loading projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <BriefcaseBusiness size={40} />
                      <strong>No matching projects found</strong>
                      <p>
                        {search
                          ? 'Try adjusting your search filter.'
                          : 'Submit your first project to begin verification.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.projectId}>
                    <td>
                      <strong>{p.title}</strong>
                      <span className="cell-sub mono">{p.projectId}</span>
                    </td>
                    <td>
                      <span className="mono">
                        {p.onChainProjectId ? `#${p.onChainProjectId}` : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <strong>{p.type}</strong>
                      <span className="cell-sub">{p.location || 'N/A'}</span>
                    </td>
                    <td>
                      <strong>
                        {fmt(p.creditsApproved || p.creditsRequested)} tCO2e
                      </strong>
                      <span className="cell-sub">
                        {p.creditsApproved ? 'Approved' : 'Requested'}
                      </span>
                    </td>
                    <td>
                      {p.assignedAuditor ? (
                        <div>
                          <strong>{p.assignedAuditor.name}</strong>
                          <span className="cell-sub mono">
                            {p.assignedAuditor.walletAddress?.slice(0, 6)}...
                          </span>
                        </div>
                      ) : (
                        <span className="cell-sub">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                    <td>
                      <Link
                        to={`/projects/${p.projectId}`}
                        className="btn-link"
                      >
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </Link>
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
