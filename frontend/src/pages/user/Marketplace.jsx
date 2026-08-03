import React, { useState, useEffect } from 'react'
import { Store, ShoppingCart, Globe2, Leaf, Search, CheckCircle2 } from 'lucide-react'
import { apiGet, apiPost } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'

const fmt = (v) => new Intl.NumberFormat('en-US').format(v || 0)
const money = (v) => `$${Number(v || 0).toFixed(2)}`

export default function Marketplace() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadListings = async () => {
    try {
      setLoading(true)
      const res = await apiGet('/market/listings')
      setListings(res.listings || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch marketplace listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  const handleBuy = async (listingId) => {
    setError('')
    setMessage('')
    setPurchasingId(listingId)

    try {
      await apiPost(`/market/buy/${listingId}`, {})
      setMessage('Listing successfully purchased! ERC-1155 tokens transferred to your wallet.')
      await loadListings()
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Failed to purchase listing'
      )
    } finally {
      setPurchasingId(null)
    }
  }

  const filteredListings = listings.filter((l) => {
    const q = search.toLowerCase()
    const title = l.credit?.project?.title || ''
    const seller = l.seller?.name || ''
    const location = l.credit?.project?.location || ''
    const type = l.credit?.project?.type || ''
    return (
      title.toLowerCase().includes(q) ||
      seller.toLowerCase().includes(q) ||
      location.toLowerCase().includes(q) ||
      type.toLowerCase().includes(q)
    )
  })

  const totalSupply = listings.reduce((s, l) => s + (l.amount || 0), 0)
  const avgPrice = listings.length
    ? listings.reduce((s, l) => s + (l.price || 0), 0) / listings.length
    : 0

  return (
    <div className="stack">
      <PageHeader
        eyebrow="INSTITUTIONAL MARKETPLACE"
        title="Carbon Credit Marketplace"
        desc="Trade verified ERC-1155 carbon credits listed by accredited project developers. Purchases initiate immediate on-chain settlement."
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

      <div className="metrics-row">
        <div className="metric">
          <span className="metric-label">Total Open Supply</span>
          <div className="metric-value">{fmt(totalSupply)} tCO2e</div>
        </div>
        <div className="metric">
          <span className="metric-label">Active Listings</span>
          <div className="metric-value">{listings.length} Listings</div>
        </div>
        <div className="metric">
          <span className="metric-label">Average Price / Credit</span>
          <div className="metric-value">{money(avgPrice)}</div>
        </div>
        <div className="metric">
          <span className="metric-label">Settlement Engine</span>
          <div className="metric-value" style={{ color: 'var(--emerald-400)' }}>
            EVM Token Relayer
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by project, developer, location, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Showing {filteredListings.length} of {listings.length} Open Listings
        </div>
      </div>

      {loading ? (
        <div className="workspace"><p>Loading marketplace listings...</p></div>
      ) : filteredListings.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <Store size={40} />
            <strong>No open listings found</strong>
            <p>
              {search
                ? 'Try adjusting your search criteria.'
                : 'Project owners can list verified credits from their wallet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="listing-cards">
          {filteredListings.map((l) => {
            const isSelf = String(l.seller?._id) === String(user?._id)
            return (
              <div key={l.listingId} className="listing-card">
                <div className="listing-top">
                  <Badge status={l.status} />
                  <code className="mono">{l.listingId}</code>
                </div>

                <div>
                  <h3>{l.credit?.project?.title || 'Carbon Credit Batch'}</h3>
                  <div className="listing-seller">
                    Developer: {l.seller?.name || 'Accredited Developer'}
                  </div>
                </div>

                <div className="listing-meta">
                  <span>
                    <Globe2 size={15} />
                    {l.credit?.project?.location || 'International'}
                  </span>
                  <span>
                    <Leaf size={15} />
                    {l.credit?.project?.type || 'Sustainability Project'}
                  </span>
                </div>

                <div className="listing-price">
                  <div>
                    <small>Available Amount</small>
                    <strong>{fmt(l.amount)} tCO2e</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <small>Price / Credit</small>
                    <strong style={{ color: 'var(--emerald-400)' }}>
                      {money(l.price)}
                    </strong>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-full"
                  disabled={isSelf || purchasingId === l.listingId}
                  onClick={() => handleBuy(l.listingId)}
                >
                  <ShoppingCart size={16} />
                  <span>
                    {isSelf
                      ? 'Your Listing'
                      : purchasingId === l.listingId
                      ? 'Processing On-Chain...'
                      : `Buy for ${money(l.amount * l.price)}`}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
