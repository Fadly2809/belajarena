import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { resetClassroomsCache } from '@/composables/useClassrooms'

export interface SchoolInfo {
  id: string
  name: string
  npsn?: string
  institution?: string
  department?: string
  address?: string
  email?: string
  phone?: string
  principal_name?: string
  principal_nip?: string
  accreditation?: string
  curriculum?: string
  kktp?: number
  academic_year?: string
  city?: string
  province?: string
  student_count?: number
  teacher_count?: number
  classroom_count?: number
}

export interface User {
  id: string
  name: string
  email: string
  username?: string
  avatar_path?: string
  avatar_url?: string
  school_id: string
  school_name?: string
  roles: string[]
  permissions: string[]
  role?: string
  is_student?: boolean
  nis?: string
  nip?: string
  subject?: string
  subjects?: string[]
  classroom_id?: string
  classroom_name?: string
}

function getSavedUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getSavedSchool(): SchoolInfo | null {
  try {
    const raw = localStorage.getItem('auth_school')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(getSavedUser())
  const currentSchool = ref<SchoolInfo | null>(getSavedSchool())
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value || !!localStorage.getItem('auth_token'))
  const userRoles = computed(() => {
    const roles: string[] = []
    if (Array.isArray(user.value?.roles)) {
      roles.push(...user.value.roles)
    }
    if (user.value?.role && !roles.includes(user.value.role)) {
      roles.push(user.value.role)
    }
    if (user.value?.is_student && !roles.includes('student')) {
      roles.push('student')
    }
    return roles
  })
  const userPermissions = computed(() => user.value?.permissions ?? [])

  const isStudent = computed(() => {
    if (!user.value) return false
    return (
      user.value.role === 'student' ||
      user.value.is_student === true ||
      userRoles.value.includes('student') ||
      !!user.value.nis
    )
  })

  function hasRole(role: string | string[]): boolean {
    const roles = Array.isArray(role) ? role : [role]
    return roles.some(r => userRoles.value.includes(r))
  }

  function hasPermission(permission: string): boolean {
    return userPermissions.value.includes(permission)
  }

  function isSuperAdmin(): boolean {
    return hasRole('superadmin') || user.value?.role === 'superadmin' || user.value?.email === 'admin@belajarena.id'
  }

  async function login(credentials: { email: string; password: string; school_id?: string }) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user: userData, school: schoolData } = response.data.data

      resetClassroomsCache()
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      if (schoolData) {
        localStorage.setItem('auth_school', JSON.stringify(schoolData))
        currentSchool.value = schoolData
      }
      user.value = userData
      initialized.value = true

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Tidak dapat terhubung ke server backend.' : 'Identitas akun atau kata sandi tidak cocok'),
        errors: error.response?.data?.errors || {}
      }
    } finally {
      loading.value = false
    }
  }

  async function registerTeacher(data: {
    teacher_name: string
    school_name?: string
    nip?: string
    subject?: string
    subjects?: string[]
    city?: string
    province?: string
    email: string
    password: string
  }) {
    loading.value = true
    try {
      const response = await api.post('/auth/register-teacher', data)
      const { token, user: userData, school: schoolData } = response.data.data

      resetClassroomsCache()
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      if (schoolData) {
        localStorage.setItem('auth_school', JSON.stringify(schoolData))
        currentSchool.value = schoolData
      }
      user.value = userData
      initialized.value = true
      return { success: true, message: response.data?.message }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registrasi akun guru gagal. Periksa kembali formulir Anda.',
        errors: error.response?.data?.errors || {}
      }
    } finally {
      loading.value = false
    }
  }

  async function registerSchool(data: {
    school_name: string
    level?: string
    code?: string
    npsn?: string
    city?: string
    province?: string
    address?: string
    phone?: string
    admin_name: string
    email: string
    password: string
  }) {
    loading.value = true
    try {
      const response = await api.post('/auth/register-school', data)
      const { token, user: userData, school: schoolData } = response.data.data

      resetClassroomsCache()
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      if (schoolData) {
        localStorage.setItem('auth_school', JSON.stringify(schoolData))
        currentSchool.value = schoolData
      }
      user.value = userData
      initialized.value = true
      return { success: true, message: response.data?.message }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registrasi sekolah gagal. Periksa kembali formulir Anda.',
        errors: error.response?.data?.errors || {}
      }
    } finally {
      loading.value = false
    }
  }

  function setSchool(school: SchoolInfo) {
    currentSchool.value = school
    localStorage.setItem('auth_school', JSON.stringify(school))
  }

  async function fetchActiveSchool() {
    try {
      const res = await api.get('/school')
      if (res.data?.data) {
        setSchool(res.data.data)
        return res.data.data
      }
    } catch {}
    return null
  }

  async function logout() {
    loading.value = true
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore logout errors — always clear local state
    } finally {
      resetClassroomsCache()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_school')
      localStorage.removeItem('cerdika_ai_history')
      user.value = null
      currentSchool.value = null
      loading.value = false
      initialized.value = true
    }
  }

  async function fetchUser() {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      user.value = null
      localStorage.removeItem('auth_user')
      initialized.value = true
      return null
    }

    loading.value = true
    try {
      const response = await api.get('/auth/me')
      if (response.data?.data) {
        const userData = response.data.data
        user.value = userData
        localStorage.setItem('auth_user', JSON.stringify(userData))
        if (userData.school) {
          currentSchool.value = userData.school
          localStorage.setItem('auth_school', JSON.stringify(userData.school))
        }
        return userData
      }
      return null
    } catch (error: any) {
      // Token invalid or expired
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        user.value = null
      }
      return null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function forgotPassword(email: string) {
    try {
      await api.post('/auth/forgot-password', { email })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim email reset password'
      }
    }
  }

  async function resetPassword(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }) {
    try {
      await api.post('/auth/reset-password', data)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal reset password',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  async function updateProfile(data: Partial<User & { password?: string; current_password?: string; nip?: string; nuptk?: string; phone?: string; subject?: string; subjects?: string[] }>) {
    loading.value = true
    try {
      const response = await api.put('/profile', data)
      user.value = response.data.data
      resetClassroomsCache()
      localStorage.setItem('auth_user', JSON.stringify(response.data.data))
      return { success: true, message: response.data?.message || 'Profil berhasil diperbarui' }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memperbarui profil',
        errors: error.response?.data?.errors || {}
      }
    } finally {
      loading.value = false
    }
  }

  async function changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }) {
    loading.value = true
    try {
      const response = await api.put('/profile/password', data)
      return { success: true, message: response.data?.message || 'Kata sandi berhasil diperbarui.' }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memperbarui kata sandi.',
        errors: error.response?.data?.errors || {}
      }
    } finally {
      loading.value = false
    }
  }

  function updateUser(newData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...newData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return {
    user,
    currentSchool,
    loading,
    initialized,
    isAuthenticated,
    userRoles,
    userPermissions,
    isStudent,
    hasRole,
    hasPermission,
    isSuperAdmin,
    login,
    registerTeacher,
    registerSchool,
    setSchool,
    fetchActiveSchool,
    logout,
    fetchUser,
    updateUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  }
})
