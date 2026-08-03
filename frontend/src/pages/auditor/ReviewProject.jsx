import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  FileImage,
} from 'lucide-react'
import { apiGet, apiPost, fileUrl } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

function isImage(file) {
  return file?.mimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file?.filename || file?.originalName || '')
}

function isPdf(file) {
  return file?.mimeType === 'application/pdf' || /\.pdf$/i.test(file?.filename || file?.originalName || '')
}

export default function ReviewProject() {
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [approvedCredits, setApprovedCredits] = useState('')
  const [reason, setReason] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [txHash, setTxHash] = useState('')
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)

  const loadProject = async () => {
    try {
      setLoading(true)
      const res = await apiGet(`/projects/${projectId}`)
      const p = res.project
      setProject(p)
      if (p) {
        setApprovedCredits(p.creditsApproved || p.creditsRequested || '')
        setSelectedFileIndex(0)
      }
    } catch (err) {
      setError(err.message || 'Failed to load project for audit review')
    } finally {
      setLoading(false)
    }
  }

  const files = project?.files || []
  const selectedFile = files[selectedFileIndex]
  const selectedFileUrl = selectedFile ? fileUrl(selectedFile.path) : ''

  useEffect(() => {
    loadProject()
  }, [projectId])

  const handleApprove = async () => {
    if (!approvedCredits || Number(approvedCredits) <= 0) {
      setError('Please enter a valid approved credits amount.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const res = await apiPost(`/audit/${projectId}/approve`, {
        approvedCredits: Number(approvedCredits),
      })
      setSuccess('Project approved and ERC-1155 tokens minted on-chain!')
      setTxHash(res.credit?.txHash || res.project?.approvalHash || '')
      await loadProject()
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Approval failed'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestInfo = async () => {
    if (!reason) {
      setError('Please provide notes explaining what additional information is required.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const res = await apiPost(`/audit/${projectId}/more-info`, { reason })
      setSuccess('More information requested from project owner.')
      setTxHash(res.project?.approvalHash || '')
      await loadProject()
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Request for more info failed'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!reason) {
      setError('Please provide a reason for rejecting this project.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const res = await apiPost(`/audit/${projectId}/reject`, { reason })
      setSuccess('Project rejected on-chain.')
      setTxHash(res.project?.approvalHash || '')
      await loadProject()
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Rejection failed'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="workspace"><p>Loading project audit package...</p></div>
  }

  if (error && !project) {
    return (
      <div className="workspace">
        <div className="error-text">{error}</div>
        <br />
        <Link to="/auditor/queue" className="btn btn-secondary">
          Back to Queue
        </Link>
      </div>
    )
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow={`AUDIT REVIEW WORKSPACE / ${project.projectId}`}
        title={project.title}
        desc={`Verifying ${project.type} project submitted by ${project.owner?.name || 'Owner'}. On-Chain Project ID: #${project.onChainProjectId || 'Pending'}.`}
        action={<Badge status={project.status} />}
      />

      {error && <div className="error-text">{error}</div>}
      {success && (
        <div className="panel" style={{ borderColor: 'var(--emerald-500)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="var(--emerald-400)" size={20} />
            <div>
              <strong style={{ color: 'var(--emerald-400)' }}>{success}</strong>
              {txHash && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }} className="mono">
                  Blockchain Transaction Hash: {txHash}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        <section className="panel span-8 evidence-review-panel">
          <div className="panel-title">
            <div className="panel-title-left">
              <FileText size={18} />
              <h3>Uploaded Evidence Review</h3>
            </div>
            <span className="panel-meta">{project.files?.length || 0} Attached Files</span>
          </div>

          <div className="stack" style={{ gap: '16px' }}>
            {selectedFile ? (
              <div className="evidence-viewer">
                <div className="evidence-viewer-header">
                  <div>
                    <strong>{selectedFile.originalName || selectedFile.filename}</strong>
                    <span>{selectedFile.mimeType || 'Uploaded evidence file'}</span>
                  </div>
                  <a
                    href={selectedFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                  >
                    <ExternalLink size={15} />
                    <span>Open File</span>
                  </a>
                </div>

                <div className="evidence-frame">
                  {isImage(selectedFile) ? (
                    <img src={selectedFileUrl} alt={selectedFile.originalName || selectedFile.filename} />
                  ) : isPdf(selectedFile) ? (
                    <iframe title="Evidence file preview" src={selectedFileUrl} />
                  ) : (
                    <div className="empty-state">
                      <FileImage size={42} />
                      <strong>Preview not available for this file type</strong>
                      <p>Open the uploaded evidence in a new tab to inspect it.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state evidence-frame">
                <FileText size={42} />
                <strong>No evidence file uploaded</strong>
                <p>Ask the project owner to upload MRV documentation before approval.</p>
              </div>
            )}

            <div className="metrics-row">
              <div className="metric">
                <span className="metric-label">Project Type</span>
                <div className="metric-value">{project.type}</div>
              </div>
              <div className="metric">
                <span className="metric-label">Location</span>
                <div className="metric-value">{project.location || 'N/A'}</div>
              </div>
              <div className="metric">
                <span className="metric-label">Requested Credits</span>
                <div className="metric-value">{fmt(project.creditsRequested)} tCO2e</div>
              </div>
              <div className="metric">
                <span className="metric-label">Methodology</span>
                <div className="metric-value">{project.methodology || 'Standard MRV'}</div>
              </div>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: '6px' }}>Project Summary</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                {project.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: '10px' }}>Uploaded Evidence Packages</div>
              {project.files && project.files.length > 0 ? (
                <div className="file-list">
                  {project.files.map((f, idx) => (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      className={`file-item file-item-button ${idx === selectedFileIndex ? 'active' : ''}`}
                      onClick={() => setSelectedFileIndex(idx)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedFileIndex(idx)
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        <span>{f.originalName || f.filename}</span>
                      </div>
                      <a
                        href={fileUrl(f.path)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-link"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                        <span>Inspect File</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No document files uploaded by project owner.</p>
                </div>
              )}
            </div>

            {project.lastComment && (
              <div className="metric" style={{ background: 'var(--bg-input)' }}>
                <span className="metric-label">Last Auditor / System Remark</span>
                <div className="metric-value" style={{ fontSize: '14px', fontWeight: 500 }}>
                  "{project.lastComment}"
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel span-4 form">
          <div className="panel-title">
            <div className="panel-title-left">
              <ShieldCheck size={18} />
              <h3>Accept / Reject Decision</h3>
            </div>
            <span className="panel-meta">Auditor Review</span>
          </div>

          <div className="metric" style={{ background: 'var(--bg-input)' }}>
            <span className="metric-label">Requested By User</span>
            <div className="metric-value">{fmt(project.creditsRequested)} tCO2e</div>
          </div>

          <div className="field">
            <label className="field-label">Correct Credits After Review (tCO2e)</label>
            <input
              type="number"
              min="1"
              value={approvedCredits}
              onChange={(e) => setApprovedCredits(e.target.value)}
              placeholder="10000"
            />
          </div>

          <div className="field">
            <label className="field-label">Auditor Reason / Review Remarks</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter verification notes, baseline verification results, or request details..."
            />
          </div>

          <div className="stack" style={{ gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-primary btn-full"
              disabled={submitting || project.status === 'Minted'}
              onClick={handleApprove}
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Accepting...' : 'Accept Project & Issue Credits'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              disabled={submitting}
              onClick={handleRequestInfo}
            >
              <AlertCircle size={16} />
              <span>Request More Information</span>
            </button>

            <button
              type="button"
              className="btn btn-danger btn-full"
              disabled={submitting || project.status === 'Rejected'}
              onClick={handleReject}
            >
              <XCircle size={16} />
              <span>Reject Project</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
