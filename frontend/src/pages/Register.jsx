import React from 'react'
import Logo from '../components/Logo.jsx'
import { registerUserAPI } from '../utils/api.js'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [orgName, setOrgName] = React.useState('')
  const [orgType, setOrgType] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await registerUserAPI({ name, email, password, phone, orgName, orgType })
      if (res?.ok) {
        // go to login so the user can sign in
        navigate('/login?registered=1', { replace: true })
      } else {
        throw new Error(res?.message || 'Registration failed')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-emerald-50 to-transparent">
      <div className="card max-w-md w-[92vw] p-6">
        <div className="flex justify-center mb-2"><Logo size={56} /></div>
        <h1 className="text-center text-3xl font-extrabold">CarbonLedger</h1>
        <p className="text-center text-slate-500">Transparent Carbon Credit Management</p>

        {/* Top Tabs */}
        <div className="mt-4 bg-slate-100 p-1 rounded-xl flex">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex-1 py-2 rounded-xl text-center ${isActive ? 'bg-white shadow font-semibold' : 'text-slate-500'}`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `flex-1 py-2 rounded-xl text-center ${isActive ? 'bg-white shadow font-semibold' : 'text-slate-500'}`
            }
          >
            Register
          </NavLink>
        </div>

        {/* I am registering as (User only) */}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-1">I am registering as</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-primary">User</button>
            <button type="button" aria-disabled className="btn border border-slate-200 bg-white opacity-60 cursor-not-allowed">
              Auditor
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <div className="text-sm font-semibold mb-1">Account Information</div>
            <div className="space-y-3">
              <input className="input" placeholder="Full Name *" value={name} onChange={e=>setName(e.target.value)} required />
              <input className="input" placeholder="Email *" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <input className="input" placeholder="Password *" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              <input className="input" placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-1">Organization Details (optional)</div>
            <div className="space-y-3">
              <input className="input" placeholder="Organization Name" value={orgName} onChange={e=>setOrgName(e.target.value)} />
              <input className="input" placeholder="Organization Type e.g., Solar, Wind, NGO" value={orgType} onChange={e=>setOrgType(e.target.value)} />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
