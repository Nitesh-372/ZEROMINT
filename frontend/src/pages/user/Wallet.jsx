import React, { useState, useEffect } from 'react'
import { Wallet, Store, Recycle, Coins, CheckCircle2, Award } from 'lucide-react'
import { apiGet, apiPost } from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)
const money = (v) => `$${Number(v || 0).toFixed(2)}`

export default function CreditsWallet() {
  const [credits, setCredits] = useState([])
  const [selectedCreditId, setSelectedCreditId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Form states for listing and retirement
  const [listAmount, setListAmount] = useState('')
  const [listPrice, setListPrice] = useState('25')
  const [retireAmount, setRetireAmount] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [certificate, setCertificate] = useState(null)

  const [submittingList, setSubmittingList] = useState(false)
  const [submittingRetire, setSubmittingRetire] = useState(false)

  const loadCredits = async () => {
    try {
      setLoading(true)
      const res = await apiGet('/market/credits')
      const fetched = res.credits || []
      setCredits(fetched)
      if (fetched.length > 0 && !selectedCreditId) {
        setSelectedCreditId(fetched[0].creditId)
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet credits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCredits()
  }, [])

  const selectedCredit = credits.find((c) => c.creditId === selectedCreditId) || credits[0]
  const walletTotals = {
    minted: credits.reduce((sum, credit) => sum + (credit.amount || 0), 0),
    available: credits.reduce((sum, credit) => sum + (credit.available || 0), 0),
    listed: credits.reduce((sum, credit) => sum + (credit.listed || 0), 0),
    retired: credits.reduce((sum, credit) => sum + (credit.retired || 0), 0),
  }

  const handleListSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCredit) return
    setError('')
    setMessage('')
    setSubmittingList(true)

    try {
      await apiPost('/market/list', {
        creditId: selectedCredit.creditId,
        amount: Number(listAmount),
        price: Number(listPrice),
      })
      setMessage(`Successfully listed ${listAmount} credits for sale at $${listPrice}/credit!`)
      setListAmount('')
      await loadCredits()
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Failed to list credit')
    } finally {
      setSubmittingList(false)
    }
  }

  const handleRetireSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCredit) return
    setError('')
    setMessage('')
    setCertificate(null)
    setSubmittingRetire(true)

    try {
      const res = await apiPost(`/market/credits/${selectedCredit.creditId}/retire`, {
        amount: Number(retireAmount),
        beneficiary: beneficiary || 'Corporate Offsetter',
      })
      setMessage(`Successfully retired ${retireAmount} credits on-chain!`)
      setCertificate(res.certificate)
      setRetireAmount('')
      await loadCredits()
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Failed to retire credits')
    } finally {
      setSubmittingRetire(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="TOKENIZED CARBON ASSETS"
        title="Credits Wallet"
        desc="Your wallet holds ERC-1155 tokenized carbon credit batches minted upon verification. List credits for sale on the marketplace or permanently retire them on-chain."
      />

      {error && <div className="error-text">{error}</div>}
      {message && (
        <div className="panel" style={{ borderColor: 'var(--emerald-500)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="var(--emerald-400)" size={20} />
            <strong style={{ color: 'var(--emerald-400)' }}>{message}</strong>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon={Wallet}
          label="Wallet Balance"
          value={`${fmt(walletTotals.available)} Credits`}
          help="Available to list or retire"
        />
        <StatCard
          icon={Coins}
          label="Total Minted"
          value={fmt(walletTotals.minted)}
          help={`${credits.length} credit batches`}
        />
        <StatCard
          icon={Store}
          label="Listed Balance"
          value={fmt(walletTotals.listed)}
          help="Locked in marketplace listings"
        />
        <StatCard
          icon={Recycle}
          label="Retired Balance"
          value={fmt(walletTotals.retired)}
          help="Permanently burned credits"
        />
      </div>

      {certificate && (
        <div className="panel" style={{ borderColor: 'var(--emerald-500)' }}>
          <div className="panel-title">
            <div className="panel-title-left">
              <Award size={20} color="var(--emerald-400)" />
              <h3>Official Proof of Retirement Certificate</h3>
            </div>
            <span className="panel-meta">Immutable Proof</span>
          </div>

          <div className="metrics-row">
            <div className="metric">
              <span className="metric-label">Retired Amount</span>
              <div className="metric-value">{fmt(certificate.amount)} tCO2e</div>
            </div>
            <div className="metric">
              <span className="metric-label">Beneficiary</span>
              <div className="metric-value">{certificate.beneficiary}</div>
            </div>
            <div className="metric">
              <span className="metric-label">Timestamp</span>
              <div className="metric-value">
                {new Date(certificate.retiredAt).toLocaleString()}
              </div>
            </div>
            <div className="metric">
              <span className="metric-label">Status</span>
              <div className="metric-value" style={{ color: 'var(--emerald-400)' }}>
                Burned On-Chain
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="panel">
        <div className="panel-title">
          <div className="panel-title-left">
            <Wallet size={18} />
            <h3>Owned Credit Batches</h3>
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
                <th>Total Minted</th>
                <th>Available</th>
                <th>Listed</th>
                <th>Retired</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                    Loading wallet credits...
                  </td>
                </tr>
              ) : credits.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <Coins size={40} />
                      <strong>No credit holdings found</strong>
                      <p>Once an auditor approves your submitted project, ERC-1155 credit tokens will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                credits.map((c) => (
                  <tr
                    key={c.creditId}
                    style={{
                      background:
                        c.creditId === selectedCredit?.creditId
                          ? 'rgba(16, 185, 129, 0.06)'
                          : 'transparent',
                    }}
                  >
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
                    <td>
                      <strong style={{ color: 'var(--emerald-400)' }}>
                        {fmt(c.available)}
                      </strong>
                    </td>
                    <td>{fmt(c.listed)}</td>
                    <td>{fmt(c.retired)}</td>
                    <td>
                      <Badge status={c.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setSelectedCreditId(c.creditId)}
                      >
                        {selectedCredit?.creditId === c.creditId ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCredit && (
        <div className="grid">
          <section className="panel span-6">
            <div className="panel-title">
              <div className="panel-title-left">
                <Store size={18} />
                <h3>List Credits on Marketplace</h3>
              </div>
              <span className="panel-meta">
                Available: {fmt(selectedCredit.available)} Credits
              </span>
            </div>

            <form className="form" onSubmit={handleListSubmit}>
              <div className="field">
                <label className="field-label">Selected Credit Batch</label>
                <input
                  type="text"
                  value={`${selectedCredit.creditId} (Token #${selectedCredit.tokenId})`}
                  disabled
                />
              </div>

              <div className="field-grid">
                <div className="field">
                  <label className="field-label">Amount to List (tCO2e)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCredit.available}
                    value={listAmount}
                    onChange={(e) => setListAmount(e.target.value)}
                    placeholder={`Max ${selectedCredit.available}`}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Price per Credit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="split-row">
                <span>Total Value of Listing:</span>
                <strong>
                  {money((Number(listAmount) || 0) * (Number(listPrice) || 0))}
                </strong>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submittingList || selectedCredit.available <= 0}
              >
                {submittingList ? 'Listing...' : 'Create Marketplace Listing'}
              </button>
            </form>
          </section>

          <section className="panel span-6">
            <div className="panel-title">
              <div className="panel-title-left">
                <Recycle size={18} />
                <h3>Permanently Retire Credits</h3>
              </div>
              <span className="panel-meta">On-Chain Burn</span>
            </div>

            <form className="form" onSubmit={handleRetireSubmit}>
              <div className="field">
                <label className="field-label">Selected Credit Batch</label>
                <input
                  type="text"
                  value={`${selectedCredit.creditId} (Token #${selectedCredit.tokenId})`}
                  disabled
                />
              </div>

              <div className="field-grid">
                <div className="field">
                  <label className="field-label">Amount to Retire (tCO2e)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCredit.available}
                    value={retireAmount}
                    onChange={(e) => setRetireAmount(e.target.value)}
                    placeholder={`Max ${selectedCredit.available}`}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Beneficiary Name / Enterprise</label>
                  <input
                    type="text"
                    placeholder="Acme Corp Net-Zero 2026"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="split-row">
                <span>Offset Target:</span>
                <strong>{fmt(retireAmount || 0)} tCO2e Destroyed</strong>
              </div>

              <button
                type="submit"
                className="btn btn-secondary btn-full"
                disabled={submittingRetire || selectedCredit.available <= 0}
              >
                {submittingRetire ? 'Burning On-Chain...' : 'Retire & Issue Certificate'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
