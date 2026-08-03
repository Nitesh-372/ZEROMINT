import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CloudUpload, FileText, CheckCircle2, Trash2 } from 'lucide-react'
import { apiPostForm } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)

const typeRules = [
  { type: 'Solar', methodology: 'VM0038 / Renewable Electricity Generation', keywords: ['solar', 'pv', 'photovoltaic'] },
  { type: 'Wind', methodology: 'ACM0002 / Grid-connected Renewable Electricity', keywords: ['wind', 'turbine'] },
  { type: 'Reforestation', methodology: 'AR-ACM0003 / Afforestation and Reforestation', keywords: ['forest', 'reforest', 'tree', 'afforestation', 'redd'] },
  { type: 'Biomass', methodology: 'AMS-I.C / Thermal Energy from Biomass', keywords: ['biomass', 'bioenergy', 'waste'] },
  { type: 'Hydro', methodology: 'ACM0002 / Hydroelectric Renewable Energy', keywords: ['hydro', 'water'] },
  { type: 'Methane Capture', methodology: 'AMS-III.D / Methane Recovery', keywords: ['methane', 'landfill', 'biogas'] },
]

function fileStem(name = '') {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

function inferEvidenceDraft(files) {
  const names = files.map((file) => file.name.toLowerCase())
  const joinedNames = names.join(' ')
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  const matchedRule = typeRules.find((rule) =>
    rule.keywords.some((keyword) => joinedNames.includes(keyword))
  )
  const hashSeed = files.map((file) => `${file.name}:${file.size}`).join('|') || 'empty'
  const hash = Array.from(hashSeed).reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) >>> 0, 0)
  const type = matchedRule?.type || 'Other'
  const typeCode = type.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'OTH'
  const suggestedCredits = Math.max(100, Math.round((files.length * 250 + totalBytes / 1024 / 12) / 50) * 50)

  return {
    draftProjectId: `PRJ-${typeCode}-${hash.toString(16).toUpperCase().padStart(8, '0').slice(0, 8)}-${files.length}`,
    title: files[0] ? fileStem(files[0].name) : '',
    type,
    methodology: matchedRule?.methodology || 'Standard MRV Evidence Review',
    suggestedCredits,
    totalBytes,
    completeness: Math.min(100, files.length * 25 + (totalBytes > 1024 * 1024 ? 25 : 0)),
  }
}

function formatBytes(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default function SubmitProject() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    type: 'Solar',
    location: '',
    creditsRequested: '',
    description: '',
    methodology: 'VM0007 / VCS REDD+ Methodology',
    ownerWallet: user?.walletAddress || '',
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState(null)
  const evidenceDraft = useMemo(() => inferEvidenceDraft(selectedFiles), [selectedFiles])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const draft = inferEvidenceDraft(files)
      setSelectedFiles(files)
      if (files.length > 0) {
        setForm((current) => ({
          ...current,
          title: current.title || draft.title,
          type: current.type === 'Solar' ? draft.type : current.type,
          methodology: !current.methodology || current.methodology === 'VM0007 / VCS REDD+ Methodology'
            ? draft.methodology
            : current.methodology,
          creditsRequested: current.creditsRequested || String(draft.suggestedCredits),
        }))
      }
    }
  }

  const clearFiles = () => {
    setSelectedFiles([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessResult(null)

    if (!form.title || !form.creditsRequested || !form.ownerWallet) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('type', form.type)
      formData.append('location', form.location)
      formData.append('creditsRequested', form.creditsRequested)
      formData.append('description', form.description)
      formData.append('methodology', form.methodology)
      formData.append('ownerWallet', form.ownerWallet)

      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const res = await apiPostForm('/projects', formData)
      setSuccessResult(res.project)
      setTimeout(() => {
        navigate('/projects')
      }, 2500)
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Failed to submit project'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="PROJECT REGISTRATION"
        title="Register New Carbon Project"
        desc="Submitting a project creates a record in MongoDB and triggers an on-chain registration via CarbonRegistry contract."
      />

      {successResult && (
        <div className="panel" style={{ borderColor: 'var(--emerald-500)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <div className="split-row" style={{ marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 color="var(--emerald-400)" size={24} />
              <div>
                <strong style={{ color: 'var(--emerald-400)' }}>
                  Project Successfully Registered On-Chain!
                </strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  On-chain Project ID: #{successResult.onChainProjectId} | Tx Hash: {successResult.chainHash}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form className="grid" onSubmit={handleSubmit}>
        <section className="panel span-8 form">
          <div className="panel-title">
            <div className="panel-title-left">
              <Building2 size={18} />
              <h3>Project Information</h3>
            </div>
            <span className="panel-meta">Required Fields</span>
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="field-label">Project Title</label>
              <input
                type="text"
                name="title"
                placeholder="Amazon Basin Reforestation Project"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Project Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="Solar">Solar Energy</option>
                <option value="Wind">Wind Power</option>
                <option value="Reforestation">Reforestation & Afforestation</option>
                <option value="Biomass">Biomass & Bioenergy</option>
                <option value="Hydro">Hydroelectric</option>
                <option value="Methane Capture">Methane Capture</option>
                <option value="Other">Other Sustainability Type</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">Location / Region</label>
              <input
                type="text"
                name="location"
                placeholder="Pará, Brazil"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Requested Carbon Credits (tCO2e)</label>
              <input
                type="number"
                name="creditsRequested"
                placeholder="10000"
                value={form.creditsRequested}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Project Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Detailed description of the carbon offset project, scope, and impact..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="field-label">Quantification Methodology</label>
              <input
                type="text"
                name="methodology"
                placeholder="VM0007 / VCS REDD+"
                value={form.methodology}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field-label">Project Owner Wallet Address</label>
              <input
                type="text"
                name="ownerWallet"
                value={form.ownerWallet}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? 'Registering on Blockchain...' : 'Register Project On-Chain'}
          </button>
        </section>

        <section className="panel span-4 form">
          <div className="panel-title">
            <div className="panel-title-left">
              <CloudUpload size={18} />
              <h3>Evidence Package</h3>
            </div>
            <span className="panel-meta">Files</span>
          </div>

          <label className="file-upload">
            <CloudUpload size={36} className="file-upload-icon" />
            <div>
              <strong>Upload Documentation & Evidence</strong>
              <p>PDD documents, satellite imagery, MRV evidence files</p>
            </div>
            <span className="btn btn-secondary">Choose Files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </label>

          <div className="metric">
            <span className="metric-label">Draft Project Number</span>
            <div className="metric-value mono">
              {selectedFiles.length ? evidenceDraft.draftProjectId : 'Upload files to generate'}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="metrics-row compact">
              <div className="metric">
                <span className="metric-label">Files</span>
                <div className="metric-value">{selectedFiles.length}</div>
              </div>
              <div className="metric">
                <span className="metric-label">Size</span>
                <div className="metric-value">{formatBytes(evidenceDraft.totalBytes)}</div>
              </div>
              <div className="metric">
                <span className="metric-label">Suggested</span>
                <div className="metric-value">{fmt(evidenceDraft.suggestedCredits)}</div>
              </div>
              <div className="metric">
                <span className="metric-label">Score</span>
                <div className="metric-value">{evidenceDraft.completeness}%</div>
              </div>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="file-list">
              <div className="split-row" style={{ paddingTop: 0, marginTop: 0 }}>
                <div className="field-label">Selected Files ({selectedFiles.length})</div>
                <button type="button" className="btn-link" onClick={clearFiles}>
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              </div>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="file-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} />
                    <span>{file.name}</span>
                  </div>
                  <small className="mono">{(file.size / 1024).toFixed(1)} KB</small>
                </div>
              ))}
            </div>
          )}

          <div className="metric" style={{ background: 'var(--bg-input)' }}>
            <span className="metric-label">Parameters Updated From Evidence</span>
            <div className="metric-value" style={{ fontSize: '13px', fontWeight: 600 }}>
              {selectedFiles.length
                ? `${form.type} | ${fmt(form.creditsRequested)} tCO2e | ${form.methodology}`
                : 'Select files to auto-fill project type, methodology, and requested credits.'}
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
