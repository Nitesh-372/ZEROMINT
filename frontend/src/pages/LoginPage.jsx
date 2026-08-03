import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'user',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const loggedUser = await login(form)
      if (loggedUser.role === 'auditor') {
        navigate('/auditor')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.err ||
          err.message ||
          'Login failed'
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

        <h2>Sign in to account</h2>
        <p className="auth-subtitle">
          Access your carbon projects, credits, and verification workspace
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Account Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">Project Owner (User)</option>
              <option value="auditor">Auditor (Verifier)</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="user@example.com"
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

          {error && <div className="error-text">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  )
}
