import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export interface ClassroomOption {
  id: string
  name: string
  grade_level?: number | string
  academic_year_id?: string
  homeroom_teacher_id?: string | null
  homeroom_teacher_name?: string
  capacity?: number
  student_count?: number
}

export interface TeachingSubject {
  id: string
  code: string
  name: string
  grade_level?: number | string
  kkm: number
  kktp: number
}

// Global cached state so multiple components share reactive data
const classrooms = ref<ClassroomOption[]>([])
const classroomsLoading = ref(false)
const classroomsLoaded = ref(false)

const subjects = ref<TeachingSubject[]>([])
const subjectsLoading = ref(false)
const subjectsLoaded = ref(false)

let lastCachedSchoolId: string | null = null

export function resetClassroomsCache() {
  classrooms.value = []
  classroomsLoading.value = false
  classroomsLoaded.value = false
  subjects.value = []
  subjectsLoading.value = false
  subjectsLoaded.value = false
  lastCachedSchoolId = null
}

/**
 * Mendeteksi tingkatan kelas dari id, nama, atau objek kelas
 */
export function getClassGradeLevel(classIdOrNameOrObj: any): number {
  if (!classIdOrNameOrObj) return 7
  if (typeof classIdOrNameOrObj === 'object') {
    const gl = Number(classIdOrNameOrObj.grade_level)
    if (!isNaN(gl) && gl > 0) return gl
    const name = String(classIdOrNameOrObj.name || '').toUpperCase()
    if (name.includes('IX') || name.includes('9')) return 9
    if (name.includes('VIII') || name.includes('8')) return 8
    return 7
  }
  const str = String(classIdOrNameOrObj).toUpperCase()
  if (str.includes('9') || str.includes('IX') || str.includes('CLS-9')) return 9
  if (str.includes('8') || str.includes('VIII') || str.includes('CLS-8')) return 8
  return 7
}

/**
 * Mengambil daftar mata pelajaran yang aktif untuk guru dan kelas terpilih
 */
export function getAvailableSubjectsForClass(classIdOrNameOrObj?: any): TeachingSubject[] {
  if (subjects.value.length > 0) {
    return subjects.value
  }
  try {
    const authStore = useAuthStore()
    const userSub = authStore.user?.subject
    if (userSub && userSub.trim()) {
      return [
        {
          id: 'sub-user-active',
          code: userSub.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'MAPEL',
          name: userSub.trim(),
          kkm: 75,
          kktp: 75
        }
      ]
    }
  } catch {}

  return []
}

/**
 * Mengambil mata pelajaran yang diampu guru
 */
export function getSubjectForClass(classIdOrNameOrObj: any): TeachingSubject {
  const available = getAvailableSubjectsForClass(classIdOrNameOrObj)
  return available[0] || {
    id: '',
    code: '',
    name: 'Mata Pelajaran',
    kkm: 75,
    kktp: 75
  }
}

export function getSubjectIdForClass(classIdOrNameOrObj: any): string {
  return getSubjectForClass(classIdOrNameOrObj).id || ''
}

export function getSubjectNameForClass(classIdOrNameOrObj: any): string {
  return getSubjectForClass(classIdOrNameOrObj).name || 'Mata Pelajaran'
}

/**
 * Memfilter daftar kelas berdasarkan mata pelajaran
 * Semua rombel kelas yang dibuat guru dapat digunakan untuk mata pelajaran guru
 */
export function filterClassroomsBySubject(classroomsList: ClassroomOption[], subjectIdOrName?: string): ClassroomOption[] {
  if (!subjectIdOrName) return classroomsList
  return classroomsList
}

export const TEACHING_SUBJECTS: Record<string, TeachingSubject> = {}

export async function fetchSubjects(force = false): Promise<TeachingSubject[]> {
  try {
    const authStore = useAuthStore()
    const currentSchoolId = authStore.user?.school_id || null
    if (lastCachedSchoolId !== null && lastCachedSchoolId !== currentSchoolId) {
      resetClassroomsCache()
      force = true
    }
    lastCachedSchoolId = currentSchoolId
  } catch {}

  if (subjectsLoaded.value && !force && subjects.value.length > 0) {
    return subjects.value
  }
  subjectsLoading.value = true
  try {
    const res = await api.get('/subjects')
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      subjects.value = res.data.data
      subjectsLoaded.value = true
      return subjects.value
    }
  } catch (err) {
    console.warn('Failed to load subjects:', err)
  } finally {
    subjectsLoading.value = false
  }

  // Fallback to auth user subject
  try {
    const authStore = useAuthStore()
    const userSub = authStore.user?.subject
    if (userSub && userSub.trim()) {
      subjects.value = [
        {
          id: 'sub-user-active',
          code: userSub.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'MAPEL',
          name: userSub.trim(),
          kkm: 75,
          kktp: 75
        }
      ]
      subjectsLoaded.value = true
      return subjects.value
    }
  } catch {}

  subjects.value = []
  return subjects.value
}

export function useClassrooms() {
  async function fetchClassrooms(force = false): Promise<ClassroomOption[]> {
    try {
      const authStore = useAuthStore()
      const currentSchoolId = authStore.user?.school_id || null
      if (lastCachedSchoolId !== null && lastCachedSchoolId !== currentSchoolId) {
        resetClassroomsCache()
        force = true
      }
      lastCachedSchoolId = currentSchoolId
    } catch {}

    if (classroomsLoaded.value && !force && classrooms.value.length > 0) {
      return classrooms.value
    }
    classroomsLoading.value = true
    try {
      const res = await api.get('/classrooms', { params: { per_page: 100 } })
      if (res.data?.data && Array.isArray(res.data.data)) {
        classrooms.value = res.data.data
        classroomsLoaded.value = true
      } else {
        classrooms.value = []
      }
    } catch (err) {
      console.warn('Failed to load classrooms from Manajemen Kelas:', err)
      classrooms.value = []
    } finally {
      classroomsLoading.value = false
    }
    return classrooms.value
  }

  function formatClassLabel(c: ClassroomOption | null | undefined): string {
    if (!c) return ''
    const rawName = c.name || ''
    if (/^kelas/i.test(rawName)) return rawName
    return `Kelas ${rawName}`
  }

  function getClassName(idOrVal: string | null | undefined): string {
    if (!idOrVal) return ''
    const clean = String(idOrVal).trim()
    const found = classrooms.value.find(
      (c) =>
        c.id === clean ||
        c.name.toLowerCase() === clean.toLowerCase() ||
        c.name.replace(/\s+/g, '-').toLowerCase() === clean.toLowerCase() ||
        `kelas ${c.name}`.toLowerCase() === clean.toLowerCase()
    )
    if (found) {
      return formatClassLabel(found)
    }
    return clean
  }

  return {
    classrooms,
    subjects,
    loadingClassrooms: classroomsLoading,
    hasLoadedClassrooms: classroomsLoaded,
    loadingSubjects: subjectsLoading,
    fetchClassrooms,
    fetchSubjects,
    formatClassLabel,
    getClassName,
    getClassGradeLevel,
    getSubjectForClass,
    getSubjectIdForClass,
    getSubjectNameForClass,
    getAvailableSubjectsForClass,
    filterClassroomsBySubject,
    TEACHING_SUBJECTS,
  }
}
