// services/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

console.log('GyaanLMS API URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
})

const protectedRoutePrefixes = ['/admin', '/faculty', '/student', '/checkout']

const isProtectedRoute = (pathname) =>
  protectedRoutePrefixes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('gyaanlms_user'))
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && isProtectedRoute(window.location.pathname)) {
      localStorage.removeItem('gyaanlms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
