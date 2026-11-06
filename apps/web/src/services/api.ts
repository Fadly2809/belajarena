import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const port = window.location.port

    // Local / LAN development environments (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, *.local, or dev ports)
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.') ||
      host.endsWith('.local') ||
      port === '5173' ||
      port === '4173' ||
      port === '8000'

    if (isLocal) {
      return '/api/v1'
    }

    // Public / Netlify production fallback to Cloudflare Tunnel
    return 'https://probability-edmonton-freebsd-mills.trycloudflare.com/api/v1'
  }
  return '/api/v1'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
})

// Request interceptor - add auth token & active school id
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const rawSchool = localStorage.getItem('auth_school')
    if (rawSchool) {
      try {
        const s = JSON.parse(rawSchool)
        if (s?.id) {
          config.headers['X-School-Id'] = s.id
        }
      } catch {}
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
