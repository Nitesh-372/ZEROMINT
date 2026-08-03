import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    walletAddress: '',
    orgName: '',
    orgType: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic wallet address validation
    if (!form.walletAddress.startsWith('0x') || form.walletAddress.length !== 42) {
      setError('Wallet address must be a valid 42-character Ethereum address starting with 0x')
      return
    }

    setSubmitting(true)
    try {
      const registeredUser = await register(form)
      if (registeredUser.role === 'auditor') {
        navigate('/auditor')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Registration failed'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={22} />
          </div>
          <div>
            <h1>CarbonLedger</h1>
            <p>INSTITUTIONAL REGISTRY</p>
          </div>
        </div>

        <h2>Create Account</h2>
        <p className="auth-subtitle">
          Register your organization or auditor profile on-chain
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label className="field-label">Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Project Owner (User)</option>
                <option value="auditor">Auditor (Verifier)</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="jane@organization.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Ethereum Wallet Address</label>
            <input
              type="text"
              name="walletAddress"
              placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
              value={form.walletAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="field-label">Organization Name</label>
              <input
                type="text"
                name="orgName"
                placeholder="GreenTech Corp"
                value={form.orgName}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label className="field-label">Org Type</label>
              <input
                type="text"
                name="orgType"
                placeholder="Developer / VVB"
                value={form.orgType}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
