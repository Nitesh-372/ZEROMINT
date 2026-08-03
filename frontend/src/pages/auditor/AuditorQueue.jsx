import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Search, ChevronRight } from 'lucide-react'
import { apiGet } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

export default function AuditorQueue() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAssigned() {
      try {
        setLoading(true)
        const res = await apiGet('/audit/assigned')
        setProjects(res.projects || [])
      } catch (err) {
        setError(err.message || 'Failed to fetch verification queue')
      } finally {
        setLoading(false)
      }
    }
    loadAssigned()
  }, [])

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="stack">
      <PageHeader
        eyebrow="AUDIT WORKSPACE"
        title="Verification Queue"
        desc="Projects assigned to your auditor wallet for MRV review, evidence verification, and on-chain credit issuance decisions."
      />

      {error && <div className="error-text">{error}</div>}

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by project, status, type, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {filteredProjects.length} Assigned Projects
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>On-Chain ID</th>
                <th>Type / Location</th>
                <th>Requested Credits</th>
                <th>Project Owner</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    Loading verification queue...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <ClipboardCheck size={40} />
                      <strong>No assigned projects found</strong>
                      <p>
                        {search
                          ? 'Try adjusting your search criteria.'
                          : 'No projects have been assigned to your auditor account yet.'}
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
                      <strong>{fmt(p.creditsRequested)} tCO2e</strong>
                    </td>
                    <td>
                      <strong>{p.owner?.name || 'Owner'}</strong>
                      <span className="cell-sub mono">
                        {p.ownerWallet?.slice(0, 6)}...{p.ownerWallet?.slice(-4)}
                      </span>
                    </td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                    <td>
                      <Link
                        to={`/auditor/review/${p.projectId}`}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <span>Review</span>
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
