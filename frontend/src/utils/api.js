import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const client = axios.create({ baseURL: API_URL })

export function fileUrl(filePath = '') {
  if (!filePath) return '#'
  if (/^https?:\/\//i.test(filePath)) return filePath
  const normalized = filePath.replace(/\\/g, '/').replace(/^src\/uploads\//, 'uploads/')
  return `${API_ORIGIN}/${normalized.replace(/^\/+/, '')}`
}

export function setAuthToken(token) {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete client.defaults.headers.common.Authorization
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem('carbonledger_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeSession(session) {
  localStorage.setItem('carbonledger_session', JSON.stringify(session))
  setAuthToken(session?.token)
}

export function clearSession() {
  localStorage.removeItem('carbonledger_session')
  setAuthToken(null)
}

export async function apiGet(path) {
  const { data } = await client.get(path)
  return data
}

export async function apiPost(path, body) {
  const { data } = await client.post(path, body)
  return data
}

export async function apiPostForm(path, formData) {
  const { data } = await client.post(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
