import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Clear auth and redirect to login only if user was authenticated
      const hadToken = !!localStorage.getItem('auth_token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      if (hadToken && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      console.error('Akses ditolak:', error.response?.data?.message)
    }

    if (status === 422) {
      // Validation errors - let components handle these
    }

    if (status >= 500) {
      console.error('Server error:', error.response?.data?.message || 'Terjadi kesalahan server')
    }

    return Promise.reject(error)
  }
)

export default api
