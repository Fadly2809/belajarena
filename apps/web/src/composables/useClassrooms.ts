import { ref, computed } from 'vue'
import api from '@/services/api'

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
  grade_level: 7 | 9
  kkm: number
  kktp: number
}

// Jadwal resmi mengajar guru:
// - Kelas 7: KKA (Koding dan Kecerdasan Artifisial)
// - Kelas 9: Informatika
export const TEACHING_SUBJECTS: Record<7 | 9, TeachingSubject> = {
  7: {
    id: 'sub-kka',
    code: 'KKA',
    name: 'KKA (Koding dan Kecerdasan Artifisial)',
    grade_level: 7,
    kkm: 75,
    kktp: 75,
  },
  9: {
    id: 'sub-inf',
    code: 'INF',
    name: 'Informatika',
    grade_level: 9,
    kkm: 78,
    kktp: 78,
  },
}

/**
 * Mendeteksi tingkatan kelas (7 atau 9) dari id, nama, atau objek kelas
 */
export function getClassGradeLevel(classIdOrNameOrObj: any): 7 | 9 {
  if (!classIdOrNameOrObj) return 7
  if (typeof classIdOrNameOrObj === 'object') {
    const gl = Number(classIdOrNameOrObj.grade_level)
    if (gl === 9 || gl === 7) return gl
    const name = String(classIdOrNameOrObj.name || '').toUpperCase()
    if (name.includes('IX') || name.includes('9')) return 9
    return 7
  }
  const str = String(classIdOrNameOrObj).toUpperCase()
  if (str.includes('9') || str.includes('IX') || str.includes('CLS-9')) return 9
  return 7
}

/**
 * Mengambil mata pelajaran resmi sesuai jadwal mengajar untuk kelas tertentu
 * Kelas 7 -> KKA, Kelas 9 -> Informatika
 */
export function getSubjectForClass(classIdOrNameOrObj: any): TeachingSubject {
  const grade = getClassGradeLevel(classIdOrNameOrObj)
  return grade === 9 ? TEACHING_SUBJECTS[9] : TEACHING_SUBJECTS[7]
}

export function getSubjectIdForClass(classIdOrNameOrObj: any): 'sub-inf' | 'sub-kka' {
  return getSubjectForClass(classIdOrNameOrObj).id as 'sub-inf' | 'sub-kka'
}

export function getSubjectNameForClass(classIdOrNameOrObj: any): string {
  return getSubjectForClass(classIdOrNameOrObj).name
}

/**
 * Daftar mata pelajaran yang tersedia untuk kelas yang dipilih.
 * Jika kelas sudah dipilih, HANYA mengembalikan mapel yang diajarkan pada kelas tersebut
 * (misal jika kelas 9 -> hanya Informatika, jika kelas 7 -> hanya KKA)
 */
export function getAvailableSubjectsForClass(classIdOrNameOrObj?: any): TeachingSubject[] {
  if (!classIdOrNameOrObj) {
    return [TEACHING_SUBJECTS[7], TEACHING_SUBJECTS[9]]
  }
  return [getSubjectForClass(classIdOrNameOrObj)]
}

/**
 * Memfilter daftar kelas berdasarkan mata pelajaran
 * Jika KKA -> hanya kelas 7, jika Informatika -> hanya kelas 9
 */
export function filterClassroomsBySubject(classroomsList: ClassroomOption[], subjectIdOrName?: string): ClassroomOption[] {
  if (!subjectIdOrName) return classroomsList
  const s = String(subjectIdOrName).toLowerCase()
  if (s.includes('kka') || s.includes('koding') || s.includes('kecerdasan')) {
    return classroomsList.filter(c => getClassGradeLevel(c) === 7)
  }
  if (s.includes('inf') || s.includes('informatika')) {
    return classroomsList.filter(c => getClassGradeLevel(c) === 9)
  }
  return classroomsList
}

// Global cached state so multiple components share the same reactive classrooms data
const classrooms = ref<ClassroomOption[]>([])
const loading = ref(false)
const hasLoaded = ref(false)

export function useClassrooms() {
  async function fetchClassrooms(force = false) {
    if (hasLoaded.value && !force && classrooms.value.length > 0) {
      return classrooms.value
    }
    loading.value = true
    try {
      const res = await api.get('/classrooms', { params: { per_page: 100 } })
      if (res.data?.data && Array.isArray(res.data.data)) {
        classrooms.value = res.data.data
        hasLoaded.value = true
      }
    } catch (err) {
      console.warn('Failed to load classrooms from Manajemen Kelas:', err)
      // Fallback defaults if API fails
      if (classrooms.value.length === 0) {
        classrooms.value = [
          { id: 'cls-7a', name: 'VII A', grade_level: 7 },
          { id: 'cls-7b', name: 'VII B', grade_level: 7 },
          { id: 'cls-7c', name: 'VII C', grade_level: 7 },
          { id: 'cls-7d', name: 'VII D', grade_level: 7 },
          { id: 'cls-9a', name: 'IX A', grade_level: 9 },
          { id: 'cls-9b', name: 'IX B', grade_level: 9 },
          { id: 'cls-9c', name: 'IX C', grade_level: 9 },
          { id: 'cls-9d', name: 'IX D', grade_level: 9 },
        ]
      }
    } finally {
      loading.value = false
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
    loadingClassrooms: loading,
    hasLoadedClassrooms: hasLoaded,
    fetchClassrooms,
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
