import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Building2,
  FileCheck2,
  Coins,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { apiGet, fileUrl } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

export default function ProjectDetails() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true)
        const res = await apiGet(`/projects/${projectId}`)
        setProject(res.project)
      } catch (err) {
        setError(err.message || 'Failed to load project details')
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [projectId])

  if (loading) {
    return <div className="workspace"><p>Loading project verification record...</p></div>
  }

  if (error || !project) {
    return (
      <div className="workspace">
        <div className="error-text">{error || 'Project not found'}</div>
        <br />
        <Link to="/projects" className="btn btn-secondary">
          Back to Projects
        </Link>
      </div>
    )
  }

  const timelineSteps = [
    {
      title: 'Project Submission & On-Chain Registration',
      date: new Date(project.createdAt).toLocaleDateString(),
      desc: `Registered on-chain as Project #${project.onChainProjectId || 'Pending'}. Tx Hash: ${project.chainHash || 'N/A'}`,
    },
    {
      title: 'Auditor Assignment',
      date: project.assignedAuditor ? 'Assigned' : 'Pending',
      desc: project.assignedAuditor
        ? `Auditor ${project.assignedAuditor.name} (${project.assignedAuditor.walletAddress}) assigned.`
        : 'Waiting for project owner to assign an independent auditor.',
    },
    {
      title: 'Verification Decision',
      date: project.status,
      desc: project.lastComment || 'Pending verification review by assigned auditor.',
    },
    {
      title: 'Credit Issuance & Minting',
      date: project.creditsApproved ? `${fmt(project.creditsApproved)} Credits` : 'Pending',
      desc: project.approvalHash
        ? `ERC-1155 tokens minted on-chain. Mint Hash: ${project.approvalHash}`
        : 'Tokens will be minted automatically upon auditor approval.',
    },
  ]

  return (
    <div className="stack">
      <PageHeader
        eyebrow={`PROJECT RECORD / ${project.projectId}`}
        title={project.title}
        desc={`${project.type} project located in ${project.location}. Linked to EVM Registry Project #${project.onChainProjectId || 'N/A'}.`}
        action={<Badge status={project.status} />}
      />

      <div className="grid">
        <section className="panel span-8">
          <div className="panel-title">
            <div className="panel-title-left">
              <ShieldCheck size={18} />
              <h3>Audit & Verification Audit Trail</h3>
            </div>
            <span className="panel-meta">On-Chain Provenance</span>
          </div>

          <div className="timeline">
            {timelineSteps.map((step, idx) => (
              <div className="step" key={idx}>
                <div className="step-number">{idx + 1}</div>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                  <small>{step.date}</small>
                </div>
              </div>
            ))}
          </div>

          {project.description && (
            <div style={{ marginTop: '24px' }}>
              <div className="field-label" style={{ marginBottom: '8px' }}>Project Description</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                {project.description}
              </p>
            </div>
          )}

          {project.files && project.files.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div className="field-label" style={{ marginBottom: '12px' }}>Evidence Documentation</div>
              <div className="file-list">
                {project.files.map((f, i) => (
                  <div key={i} className="file-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} />
                      <span>{f.originalName || f.filename}</span>
                    </div>
                    <a
                      href={fileUrl(f.path)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-link"
                    >
                      <ExternalLink size={14} />
                      <span>View File</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="panel span-4">
          <div className="panel-title">
            <div className="panel-title-left">
              <Coins size={18} />
              <h3>Project Metadata</h3>
            </div>
          </div>

          <div className="stack" style={{ gap: '12px' }}>
            <div className="metric">
              <span className="metric-label">On-Chain Project ID</span>
              <div className="metric-value mono">
                #{project.onChainProjectId || 'Not assigned'}
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">Requested Credits</span>
              <div className="metric-value">
                {fmt(project.creditsRequested)} tCO2e
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">Approved Credits</span>
              <div className="metric-value" style={{ color: project.creditsApproved ? 'var(--emerald-400)' : 'var(--text-muted)' }}>
                {fmt(project.creditsApproved)} tCO2e
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">Owner Wallet</span>
              <div className="metric-value mono">
                {project.ownerWallet}
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">Methodology</span>
              <div className="metric-value">
                {project.methodology || 'Standard MRV Protocol'}
              </div>
            </div>

            {!project.assignedAuditor && (
              <Link to="/hire-auditor" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
                <UserCheck size={16} />
                <span>Hire Independent Auditor</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
