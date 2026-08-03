import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { apiGet, apiPost } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'

export default function HireAuditor() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [auditors, setAuditors] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedAuditorId, setSelectedAuditorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [pRes, aRes] = await Promise.all([
          apiGet('/projects'),
          apiGet('/projects/auditors'),
        ])
        setProjects(pRes.projects || [])
        setAuditors(aRes.auditors || [])
        if (pRes.projects?.[0]) setSelectedProjectId(pRes.projects[0].projectId)
        if (aRes.auditors?.[0]) setSelectedAuditorId(aRes.auditors[0]._id)
      } catch (err) {
        setError(err.message || 'Failed to fetch auditor options')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const selectedAuditor = auditors.find((a) => a._id === selectedAuditorId)
  const selectedProject = projects.find((p) => p.projectId === selectedProjectId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProjectId || !selectedAuditorId) {
      setError('Please select both a project and an auditor.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await apiPost(`/projects/${selectedProjectId}/hire-auditor`, {
        auditorId: selectedAuditorId,
      })
      setSuccess('Auditor assigned successfully on-chain and in MongoDB!')
      setTimeout(() => {
        navigate('/projects')
      }, 2000)
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Failed to assign auditor'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="workspace"><p>Loading auditor network...</p></div>
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="MRV VERIFICATION NETWORK"
        title="Hire & Assign Auditor"
        desc="Select an accredited auditor from the registered network to verify your project's carbon offset claims and issue ERC-1155 tokens on-chain."
      />

      {success && (
        <div className="panel" style={{ borderColor: 'var(--emerald-500)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="var(--emerald-400)" size={24} />
            <strong style={{ color: 'var(--emerald-400)' }}>{success}</strong>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <UserCheck size={40} />
            <strong>No registered projects</strong>
            <p>Please submit a project first before hiring an auditor.</p>
          </div>
        </div>
      ) : auditors.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <ShieldCheck size={40} />
            <strong>No auditors available</strong>
            <p>No auditor accounts exist in MongoDB yet. Register an auditor account to proceed.</p>
          </div>
        </div>
      ) : (
        <form className="grid" onSubmit={handleSubmit}>
          <section className="panel span-7 form">
            <div className="panel-title">
              <div className="panel-title-left">
                <UserCheck size={18} />
                <h3>Assignment Details</h3>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
              >
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.title} (On-Chain ID #{p.onChainProjectId || 'Pending'}) — Status: {p.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Select Accredited Auditor</label>
              <select
                value={selectedAuditorId}
                onChange={(e) => setSelectedAuditorId(e.target.value)}
                required
              >
                {auditors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.orgName || 'Independent Auditor'}) — {a.walletAddress?.slice(0, 6)}...{a.walletAddress?.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="error-text">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? 'Assigning On-Chain...' : 'Assign Auditor On-Chain'}
            </button>
          </section>

          {selectedAuditor && (
            <section className="panel span-5">
              <div className="panel-title">
                <div className="panel-title-left">
                  <ShieldCheck size={18} />
                  <h3>Auditor Profile</h3>
                </div>
              </div>

              <div className="stack" style={{ gap: '12px' }}>
                <div className="metric">
                  <span className="metric-label">Auditor Name</span>
                  <div className="metric-value">{selectedAuditor.name}</div>
                </div>

                <div className="metric">
                  <span className="metric-label">Email</span>
                  <div className="metric-value">{selectedAuditor.email}</div>
                </div>

                <div className="metric">
                  <span className="metric-label">Wallet Address</span>
                  <div className="metric-value mono">
                    {selectedAuditor.walletAddress}
                  </div>
                </div>

                <div className="metric">
                  <span className="metric-label">Organization</span>
                  <div className="metric-value">
                    {selectedAuditor.orgName || 'N/A'} ({selectedAuditor.orgType || 'VVB Inspector'})
                  </div>
                </div>
              </div>
            </section>
          )}
        </form>
      )}
    </div>
  )
}
