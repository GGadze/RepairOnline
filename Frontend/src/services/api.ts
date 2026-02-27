import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // заменишь потом на реальный URL бэкенда
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    const parsed = JSON.parse(token)
    if (parsed.state.token) {
      config.headers.Authorization = `Bearer ${parsed.state.token}`
    }
  }
  return config
})

export default api