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
let lastCachedUserId: string | null = null

export function resetClassroomsCache() {
  classrooms.value = []
  classroomsLoading.value = false
  classroomsLoaded.value = false
  subjects.value = []
  subjectsLoading.value = false
  subjectsLoaded.value = false
  lastCachedSchoolId = null
  lastCachedUserId = null
}

function deduplicateSubjects(list: TeachingSubject[]): TeachingSubject[] {
  const result: TeachingSubject[] = []
  const seen = new Set<string>()
  for (const item of list) {
    const key = item.name.trim().toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result
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
 * Otomatis mendahulukan mapel sesuai aturan kelas / jadwal:
 * - Kelas 7: KKA (Koding dan Kecerdasan Artifisial)
 * - Kelas 9: Informatika
 */
export function getAvailableSubjectsForClass(classIdOrNameOrObj?: any): TeachingSubject[] {
  try {
    const authStore = useAuthStore()
    const userSubs: string[] = Array.isArray((authStore.user as any)?.subjects) && (authStore.user as any).subjects.length > 0
      ? (authStore.user as any).subjects
      : (authStore.user?.subject ? authStore.user.subject.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [])

    // Jika guru belum menentukan mapel di profil/akunnya, harus kosong
    if (userSubs.length === 0) {
      return []
    }

    let allSubs: TeachingSubject[] = []

    if (subjects.value.length > 0) {
      const userSubsLower = userSubs.map(s => s.toLowerCase())
      const matched = subjects.value.filter(s => userSubsLower.includes(s.name.trim().toLowerCase()))
      if (matched.length > 0) {
        allSubs = deduplicateSubjects(matched)
      }
    }

    if (allSubs.length === 0) {
      const mapped = userSubs.map((subName, idx) => ({
        id: `sub-user-${idx + 1}`,
        code: subName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'MAPEL',
        name: subName,
        kkm: 75,
        kktp: 75
      }))
      allSubs = deduplicateSubjects(mapped)
    }

    // Jika parameter kelas diberikan, atur urutan prioritas mapel sesuai jadwal mengajar:
    if (classIdOrNameOrObj) {
      const grade = getClassGradeLevel(classIdOrNameOrObj)
      if (grade === 7) {
        const kka = allSubs.find(s => {
          const n = s.name.toLowerCase()
          return n.includes('kka') || n.includes('koding') || n.includes('kecerdasan')
        })
        if (kka) {
          const others = allSubs.filter(s => s.id !== kka.id)
          return [kka, ...others]
        }
      } else if (grade === 9) {
        const inf = allSubs.find(s => {
          const n = s.name.toLowerCase()
          return (n.includes('informatika') || n === 'inf') && !n.includes('kka')
        })
        if (inf) {
          const others = allSubs.filter(s => s.id !== inf.id)
          return [inf, ...others]
        }
      }
    }

    return allSubs
  } catch {}

  return []
}

/**
 * Mengambil mata pelajaran yang diampu guru untuk kelas tertentu (Auto-Select):
 * - Semua Kelas 7 otomatis KKA (Koding dan Kecerdasan Artifisial)
 * - Semua Kelas 9 otomatis Informatika
 */
export function getSubjectForClass(classIdOrNameOrObj: any): TeachingSubject {
  const available = getAvailableSubjectsForClass(classIdOrNameOrObj)
  if (available.length === 0) {
    return {
      id: '',
      code: '',
      name: 'Mata Pelajaran',
      kkm: 75,
      kktp: 75
    }
  }

  if (available.length === 1) {
    return available[0]
  }

  const grade = getClassGradeLevel(classIdOrNameOrObj)

  // Otomatisasi jadwal mengajar:
  // Kelas 7 -> KKA
  if (grade === 7) {
    const kka = available.find(s => {
      const n = s.name.toLowerCase()
      return n.includes('kka') || n.includes('koding') || n.includes('kecerdasan')
    })
    if (kka) return kka
  }

  // Kelas 9 -> Informatika
  if (grade === 9) {
    const inf = available.find(s => {
      const n = s.name.toLowerCase()
      return (n.includes('informatika') || n === 'inf') && !n.includes('kka')
    })
    if (inf) return inf
  }

  return available[0]
}

export function getSubjectIdForClass(classIdOrNameOrObj: any): string {
  return getSubjectForClass(classIdOrNameOrObj).id || ''
}

export function getSubjectNameForClass(classIdOrNameOrObj: any): string {
  return getSubjectForClass(classIdOrNameOrObj).name || 'Mata Pelajaran'
}

/**
 * Memfilter daftar kelas berdasarkan mata pelajaran
 * - KKA -> Rombel Kelas 7 (VII A, VII B, dst.)
 * - Informatika -> Rombel Kelas 9 (IX A, IX B, dst.)
 */
export function filterClassroomsBySubject(classroomsList: ClassroomOption[], subjectIdOrName?: string): ClassroomOption[] {
  if (!subjectIdOrName || !classroomsList || classroomsList.length === 0) {
    return classroomsList || []
  }

  let subName = String(subjectIdOrName).toLowerCase()
  const foundSub = subjects.value.find(s => s.id === subjectIdOrName)
  if (foundSub) {
    subName = foundSub.name.toLowerCase()
  }

  const isKka = subName.includes('kka') || subName.includes('koding') || subName.includes('kecerdasan')
  const isInf = (subName.includes('informatika') || subName === 'inf') && !isKka

  if (isKka) {
    const class7 = classroomsList.filter(c => getClassGradeLevel(c) === 7)
    return class7.length > 0 ? class7 : classroomsList
  }

  if (isInf) {
    const class9 = classroomsList.filter(c => getClassGradeLevel(c) === 9)
    return class9.length > 0 ? class9 : classroomsList
  }

  return classroomsList
}

export const TEACHING_SUBJECTS: Record<string, TeachingSubject> = {}

export async function fetchSubjects(force = false): Promise<TeachingSubject[]> {
  try {
    const authStore = useAuthStore()
    const currentSchoolId = authStore.user?.school_id || null
    const currentUserId = authStore.user?.id || null
    if (
      (lastCachedSchoolId !== null && lastCachedSchoolId !== currentSchoolId) ||
      (lastCachedUserId !== null && lastCachedUserId !== currentUserId)
    ) {
      resetClassroomsCache()
      force = true
    }
    lastCachedSchoolId = currentSchoolId
    lastCachedUserId = currentUserId
  } catch {}

  if (subjectsLoaded.value && !force && subjects.value.length > 0) {
    return subjects.value
  }
  subjectsLoading.value = true
  try {
    const res = await api.get('/subjects')
    if (res.data?.data && Array.isArray(res.data.data)) {
      subjects.value = deduplicateSubjects(res.data.data)
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
    const userSubs: string[] = Array.isArray((authStore.user as any)?.subjects) && (authStore.user as any).subjects.length > 0
      ? (authStore.user as any).subjects
      : (authStore.user?.subject ? authStore.user.subject.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [])

    if (userSubs.length > 0) {
      subjects.value = userSubs.map((subName, idx) => ({
        id: `sub-user-${idx + 1}`,
        code: subName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'MAPEL',
        name: subName,
        kkm: 75,
        kktp: 75
      }))
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
      const currentUserId = authStore.user?.id || null
      if (
        (lastCachedSchoolId !== null && lastCachedSchoolId !== currentSchoolId) ||
        (lastCachedUserId !== null && lastCachedUserId !== currentUserId)
      ) {
        resetClassroomsCache()
        force = true
      }
      lastCachedSchoolId = currentSchoolId
      lastCachedUserId = currentUserId
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
