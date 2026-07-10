import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  timeout: 120000,
})

export async function fetchResearch(symbol) {
  const response = await api.get(`/api/research/${symbol}`)
  return response.data
}

export async function searchCompanies(query) {
  const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`)
  return response.data
}

export default api
