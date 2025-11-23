import React from 'react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { NavLink } from 'react-router-dom'   // ⬅️ add this

export default function Login() {
  const [role, setRole] = React.useState('User')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState(null)
  const { loginAuditor } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (role === 'Auditor') {
        await loginAuditor({ email, password })
        window.location.href = '/auditor/dashboard'
      } else {
        // demo user redirect
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Login failed'
      )
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-emerald-50 to-transparent">
      <form onSubmit={onSubmit} className="card max-w-md w-[92vw] p-6">
        <div className="flex justify-center mb-2"><Logo size={56} /></div>
        <h1 className="text-center text-3xl font-extrabold">CarbonLedger</h1>
        <p className="text-center text-slate-500">Transparent Carbon Credit Management</p>

        {/* Tabs now use routing, not local tab state */}
        <div className="mt-4 bg-slate-100 p-1 rounded-xl flex">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex-1 py-2 rounded-xl text-center ${
                isActive ? 'bg-white shadow font-semibold' : 'text-slate-500'
              }`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `flex-1 py-2 rounded-xl text-center ${
                isActive ? 'bg-white shadow font-semibold' : 'text-slate-500'
              }`
            }
          >
            Register
          </NavLink>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold mb-1">Role</div>
          <div className="grid grid-cols-2 gap-2">
            {['User', 'Auditor'].map(r => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`btn ${
                  role === r ? 'btn-primary' : 'border border-slate-200 bg-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

        <button type="submit" className="btn btn-primary w-full mt-4">
          {`Login as ${role.toLowerCase()}`}
        </button>
      </form>
    </div>
  )
}
