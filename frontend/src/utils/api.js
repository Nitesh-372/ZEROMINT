import axios from 'axios'
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const USE_DEMO = (import.meta.env.VITE_USE_DEMO_AUTH ?? 'true') === 'true'
const LOGIN_PATH = import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login'
const DEMO = (import.meta.env.VITE_USE_DEMO_AUTH ?? 'true') === 'true'


export const client = axios.create({
  baseURL: API,
  withCredentials: true,
})

let _token = null
export function setAuthToken(t){ _token = t }
export function clearAuthToken(){ _token = null }

client.interceptors.request.use((config) => {
  if(_token){
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${_token}`
  }
  return config
})

// ---- Notifications (existing demo) ----
export async function fetchNotifications(){
  if(!API) {
    return [
      { id: 'n1', title:'Project Verified', body:'Solar Farm approved.', time:'2h ago', ok:true, read:false },
      { id: 'n2', title:'Pending Review', body:'Reforestation awaiting verification.', time:'1d ago', ok:false, read:false },
      { id: 'n3', title:'Credits Purchased', body:'35 tokens used to buy 75 credits.', time:'3d ago', ok:true, read:true },
    ]
  }
  const { data } = await client.get('/notifications')
  return data
}

export async function markAllNotificationsRead(){
  if(!API) return { ok:true }
  const { data } = await client.post('/notifications/mark-all-read')
  return data
}

// ---- Auth: Auditor login ----
export async function loginAuditorAPI({ email, password }){
  // Demo fallback if API is not set or explicitly enabled
  if(!API || USE_DEMO){
    await new Promise(r=>setTimeout(r, 300))
    return { token: 'demo-auditor-token', profile: { email, name: 'Demo Auditor' } }
  }
  try {
    // Try common payload variants
    const payloads = [
      { email, password, role: 'auditor' },
      { email, password, role: 'AUDITOR' },
      { username: email, password, role: 'auditor' },
      { identifier: email, password, role: 'auditor' },
      { email, password, roleType: 'auditor' },
    ]

    let lastError = null
    for (const body of payloads){
      try {
        const { data } = await client.post(LOGIN_PATH, body)
        const token = data?.token || data?.accessToken || data?.jwt || data?.data?.token
        const profile = data?.profile || data?.user || data?.data?.user || { email }
        if(token){
          return { token, profile }
        }
        lastError = new Error('No token in response')
      } catch (err) {
        lastError = err
        // try next variant
      }
    }
    if(lastError) throw lastError
  } catch (err){
    const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Login failed'
    const e = new Error(serverMsg)
    e.response = err?.response
    throw e
  }
}
// ---- Auth: User register (auditors cannot self-register) ----
export async function registerUserAPI(payload) {
  // payload: { name, email, password, phone?, orgName?, orgType? }
  if (DEMO || !API) {
    // Demo: pretend success so UI works without backend
    await new Promise(r => setTimeout(r, 300))
    return { ok: true, user: { name: payload.name, email: payload.email, role: 'user' } }
  }

  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, role: 'user' }) // enforce user-only
  })

  if (!res.ok) {
    let err = 'Registration failed'
    try {
      const data = await res.json()
      err = data?.message || err
    } catch {}
    throw new Error(err)
  }
  return await res.json() // expected: { ok: true, user: {...} }
}

// (optional) simple demo logins used elsewhere
export async function loginUserDemo() {
  await new Promise(r => setTimeout(r, 200))
  return { ok: true }
}

export async function loginAuditorDemo() {
  await new Promise(r => setTimeout(r, 200))
  return { ok: true }
}


// ---- Auditor data (demo if no API) ----
export async function fetchAuditorDashboard(){
  if(!API){
    return {
      assigned: 12, completed: 45, pending: 3,
      projects: [
        { id:'p1', name:'Solar Farm Installation', client:'GreenTech Solutions', type:'Solar Energy', credits:150, due:'2024-05-05', status:'Pending' },
        { id:'p2', name:'Reforestation Program', client:'EcoForest Initiative', type:'Forestation', credits:200, due:'2024-05-18', status:'Pending' },
        { id:'p3', name:'Wind Energy Project', client:'WindPower Corp', type:'Wind Energy', credits:120, due:'2024-07-20', status:'Pending' },
      ]
    }
  }
  const { data } = await client.get('/auditor/dashboard')
  return data
}

export async function approveProject(id){
  if(!API) return { ok:true }
  const { data } = await client.post(`/auditor/projects/${id}/approve`)
  return data
}
export async function rejectProject(id){
  if(!API) return { ok:true }
  const { data } = await client.post(`/auditor/projects/${id}/reject`)
  return data
}

export async function fetchAuditorClients(){
  if(!API){
    return [
      { id:'c1', name:'GreenTech Solutions', email:'contact@greentech.com', phone:'+1 234 567 890', projects:5, status:'Active' },
      { id:'c2', name:'WindPower Corp', email:'ops@windpower.com', phone:'+1 312 987 8800', projects:4, status:'Active' },
      { id:'c3', name:'EcoForest Initiative', email:'info@ecoforest.org', phone:'+1 987 654 0001', projects:1, status:'Active' },
    ]
  }
  const { data } = await client.get('/auditor/clients')
  return data
}

export async function fetchMarketplace(){
  if(!API){
    return [
      { id:'m1', name:'GreenTech Solutions', type:'Solar Energy', available:50, price:0.50, total:25 },
      { id:'m2', name:'EcoForest Initiative', type:'Forestation', available:100, price:0.45, total:45 },
      { id:'m3', name:'WindPower Corp', type:'Wind Energy', available:75, price:0.47, total:35 },
      { id:'m4', name:'SolarFuture Ltd', type:'Solar Energy', available:120, price:0.46, total:55 },
      { id:'m5', name:'BiomassEnergy Inc', type:'Biomass', available:60, price:0.47, total:28 },
      { id:'m6', name:'HydroClean Energy', type:'Hydroelectric', available:90, price:0.47, total:42 },
    ]
  }
  const { data } = await client.get('/marketplace')
  return data
}
