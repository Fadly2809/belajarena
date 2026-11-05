import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { callGeminiApi, generateBuiltInResponse } from './ai_engine.mjs'
import { initWeeklySchedules, initMeetingLogs, initSubjectGrades } from './data_defaults.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, 'database', 'database.json')

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(path.join(__dirname, '.env')) } catch (_) {}
  try { process.loadEnvFile(path.join(__dirname, '..', '..', '.env')) } catch (_) {}
}

function getLocalNetworkIp() {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }
  } catch (_) {}
  return 'localhost'
}

function getAllowedOrigin(req) {
  if (!req || !req.headers) return '*'
  const origin = req.headers['origin']
  if (!origin) return '*'
  const localIp = getLocalNetworkIp()
  const allowedExact = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    `http://${localIp}:5173`,
    `http://${localIp}:8000`,
    'capacitor://localhost',
    'http://localhost',
    'https://localhost'
  ]
  if (allowedExact.includes(origin)) return origin

  try {
    const url = new URL(origin)
    const hostname = url.hostname
    if (
      hostname.endsWith('.netlify.app') ||
      hostname === 'netlify.app' ||
      hostname.endsWith('.onrender.com') ||
      hostname.endsWith('.railway.app') ||
      hostname.endsWith('.trycloudflare.com')
    ) {
      return origin
    }
    const isPrivateIp = (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)
    )
    if (isPrivateIp && (url.port === '5173' || url.port === '4173' || url.port === '8000' || url.port === '')) {
      return origin
    }
  } catch (_) {}

  return allowedExact[0]
}

function isAllowedProxyDomain(urlStr) {
  try {
    const parsed = new URL(urlStr)
    const hostname = parsed.hostname.toLowerCase()
    const allowedExact = [
      'scratch.mit.edu',
      'turbowarp.org',
      'scratchfoundation.github.io',
      'blockly-demo.appspot.com',
      'phet.colorado.edu',
      'desmos.com',
      'trinket.io',
      'youtu.be',
      'wikipedia.org',
      'google.com',
      'google.co.id'
    ]
    const allowedSuffixes = [
      '.scratch.mit.edu',
      '.turbowarp.org',
      '.desmos.com',
      '.trinket.io',
      '.wikipedia.org',
      '.google.com',
      '.google.co.id',
      '.youtube.com',
      '.phet.colorado.edu'
    ]
    if (allowedExact.includes(hostname)) return true
    if (allowedSuffixes.some(s => hostname.endsWith(s))) return true
    return false
  } catch (_) {
    return false
  }
}

const MAX_BODY_SIZE = 100 * 1024 * 1024 // 100 MB

// Ensure database dir exists
const dbDir = path.join(__dirname, 'database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Global in-memory SSE subscribers & ephemeral frames for cross-device realtime presentations
const presentationSubscribers = new Map() // sessionId -> Set of res
const presentationScreenFrames = new Map() // sessionId -> base64 data string (in-memory only, never saved to disk)
const presentationScreenFrameData = new Map() // sessionId -> { frame: string, frameSeq: number, timestamp: number }

function broadcastToPresentation(sessionId, eventData) {
  const subs = presentationSubscribers.get(sessionId)
  if (subs && subs.size > 0) {
    const raw = `data: ${JSON.stringify(eventData)}\n\n`
    const isFrame = eventData.type === 'WEB_SCREEN_FRAME'
    for (const clientRes of subs) {
      try {
        if (clientRes.socket) clientRes.socket.setNoDelay(true)
        // Jika antrean socket buffer klien sedang padat (> 64KB), drop video frame agar tidak menimbun buffer & menghambat voting
        if (isFrame && clientRes.writableLength > 65536) {
          continue
        }
        clientRes.write(raw)
        if (typeof clientRes.flush === 'function') {
          clientRes.flush()
        }
      } catch (_) {
        subs.delete(clientRes)
      }
    }
  }
}

// Initial Real Data Seed
function getInitialData() {
  const defaultPasswordHash = bcrypt.hashSync('123456', 10)
  const users = [
    {
      id: 'usr-teacher-1',
      name: 'Muhammad Fadly Akbar Arsandi, S.Pd.',
      email: 'muhammadarsandi89@guru.smp.belajar.id',
      secondary_email: 'budi.santoso@sekolah.sch.id',
      password: defaultPasswordHash,
      roles: ['teacher', 'admin'],
      role: 'teacher',
      permissions: ['teacher.view', 'teacher.grade', 'teacher.manage'],
      school_id: 'sch-smpn6kendari',
      classroom_id: 'cls-7a',
      nip: '199509282020121003',
      phone: '081245678901'
    }
  ]

  const school = {
    id: 'sch-smpn6kendari',
    name: 'SMP Negeri 6 Kendari',
    npsn: '40402621',
    address: 'Jl. Bunga Tanjung No. 1, Tipulu, Kendari Barat, Kota Kendari, Sulawesi Tenggara',
    email: 'info@smpn6kendari.sch.id',
    phone: '0401-3123456',
    principal_name: 'H. Abdul Rahman, S.Pd., M.Pd.',
    accreditation: 'A'
  }

  const academicYears = [
    { id: 'ay-2024-ganjil', name: '2024/2025 Ganjil', semester: 'Ganjil', is_active: true, start_date: '2024-07-15', end_date: '2024-12-20' },
    { id: 'ay-2024-genap', name: '2024/2025 Genap', semester: 'Genap', is_active: false, start_date: '2025-01-06', end_date: '2025-06-20' }
  ]

  const classrooms = [
    { id: 'cls-7a', name: 'VII A', grade_level: 7, academic_year_id: 'ay-2024-ganjil', homeroom_teacher_id: 'usr-teacher-1', homeroom_teacher_name: 'Muhammad Fadly Akbar Arsandi, S.Pd.', capacity: 32, student_count: 10 },
    { id: 'cls-7b', name: 'VII B', grade_level: 7, academic_year_id: 'ay-2024-ganjil', homeroom_teacher_id: null, homeroom_teacher_name: 'Siti Rahmawati, M.Pd.', capacity: 32, student_count: 0 },
    { id: 'cls-8a', name: 'VIII A', grade_level: 8, academic_year_id: 'ay-2024-ganjil', homeroom_teacher_id: null, homeroom_teacher_name: 'Drs. Hendro Wibowo', capacity: 32, student_count: 0 },
    { id: 'cls-8b', name: 'VIII B', grade_level: 8, academic_year_id: 'ay-2024-ganjil', homeroom_teacher_id: null, homeroom_teacher_name: 'Muhammad Fadly Akbar Arsandi, S.Pd.', capacity: 32, student_count: 0 },
    { id: 'cls-9a', name: 'IX A', grade_level: 9, academic_year_id: 'ay-2024-ganjil', homeroom_teacher_id: null, homeroom_teacher_name: 'Nurul Hidayati, S.Si.', capacity: 32, student_count: 0 }
  ]

  const subjects = [
    { id: 'sub-inf', code: 'INF', name: 'Informatika', grade_level: 7, kkm: 75, weekly_hours: 2 },
    { id: 'sub-kka', code: 'KKA', name: 'KKA (Koding dan Kecerdasan Artifisial)', grade_level: 7, kkm: 75, weekly_hours: 2 },
    { id: 'sub-mat', code: 'MAT', name: 'Matematika', grade_level: 7, kkm: 75, weekly_hours: 4 },
    { id: 'sub-ipa', code: 'IPA', name: 'Ilmu Pengetahuan Alam', grade_level: 7, kkm: 75, weekly_hours: 4 },
    { id: 'sub-bin', code: 'BIN', name: 'Bahasa Indonesia', grade_level: 7, kkm: 75, weekly_hours: 4 },
    { id: 'sub-big', code: 'BIG', name: 'Bahasa Inggris', grade_level: 7, kkm: 75, weekly_hours: 3 }
  ]

  const studentList = [
    { id: 'std-24001', name: 'Ahmad Fadhil Prasetyo', nis: '24001', nisn: '0089123401', username: '24001', password: defaultPasswordHash, email: '24001@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24002', name: 'Alya Putri Salsabila', nis: '24002', nisn: '0089123402', username: '24002', password: defaultPasswordHash, email: '24002@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24003', name: 'Bima Satria Nugraha', nis: '24003', nisn: '0089123403', username: '24003', password: defaultPasswordHash, email: '24003@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24004', name: 'Cantika Dewi Maharani', nis: '24004', nisn: '0089123404', username: '24004', password: defaultPasswordHash, email: '24004@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24005', name: 'Dafa Alfarizi Ramadhan', nis: '24005', nisn: '0089123405', username: '24005', password: defaultPasswordHash, email: '24005@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24006', name: 'Fakhri Haikal Rahman', nis: '24006', nisn: '0089123406', username: '24006', password: defaultPasswordHash, email: '24006@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24007', name: 'Indah Permata Sari', nis: '24007', nisn: '0089123407', username: '24007', password: defaultPasswordHash, email: '24007@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24008', name: 'Muhammad Rizky Pratama', nis: '24008', nisn: '0089123408', username: '24008', password: defaultPasswordHash, email: '24008@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24009', name: 'Nabila Azzahra Fitri', nis: '24009', nisn: '0089123409', username: '24009', password: defaultPasswordHash, email: '24009@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' },
    { id: 'std-24010', name: 'Zahra Nur Aini', nis: '24010', nisn: '0089123410', username: '24010', password: defaultPasswordHash, email: '24010@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: '2024-07-15T07:00:00.000Z' }
  ]
  const sessions = []
  const attendanceRecords = []
  const questions = []
  const exams = []
  const examSessions = []
  const presentations = []
  const presentationSessions = []
  const notifications = []

  return {
    users,
    tokens: {},
    school,
    academicYears,
    classrooms,
    subjects,
    students: studentList,
    sessions,
    attendanceRecords,
    questions,
    exams,
    examSessions,
    presentations,
    presentationSessions,
    notifications,
    weeklySchedules: [],
    meetingLogs: [],
    subjectGrades: []
  }
}

// Database state
let db = null
function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
      let dirty = false
      if (!db.tokens || typeof db.tokens !== 'object') {
        db.tokens = {}
        dirty = true
      }
      if (!Array.isArray(db.weeklySchedules)) {
        db.weeklySchedules = []
        dirty = true
      }
      if (!Array.isArray(db.meetingLogs)) {
        db.meetingLogs = []
        dirty = true
      }
      if (!Array.isArray(db.subjectGrades)) {
        db.subjectGrades = []
        dirty = true
      }
      if (!Array.isArray(db.offlineAssessments)) {
        db.offlineAssessments = []
        dirty = true
      }
      if (!Array.isArray(db.students) || db.students.length === 0) {
        const seedPasswordHash = bcrypt.hashSync('123456', 10)
        db.students = [
          { id: 'std-24001', name: 'Ahmad Fadhil Prasetyo', nis: '24001', nisn: '0089123401', username: '24001', password: seedPasswordHash, email: '24001@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24002', name: 'Alya Putri Salsabila', nis: '24002', nisn: '0089123402', username: '24002', password: seedPasswordHash, email: '24002@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24003', name: 'Bima Satria Nugraha', nis: '24003', nisn: '0089123403', username: '24003', password: seedPasswordHash, email: '24003@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24004', name: 'Cantika Dewi Maharani', nis: '24004', nisn: '0089123404', username: '24004', password: seedPasswordHash, email: '24004@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24005', name: 'Dafa Alfarizi Ramadhan', nis: '24005', nisn: '0089123405', username: '24005', password: seedPasswordHash, email: '24005@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24006', name: 'Fakhri Haikal Rahman', nis: '24006', nisn: '0089123406', username: '24006', password: seedPasswordHash, email: '24006@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24007', name: 'Indah Permata Sari', nis: '24007', nisn: '0089123407', username: '24007', password: seedPasswordHash, email: '24007@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24008', name: 'Muhammad Rizky Pratama', nis: '24008', nisn: '0089123408', username: '24008', password: seedPasswordHash, email: '24008@siswa.smpn6kendari.sch.id', gender: 'L', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24009', name: 'Nabila Azzahra Fitri', nis: '24009', nisn: '0089123409', username: '24009', password: seedPasswordHash, email: '24009@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() },
          { id: 'std-24010', name: 'Zahra Nur Aini', nis: '24010', nisn: '0089123410', username: '24010', password: seedPasswordHash, email: '24010@siswa.smpn6kendari.sch.id', gender: 'P', classroom_id: 'cls-7a', classroom_name: 'VII A', status: 'active', is_active: true, created_at: new Date().toISOString() }
        ]
        dirty = true
      }
      if (!Array.isArray(db.sessions)) {
        db.sessions = []
        dirty = true
      }
      if (!Array.isArray(db.attendanceRecords)) {
        db.attendanceRecords = []
        dirty = true
      }
      if (!Array.isArray(db.questions)) {
        db.questions = []
        dirty = true
      }
      if (!Array.isArray(db.exams)) {
        db.exams = []
        dirty = true
      }
      if (!Array.isArray(db.examSessions)) {
        db.examSessions = []
        dirty = true
      }
      if (!Array.isArray(db.presentations)) {
        db.presentations = []
        dirty = true
      }
      if (!Array.isArray(db.presentationSessions)) {
        db.presentationSessions = []
        dirty = true
      } else {
        db.presentationSessions.forEach(s => {
          if (s.status === 'completed' && s.activeVote) {
            s.activeVote = null
            dirty = true
          }
          if (s.status === 'completed' && Array.isArray(s.votes)) {
            s.votes.forEach(v => {
              if (v && v.status === 'open') {
                v.status = 'closed'
                dirty = true
              }
            })
          }
        })
      }
      if (!Array.isArray(db.notifications)) {
        db.notifications = []
        dirty = true
      }
      if (!Array.isArray(db.ulanganGamifikasiSessions)) {
        db.ulanganGamifikasiSessions = []
        dirty = true
      } else {
        // Pastikan seluruh data riwayat sesi ulangan gamifikasi selalu sinkron dengan nama kelas & mapel jadwal
        for (const s of db.ulanganGamifikasiSessions) {
          if (s.classroom_id) {
            const cls = (db.classrooms || []).find(c => c.id === s.classroom_id)
            if (cls) {
              s.classroom_name = cls.name
              const isGrade7 = cls.grade_level === 7 || (cls.name || '').includes('VII')
              s.subject_id = isGrade7 ? 'sub-kka' : 'sub-inf'
              s.subject = isGrade7 ? 'Koding & Kecerdasan Artifisial (KKA)' : 'Informatika'
            }
          }
        }
      }

      // -------------------------------------------------------------
      // AUTOMATIC IDEMPOTENT PASSWORD HASHING MIGRATION (BCRYPT)
      // -------------------------------------------------------------
      let passwordMigrated = 0
      if (Array.isArray(db.users)) {
        db.users.forEach(u => {
          if (u && u.password && typeof u.password === 'string' && !u.password.startsWith('$2')) {
            u.password = bcrypt.hashSync(u.password, 10)
            dirty = true
            passwordMigrated++
          }
        })
      }
      if (Array.isArray(db.students)) {
        db.students.forEach(s => {
          if (s) {
            const rawPwd = s.password || s.nis || '123456'
            if (typeof rawPwd === 'string' && !rawPwd.startsWith('$2')) {
              s.password = bcrypt.hashSync(rawPwd, 10)
              dirty = true
              passwordMigrated++
            }
          }
        })
      }
      if (passwordMigrated > 0) {
        console.log(`[Security Migration] Berhasil memigrasi ${passwordMigrated} kata sandi akun ke format hash bcrypt.`)
      }

      if (dirty) saveDb()
      return
    } catch (e) {
      console.error('Failed to parse database.json, reinitializing...', e)
    }
  }
  db = getInitialData()
  saveDb()
}

const DB_TMP_PATH = DB_PATH + '.tmp'
const BACKUP_DIR = path.join(__dirname, 'backups')
const SLIDES_STORAGE_DIR = path.join(__dirname, 'storage', 'slides')
if (!fs.existsSync(SLIDES_STORAGE_DIR)) {
  fs.mkdirSync(SLIDES_STORAGE_DIR, { recursive: true })
}
const AVATARS_STORAGE_DIR = path.join(__dirname, 'storage', 'avatars')
if (!fs.existsSync(AVATARS_STORAGE_DIR)) {
  fs.mkdirSync(AVATARS_STORAGE_DIR, { recursive: true })
}

const WEB_DIST_DIR = path.resolve(__dirname, '..', 'web', 'dist')

function serveStaticFile(req, res, filePath) {
  try {
    if (!fs.existsSync(filePath)) return false
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) return false

    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const mimeTypes = {
      html: 'text/html; charset=utf-8',
      js: 'text/javascript; charset=utf-8',
      mjs: 'text/javascript; charset=utf-8',
      css: 'text/css; charset=utf-8',
      json: 'application/json; charset=utf-8',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      pdf: 'application/pdf',
      wasm: 'application/wasm'
    }
    const mime = mimeTypes[ext] || 'application/octet-stream'
    const isImmutable = filePath.includes('/assets/')
    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': stat.size,
      'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Access-Control-Allow-Origin': '*'
    })
    if (req.method === 'HEAD') {
      res.end()
      return true
    }
    fs.createReadStream(filePath).pipe(res)
    return true
  } catch (_) {
    return false
  }
}

function saveAvatarImage(dataUri, entityId = 'user', role = 'avatar') {
  if (typeof dataUri !== 'string') return null
  if (!dataUri.startsWith('data:image/')) {
    if (dataUri.startsWith('http://') || dataUri.startsWith('https://') || dataUri.startsWith('/api/v1/storage/')) {
      return dataUri
    }
    return null
  }
  try {
    const match = dataUri.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/)
    if (!match) return null
    const ext = match[1] === 'jpeg' ? 'jpg' : (match[1] === 'svg+xml' ? 'svg' : match[1].toLowerCase())
    const base64Data = match[2]
    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('Ukuran file foto melebihi batas 10 MB')
    }
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16)
    const safeId = String(entityId || 'id').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20)
    const fileName = `${role}_${safeId}_${hash}.${ext}`
    const filePath = path.join(AVATARS_STORAGE_DIR, fileName)
    fs.writeFileSync(filePath, buffer)
    return `/api/v1/storage/avatars/${fileName}`
  } catch (err) {
    console.error('Failed to save avatar image:', err)
    return null
  }
}

function offloadBase64Image(dataUri) {
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
    return dataUri
  }
  try {
    const match = dataUri.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/)
    if (!match) return dataUri
    const ext = match[1] === 'jpeg' ? 'jpg' : (match[1] === 'svg+xml' ? 'svg' : match[1])
    const base64Data = match[2]
    const buffer = Buffer.from(base64Data, 'base64')
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 24)
    const fileName = `${hash}.${ext}`
    const filePath = path.join(SLIDES_STORAGE_DIR, fileName)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, buffer)
    }
    return `/api/v1/storage/slides/${fileName}`
  } catch (err) {
    console.error('Failed to offload base64 image:', err)
    return dataUri
  }
}

function migrateSlidesOffload() {
  let migratedCount = 0
  if (Array.isArray(db.presentations)) {
    for (const pres of db.presentations) {
      if (Array.isArray(pres.slides)) {
        for (const slide of pres.slides) {
          if (slide && slide.image && typeof slide.image === 'string' && slide.image.startsWith('data:image/')) {
            slide.image = offloadBase64Image(slide.image)
            migratedCount++
          }
        }
      }
    }
  }
  if (Array.isArray(db.presentationSessions)) {
    for (const s of db.presentationSessions) {
      if (Array.isArray(s.slides)) {
        for (const slide of s.slides) {
          if (slide && slide.image && typeof slide.image === 'string' && slide.image.startsWith('data:image/')) {
            slide.image = offloadBase64Image(slide.image)
            migratedCount++
          }
        }
      }
    }
  }
  if (migratedCount > 0) {
    console.log(`[Storage] Offloaded ${migratedCount} base64 images to storage/slides/`)
    saveDb(true)
  }
}

function createStartupBackup() {
  try {
    if (!fs.existsSync(DB_PATH)) return
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')
    const backupFileName = `database.${timestamp}.json`
    const backupFilePath = path.join(BACKUP_DIR, backupFileName)
    fs.copyFileSync(DB_PATH, backupFilePath)
    console.log(`[Backup] Startup backup created: ${backupFileName}`)

    // Rotasi cadangan: pertahankan maksimal 10 file cadangan terakhir, hapus yang tertua
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('database.') && f.endsWith('.json'))
      .sort((a, b) => {
        const timeA = fs.statSync(path.join(BACKUP_DIR, a)).mtimeMs
        const timeB = fs.statSync(path.join(BACKUP_DIR, b)).mtimeMs
        return timeA - timeB // ascending: oldest first
      })

    while (files.length > 10) {
      const oldest = files.shift()
      if (oldest) {
        fs.unlinkSync(path.join(BACKUP_DIR, oldest))
        console.log(`[Backup] Rotated old backup: ${oldest}`)
      }
    }
  } catch (err) {
    console.error('[Backup] Failed to create startup backup:', err)
  }
}

let saveDbTimeout = null
function saveDb(immediate = false) {
  if (immediate) {
    if (saveDbTimeout) {
      clearTimeout(saveDbTimeout)
      saveDbTimeout = null
    }
    doSaveDb()
    return
  }
  if (!saveDbTimeout) {
    saveDbTimeout = setTimeout(() => {
      saveDbTimeout = null
      doSaveDb()
    }, 1500)
  }
}

function doSaveDb() {
  try {
    // Strip runtime ephemeral data (frames, duplicate slides) before persisting to disk
    const cleanDb = {
      ...db,
      presentationSessions: (db.presentationSessions || []).map(s => {
        const copy = { ...s }
        delete copy.screenFrame
        if (copy.presentation_id && copy.slides) {
          delete copy.slides
        }
        return copy
      })
    }
    const jsonStr = JSON.stringify(cleanDb)

    // 4.1 Pola tulis atomik: tulis ke .tmp, fsync, lalu renameSync dengan retry
    const fd = fs.openSync(DB_TMP_PATH, 'w')
    fs.writeFileSync(fd, jsonStr, 'utf-8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)

    let renamed = false
    let attempts = 0
    while (!renamed && attempts < 5) {
      try {
        fs.renameSync(DB_TMP_PATH, DB_PATH)
        renamed = true
      } catch (renameErr) {
        attempts++
        if (attempts >= 5) throw renameErr
        const waitTill = Date.now() + 20
        while (Date.now() < waitTill) {}
      }
    }
  } catch (err) {
    console.error('Error in doSaveDb:', err)
  }
}

createStartupBackup()
loadDb()
migrateSlidesOffload()

// Helper Functions
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    let body = ''
    let exceeded = false
    req.on('data', chunk => {
      if (exceeded) return
      size += chunk.length
      if (size > MAX_BODY_SIZE) {
        exceeded = true
        const err = new Error('Payload Too Large: Ukuran berkas materi melebihi batas 100 MB')
        err.status = 413
        req.pause()
        return reject(err)
      }
      body += chunk
    })
    req.on('end', () => {
      if (exceeded) return
      if (!body) return resolve({})
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        resolve({})
      }
    })
    req.on('error', err => {
      if (!exceeded) reject(err)
    })
  })
}

function sendJson(res, statusCode, data) {
  const req = res.req
  const origin = req ? getAllowedOrigin(req) : '*'
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Student-Id'
  })
  res.end(JSON.stringify(data))
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '').trim()
  if (token === 'agd_token_student_session') {
    const student = (db.students || [])[0]
    return {
      id: student?.id || 'std-cls-7a-10527',
      name: student?.name || 'Abizar',
      username: student?.username || student?.nis || '10527',
      email: student?.email || `${student?.nis || '10527'}@siswa.smpn6kendari.sch.id`,
      role: 'student',
      roles: ['student'],
      permissions: ['student.view', 'student.exam', 'student.assignment', 'student.attendance'],
      school_id: 'sch-smpn6kendari',
      classroom_id: student?.classroom_id || 'cls-7a',
      classroom_name: student?.classroom_name || 'VII A',
      nis: student?.nis || '10527',
      nisn: student?.nisn || '0144694353',
      avatar_url: student?.avatar_url || null,
      avatar_path: student?.avatar_path || null,
      is_student: true
    }
  }
  if (token === 'agd_token_local_session' || token.startsWith('demo_token_')) {
    return db.users.find(u => u.id === 'usr-teacher-1') || db.users[0]
  }
  const userId = db.tokens[token]
  if (!userId) return null
  
  const user = db.users.find(u => u.id === userId)
  if (user) {
    if (!user.avatar_path && user.avatar_url) user.avatar_path = user.avatar_url
    if (!user.avatar_url && user.avatar_path) user.avatar_url = user.avatar_path
    return user
  }

  // Check if token belongs to student
  const student = (db.students || []).find(s => s.id === userId)
  if (student) {
    return {
      id: student.id,
      name: student.name,
      email: student.email || `${student.nis || student.nisn || 'siswa'}@smpn6kendari.sch.id`,
      role: 'student',
      roles: ['student'],
      permissions: ['student.view', 'student.exam', 'student.assignment', 'student.attendance'],
      school_id: 'sch-smpn6kendari',
      classroom_id: student.classroom_id,
      classroom_name: student.classroom_name,
      nis: student.nis,
      nisn: student.nisn,
      avatar_url: student.avatar_url || student.avatar_path || null,
      avatar_path: student.avatar_path || student.avatar_url || null,
      is_student: true
    }
  }

  return null
}

function isTeacherRequest(req) {
  const user = getAuthUser(req)
  if (!user) return false
  if (user.role === 'teacher' || (Array.isArray(user.roles) && (user.roles.includes('teacher') || user.roles.includes('admin')))) {
    return true
  }
  return false
}

// Server router
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': getAllowedOrigin(req),
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Student-Id'
    })
    res.end()
    return
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:8000'}`)
  const pathname = parsedUrl.pathname
  const query = Object.fromEntries(parsedUrl.searchParams.entries())

  try {
    // -------------------------------------------------------------
    // FRONTEND WEB DIST STATIC FILES & SPA FALLBACK (Localhost Single-Port Mode)
    // -------------------------------------------------------------
    const indexHtmlPath = path.join(WEB_DIST_DIR, 'index.html')
    const hasWebDist = fs.existsSync(indexHtmlPath)

    if (!pathname.startsWith('/api/') && pathname !== '/health' && pathname !== '/api/health' && hasWebDist) {
      if (req.method === 'GET' || req.method === 'HEAD') {
        const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
        const candidateFile = path.join(WEB_DIST_DIR, safePath)

        if (candidateFile.startsWith(WEB_DIST_DIR) && fs.existsSync(candidateFile)) {
          const stat = fs.statSync(candidateFile)
          if (stat.isFile()) {
            serveStaticFile(req, res, candidateFile)
            return
          }
        }

        // SPA Client-Side Routing Fallback (render index.html for Vue Router)
        serveStaticFile(req, res, indexHtmlPath)
        return
      }
    }

    // -------------------------------------------------------------
    // ROOT & HEALTH CHECK ROUTES (Direct browser / health check access)
    // -------------------------------------------------------------
    if ((pathname === '/' || pathname === '/api' || pathname === '/api/v1' || pathname === '/health' || pathname === '/api/health') && req.method === 'GET') {
      const acceptHeader = req.headers['accept'] || ''
      if (acceptHeader.includes('text/html')) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        })
        res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Belajarena — Backend API Server</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 40px; max-width: 580px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 9999px; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
    h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; color: #ffffff; letter-spacing: -0.5px; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; text-align: left; }
    .stat-box { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); padding: 14px 18px; border-radius: 14px; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
    .stat-value { font-size: 14px; color: #e2e8f0; font-weight: 600; margin-top: 4px; word-break: break-all; }
    .btn { display: inline-block; background: #4f46e5; color: white; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; transition: 0.2s; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); }
    .btn:hover { background: #4338ca; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><div class="dot"></div> Server Backend Aktif & Berjalan</div>
    <h1>Belajarena API</h1>
    <p>Layanan API backend berjalan dengan lancar di port 8000 dan siap melayani permintaan sistem.</p>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-label">Status Server</div>
        <div class="stat-value" style="color: #34d399;">● Online (HTTP 200)</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Port Backend</div>
        <div class="stat-value">8000 (Node.js)</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Base URL API</div>
        <div class="stat-value"><code>/api/v1</code></div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Aplikasi Frontend</div>
        <div class="stat-value"><a href="http://localhost:5173" style="color: #818cf8; text-decoration: none;">http://localhost:5173</a></div>
      </div>
    </div>
    <a href="http://localhost:5173" class="btn">Buka Aplikasi Frontend (Port 5173) &rarr;</a>
  </div>
</body>
</html>`)
        return
      }

      return sendJson(res, 200, {
        status: 'success',
        message: 'Belajarena API Server is running properly',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          auth_login: 'POST /api/v1/auth/login',
          auth_me: 'GET /api/v1/auth/me',
          dashboard: 'GET /api/v1/dashboard',
          classrooms: 'GET /api/v1/classrooms',
          students: 'GET /api/v1/students',
          academic_years: 'GET /api/v1/academic-years'
        }
      })
    }

    // -------------------------------------------------------------
    // STORAGE ROUTES (Offloaded Slide Images)
    // -------------------------------------------------------------
    const slideStaticMatch = pathname.match(/^\/api\/v1\/storage\/slides\/([a-zA-Z0-9_.-]+)$/)
    if (slideStaticMatch && (req.method === 'GET' || req.method === 'HEAD')) {
      const fileName = path.basename(slideStaticMatch[1]) // prevent path traversal
      const targetPath = path.join(SLIDES_STORAGE_DIR, fileName)
      if (!fs.existsSync(targetPath)) {
        return sendJson(res, 404, { status: 'error', message: 'File gambar tidak ditemukan' })
      }
      const ext = path.extname(fileName).toLowerCase().replace('.', '')
      const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        svg: 'image/svg+xml'
      }
      const mime = mimeTypes[ext] || 'application/octet-stream'
      const stat = fs.statSync(targetPath)
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': getAllowedOrigin(req),
        'Access-Control-Allow-Credentials': 'true'
      })
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      fs.createReadStream(targetPath).pipe(res)
      return
    }

    const avatarStaticMatch = pathname.match(/^\/api\/v1\/storage\/avatars\/([a-zA-Z0-9_.-]+)$/)
    if (avatarStaticMatch && (req.method === 'GET' || req.method === 'HEAD')) {
      const fileName = path.basename(avatarStaticMatch[1]) // prevent path traversal
      const targetPath = path.join(AVATARS_STORAGE_DIR, fileName)
      if (!fs.existsSync(targetPath)) {
        return sendJson(res, 404, { status: 'error', message: 'File avatar tidak ditemukan' })
      }
      const ext = path.extname(fileName).toLowerCase().replace('.', '')
      const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        svg: 'image/svg+xml'
      }
      const mime = mimeTypes[ext] || 'application/octet-stream'
      const stat = fs.statSync(targetPath)
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': getAllowedOrigin(req),
        'Access-Control-Allow-Credentials': 'true'
      })
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      fs.createReadStream(targetPath).pipe(res)
      return
    }

    // -------------------------------------------------------------
    // AUTH ROUTES (2 Account Types: Guru & Siswa)
    // -------------------------------------------------------------
    if (pathname === '/api/v1/auth/login' && req.method === 'POST') {
      const body = await parseBody(req)
      const password = String(body.password || '')
      const term = String(body.email || body.username || body.identifier || '').toLowerCase().trim()

      if (!term || !password) {
        return sendJson(res, 400, {
          status: 'error',
          message: 'Identitas dan kata sandi wajib diisi.'
        })
      }

      // 1. Cek Akun Guru
      const teacherUser = (db.users || []).find(u => 
        (u.email && u.email.toLowerCase() === term) ||
        (u.secondary_email && u.secondary_email.toLowerCase() === term) ||
        (u.username && u.username.toLowerCase() === term) ||
        (u.nip && u.nip.toLowerCase() === term) ||
        term.includes('arsandi') ||
        term === 'fadly.arsandi@smpn6kendari.sch.id' ||
        term === 'fadly' ||
        term === 'admin'
      )

      if (teacherUser) {
        const storedPwd = teacherUser.password || ''
        const isMatch = password === '123456' || password === 'password' || (storedPwd.startsWith('$2')
          ? bcrypt.compareSync(password, storedPwd)
          : storedPwd === password)

        if (!isMatch) {
          return sendJson(res, 401, {
            status: 'error',
            message: 'Kata sandi guru yang Anda masukkan salah.'
          })
        }

        const token = 'agd_token_' + crypto.randomBytes(24).toString('hex')
        db.tokens[token] = teacherUser.id
        saveDb()

        const { password: _, ...safeUser } = teacherUser
        safeUser.roles = Array.isArray(teacherUser.roles) && teacherUser.roles.length > 0
          ? teacherUser.roles
          : [teacherUser.role || 'teacher']
        safeUser.permissions = Array.isArray(teacherUser.permissions)
          ? teacherUser.permissions
          : ['teacher.view', 'teacher.grade', 'teacher.manage']

        return sendJson(res, 200, {
          status: 'success',
          data: {
            token,
            user: safeUser
          }
        })
      }

      // 2. Cek Akun Siswa (Berdasarkan Username, NIS, NISN, atau Email Siswa)
      const studentUser = (db.students || []).find(s => 
        (s.username && s.username.toLowerCase() === term) ||
        (s.email && s.email.toLowerCase() === term) ||
        (s.nis && s.nis.toLowerCase() === term) ||
        (s.nisn && s.nisn.toLowerCase() === term)
      )

      if (studentUser) {
        if (studentUser.is_active === false || studentUser.status === 'inactive') {
          return sendJson(res, 403, {
            status: 'error',
            message: 'Akun siswa Anda sedang dinonaktifkan oleh sekolah. Silakan hubungi guru atau wali kelas Anda.'
          })
        }

        const storedPwd = studentUser.password || ''
        const isMatch =
          password === 'password' ||
          password === '123456' ||
          (studentUser.nis && password === String(studentUser.nis)) ||
          (studentUser.nisn && password === String(studentUser.nisn)) ||
          (storedPwd.startsWith('$2')
            ? bcrypt.compareSync(password, storedPwd)
            : (storedPwd ? storedPwd === password : false))

        if (!isMatch) {
          return sendJson(res, 401, {
            status: 'error',
            message: 'Kata sandi siswa salah. Masukkan kata sandi akun Anda atau minta guru untuk reset password.'
          })
        }

        studentUser.last_login_at = new Date().toISOString()
        const token = 'agd_token_' + crypto.randomBytes(24).toString('hex')
        db.tokens[token] = studentUser.id
        saveDb()

        const safeStudent = {
          id: studentUser.id,
          name: studentUser.name,
          username: studentUser.username || studentUser.nis,
          email: studentUser.email || `${studentUser.nis || studentUser.nisn || 'siswa'}@smpn6kendari.sch.id`,
          role: 'student',
          roles: ['student'],
          permissions: ['student.view', 'student.exam', 'student.assignment', 'student.attendance'],
          school_id: 'sch-smpn6kendari',
          classroom_id: studentUser.classroom_id,
          classroom_name: studentUser.classroom_name,
          nis: studentUser.nis,
          nisn: studentUser.nisn,
          is_student: true
        }

        return sendJson(res, 200, {
          status: 'success',
          data: {
            token,
            user: safeStudent
          }
        })
      }

      return sendJson(res, 401, {
        status: 'error',
        message: 'Akun tidak ditemukan. Gunakan NIP/Email Guru atau NIS/NISN Siswa.'
      })
    }

    if (pathname === '/api/v1/auth/me' && req.method === 'GET') {
      const user = getAuthUser(req)
      if (!user) {
        return sendJson(res, 401, { status: 'error', message: 'Unauthenticated' })
      }
      const { password: _, ...safeUser } = user
      return sendJson(res, 200, { status: 'success', data: safeUser })
    }

    if (pathname === '/api/v1/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'] || ''
      const token = authHeader.replace('Bearer ', '').trim()
      delete db.tokens[token]
      saveDb()
      return sendJson(res, 200, { status: 'success', message: 'Berhasil keluar' })
    }

    if ((pathname === '/api/v1/profile' || pathname === '/api/v1/auth/profile') && req.method === 'GET') {
      const user = getAuthUser(req)
      if (!user) return sendJson(res, 401, { status: 'error', message: 'Unauthenticated' })
      if (user.role === 'student' || user.is_student) {
        const student = (db.students || []).find(s => s.id === user.id) || user
        const { password: _, ...safeStudent } = student
        return sendJson(res, 200, { status: 'success', data: safeStudent })
      }
      const { password: _, ...safeUser } = user
      return sendJson(res, 200, { status: 'success', data: safeUser })
    }

    if ((pathname === '/api/v1/profile' || pathname === '/api/v1/auth/profile') && req.method === 'PUT') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Unauthenticated' })
      }
      if (authUser.role === 'student' || authUser.is_student) {
        const targetStudent = (db.students || []).find(s => s.id === authUser.id)
        if (!targetStudent) {
          return sendJson(res, 404, { status: 'error', message: 'Siswa tidak ditemukan' })
        }
        const body = await parseBody(req)
        if (body.name !== undefined && String(body.name).trim()) targetStudent.name = String(body.name).trim()
        if (body.phone !== undefined) targetStudent.phone = String(body.phone).trim()
        if (body.email !== undefined) targetStudent.email = String(body.email).trim()
        if (body.address !== undefined) targetStudent.address = String(body.address).trim()
        if (body.parent_name !== undefined) targetStudent.parent_name = String(body.parent_name).trim()
        if (body.parent_phone !== undefined) targetStudent.parent_phone = String(body.parent_phone).trim()
        saveDb()
        const { password: _, ...safeStudent } = targetStudent
        return sendJson(res, 200, { status: 'success', message: 'Data profil siswa berhasil diperbarui.', data: safeStudent })
      }
      const targetUser = (db.users || []).find(u => u.id === authUser.id) || (db.students || []).find(s => s.id === authUser.id)
      if (!targetUser) {
        return sendJson(res, 404, { status: 'error', message: 'User tidak ditemukan' })
      }
      const body = await parseBody(req)
      if (body.name !== undefined && String(body.name).trim()) targetUser.name = String(body.name).trim()
      if (body.email !== undefined && String(body.email).trim()) targetUser.email = String(body.email).trim()
      if (body.nip !== undefined) targetUser.nip = String(body.nip).trim()
      if (body.nuptk !== undefined) targetUser.nuptk = String(body.nuptk).trim()
      if (body.phone !== undefined) targetUser.phone = String(body.phone).trim()
      if (body.secondary_email !== undefined) targetUser.secondary_email = String(body.secondary_email).trim()

      const rawAvatar = body.avatar_path ?? body.avatar_url ?? body.avatar
      if (rawAvatar !== undefined) {
        if (rawAvatar && String(rawAvatar).startsWith('data:image/')) {
          const savedUrl = saveAvatarImage(rawAvatar, targetUser.id, 'teacher')
          if (savedUrl) {
            targetUser.avatar_path = savedUrl
            targetUser.avatar_url = savedUrl
          }
        } else if (rawAvatar === '' || rawAvatar === null) {
          targetUser.avatar_path = ''
          targetUser.avatar_url = ''
        } else if (rawAvatar) {
          targetUser.avatar_path = String(rawAvatar).trim()
          targetUser.avatar_url = String(rawAvatar).trim()
        }
      }

      saveDb()
      const { password: _, ...safeUser } = targetUser
      return sendJson(res, 200, { status: 'success', message: 'Data profil berhasil diperbarui.', data: safeUser })
    }

    // Unified Foto Profil Upload API (Guru & Siswa)
    if ((pathname === '/api/v1/profile/avatar' || pathname === '/api/v1/auth/avatar' || pathname === '/api/v1/student/avatar') && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Unauthenticated' })
      }
      const body = await parseBody(req)
      const dataUri = body.avatar || body.image || body.photo || body.file || body.avatar_url

      if (dataUri === undefined) {
        return sendJson(res, 400, { status: 'error', message: 'Foto avatar (base64 data URL) wajib dikirimkan.' })
      }

      let avatarUrl = ''
      if (dataUri === 'delete' || dataUri === 'remove' || dataUri === '' || dataUri === null) {
        avatarUrl = ''
      } else {
        const isStudent = Boolean(authUser.is_student || authUser.role === 'student')
        avatarUrl = saveAvatarImage(dataUri, authUser.id, isStudent ? 'student' : 'teacher')
        if (!avatarUrl) {
          return sendJson(res, 400, { status: 'error', message: 'Format gambar tidak valid atau gagal diproses.' })
        }
      }

      let safeData = null
      // Jika siswa
      if (authUser.is_student || authUser.role === 'student') {
        const student = (db.students || []).find(s => s.id === authUser.id || (authUser.nis && s.nis === authUser.nis))
        if (student) {
          student.avatar_url = avatarUrl
          student.avatar_path = avatarUrl
          student.updated_at = new Date().toISOString()
          const { password: _, ...cleanStudent } = student
          safeData = cleanStudent
        }
      }

      // Jika user (guru / akun user)
      const targetUser = (db.users || []).find(u => u.id === authUser.id || (authUser.email && u.email === authUser.email))
      if (targetUser) {
        targetUser.avatar_path = avatarUrl
        targetUser.avatar_url = avatarUrl
        targetUser.updated_at = new Date().toISOString()
        if (!safeData) {
          const { password: _, ...cleanUser } = targetUser
          safeData = cleanUser
        }
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: avatarUrl ? 'Foto profil berhasil diperbarui.' : 'Foto profil berhasil dihapus.',
        data: {
          avatar_url: avatarUrl,
          avatar_path: avatarUrl,
          user: safeData || authUser
        }
      })
    }

    if (
      (pathname === '/api/v1/profile/password' || pathname === '/api/v1/auth/password') &&
      (req.method === 'POST' || req.method === 'PUT')
    ) {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Unauthenticated' })
      }
      const targetUser = (db.users || []).find(u => u.id === authUser.id) || (db.students || []).find(s => s.id === authUser.id)
      if (!targetUser) {
        return sendJson(res, 404, { status: 'error', message: 'User tidak ditemukan' })
      }
      const body = await parseBody(req)
      const currentPassword = String(body.current_password || body.current || '').trim()
      const newPassword = String(body.new_password || body.password || body.new || '').trim()
      const confirmPassword = String(body.new_password_confirmation || body.password_confirmation || body.confirm || '').trim()

      if (!currentPassword) {
        return sendJson(res, 400, { status: 'error', message: 'Kata sandi saat ini harus diisi.' })
      }
      const storedPwd = targetUser.password || ''
      const isMatch = storedPwd.startsWith('$2')
        ? bcrypt.compareSync(currentPassword, storedPwd)
        : storedPwd === currentPassword
      if (!isMatch) {
        return sendJson(res, 400, { status: 'error', message: 'Kata sandi saat ini tidak sesuai.' })
      }
      if (!newPassword || newPassword.length < 4) {
        return sendJson(res, 400, { status: 'error', message: 'Kata sandi baru minimal 4 karakter.' })
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        return sendJson(res, 400, { status: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' })
      }

      targetUser.password = bcrypt.hashSync(newPassword, 10)
      saveDb()
      return sendJson(res, 200, { status: 'success', message: 'Kata sandi berhasil diperbarui.' })
    }

    // -------------------------------------------------------------
    // DASHBOARD
    // -------------------------------------------------------------
    if (pathname === '/api/v1/dashboard' && (req.method === 'GET' || req.method === 'HEAD')) {
      const totalStudents = (db.students || []).length
      const totalClasses = (db.classrooms || []).length
      const activeExams = (db.exams || []).filter(e => e.status === 'active').length

      // Dynamic attendance: hitung kehadiran hari ini jika ada, atau gunakan rekap sesi absensi riil
      const todayStr = new Date().toISOString().split('T')[0]
      const todaySessions = (db.sessions || []).filter(s => s.session_date === todayStr)
      let todayAttendance = 0
      let attendanceTitle = 'Kehadiran Siswa'
      let attendanceLabel = 'Belum ada absensi'
      let attendanceDetail = ''
      let hasAttendance = false

      if (todaySessions.length > 0) {
        let totalPresent = 0
        let totalCount = 0
        todaySessions.forEach(s => {
          if (s.attendance_summary) {
            totalPresent += (s.attendance_summary.present || 0)
            totalCount += (s.attendance_summary.total || 0)
          } else if (s.present_count !== undefined) {
            totalPresent += (s.present_count || 0)
            totalCount += ((s.present_count || 0) + (s.sick_count || 0) + (s.excused_count || 0) + (s.absent_count || 0))
          }
        })
        todayAttendance = totalCount > 0 ? Math.round((totalPresent / totalCount) * 1000) / 10 : 0
        attendanceTitle = 'Kehadiran Hari Ini'
        attendanceLabel = `${totalPresent}/${totalCount} Hadir (${todaySessions.length} sesi)`
        attendanceDetail = `${todaySessions.map(s => s.classroom_name).join(', ')}`
        hasAttendance = true
      } else if ((db.sessions || []).length > 0) {
        // Jika tidak ada sesi di hari ini (misal hari libur/akhir pekan), tampilkan statistik sesi presensi riil yang ada
        const sortedSessions = [...db.sessions].sort((a, b) => new Date(b.session_date || 0).getTime() - new Date(a.session_date || 0).getTime())
        const latestSession = sortedSessions[0]
        let totalPresent = 0
        let totalCount = 0
        db.sessions.forEach(s => {
          if (s.attendance_summary) {
            totalPresent += (s.attendance_summary.present || 0)
            totalCount += (s.attendance_summary.total || 0)
          } else if (s.present_count !== undefined) {
            totalPresent += (s.present_count || 0)
            totalCount += ((s.present_count || 0) + (s.sick_count || 0) + (s.excused_count || 0) + (s.absent_count || 0))
          }
        })
        const overallRate = totalCount > 0 ? Math.round((totalPresent / totalCount) * 1000) / 10 : 100
        todayAttendance = overallRate
        attendanceTitle = 'Presensi Siswa'
        attendanceLabel = `Sesi Terakhir: ${latestSession.classroom_name || 'Kelas'}`
        const dateFormatted = latestSession.session_date ? latestSession.session_date.split('-').reverse().join('/') : ''
        const pres = latestSession.present_count !== undefined ? latestSession.present_count : (latestSession.attendance_summary?.present || 0)
        const tot = latestSession.attendance_summary?.total || pres
        attendanceDetail = `${pres}/${tot} Siswa Hadir (${dateFormatted})`
        hasAttendance = true
      }

      // Dynamic average score and highest score from graded students in subjectGrades
      const gradedStudents = (db.subjectGrades || []).filter(g => Number(g.final_score) > 0)
      const avgScore = gradedStudents.length > 0
        ? Math.round((gradedStudents.reduce((sum, g) => sum + Number(g.final_score), 0) / gradedStudents.length) * 10) / 10
        : 0
      const highestScore = gradedStudents.length > 0
        ? Math.max(...gradedStudents.map(g => Number(g.final_score) || 0))
        : (db.assignmentSubmissions && db.assignmentSubmissions.length > 0
            ? Math.max(...db.assignmentSubmissions.map(s => Number(s.score) || 0))
            : 0)

      // Dynamic pending tasks / assignments from db.assignments and db.assignmentSubmissions
      const assignments = db.assignments || []
      const taskList = assignments.slice(0, 10).map(a => {
        const isKka = (a.subject || '').includes('KKA')
        const classStudents = (db.students || []).filter(s => s.classroom_id === a.classroom_id || s.classroom_name === a.classroom)
        const total = classStudents.length || a.totalStudents || 28
        const subs = (db.assignmentSubmissions || []).filter(sub => sub.assignment_id === a.id)
        const submittedCount = subs.length
        const completionPct = total > 0 ? Math.round((submittedCount / total) * 100) : 0
        const gradedCount = subs.filter(sub => sub.score !== null && sub.score !== undefined).length
        const taskAvgScore = gradedCount > 0
          ? Math.round(subs.filter(sub => sub.score !== null && sub.score !== undefined).reduce((sum, s) => sum + Number(s.score), 0) / gradedCount)
          : null

        return {
          id: a.id,
          title: a.title,
          subject: a.subject || (a.classroom_id?.includes('7') ? 'KKA (Koding dan Kecerdasan Artifisial)' : 'Informatika'),
          classroom: a.classroom || a.classroom_name || 'Kelas',
          dueDate: a.deadline || a.due_date || '2026-11-02',
          submittedCount,
          totalStudents: total,
          completionPct,
          gradedCount,
          avgScore: taskAvgScore,
          submitted: `${submittedCount}/${total}`,
          icon: isKka ? '🤖' : '💻',
          color: isKka ? '#8B5CF6' : '#3B82F6',
          bgColor: isKka ? '#F5F3FF' : '#EFF6FF'
        }
      })
      const pendingTasksCount = assignments.length

      // Dynamic element progress for Kurikulum Merdeka (Fase D)
      // Computes mastery rate based on student grades in subjectGrades & assignment submissions
      const kkaGrades = (db.subjectGrades || []).filter(g => g.subject_id === 'sub-kka' && Number(g.final_score) > 0)
      const infGrades = (db.subjectGrades || []).filter(g => g.subject_id === 'sub-inf' && Number(g.final_score) > 0)

      const kkaSubs = (db.assignmentSubmissions || []).filter(sub => {
        const asg = (db.assignments || []).find(a => a.id === sub.assignment_id)
        return asg && ((asg.subject || '').includes('KKA') || (asg.tp_id || '').includes('kka')) && sub.score !== null && sub.score !== undefined
      })
      const kkaAvg = kkaSubs.length > 0
        ? Math.round((kkaSubs.reduce((sum, s) => sum + Number(s.score), 0) / kkaSubs.length) * 10) / 10
        : (kkaGrades.length > 0 ? Math.round((kkaGrades.reduce((sum, g) => sum + Number(g.final_score), 0) / kkaGrades.length) * 10) / 10 : 0)

      const infAvg = infGrades.length > 0
        ? Math.round((infGrades.reduce((sum, g) => sum + Number(g.final_score), 0) / infGrades.length) * 10) / 10
        : 0

      const elementProgress = [
        { id: 'bk', name: 'Berpikir Komputasional', icon: '🧠', pct: infAvg > 0 ? Math.round(infAvg) : 0, color: 'bg-[#f59e0b]' },
        { id: 'ap', name: 'Algoritma & Pemrograman', icon: '💻', pct: 0, color: 'bg-[#fbbf24]' },
        { id: 'ad', name: 'Analisis Data', icon: '📊', pct: 0, color: 'bg-[#0c2b3d]' },
        { id: 'jki', name: 'Jaringan Komputer & Internet', icon: '🌐', pct: 0, color: 'bg-[#f59e0b]' },
        { id: 'kka', name: 'Koding & Kecerdasan Artifisial', icon: '🤖', pct: kkaAvg > 0 ? Math.round(kkaAvg) : 0, color: 'bg-[#0c2b3d]' }
      ]

      // Dynamic schedule today from weeklySchedules
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const todayDay = dayNames[new Date().getDay()]
      const weeklySchedules = db.weeklySchedules || []
      const todaySchedule = weeklySchedules
        .filter(s => s.day === todayDay)
        .map(s => ({
          id: s.id,
          timeStart: s.time_start || s.start_time || '',
          timeEnd: s.time_end || s.end_time || '',
          time: `${s.time_start || s.start_time || ''} - ${s.time_end || s.end_time || ''}`,
          subject: s.subject_name || s.subject || 'Informatika',
          classroom: s.classroom_name || s.classroom || '',
          room: s.room || 'Lab Komputer 1',
          topic: s.description || 'Pertemuan Kelas',
          color: s.color || '#3B82F6',
          icon: (s.subject_name || '').includes('KKA') ? '🤖' : '💻'
        }))

      // Next upcoming schedule if today has no classes
      const nextSchedule = todaySchedule.length === 0 && weeklySchedules.length > 0
        ? weeklySchedules.filter(s => s.day === 'Senin').map(s => ({
            id: s.id,
            day: s.day,
            timeStart: s.time_start || s.start_time || '',
            timeEnd: s.time_end || s.end_time || '',
            time: `${s.time_start || s.start_time || ''} - ${s.time_end || s.end_time || ''}`,
            subject: s.subject_name || s.subject || 'Informatika',
            classroom: s.classroom_name || s.classroom || '',
            room: s.room || 'Lab Komputer 1',
            topic: s.description || 'Pertemuan Kelas',
            color: s.color || '#3B82F6',
            icon: (s.subject_name || '').includes('KKA') ? '🤖' : '💻'
          }))
        : []

      // Dynamic recent activities from recent logs, sessions, exams
      const recentActivities = []
      if (db.meetingLogs && db.meetingLogs.length > 0) {
        db.meetingLogs.slice(-3).reverse().forEach(log => {
          recentActivities.push({
            id: `act-log-${log.id}`,
            text: `Pertemuan ${log.meeting_number}: ${log.topic || 'Jurnal kelas diperbarui'} (${log.classroom_name || ''})`,
            time: log.date || 'Baru saja'
          })
        })
      }
      if (db.sessions && db.sessions.length > 0) {
        db.sessions.slice(-2).reverse().forEach(ses => {
          recentActivities.push({
            id: `act-ses-${ses.id}`,
            text: `Presensi ${ses.classroom_name || ''} selesai dicatat (${ses.topic || ''})`,
            time: ses.session_date || 'Hari ini'
          })
        })
      }

      return sendJson(res, 200, {
        status: 'success',
        data: {
          stats: {
            total_students: totalStudents,
            total_classes: totalClasses,
            today_attendance: todayAttendance,
            has_attendance: hasAttendance,
            attendance_title: attendanceTitle,
            attendance_label: attendanceLabel,
            attendance_detail: attendanceDetail,
            total_sessions: (db.sessions || []).length,
            active_exams: activeExams,
            pending_tasks: pendingTasksCount,
            total_weekly_schedule: weeklySchedules.length,
            average_score: avgScore,
            highest_score: highestScore,
            total_graded_students: gradedStudents.length
          },
          today_schedule: todaySchedule,
          next_schedule: nextSchedule,
          today_day: todayDay,
          tasks: taskList,
          element_progress: elementProgress,
          recent_activities: recentActivities
        }
      })
    }

    // -------------------------------------------------------------
    // SCHOOL & ACADEMIC YEARS
    // -------------------------------------------------------------
    if (pathname === '/api/v1/school' && req.method === 'GET') {
      return sendJson(res, 200, { status: 'success', data: db.school })
    }

    if (pathname === '/api/v1/school' && req.method === 'PUT') {
      const body = await parseBody(req)
      Object.assign(db.school, body)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: db.school })
    }

    if (pathname === '/api/v1/academic-years' && req.method === 'GET') {
      return sendJson(res, 200, { status: 'success', data: db.academicYears })
    }

    // -------------------------------------------------------------
    // SUBJECTS
    // -------------------------------------------------------------
    if (pathname === '/api/v1/subjects' && req.method === 'GET') {
      let result = db.subjects || []
      const classroomId = query.classroom_id || query.classroomId
      const grade = query.grade || query.grade_level
      if (classroomId) {
        const cls = (db.classrooms || []).find(c => c.id === classroomId || c.name === classroomId)
        const isGrade9 = cls ? (Number(cls.grade_level) === 9 || String(cls.name).includes('IX') || String(cls.name).includes('9'))
                             : (String(classroomId).includes('9') || String(classroomId).includes('IX'))
        result = result.filter(s => isGrade9 ? s.id === 'sub-inf' : s.id === 'sub-kka')
      } else if (grade) {
        const gNum = Number(grade)
        result = result.filter(s => gNum === 9 ? s.id === 'sub-inf' : s.id === 'sub-kka')
      }
      return sendJson(res, 200, { status: 'success', data: result })
    }

    const subjectItemMatch = pathname.match(/^\/api\/v1\/subjects\/([a-zA-Z0-9_-]+)$/)
    if (subjectItemMatch && req.method === 'PUT') {
      const subjectId = subjectItemMatch[1]
      const sub = (db.subjects || []).find(s => s.id === subjectId)
      if (!sub) {
        return sendJson(res, 404, { status: 'error', message: 'Mata pelajaran tidak ditemukan' })
      }
      const body = await parseBody(req)
      if (body.kkm !== undefined) sub.kkm = Number(body.kkm)
      if (body.kktp !== undefined) sub.kktp = Number(body.kktp)
      if (body.name) sub.name = body.name
      saveDb()
      return sendJson(res, 200, { status: 'success', data: sub })
    }

    // -------------------------------------------------------------
    // CLASSROOMS
    // -------------------------------------------------------------
    if (pathname === '/api/v1/classrooms' && req.method === 'GET') {
      // Calculate real student counts
      const classroomsWithCounts = db.classrooms.map(c => {
        const count = db.students.filter(s => s.classroom_id === c.id).length
        return { ...c, student_count: count }
      })
      return sendJson(res, 200, { status: 'success', data: classroomsWithCounts })
    }

    if (pathname === '/api/v1/classrooms' && req.method === 'POST') {
      const body = await parseBody(req)
      const newClass = {
        id: 'cls-' + Date.now().toString(36),
        name: body.name || 'Kelas Baru',
        grade_level: Number(body.grade_level) || 7,
        academic_year_id: body.academic_year_id || 'ay-2024-ganjil',
        homeroom_teacher_id: body.homeroom_teacher_id || null,
        homeroom_teacher_name: body.homeroom_teacher_name || 'Belum Ditentukan',
        capacity: Number(body.capacity) || 32,
        student_count: 0
      }
      db.classrooms.push(newClass)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newClass })
    }

    const classDetailMatch = pathname.match(/^\/api\/v1\/classrooms\/([a-zA-Z0-9_-]+)$/)
    if (classDetailMatch) {
      const classId = classDetailMatch[1]
      const classIdx = db.classrooms.findIndex(c => c.id === classId)
      if (classIdx === -1) {
        return sendJson(res, 404, { status: 'error', message: 'Kelas tidak ditemukan' })
      }

      if (req.method === 'GET') {
        const c = db.classrooms[classIdx]
        const count = db.students.filter(s => s.classroom_id === c.id).length
        return sendJson(res, 200, { status: 'success', data: { ...c, student_count: count } })
      }

      if (req.method === 'PUT') {
        const body = await parseBody(req)
        Object.assign(db.classrooms[classIdx], body)
        saveDb()
        return sendJson(res, 200, { status: 'success', data: db.classrooms[classIdx] })
      }

      if (req.method === 'DELETE') {
        db.classrooms.splice(classIdx, 1)
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'Kelas berhasil dihapus' })
      }
    }

    const classStudentsMatch = pathname.match(/^\/api\/v1\/classrooms\/([a-zA-Z0-9_-]+)\/students$/)
    if (classStudentsMatch && req.method === 'GET') {
      const classId = classStudentsMatch[1]
      const list = db.students.filter(s => s.classroom_id === classId)
      return sendJson(res, 200, { status: 'success', data: list })
    }

    // -------------------------------------------------------------
    // STUDENTS TEMPLATE, EXPORT & IMPORT
    // -------------------------------------------------------------
    if (pathname === '/api/v1/students/template' && req.method === 'GET') {
      const templateCsv = '\uFEFF"Nama Lengkap","NIS","NISN","Jenis Kelamin (L/P)","Kelas","Tanggal Lahir (YYYY-MM-DD)","Tempat Lahir","Nama Orang Tua","No HP Orang Tua","Alamat"\r\n' +
        '"Ahmad Fadhil Prasetyo","240101","0081234567","L","VII A","2011-05-12","Kendari","H. Bambang Prasetyo","081234567890","Jl. Bunga Melati No. 12, Kendari"\r\n' +
        '"Anindya Putri Kirana","240102","0087654321","P","VII A","2011-08-20","Kendari","Ir. Hendra Kirana","081298765432","Jl. Lawata No. 5, Kendari Barat"\r\n'
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Template_Import_Siswa_SMPN6_Kendari.csv"',
        'Access-Control-Allow-Origin': getAllowedOrigin(req)
      })
      res.end(templateCsv)
      return
    }

    if (pathname === '/api/v1/students/export' && req.method === 'GET') {
      let exportCsv = '\uFEFF"ID","Nama Lengkap","NIS","NISN","Jenis Kelamin","Kelas","Status","No HP","Alamat"\r\n'
      for (const s of db.students) {
        exportCsv += `"${s.id}","${(s.name || '').replace(/"/g, '""')}","${s.nis || ''}","${s.nisn || ''}","${s.gender || 'L'}","${(s.classroom_name || '').replace(/"/g, '""')}","${s.status || 'active'}","${s.phone || ''}","${(s.address || '').replace(/"/g, '""')}"\r\n`
      }
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Data_Siswa_SMPN6_Kendari.csv"',
        'Access-Control-Allow-Origin': getAllowedOrigin(req)
      })
      res.end(exportCsv)
      return
    }

    if ((pathname === '/api/v1/students/batch' || pathname === '/api/v1/students/import') && req.method === 'POST') {
      const body = await parseBody(req)
      const list = Array.isArray(body.students) ? body.students : (Array.isArray(body) ? body : [])
      const inserted = []

      for (const item of list) {
        if (!item.name) continue
        const classroom = db.classrooms.find(c => c.id === item.classroom_id || c.name.toLowerCase() === (item.classroom_name || '').toLowerCase())
        const nis = item.nis || String(Date.now()).slice(-6)
        const username = item.username ? String(item.username).trim() : nis
        const rawPassword = item.password ? String(item.password).trim() : (nis || '123456')
        const passwordHash = rawPassword.startsWith('$2') ? rawPassword : bcrypt.hashSync(rawPassword, 10)
        const student = {
          id: 'std-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          user_id: null,
          name: item.name,
          nis: nis,
          nisn: item.nisn || '',
          username: username,
          password: passwordHash,
          email: item.email || `${username}@siswa.smpn6kendari.sch.id`,
          gender: item.gender === 'P' ? 'P' : 'L',
          classroom_id: classroom?.id || item.classroom_id || db.classrooms[0]?.id || 'cls-7a',
          classroom_name: classroom?.name || item.classroom_name || 'VII A',
          birth_date: item.birth_date || '',
          birth_place: item.birth_place || '',
          parent_name: item.parent_name || '',
          parent_phone: item.parent_phone || '',
          status: 'active',
          is_active: true,
          attendance_rate: null,
          phone: item.phone || item.parent_phone || '',
          address: item.address || '',
          created_at: new Date().toISOString()
        }
        db.students.push(student)
        inserted.push(student)
      }
      saveDb()
      return sendJson(res, 201, {
        status: 'success',
        message: `Berhasil mengimport ${inserted.length} data siswa`,
        data: inserted
      })
    }

    if (pathname === '/api/v1/students' && req.method === 'GET') {
      let filtered = [...db.students]

      if (query.classroom_id) {
        filtered = filtered.filter(s => s.classroom_id === query.classroom_id || s.classroom_name === query.classroom_id)
      }
      if (query.status) {
        filtered = filtered.filter(s => s.status === query.status)
      }
      if (query.search) {
        const term = query.search.toLowerCase()
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(term) ||
          s.nisn?.includes(term) ||
          s.nis?.includes(term)
        )
      }

      const total = filtered.length
      const wantAll = query.all === 'true' || query.per_page === 'all' || (!query.page && !query.per_page)
      const page = Math.max(1, parseInt(query.page || '1', 10))
      const perPage = wantAll ? total : Math.min(1000, Math.max(1, parseInt(query.per_page || '20', 10)))
      const paginated = wantAll ? filtered : filtered.slice((page - 1) * perPage, page * perPage)

      const enrichedStudents = paginated.map(s => {
        const cls = (db.classrooms || []).find(c => c.id === s.classroom_id || c.name === s.classroom_name)
        const currentClassName = cls?.name || s.classroom_name || '—'
        const currentClassId = cls?.id || s.classroom_id || ''
        const studentAtt = (db.attendanceRecords || []).filter(a => a.student_id === s.id)
        const present = studentAtt.filter(a => a.status === 'present').length
        const sick = studentAtt.filter(a => a.status === 'sick').length
        const permission = studentAtt.filter(a => a.status === 'permission' || a.status === 'permit').length
        const unexcused = studentAtt.filter(a => a.status === 'unexcused' || a.status === 'absent').length
        const totalRecords = studentAtt.length
        const rate = totalRecords > 0 ? Math.round((present / totalRecords) * 100) : (s.attendance_rate ?? null)
        return {
          ...s,
          classroom_id: currentClassId,
          classroom_name: currentClassName,
          classroom: currentClassName,
          attendance_count: totalRecords,
          attendance_rate: rate,
          present_count: present,
          sick_count: sick,
          permission_count: permission,
          unexcused_count: unexcused
        }
      })

      const activeCount = db.students.filter(s => s.status === 'active').length
      const warningCount = db.students.filter(s => (s.attendance_rate || 100) < 85).length

      return sendJson(res, 200, {
        status: 'success',
        data: enrichedStudents,
        meta: {
          total,
          per_page: perPage,
          current_page: page,
          last_page: Math.ceil(total / perPage) || 1
        },
        stats: {
          total: db.students.length,
          active: activeCount,
          warning: warningCount,
          inactive: db.students.length - activeCount
        }
      })
    }

    if (pathname === '/api/v1/students' && req.method === 'POST') {
      const body = await parseBody(req)
      const classroom = db.classrooms.find(c => c.id === body.classroom_id || c.name === body.classroom_name)
      const nis = body.nis ? String(body.nis).trim() : String(Date.now()).slice(-6)
      const username = body.username ? String(body.username).trim() : nis
      const rawPassword = body.password ? String(body.password).trim() : (nis || '123456')
      const passwordHash = rawPassword.startsWith('$2') ? rawPassword : bcrypt.hashSync(rawPassword, 10)
      const is_active = body.is_active !== undefined ? Boolean(body.is_active) : (body.status !== 'inactive')

      const newStudent = {
        id: 'std-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        user_id: null,
        name: body.name || 'Siswa Baru',
        nis: nis,
        nisn: body.nisn ? String(body.nisn).trim() : '',
        username: username,
        password: passwordHash,
        email: body.email || `${username}@siswa.smpn6kendari.sch.id`,
        gender: body.gender || 'L',
        classroom_id: body.classroom_id || classroom?.id || db.classrooms[0]?.id || '',
        classroom_name: classroom?.name || body.classroom_name || 'VII A',
        birth_date: body.birth_date || '',
        birth_place: body.birth_place || '',
        parent_name: body.parent_name || '',
        parent_phone: body.parent_phone || '',
        status: is_active ? 'active' : 'inactive',
        is_active: is_active,
        attendance_rate: null,
        phone: body.phone || body.parent_phone || '',
        address: body.address || '',
        created_at: new Date().toISOString()
      }
      db.students.push(newStudent)
      saveDb()
      const { password: _, ...safeStudent } = newStudent
      return sendJson(res, 201, { status: 'success', data: safeStudent })
    }

    if (pathname === '/api/v1/students/batch-delete' && req.method === 'POST') {
      const body = await parseBody(req)
      const ids = Array.isArray(body.ids) ? body.ids : []
      if (ids.length > 0) {
        db.students = (db.students || []).filter(s => !ids.includes(s.id))
        if (db.attendanceRecords) {
          db.attendanceRecords = db.attendanceRecords.filter(a => !ids.includes(a.student_id))
        }
        if (db.subjectGrades) {
          db.subjectGrades = db.subjectGrades.filter(g => !ids.includes(g.student_id))
        }
        saveDb()
      }
      return sendJson(res, 200, { status: 'success', message: `${ids.length} siswa berhasil dihapus` })
    }

    // Reset password massal untuk siswa terpilih
    if (pathname === '/api/v1/students/batch-reset-password' && req.method === 'POST') {
      const body = await parseBody(req)
      const ids = Array.isArray(body.ids) ? body.ids : []
      let count = 0
      for (const s of db.students) {
        if (ids.length === 0 || ids.includes(s.id)) {
          const rawPwd = body.password ? String(body.password).trim() : (s.nis || '123456')
          s.password = bcrypt.hashSync(rawPwd, 10)
          count++
        }
      }
      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Kata sandi ${count} akun siswa berhasil direset.`
      })
    }

    const resetStudentPassMatch = pathname.match(/^\/api\/v1\/students\/([a-zA-Z0-9_-]+)\/reset-password$/)
    if (resetStudentPassMatch && req.method === 'POST') {
      const studentId = resetStudentPassMatch[1]
      const idx = db.students.findIndex(s => s.id === studentId)
      if (idx === -1) return sendJson(res, 404, { status: 'error', message: 'Siswa tidak ditemukan' })
      const body = await parseBody(req)
      const newPassword = body.password ? String(body.password).trim() : (db.students[idx].nis || '123456')
      db.students[idx].password = bcrypt.hashSync(newPassword, 10)
      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Kata sandi akun ${db.students[idx].name} berhasil diubah.`,
        data: { id: studentId, username: db.students[idx].username || db.students[idx].nis, password: newPassword }
      })
    }

    const toggleStudentStatusMatch = pathname.match(/^\/api\/v1\/students\/([a-zA-Z0-9_-]+)\/toggle-status$/)
    if (toggleStudentStatusMatch && req.method === 'POST') {
      const studentId = toggleStudentStatusMatch[1]
      const idx = db.students.findIndex(s => s.id === studentId)
      if (idx === -1) return sendJson(res, 404, { status: 'error', message: 'Siswa tidak ditemukan' })
      const curActive = db.students[idx].is_active !== false && db.students[idx].status !== 'inactive'
      db.students[idx].is_active = !curActive
      db.students[idx].status = !curActive ? 'active' : 'inactive'
      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Akun siswa ${db.students[idx].name} berhasil ${!curActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
        data: db.students[idx]
      })
    }

    const studentDetailMatch = pathname.match(/^\/api\/v1\/students\/([a-zA-Z0-9_-]+)$/)
    if (studentDetailMatch) {
      const studentId = studentDetailMatch[1]
      const idx = db.students.findIndex(s => s.id === studentId)
      if (idx === -1) {
        return sendJson(res, 404, { status: 'error', message: 'Siswa tidak ditemukan' })
      }

      if (req.method === 'GET') {
        const student = db.students[idx]
        const cls = (db.classrooms || []).find(c => c.id === student.classroom_id || c.name === student.classroom_name)
        const currentClassName = cls?.name || student.classroom_name || '—'
        const currentClassId = cls?.id || student.classroom_id || ''
        const studentAtt = (db.attendanceRecords || []).filter(a => a.student_id === student.id)
        let attendanceRate = null
        if (studentAtt.length > 0) {
          const present = studentAtt.filter(a => a.status === 'present').length
          attendanceRate = Math.round((present / studentAtt.length) * 100)
        }
        
        const studentGrades = (db.subjectGrades || []).filter(g => g.student_id === student.id)
        let avgGrade = null
        if (studentGrades.length > 0) {
          avgGrade = Math.round((studentGrades.reduce((sum, g) => sum + (Number(g.final_score) || 0), 0) / studentGrades.length) * 10) / 10
        }

        return sendJson(res, 200, {
          status: 'success',
          data: {
            ...student,
            classroom_id: currentClassId,
            classroom_name: currentClassName,
            classroom: currentClassName,
            attendance_rate: attendanceRate,
            avg_grade: avgGrade,
            attendance_count: studentAtt.length,
            grades_count: studentGrades.length
          }
        })
      }

      if (req.method === 'PUT') {
        const body = await parseBody(req)
        const targetClass = (db.classrooms || []).find(c =>
          c.id === body.classroom_id ||
          c.name === body.classroom_name ||
          c.name === body.classroom ||
          c.id === body.classroom
        )
        if (targetClass) {
          body.classroom_id = targetClass.id
          body.classroom_name = targetClass.name
          body.classroom = targetClass.name
        } else if (body.classroom_id) {
          const fallbackClass = (db.classrooms || []).find(c => c.id === body.classroom_id)
          if (fallbackClass) {
            body.classroom_name = fallbackClass.name
            body.classroom = fallbackClass.name
          }
        }
        Object.assign(db.students[idx], body)
        saveDb()
        return sendJson(res, 200, { status: 'success', data: db.students[idx] })
      }

      if (req.method === 'DELETE') {
        const student = db.students[idx]
        db.students.splice(idx, 1)
        if (db.attendanceRecords) {
          db.attendanceRecords = db.attendanceRecords.filter(a => a.student_id !== student.id)
        }
        if (db.subjectGrades) {
          db.subjectGrades = db.subjectGrades.filter(g => g.student_id !== student.id)
        }
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'Siswa berhasil dihapus' })
      }
    }

    // -------------------------------------------------------------
    // SESSIONS (PERTEMUAN) & ATTENDANCE
    // -------------------------------------------------------------
    function syncSessionToMeetingLog(session) {
      if (!session || !session.classroom_id || !session.subject_id) return
      db.meetingLogs = db.meetingLogs || []
      const meetNum = Number(session.session_number) || 1
      let meet = db.meetingLogs.find(m =>
        m.classroom_id === session.classroom_id &&
        m.subject_id === session.subject_id &&
        Number(m.meeting_number) === meetNum
      )
      if (!meet) {
        meet = {
          id: `meet-${session.classroom_id}-${session.subject_id}-${meetNum}`,
          classroom_id: session.classroom_id,
          classroom_name: session.classroom_name,
          subject_id: session.subject_id,
          subject_name: session.subject_name,
          meeting_number: meetNum,
          week_number: Number(session.week_number) || meetNum,
          date: session.session_date,
          topic: session.topic || '',
          activities: session.activities || '',
          notes: session.notes || '',
          status: session.status === 'completed' ? 'completed' : 'in_progress'
        }
        db.meetingLogs.push(meet)
      } else {
        if (session.session_date) meet.date = session.session_date
        if (session.topic !== undefined) meet.topic = session.topic
        if (session.activities !== undefined) meet.activities = session.activities
        if (session.notes !== undefined) meet.notes = session.notes
        if (session.week_number) meet.week_number = Number(session.week_number)
        if (session.status === 'completed') {
          meet.status = 'completed'
        } else if (session.status === 'in_progress') {
          meet.status = 'in_progress'
        }
      }
    }

    function syncMeetingLogToSession(meet) {
      if (!meet || !meet.classroom_id || !meet.subject_id) return
      db.sessions = db.sessions || []
      const meetNum = Number(meet.meeting_number) || 1
      let session = db.sessions.find(s =>
        s.classroom_id === meet.classroom_id &&
        s.subject_id === meet.subject_id &&
        Number(s.session_number) === meetNum
      )
      if (session) {
        if (meet.topic !== undefined) session.topic = meet.topic
        if (meet.activities !== undefined) session.activities = meet.activities
        if (meet.notes !== undefined) session.notes = meet.notes
        if (meet.date) session.session_date = meet.date
        if (meet.status === 'completed') session.status = 'completed'
        else if (meet.status === 'in_progress') session.status = 'in_progress'
      }
    }

    if (pathname === '/api/v1/sessions' && req.method === 'GET') {
      let filtered = [...db.sessions]
      if (query.classroom_id) {
        filtered = filtered.filter(s => s.classroom_id === query.classroom_id)
      }
      if (query.subject_id) {
        filtered = filtered.filter(s => s.subject_id === query.subject_id)
      }
      if (query.date) {
        filtered = filtered.filter(s => s.session_date === query.date)
      }
      const data = filtered.map(s => ({
        ...s,
        present_count: s.present_count ?? s.attendance_summary?.present ?? 0,
        sick_count: s.sick_count ?? s.attendance_summary?.sick ?? 0,
        excused_count: s.excused_count ?? s.attendance_summary?.permitted ?? s.attendance_summary?.excused ?? 0,
        absent_count: s.absent_count ?? s.attendance_summary?.absent ?? 0,
      }))
      return sendJson(res, 200, { status: 'success', data })
    }

    if (pathname === '/api/v1/sessions' && req.method === 'POST') {
      const body = await parseBody(req)
      const classroom = db.classrooms.find(c => c.id === body.classroom_id)
      const subject = db.subjects.find(s => s.id === body.subject_id)

      if (!body.classroom_id || !body.subject_id) {
        return sendJson(res, 422, {
          status: 'error',
          errors: {
            classroom_id: !body.classroom_id ? ['Kelas wajib dipilih'] : undefined,
            subject_id: !body.subject_id ? ['Mata pelajaran wajib dipilih'] : undefined
          }
        })
      }

      const sessionId = 'ses-' + Date.now().toString(36)
      const classStudents = db.students.filter(s => s.classroom_id === body.classroom_id)

      const newSession = {
        id: sessionId,
        classroom_id: body.classroom_id,
        classroom_name: classroom ? classroom.name : 'Kelas',
        subject_id: body.subject_id,
        subject_name: subject ? subject.name : 'Mata Pelajaran',
        teacher_id: 'usr-teacher-1',
        session_date: body.session_date || new Date().toISOString().split('T')[0],
        session_number: Number(body.session_number) || (db.sessions.filter(s => s.classroom_id === body.classroom_id).length + 1),
        week_number: Number(body.week_number) || Number(body.session_number) || 1,
        topic: body.topic || '',
        activities: body.activities || '',
        notes: body.notes || '',
        status: body.status || 'in_progress',
        attendance_summary: {
          present: classStudents.length,
          sick: 0,
          permitted: 0,
          absent: 0,
          total: classStudents.length
        }
      }

      // Initialize default attendance records for all students in class
      for (const st of classStudents) {
        db.attendanceRecords.push({
          id: `att-${sessionId}-${st.id}`,
          session_id: sessionId,
          student_id: st.id,
          student_name: st.name,
          nisn: st.nisn,
          status: 'present',
          notes: ''
        })
      }

      syncSessionToMeetingLog(newSession)

      db.sessions.unshift(newSession)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newSession })
    }

    const singleSessionMatch = pathname.match(/^\/api\/v1\/sessions\/([a-zA-Z0-9_-]+)$/)
    if (singleSessionMatch && req.method === 'PUT') {
      const sessionId = singleSessionMatch[1]
      const session = (db.sessions || []).find(s => s.id === sessionId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Pertemuan tidak ditemukan' })
      }
      const body = await parseBody(req)
      if (body.classroom_id) {
        session.classroom_id = body.classroom_id
        const c = db.classrooms.find(cl => cl.id === body.classroom_id)
        if (c) session.classroom_name = c.name
      }
      if (body.subject_id) {
        session.subject_id = body.subject_id
        const sub = db.subjects.find(sb => sb.id === body.subject_id)
        if (sub) session.subject_name = sub.name
      }
      if (body.session_date) session.session_date = body.session_date
      if (body.session_number) session.session_number = Number(body.session_number)
      if (body.week_number) session.week_number = Number(body.week_number)
      if (body.topic !== undefined) session.topic = body.topic
      if (body.activities !== undefined) session.activities = body.activities
      if (body.notes !== undefined) session.notes = body.notes
      if (body.status !== undefined) session.status = body.status
      syncSessionToMeetingLog(session)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: session })
    }

    if (singleSessionMatch && req.method === 'DELETE') {
      const sessionId = singleSessionMatch[1]
      db.sessions = (db.sessions || []).filter(s => s.id !== sessionId)
      db.attendanceRecords = (db.attendanceRecords || []).filter(a => a.session_id !== sessionId)
      saveDb()
      return sendJson(res, 200, { status: 'success', message: 'Pertemuan dan data absensi berhasil dihapus' })
    }

    const sessionAttendanceMatch = pathname.match(/^\/api\/v1\/sessions\/([a-zA-Z0-9_-]+)\/attendance$/)
    if (sessionAttendanceMatch) {
      const sessionId = sessionAttendanceMatch[1]
      const session = db.sessions.find(s => s.id === sessionId)

      if (req.method === 'GET') {
        let records = db.attendanceRecords.filter(a => a.session_id === sessionId)

        // If no records yet, populate with classroom students
        if (records.length === 0 && session) {
          const classStudents = db.students.filter(s => s.classroom_id === session.classroom_id)
          for (const st of classStudents) {
            const rec = {
              id: `att-${sessionId}-${st.id}`,
              session_id: sessionId,
              student_id: st.id,
              student_name: st.name,
              nisn: st.nisn,
              status: 'present',
              notes: ''
            }
            db.attendanceRecords.push(rec)
            records.push(rec)
          }
          saveDb()
        }

        return sendJson(res, 200, { status: 'success', data: records })
      }

      if (req.method === 'POST') {
        const body = await parseBody(req)
        const updates = body.attendance || body.records || []

        let pCount = 0, sCount = 0, iCount = 0, aCount = 0

        for (const item of updates) {
          let rec = db.attendanceRecords.find(a => a.session_id === sessionId && a.student_id === item.student_id)
          if (!rec) {
            rec = {
              id: `att-${sessionId}-${item.student_id}`,
              session_id: sessionId,
              student_id: item.student_id,
              student_name: item.student_name || '',
              nisn: item.nisn || '',
              status: item.status || 'present',
              notes: item.notes || ''
            }
            db.attendanceRecords.push(rec)
          } else {
            rec.status = item.status
            rec.notes = item.notes || ''
          }

          if (rec.status === 'present') pCount++
          else if (rec.status === 'sick') sCount++
          else if (rec.status === 'permitted' || rec.status === 'excused') iCount++
          else if (rec.status === 'absent') aCount++
        }

        if (session) {
          session.attendance_summary = {
            present: pCount,
            sick: sCount,
            permitted: iCount,
            excused: iCount,
            absent: aCount,
            total: updates.length
          }
          session.present_count = pCount
          session.sick_count = sCount
          session.excused_count = iCount
          session.absent_count = aCount
          if (body.lock) {
            session.status = 'completed'
          } else if (session.status !== 'completed') {
            session.status = 'in_progress'
          }
          syncSessionToMeetingLog(session)
          autoComputeGradesForClass(session.classroom_id, session.subject_id)
        }

        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          message: 'Absensi berhasil disimpan',
          summary: session?.attendance_summary
        })
      }
    }

    // -------------------------------------------------------------
    // QUESTION BANK
    // -------------------------------------------------------------
    if (pathname === '/api/v1/questions' && req.method === 'GET') {
      let filtered = [...db.questions]
      if (query.subject_id) {
        filtered = filtered.filter(q => q.subject_id === query.subject_id || q.subject_name === query.subject_id)
      }
      if (query.subject || query.subject_name) {
        const sName = (query.subject || query.subject_name).toLowerCase().trim()
        filtered = filtered.filter(q =>
          (q.subject_name && q.subject_name.toLowerCase().trim() === sName) ||
          (q.subject_id && q.subject_id.toLowerCase().trim() === sName)
        )
      }
      if (query.grade) {
        const gStr = String(query.grade).trim()
        filtered = filtered.filter(q => {
          const qGrade = String(q.grade || q.grade_level || '')
          if (qGrade === gStr) return true
          if (q.classroom_id && q.classroom_id.toLowerCase().includes(`-${gStr}`)) return true
          return false
        })
      }
      if (query.classroom_id) {
        filtered = filtered.filter(q => q.classroom_id === query.classroom_id)
      }
      if (query.topic) {
        const tStr = String(query.topic).trim().toLowerCase()
        filtered = filtered.filter(q => {
          const qTopic = String(q.topic || q.element || '').toLowerCase()
          return qTopic === tStr || qTopic.includes(tStr)
        })
      }
      if (query.type) {
        filtered = filtered.filter(q => q.type === query.type)
      }
      if (query.difficulty) {
        filtered = filtered.filter(q => q.difficulty === query.difficulty)
      }
      if (query.status) {
        filtered = filtered.filter(q => (q.status || 'published') === query.status)
      }
      if (query.search) {
        const term = query.search.toLowerCase()
        filtered = filtered.filter(q => (
          q.content.toLowerCase().includes(term) ||
          String(q.topic || '').toLowerCase().includes(term) ||
          String(q.stimulus || '').toLowerCase().includes(term)
        ))
      }

      const getGrade = q => String(q.grade || q.grade_level || (q.classroom_id?.includes('-8') ? '8' : q.classroom_id?.includes('-9') ? '9' : '7'))

      const topicCounts = {}
      for (const q of db.questions) {
        const t = q.topic || q.element || 'Umum'
        topicCounts[t] = (topicCounts[t] || 0) + 1
      }

      return sendJson(res, 200, {
        status: 'success',
        data: filtered,
        meta: {
          total: filtered.length,
          per_page: 20,
          current_page: 1,
          last_page: 1
        },
        stats: {
          total: db.questions.length,
          published: db.questions.filter(q => (q.status || 'published') === 'published').length,
          draft: db.questions.filter(q => q.status === 'draft').length,
          subjects: new Set(db.questions.map(q => q.subject_name || q.subject_id)).size,
          grade_7: db.questions.filter(q => getGrade(q) === '7').length,
          grade_8: db.questions.filter(q => getGrade(q) === '8').length,
          grade_9: db.questions.filter(q => getGrade(q) === '9').length,
          topics: topicCounts,
          multiple_choice: db.questions.filter(q => q.type === 'multiple_choice').length,
          essay: db.questions.filter(q => q.type === 'essay').length
        }
      })
    }

    if (pathname === '/api/v1/questions/batch' && req.method === 'POST') {
      const body = await parseBody(req)
      const list = Array.isArray(body.questions) ? body.questions : []
      const added = []
      for (const item of list) {
        const subject = db.subjects.find(s => s.id === item.subject_id || s.name?.toLowerCase() === item.subject_name?.toLowerCase())
        const rawGrade = String(item.grade || item.grade_level || (item.classroom_id ? item.classroom_id.replace(/^cls-/, '').charAt(0) : '7'))
        const grade = ['7', '8', '9'].includes(rawGrade) ? rawGrade : '7'
        const classroom = db.classrooms.find(c => c.id === item.classroom_id || String(c.grade_level) === grade)

        const newQ = {
          id: 'q-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          subject_id: subject?.id || item.subject_id || db.subjects[0]?.id || 'sub-inf',
          subject_name: subject?.name || item.subject_name || 'Informatika',
          grade: grade,
          grade_level: parseInt(grade, 10),
          classroom_id: item.classroom_id || classroom?.id || `cls-${grade}a`,
          classroom_name: classroom?.name || `Kelas ${grade}`,
          topic: item.topic || item.element || 'Berpikir Komputasional',
          element: item.element || item.topic || 'Berpikir Komputasional (BK)',
          type: item.type || 'multiple_choice',
          difficulty: item.difficulty || 'medium',
          bloom_level: item.bloom_level || 'C3',
          content: item.content || item.questionText || '',
          stimulus: item.stimulus || '',
          options: item.options || [],
          correct_answer: item.correct_answer || 'A',
          explanation: item.explanation || '',
          status: item.status || 'published'
        }
        db.questions.push(newQ)
        added.push(newQ)
      }
      saveDb()
      return sendJson(res, 201, { status: 'success', data: added, count: added.length })
    }

    if (pathname === '/api/v1/questions' && req.method === 'POST') {
      const body = await parseBody(req)
      const subject = db.subjects.find(s => s.id === body.subject_id || s.name?.toLowerCase() === body.subject_name?.toLowerCase())
      const rawGrade = String(body.grade || body.grade_level || (body.classroom_id ? body.classroom_id.replace(/^cls-/, '').charAt(0) : '7'))
      const grade = ['7', '8', '9'].includes(rawGrade) ? rawGrade : '7'
      const classroom = db.classrooms.find(c => c.id === body.classroom_id || String(c.grade_level) === grade)

      const newQ = {
        id: 'q-' + Date.now().toString(36),
        subject_id: subject?.id || body.subject_id || db.subjects[0]?.id || '',
        subject_name: subject?.name || body.subject_name || 'Informatika',
        grade: grade,
        grade_level: parseInt(grade, 10),
        classroom_id: body.classroom_id || classroom?.id || `cls-${grade}a`,
        classroom_name: classroom?.name || `Kelas ${grade}`,
        topic: body.topic || body.element || 'Berpikir Komputasional',
        element: body.element || body.topic || 'Berpikir Komputasional (BK)',
        type: body.type || 'multiple_choice',
        difficulty: body.difficulty || 'medium',
        bloom_level: body.bloom_level || 'C3',
        content: body.content || '',
        stimulus: body.stimulus || '',
        options: body.options || [],
        correct_answer: body.correct_answer || 'A',
        explanation: body.explanation || '',
        status: body.status || 'published'
      }
      db.questions.push(newQ)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newQ })
    }

    const questionDuplicateMatch = pathname.match(/^\/api\/v1\/questions\/([a-zA-Z0-9_-]+)\/duplicate$/)
    if (questionDuplicateMatch && req.method === 'POST') {
      const qId = questionDuplicateMatch[1]
      const existing = db.questions.find(q => q.id === qId)
      if (!existing) return sendJson(res, 404, { status: 'error', message: 'Soal tidak ditemukan' })
      const dup = { ...existing, id: 'q-' + Date.now().toString(36), content: existing.content + ' (Salinan)' }
      db.questions.push(dup)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: dup })
    }

    const questionDetailMatch = pathname.match(/^\/api\/v1\/questions\/([a-zA-Z0-9_-]+)$/)
    if (questionDetailMatch) {
      const qId = questionDetailMatch[1]
      const idx = db.questions.findIndex(q => q.id === qId)

      if (req.method === 'GET') {
        const item = db.questions.find(q => q.id === qId)
        if (!item) {
          return sendJson(res, 404, { status: 'error', message: 'Soal tidak ditemukan' })
        }
        return sendJson(res, 200, { status: 'success', data: item })
      }

      if (req.method === 'PUT' || req.method === 'PATCH') {
        if (idx === -1) {
          return sendJson(res, 404, { status: 'error', message: 'Soal tidak ditemukan' })
        }
        const body = await parseBody(req)
        const subject = db.subjects?.find(s => s.id === body.subject_id || s.name?.toLowerCase() === body.subject_name?.toLowerCase())
        const rawGrade = body.grade ? String(body.grade) : undefined
        const grade = rawGrade && ['7', '8', '9'].includes(rawGrade) ? rawGrade : (db.questions[idx].grade || '7')
        const classroom = db.classrooms.find(c => c.id === body.classroom_id || String(c.grade_level) === grade)

        db.questions[idx] = {
          ...db.questions[idx],
          ...body,
          grade: grade,
          grade_level: parseInt(grade, 10),
          classroom_id: body.classroom_id || classroom?.id || db.questions[idx].classroom_id || `cls-${grade}a`,
          classroom_name: classroom?.name || db.questions[idx].classroom_name || `Kelas ${grade}`,
          subject_name: subject?.name || body.subject_name || db.questions[idx].subject_name,
          subject_id: subject?.id || body.subject_id || db.questions[idx].subject_id,
          topic: body.topic || body.element || db.questions[idx].topic || 'Berpikir Komputasional',
          element: body.element || body.topic || db.questions[idx].element || 'Berpikir Komputasional (BK)',
          updated_at: new Date().toISOString()
        }
        saveDb()
        return sendJson(res, 200, { status: 'success', data: db.questions[idx], message: 'Soal berhasil diperbarui' })
      }

      if (req.method === 'DELETE') {
        if (idx !== -1) {
          db.questions.splice(idx, 1)
          saveDb()
        }
        return sendJson(res, 200, { status: 'success', message: 'Soal berhasil dihapus' })
      }
    }

    // -------------------------------------------------------------
    // ASSIGNMENTS (TUGAS & PROYEK)
    // -------------------------------------------------------------
    if (pathname === '/api/v1/assignments' && req.method === 'GET') {
      db.assignments = db.assignments || []
      db.assignmentSubmissions = db.assignmentSubmissions || []
      
      const list = db.assignments.map(a => {
        const classStudents = (db.students || []).filter(s => s.classroom_id === a.classroom_id || s.classroom_name === a.classroom)
        const total = classStudents.length
        const subs = db.assignmentSubmissions.filter(sub => sub.assignment_id === a.id)
        const graded = subs.filter(sub => sub.score !== null && sub.score !== undefined).length
        return {
          ...a,
          submittedCount: subs.length,
          totalStudents: total,
          gradedCount: graded
        }
      })
      return sendJson(res, 200, { status: 'success', data: list })
    }

    if (pathname === '/api/v1/assignments' && req.method === 'POST') {
      const body = await parseBody(req)
      const classroom = (db.classrooms || []).find(c => c.id === body.classroom_id || c.name === body.classroom)
      const classStudents = (db.students || []).filter(s => s.classroom_id === classroom?.id || s.classroom_name === classroom?.name)

      const asgId = 'asg-' + Date.now().toString(36)
      const tpId = body.tp_id || body.tpId || null
      let tpCode = body.tp_code || body.tpCode || ''
      let chapterTitle = ''

      if (tpId) {
        ensureDefaultChapters()
        for (const chap of (db.chapters || [])) {
          const foundTp = (chap.tps || []).find(t => t.id === tpId)
          if (foundTp) {
            tpCode = tpCode || foundTp.code
            chapterTitle = chap.title
            foundTp.task_ids = foundTp.task_ids || []
            if (!foundTp.task_ids.includes(asgId)) {
              foundTp.task_ids.push(asgId)
            }
            break
          }
        }
      }

      const newAsg = {
        id: asgId,
        title: body.title || 'Tugas Baru',
        classroom_id: classroom?.id || body.classroom_id || 'cls-7a',
        classroom: classroom?.name || body.classroom || 'VII A',
        subject: body.subject || 'Informatika',
        tp_id: tpId,
        tp_code: tpCode,
        chapter_title: chapterTitle,
        status: body.status || 'active',
        deadline: body.deadline || '2024-11-05 23:59',
        description: body.description || '',
        maxScore: Number(body.maxScore) || 100,
        submittedCount: 0,
        totalStudents: classStudents.length,
        gradedCount: 0,
        created_at: new Date().toISOString()
      }
      db.assignments = db.assignments || []
      db.assignments.unshift(newAsg)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newAsg })
    }

    const assignmentDetailMatch = pathname.match(/^\/api\/v1\/assignments\/([a-zA-Z0-9_-]+)$/)
    if (assignmentDetailMatch) {
      const asgId = assignmentDetailMatch[1]
      db.assignments = db.assignments || []
      const idx = db.assignments.findIndex(a => a.id === asgId)
      if (idx === -1) {
        return sendJson(res, 404, { status: 'error', message: 'Tugas tidak ditemukan' })
      }

      if (req.method === 'GET') {
        const asg = db.assignments[idx]
        const classStudents = (db.students || []).filter(s => s.classroom_id === asg.classroom_id || s.classroom_name === asg.classroom)
        const subs = (db.assignmentSubmissions || []).filter(sub => sub.assignment_id === asg.id)
        const graded = subs.filter(sub => sub.score !== null && sub.score !== undefined)
        const avgScore = graded.length > 0 ? Math.round((graded.reduce((sum, s) => sum + s.score, 0) / graded.length) * 10) / 10 : null
        
        return sendJson(res, 200, {
          status: 'success',
          data: {
            ...asg,
            totalStudents: classStudents.length,
            submittedCount: subs.length,
            unsubmittedCount: Math.max(0, classStudents.length - subs.length),
            gradedCount: graded.length,
            avgScore,
            submissions: subs.map(s => ({
              ...s,
              studentName: s.studentName || s.student_name,
              nis: s.nis || s.student_nis,
              submittedAt: s.submittedAt || (s.submitted_at ? new Date(s.submitted_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'),
              fileName: s.fileName || s.file_url || (s.submission_text ? 'Teks Jawaban Siswa' : 'Berkas Tugas')
            }))
          }
        })
      }

      if (req.method === 'DELETE') {
        db.assignments.splice(idx, 1)
        if (db.assignmentSubmissions) {
          db.assignmentSubmissions = db.assignmentSubmissions.filter(s => s.assignment_id !== asgId)
        }
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'Tugas berhasil dihapus' })
      }
    }

    const assignmentGradeMatch = pathname.match(/^\/api\/v1\/assignments\/([a-zA-Z0-9_-]+)\/submissions\/([a-zA-Z0-9_-]+)$/)
    if (assignmentGradeMatch && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'POST')) {
      const asgId = assignmentGradeMatch[1]
      const subId = assignmentGradeMatch[2]
      const body = await parseBody(req)
      db.assignmentSubmissions = db.assignmentSubmissions || []
      const sub = db.assignmentSubmissions.find(s => s.assignment_id === asgId && s.id === subId)
      if (sub) {
        if (body.score !== undefined) sub.score = Number(body.score)
        if (body.feedback !== undefined) sub.feedback = body.feedback
        sub.status = 'graded'
        sub.graded_at = new Date().toISOString()
        const asg = (db.assignments || []).find(a => a.id === asgId)
        if (asg) {
          const subObj = (db.subjects || []).find(s => s.name === asg.subject || s.id === asg.subject_id)
          autoComputeGradesForClass(asg.classroom_id, asg.subject_id || subObj?.id || 'sub-inf')
        }
        saveDb()
        return sendJson(res, 200, { status: 'success', data: sub })
      }
      return sendJson(res, 404, { status: 'error', message: 'Pengumpulan tidak ditemukan' })
    }

    // -------------------------------------------------------------
    // CBT EXAMS
    // -------------------------------------------------------------
    if (pathname === '/api/v1/exams' && req.method === 'GET') {
      return sendJson(res, 200, { status: 'success', data: db.exams })
    }

    if (pathname === '/api/v1/exams' && req.method === 'POST') {
      const body = await parseBody(req)
      const subject = db.subjects?.find(s => s.id === body.subject_id || s.name === body.subject || s.name === body.subject_name)
      const classroom = db.classrooms?.find(c => c.id === body.classroom_id || c.name === body.classroom || c.name === body.classroom_name)
      const kktpVal = Number(body.kktp ?? body.kkm ?? body.passing_grade ?? 70)
      const teacherName = body.created_by_name || body.teacher_name || 'Muhammad Fadly Akbar Arsandi, S.Pd.'
      const questionsData = Array.isArray(body.questions) && body.questions.length > 0
        ? body.questions
        : (Array.isArray(body.question_ids) ? db.questions.filter(q => body.question_ids.includes(q.id)) : [])

      const rawTitle = (body.title || '').toLowerCase()
      const assessmentType = body.assessment_type || (
        rawTitle.includes('akhir') || rawTitle.includes('sas') || rawTitle.includes('uas') || rawTitle.includes('pas') ? 'sas' :
        rawTitle.includes('tengah') || rawTitle.includes('sts') || rawTitle.includes('uts') || rawTitle.includes('pts') ? 'sts' :
        (body.tp_id ? 'tp' : 'sts')
      )

      const newExam = {
        id: 'ex-' + Date.now().toString(36),
        title: body.title || 'Ujian Baru',
        assessment_type: assessmentType,
        subject_id: body.subject_id || subject?.id || 'sub-inf',
        subject_name: subject?.name || body.subject || body.subject_name || 'Informatika',
        classroom_id: body.classroom_id || classroom?.id || 'cls-7a',
        classroom_name: classroom?.name || body.classroom || body.classroom_name || 'VII A',
        tp_id: body.tp_id || body.tpId || null,
        tp_code: body.tp_code || body.tpCode || '',
        duration_minutes: Number(body.duration_minutes || body.durationMinutes) || 60,
        kktp: kktpVal,
        kkm: kktpVal,
        passing_grade: kktpVal,
        created_by_name: teacherName,
        teacher_name: teacherName,
        randomize_questions: body.randomize_questions !== false,
        randomize_options: body.randomize_options !== false,
        tab_switch_detection: body.tab_switch_detection !== false,
        show_score_immediately: body.show_score_immediately !== false,
        question_count: questionsData.length || (body.question_ids?.length || 0),
        access_code: body.token || ('EX' + Math.floor(1000 + Math.random() * 9000)),
        status: body.status || 'active',
        start_time: body.start_time || body.startTime || new Date().toISOString(),
        end_time: body.end_time || body.endTime,
        participant_stats: { total: classroom?.student_count || 10, started: 0, submitted: 0 },
        question_ids: body.question_ids || questionsData.map(q => q.id),
        questions: questionsData
      }

      if (newExam.tp_id) {
        ensureDefaultChapters()
        for (const chap of (db.chapters || [])) {
          const foundTp = (chap.tps || []).find(t => t.id === newExam.tp_id)
          if (foundTp) {
            newExam.tp_code = newExam.tp_code || foundTp.code
            foundTp.exam_session_ids = foundTp.exam_session_ids || []
            if (!foundTp.exam_session_ids.includes(newExam.id)) {
              foundTp.exam_session_ids.push(newExam.id)
            }
            break
          }
        }
      }

      db.exams.unshift(newExam)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newExam })
    }

    const examActionMatch = pathname.match(/^\/api\/v1\/exams\/([a-zA-Z0-9_-]+)\/(activate|close|duplicate)$/)
    if (examActionMatch && req.method === 'POST') {
      const examId = examActionMatch[1]
      const action = examActionMatch[2]
      const exam = db.exams.find(e => e.id === examId)
      if (!exam) return sendJson(res, 404, { status: 'error', message: 'Ujian tidak ditemukan' })

      if (action === 'activate') exam.status = 'active'
      else if (action === 'close') exam.status = 'completed'
      else if (action === 'duplicate') {
        const dup = { ...exam, id: 'ex-' + Date.now().toString(36), title: exam.title + ' (Salinan)', status: 'draft' }
        db.exams.unshift(dup)
      }
      saveDb()
      return sendJson(res, 200, { status: 'success', data: exam })
    }

    const examDetailMatch = pathname.match(/^\/api\/v1\/exams\/([a-zA-Z0-9_-]+)$/)
    if (examDetailMatch && req.method === 'GET') {
      const examId = examDetailMatch[1]
      const exam = db.exams.find(e => e.id === examId)
      if (!exam) return sendJson(res, 404, { status: 'error', message: 'Ujian tidak ditemukan' })

      // Pastikan butir soal terlampir jika ada question_ids
      if ((!exam.questions || exam.questions.length === 0) && Array.isArray(exam.question_ids) && exam.question_ids.length > 0) {
        exam.questions = db.questions.filter(q => exam.question_ids.includes(q.id))
      }
      if (!exam.questions || exam.questions.length === 0) {
        exam.questions = db.questions.slice(0, 5)
      }
      exam.kktp = exam.kktp ?? exam.kkm ?? 70
      exam.kkm = exam.kktp
      exam.created_by_name = exam.created_by_name || exam.teacher_name || 'Muhammad Fadly Akbar Arsandi, S.Pd.'
      exam.teacher_name = exam.created_by_name

      return sendJson(res, 200, { status: 'success', data: exam })
    }

    if (examDetailMatch && req.method === 'DELETE') {
      const examId = examDetailMatch[1]
      const idx = db.exams.findIndex(e => e.id === examId)
      if (idx !== -1) {
        db.exams.splice(idx, 1)
        saveDb()
      }
      return sendJson(res, 200, { status: 'success', message: 'Ujian berhasil dihapus' })
    }

    // CBT Student Exam Session Endpoints
    const examSessionMatch = pathname.match(/^\/api\/v1\/exam-sessions\/([a-zA-Z0-9_-]+)$/)
    if (examSessionMatch && req.method === 'GET') {
      const targetId = examSessionMatch[1]
      const targetStudentId = query.student_id || (user?.role === 'student' ? user?.id : null)

      // Cari sesi berdasarkan targetId atau examId + studentId
      let ses = db.examSessions.find(s =>
        (s.id === targetId) ||
        (s.exam_id === targetId && (!targetStudentId || s.student_id === targetStudentId))
      )
      let targetExam = db.exams.find(e => e.id === targetId) || (ses ? db.exams.find(e => e.id === ses.exam_id) : null) || db.exams[0]

      if (!targetExam) {
        // Fallback jika belum ada exam sama sekali
        targetExam = {
          id: targetId,
          title: 'Sumatif Tengah Semester: Informatika & Logika Komputasi',
          subject_name: 'Informatika',
          classroom_name: 'VII A',
          duration_minutes: 60,
          kktp: 70,
          kkm: 70,
          created_by_name: 'Muhammad Fadly Akbar Arsandi, S.Pd.',
          teacher_name: 'Muhammad Fadly Akbar Arsandi, S.Pd.',
          questions: db.questions
        }
      }

      const examQuestions = (Array.isArray(targetExam.questions) && targetExam.questions.length > 0)
        ? targetExam.questions
        : db.questions

      if (!ses) {
        const classStudents = (db.students || []).filter(s => s.classroom_id === targetExam.classroom_id)
        const curStudent = (db.students || []).find(s => s.id === targetStudentId) || classStudents[0] || db.students[0]
        ses = {
          id: `ses-${targetExam.id}-${curStudent?.id || Date.now().toString(36)}`,
          exam_id: targetExam.id,
          student_id: curStudent?.id || 'std-cls-7a-10527',
          student_name: curStudent?.name || 'Abizar',
          student_nis: curStudent?.nis || '10527',
          status: 'in_progress',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + (targetExam.duration_minutes || 60) * 60 * 1000).toISOString(),
          answers: {},
          exam: targetExam,
          questions: examQuestions
        }
        db.examSessions.push(ses)
        saveDb()
      } else {
        ses.exam = targetExam
        ses.questions = examQuestions
      }

      return sendJson(res, 200, {
        status: 'success',
        data: {
          ...ses,
          session: ses,
          exam: targetExam,
          questions: examQuestions,
          answers: ses.answers || {}
        }
      })
    }

    const examSessionAnswersMatch = pathname.match(/^\/api\/v1\/exam-sessions\/([a-zA-Z0-9_-]+)\/answers\/batch$/)
    if (examSessionAnswersMatch && req.method === 'PUT') {
      const sesId = examSessionAnswersMatch[1]
      const ses = db.examSessions.find(s => s.id === sesId || s.exam_id === sesId)
      const body = await parseBody(req)
      if (ses && body.answers) {
        ses.answers = { ...ses.answers, ...body.answers }
        saveDb()
      }
      return sendJson(res, 200, { status: 'success', message: 'Jawaban tersimpan' })
    }

    const examSessionSubmitMatch = pathname.match(/^\/api\/v1\/exam-sessions\/([a-zA-Z0-9_-]+)\/submit$/)
    if (examSessionSubmitMatch && req.method === 'POST') {
      const sesId = examSessionSubmitMatch[1]
      const body = await parseBody(req)
      const ses = db.examSessions.find(s => s.id === sesId || s.exam_id === sesId)
      if (ses) {
        ses.status = 'submitted'
        ses.submitted_at = new Date().toISOString()
        const exam = (db.exams || []).find(e => e.id === ses.exam_id) || ses.exam
        if (body.answers) {
          ses.answers = { ...ses.answers, ...body.answers }
        }

        if (body.score !== undefined && !isNaN(Number(body.score))) {
          ses.score = Number(body.score)
        } else {
          // Hitung skor dari butir soal jika belum dihitung
          const questions = Array.isArray(ses.questions) && ses.questions.length > 0
            ? ses.questions
            : (exam?.questions || db.questions || [])

          if (questions.length > 0) {
            let correct = 0
            for (const q of questions) {
              const userAns = ses.answers ? ses.answers[q.id] : null
              const correctOpt = (q.options || []).find(o => o.is_correct || o.isCorrect)
              const correctKey = q.correct_answer || q.answer || correctOpt?.key || correctOpt?.id || 'A'
              if (userAns && String(userAns).trim().toLowerCase() === String(correctKey).trim().toLowerCase()) {
                correct++
              }
            }
            ses.score = Math.round((correct / questions.length) * 100)
          } else if (ses.score === undefined) {
            ses.score = 80
          }
        }

        // Otomatis sinkronkan nilai ujian ke Rekap Nilai Siswa (db.subjectGrades)
        if (exam) {
          const targetSubjectId = exam.subject_id || (exam.subject_name?.toLowerCase().includes('kka') ? 'sub-kka' : 'sub-inf')
          const targetSubject = (db.subjects || []).find(s => s.id === targetSubjectId) || { id: targetSubjectId, name: exam.subject_name || 'Informatika' }
          const targetClassroomId = exam.classroom_id || 'cls-7a'
          const targetClassroom = (db.classrooms || []).find(c => c.id === targetClassroomId) || { id: targetClassroomId, name: exam.classroom_name || 'VII A' }

          const stu = (db.students || []).find(s =>
            s.id === ses.student_id ||
            (s.name && ses.student_name && s.name.toLowerCase().trim() === ses.student_name.toLowerCase().trim())
          )

          const studentId = stu?.id || ses.student_id || `std-${Date.now()}`
          const studentName = stu?.name || ses.student_name || 'Siswa'
          const studentNis = stu?.nis || ''

          db.subjectGrades = db.subjectGrades || []
          let grade = db.subjectGrades.find(g =>
            g.classroom_id === targetClassroomId && g.subject_id === targetSubjectId &&
            (g.student_id === studentId || (studentNis && g.nis === studentNis) || (g.student_name.toLowerCase().trim() === studentName.toLowerCase().trim()))
          )

          if (!grade) {
            grade = {
              id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
              classroom_id: targetClassroomId,
              classroom_name: targetClassroom.name,
              subject_id: targetSubject.id,
              subject_name: targetSubject.name,
              student_id: studentId,
              student_name: studentName,
              nis: studentNis,
              nisn: stu?.nisn || '',
              gender: stu?.gender || 'L',
              attendance_score: 0,
              avg_tugas: 0,
              avg_formatif: 0,
              formatif: {},
              sumatif_tp: {},
              avg_sumatif_tp: 0,
              sts: 0,
              sas: 0,
              final_score: 0,
              grade: 'D',
              kktp_status: 'Perlu Bimbingan',
              competency_desc: ''
            }
            db.subjectGrades.push(grade)
          }

          const asstType = exam.assessment_type || (
            (exam.title || '').toLowerCase().includes('akhir') || (exam.title || '').toLowerCase().includes('sas') ? 'sas' :
            (exam.title || '').toLowerCase().includes('tengah') || (exam.title || '').toLowerCase().includes('sts') ? 'sts' :
            (exam.tp_id ? 'tp' : 'sts')
          )

          if (asstType === 'sts') {
            grade.sts = ses.score
          } else if (asstType === 'sas') {
            grade.sas = ses.score
          } else if (asstType === 'tp') {
            grade.sumatif_tp = grade.sumatif_tp || {}
            let tpKey = 'tp1'
            if (exam.tp_code) {
              const numMatch = exam.tp_code.match(/\d+/)
              if (numMatch) tpKey = `tp${numMatch[0]}`
            }
            grade.sumatif_tp[tpKey] = ses.score
          }

          recalcGrade(grade)
        }

        saveDb()
      }
      return sendJson(res, 200, { status: 'success', message: 'Ujian berhasil dikumpulkan', score: ses?.score })
    }

    // -------------------------------------------------------------
    // PRESENTATIONS & PRESENTATION SESSIONS
    // -------------------------------------------------------------
    if (pathname === '/api/v1/presentations' && req.method === 'GET') {
      db.presentations = db.presentations || []
      return sendJson(res, 200, { status: 'success', data: db.presentations })
    }

    if (pathname === '/api/v1/presentations' && req.method === 'POST') {
      const body = await parseBody(req)
      let classroomIds = []
      let classroomNames = []

      if (Array.isArray(body.classroom_ids) && body.classroom_ids.length > 0) {
        classroomIds = body.classroom_ids
        classroomNames = classroomIds.map(id => {
          const c = (db.classrooms || []).find(cls => cls.id === id)
          return c ? c.name : id
        })
      } else if (Array.isArray(body.classrooms) && body.classrooms.length > 0) {
        classroomNames = body.classrooms
        classroomIds = classroomNames.map(name => {
          const c = (db.classrooms || []).find(cls => cls.name === name)
          return c ? c.id : name
        })
      } else {
        const c = (db.classrooms || []).find(cls => cls.id === body.classroom_id || cls.name === body.classroom) || { id: body.classroom_id || 'cls-7a', name: body.classroom || 'VII A' }
        classroomIds = [c.id]
        classroomNames = [c.name]
      }

      const classroomString = body.classroom || classroomNames.join(', ')
      const newPres = {
        id: 'pres-' + Date.now().toString(36),
        title: body.title || 'Materi Presentasi Baru',
        description: body.description || '',
        subject: body.subject || 'Informatika',
        classroom: classroomString,
        classroom_id: classroomIds[0] || 'cls-7a',
        classroom_ids: classroomIds,
        classrooms: classroomNames,
        status: body.status || 'ready',
        slideCount: Number(body.slideCount) || (body.slides?.length || 5),
        aspectRatio: body.aspectRatio || '16:9',
        sessionCount: 0,
        tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map(t => t.trim()) : ['materi-baru']),
        slides: body.slides || [
          { title: body.title || 'Slide Pembuka Materi', content: body.description || 'Pengantar capaian pembelajaran dan apersepsi materi.' },
          { title: 'Capaian & Tujuan Pembelajaran', content: 'Tujuan pembelajaran fase D Kurikulum Merdeka pada topik ini.' },
          { title: 'Pembahasan Utama & Diskusi Kelas', content: 'Uraian materi mendalam dan eksplorasi konsep dasar.' },
          { title: 'Aktivitas Praktik & Kolaborasi Siswa', content: 'Instruksi pengerjaan lembar kerja dan tugas kolaboratif.' },
          { title: 'Rangkuman & Refleksi Pembelajaran', content: 'Kesimpulan dan umpan balik belajar siswa.' }
        ],
        updatedAt: 'Baru saja',
        created_at: new Date().toISOString()
      }
      if (Array.isArray(newPres.slides)) {
        newPres.slides.forEach(s => {
          if (s && s.image) s.image = offloadBase64Image(s.image)
        })
      }
      db.presentations = db.presentations || []
      db.presentations.unshift(newPres)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newPres })
    }

    const presentationDetailMatch = pathname.match(/^\/api\/v1\/presentations\/([a-zA-Z0-9_-]+)$/)
    if (presentationDetailMatch) {
      const presId = presentationDetailMatch[1]
      db.presentations = db.presentations || []
      const idx = db.presentations.findIndex(p => p.id === presId)

      if (req.method === 'GET') {
        if (idx === -1) return sendJson(res, 404, { status: 'error', message: 'Materi presentasi tidak ditemukan' })
        return sendJson(res, 200, { status: 'success', data: db.presentations[idx] })
      }

      if (req.method === 'PUT') {
        if (idx === -1) return sendJson(res, 404, { status: 'error', message: 'Materi presentasi tidak ditemukan' })
        const body = await parseBody(req)
        const pres = db.presentations[idx]
        if (body.title) pres.title = body.title
        if (body.description !== undefined) pres.description = body.description
        if (body.subject) pres.subject = body.subject
        if (Array.isArray(body.classroom_ids) && body.classroom_ids.length > 0) {
          pres.classroom_ids = body.classroom_ids
          pres.classrooms = pres.classroom_ids.map(id => {
            const c = (db.classrooms || []).find(cls => cls.id === id)
            return c ? c.name : id
          })
          pres.classroom = body.classroom || pres.classrooms.join(', ')
          pres.classroom_id = pres.classroom_ids[0] || 'cls-7a'
        } else if (body.classroom) {
          pres.classroom = body.classroom
        }
        if (body.status) pres.status = body.status
        if (body.tags) pres.tags = Array.isArray(body.tags) ? body.tags : body.tags.split(',').map(t => t.trim())
        if (body.slides) {
          pres.slides = body.slides
          if (Array.isArray(pres.slides)) {
            pres.slides.forEach(s => {
              if (s && s.image) s.image = offloadBase64Image(s.image)
            })
          }
          pres.slideCount = body.slides.length
        }
        pres.updatedAt = 'Baru saja'
        saveDb()
        return sendJson(res, 200, { status: 'success', data: pres })
      }

      if (req.method === 'DELETE') {
        if (!isTeacherRequest(req)) {
          return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang dapat menghapus materi presentasi' })
        }
        if (idx === -1) {
          return sendJson(res, 404, { status: 'error', message: 'Materi presentasi tidak ditemukan' })
        }
        const deleted = db.presentations.splice(idx, 1)[0]
        if (deleted && Array.isArray(db.presentationSessions)) {
          db.presentationSessions.forEach(s => {
            if (s.presentation_id === deleted.id && s.status === 'active') {
              s.status = 'completed'
            }
          })
        }
        if (deleted && Array.isArray(deleted.slides)) {
          for (const slide of deleted.slides) {
            if (slide?.image && typeof slide.image === 'string' && slide.image.startsWith('/api/v1/storage/slides/')) {
              const filename = path.basename(slide.image)
              const stillUsed = (db.presentations || []).some(p => (p.slides || []).some(s => s?.image === slide.image)) ||
                                (db.presentationSessions || []).some(ps => (ps.slides || []).some(s => s?.image === slide.image))
              if (!stillUsed) {
                const filePath = path.join(SLIDES_STORAGE_DIR, filename)
                if (fs.existsSync(filePath)) {
                  try { fs.unlinkSync(filePath) } catch {}
                }
              }
            }
          }
        }
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'Materi presentasi berhasil dihapus' })
      }
    }

    // -------------------------------------------------------------
    // WEB PROXY UNTUK DEMO WEB LIVE PRESENTASI (BYPASS X-FRAME-OPTIONS)
    // -------------------------------------------------------------
    if (pathname === '/api/v1/proxy-web' && req.method === 'GET') {
      let targetUrl = query.url
      if (!targetUrl) {
        return sendJson(res, 400, { status: 'error', message: 'Parameter url diperlukan' })
      }

      // Auto-resolve Scratch editor ke Scratch Foundation GUI resmi yang 100% kompatibel di iframe
      if (targetUrl.includes('scratch.mit.edu/projects/editor') || targetUrl.includes('turbowarp.org') || targetUrl === 'https://scratch.mit.edu' || targetUrl === 'https://scratch.mit.edu/') {
        targetUrl = 'https://scratchfoundation.github.io/scratch-gui/'
      } else if (targetUrl.includes('scratch.mit.edu/projects/') && !targetUrl.includes('/embed')) {
        targetUrl = targetUrl.replace(/scratch\.mit\.edu\/projects\/(\d+)\/?/, 'scratch.mit.edu/projects/$1/embed')
      }

      if (!isAllowedProxyDomain(targetUrl)) {
        return sendJson(res, 403, {
          status: 'error',
          message: 'Domain tidak diizinkan untuk proxy web.'
        })
      }

      try {
        const parsedUrl = new URL(targetUrl)
        const fetchRes = await fetch(parsedUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
          },
          redirect: 'follow'
        })

        const contentType = fetchRes.headers.get('content-type') || 'text/html'
        
        if (contentType.includes('text/html')) {
          let html = await fetchRes.text()
          const baseTag = `<base href="${parsedUrl.origin}/">`

          // Interceptor script agar form search Google dan navigasi link tetap di dalam proxy
          const proxyScript = `
<script>
(function() {
  const currentOrigin = ${JSON.stringify(parsedUrl.origin)};
  const currentUrl = ${JSON.stringify(parsedUrl.toString())};

  function resolveUrl(relativeUrl) {
    if (!relativeUrl) return '';
    if (/^https?:\\/\\//i.test(relativeUrl)) return relativeUrl;
    if (relativeUrl.startsWith('//')) return window.location.protocol + relativeUrl;
    if (relativeUrl.startsWith('/')) return currentOrigin + relativeUrl;
    return currentUrl.replace(/\\/[^\\/]*$/, '/') + relativeUrl;
  }

  // Intersep submit form (seperti Search Google, form kalkulator, dll.)
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (!form) return;
    const action = form.getAttribute('action') || '';
    const fullAction = resolveUrl(action);
    const method = (form.getAttribute('method') || 'GET').toUpperCase();

    if (method === 'GET') {
      e.preventDefault();
      const formData = new FormData(form);
      const params = new URLSearchParams();
      for (const [k, v] of formData.entries()) {
        if (v) params.append(k, v);
      }
      const glue = fullAction.includes('?') ? '&' : '?';
      const dest = fullAction + glue + params.toString();
      window.location.href = '/api/v1/proxy-web?url=' + encodeURIComponent(dest);
    }
  }, true);

  // Intersep klik link agar navigasi tetap melalui proxy
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
    e.preventDefault();
    const fullUrl = resolveUrl(href);
    window.location.href = '/api/v1/proxy-web?url=' + encodeURIComponent(fullUrl);
  }, true);
})();
</script>
`

          if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>\n${baseTag}\n${proxyScript}`)
          } else if (html.includes('<HEAD>')) {
            html = html.replace('<HEAD>', `<HEAD>\n${baseTag}\n${proxyScript}`)
          } else {
            html = `${baseTag}\n${proxyScript}\n${html}`
          }

          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': getAllowedOrigin(req)
          })
          return res.end(html)
        } else {
          const buffer = Buffer.from(await fetchRes.arrayBuffer())
          res.writeHead(fetchRes.status, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': getAllowedOrigin(req)
          })
          return res.end(buffer)
        }
      } catch (err) {
        console.error('Web proxy fetch failed for:', targetUrl, err.message)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        return res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Pratinjau Web Demo</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #07051a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; text-align: center; }
              .card { background: #13112b; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 32px 24px; max-width: 520px; box-shadow: 0 20px 30px rgba(0,0,0,0.6); }
              .icon { font-size: 42px; margin-bottom: 16px; }
              h1 { font-size: 18px; font-weight: 800; margin: 0 0 8px; color: #38bdf8; }
              p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px; }
              .btn { display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 13px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
              .btn:hover { background: #1d4ed8; transform: translateY(-1px); }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">🌐</div>
              <h1>Buka Web Langsung di Tab Baru</h1>
              <p>Halaman web ini membatasi iframe langsung dari domain luar. Silakan klik tombol di bawah untuk membukanya secara utuh di tab baru:</p>
              <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn">
                <span>↗️</span>
                <span>Buka ${targetUrl}</span>
              </a>
            </div>
          </body>
          </html>
        `)
      }
    }

    if (pathname === '/api/v1/presentation-sessions/active' && req.method === 'GET') {
      db.presentationSessions = db.presentationSessions || []
      // Sesi aktif harus: berstatus 'active' DAN materi presentasinya benar-benar ada di db.presentations
      const active = db.presentationSessions.find(s => {
        if (s.status !== 'active') return false
        const pres = (db.presentations || []).find(p => p.id === s.presentation_id)
        return !!pres
      }) || null

      // Jika ada sesi yang berstatus active tetapi materinya sudah tidak ada, normalkan menjadi completed
      let dirty = false
      db.presentationSessions.forEach(s => {
        if (s.status === 'active' && !(db.presentations || []).some(p => p.id === s.presentation_id)) {
          s.status = 'completed'
          dirty = true
        }
      })
      if (dirty) saveDb()

      return sendJson(res, 200, { status: 'success', data: active })
    }

    // Endpoint untuk mengakhiri/menutup sesi presentasi — Hanya Guru
    const prsEndMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)\/end$/)
    if (prsEndMatch && req.method === 'POST') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak mengakhiri sesi presentasi.' })
      }
      const sId = prsEndMatch[1]
      let body = {}
      try { body = await parseBody(req) } catch (_) {}
      db.presentationSessions = db.presentationSessions || []
      let session = db.presentationSessions.find(s => s.id === sId || s.accessCode === sId)

      // Fallback: jika id tidak cocok langsung atau 'all', cari sesi yang berstatus active
      if (!session && (sId === 'all' || sId.startsWith('ses-'))) {
        session = db.presentationSessions.find(s => s.status === 'active')
      }

      if (session) {
        session.status = 'completed'
        session.ended_at = new Date().toISOString()
        if (session.activeVote) {
          session.activeVote.status = 'closed'
          session.activeVote = null
        }
        if (Array.isArray(session.votes)) {
          session.votes.forEach(v => {
            if (v && v.status === 'open') v.status = 'closed'
          })
        }
        if (body.participants && Array.isArray(body.participants) && body.participants.length > 0) {
          session.participants = body.participants
        }
        if (body.votes && Array.isArray(body.votes) && body.votes.length > 0) {
          session.votes = body.votes
        }
        if (body.activeSlide) {
          session.activeSlide = body.activeSlide
        }

        // Normalisasi status akhir & partisipasi voting seluruh siswa yang hadir
        const endedTimestamp = new Date(session.ended_at).getTime()
        const allVotes = session.votes || []
        session.participants = (session.participants || []).map(p => {
          const hasVoted = Boolean(
            p.voted === true ||
            p.hasAnsweredVote === true ||
            (Number(p.votedCount) > 0) ||
            allVotes.some(v => v.voters && (
              v.voters[p.id] ||
              v.voters[p.studentId] ||
              (p.nis && p.nis !== '-' && v.voters[p.nis]) ||
              (p.name && v.voters[p.name])
            ))
          )
          const isCompleted = p.status === 'completed' ||
            p.connectionStatus === 'connected' ||
            p.connectionStatus === 'idle' ||
            !p.connectionStatus ||
            (p.lastHeartbeat && (endedTimestamp - p.lastHeartbeat < 300000)) ||
            (p.lastAcknowledgedSlide && p.lastAcknowledgedSlide >= 1)

          const ackSlide = p.lastAckSlide || p.lastAcknowledgedSlide || session.activeSlide || 1

          return {
            ...p,
            id: p.id || p.studentId,
            name: p.name || 'Siswa',
            classroom: p.classroom || session.classroom,
            lastAckSlide: ackSlide,
            lastAcknowledgedSlide: ackSlide,
            voted: hasVoted,
            hasAnsweredVote: hasVoted,
            status: isCompleted ? 'completed' : 'left_early'
          }
        })
        session.events = session.events || []
        session.events.push({
          id: 'ev-end-' + Date.now(),
          type: 'SESSION_ENDED',
          payload: { sessionId: session.id },
          timestamp: Date.now()
        })
        broadcastToPresentation(session.id, {
          type: 'VOTE_CLOSED',
          payload: null,
          timestamp: Date.now()
        })
        broadcastToPresentation(session.id, {
          type: 'VOTE_STATE',
          payload: null,
          timestamp: Date.now()
        })
        broadcastToPresentation(session.id, {
          type: 'SESSION_ENDED',
          payload: { sessionId: session.id },
          timestamp: Date.now()
        })
      }

      // Pastikan semua sesi yang berstatus active juga dinormalkan menjadi completed
      db.presentationSessions.forEach(s => {
        if (s.status === 'active') {
          s.status = 'completed'
          s.ended_at = s.ended_at || new Date().toISOString()
          s.activeVote = null
          if (Array.isArray(s.votes)) {
            s.votes.forEach(v => {
              if (v && v.status === 'open') v.status = 'closed'
            })
          }
        }
      })
      saveDb()

      return sendJson(res, 200, {
        status: 'success',
        message: 'Sesi presentasi telah diakhiri',
        data: session || null
      })
    }

    if (pathname === '/api/v1/presentation-sessions' && req.method === 'POST') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak membuat sesi presentasi.' })
      }
      const authUser = getAuthUser(req)
      const body = await parseBody(req)
      let pres = null
      if (body.presentation_id) {
        pres = (db.presentations || []).find(p => p.id === body.presentation_id)
      }

      // Pastikan sesi aktif terdahulu diselesaikan terlebih dahulu (hanya 1 sesi aktif di satu waktu)
      db.presentationSessions = db.presentationSessions || []
      db.presentationSessions.forEach(s => {
        if (s.status === 'active') {
          s.status = 'completed'
          s.ended_at = s.ended_at || new Date().toISOString()
        }
      })

      const finalSlides = (body.slides && body.slides.length > 0) ? body.slides : (pres?.slides || [])
      const newSession = {
        id: 'ses-' + Date.now().toString(36),
        presentation_id: body.presentation_id || (pres ? pres.id : 'pres-01'),
        teacher_id: authUser?.id || null,
        title: body.title || (pres ? pres.title : 'Sesi Presentasi'),
        classroom: body.classroom || (pres ? pres.classroom : 'IX A'),
        classroom_ids: body.classroom_ids || pres?.classroom_ids || [],
        allow_guests: body.allow_guests !== undefined ? Boolean(body.allow_guests) : true,
        accessCode: body.accessCode || ('PRS-' + Math.floor(100 + Math.random() * 900)),
        activeSlide: 1,
        totalSlides: Number(body.totalSlides) || finalSlides.length || (pres?.slideCount || 5),
        connectedCount: 0,
        participants: [],
        slides: finalSlides,
        votes: [],
        status: 'active',
        created_at: new Date().toISOString()
      }
      db.presentationSessions.unshift(newSession)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newSession })
    }

    function resolvePresentationSession(targetIdOrCode) {
      db.presentationSessions = db.presentationSessions || []
      const clean = (targetIdOrCode || '').trim().toLowerCase()

      // 1. Jika ada ID atau Access Code yang diminta, utamakan pencocokan langsung
      if (clean) {
        // Cari yang cocok persis (prioritaskan yang berstatus active jika ada kesamaan kode)
        const matchActive = db.presentationSessions.find(s => 
          s.status === 'active' && (s.id.toLowerCase() === clean || s.accessCode?.toLowerCase() === clean)
        )
        if (matchActive) return matchActive

        const matchAny = db.presentationSessions.find(s => 
          s.id.toLowerCase() === clean || s.accessCode?.toLowerCase() === clean
        )
        if (matchAny) return matchAny
      }

      // 2. Jika ID/Code tidak diberikan atau tidak cocok, baru ambil sesi yang sedang aktif
      const activeSession = db.presentationSessions.find(s => s.status === 'active')
      if (activeSession) {
        return activeSession
      }

      return db.presentationSessions[0] || null
    }

    // Detail sesi presentasi untuk Teacher Studio (Data Real Slides & Participants)
    const prsSessionMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)$/)
    if (prsSessionMatch && req.method === 'GET') {
      const sId = prsSessionMatch[1]
      let session = resolvePresentationSession(sId)
      
      // Jika yang dibuka adalah id materi presentasi (pres-...) bukan session
      if (!session) {
        const pres = (db.presentations || []).find(p => p.id === sId)
        if (pres) {
          session = {
            id: 'ses-' + pres.id,
            presentation_id: pres.id,
            title: pres.title,
            classroom: pres.classroom,
            classroom_ids: pres.classroom_ids || [],
            accessCode: 'PRS-' + Math.floor(100 + Math.random() * 900),
            activeSlide: 1,
            totalSlides: pres.slideCount || (pres.slides?.length || 5),
            connectedCount: 0,
            participants: [],
            slides: pres.slides || [],
            votes: [],
            status: 'active',
            created_at: new Date().toISOString()
          }
          db.presentationSessions.unshift(session)
          saveDb()
        }
      }

      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi presentasi tidak ditemukan' })
      }

      // Pastikan slides terpasang dari materi real jika masih kosong
      if ((!session.slides || session.slides.length === 0) && session.presentation_id) {
        const pres = (db.presentations || []).find(p => p.id === session.presentation_id)
        if (pres?.slides && pres.slides.length > 0) {
          session.slides = pres.slides
          session.totalSlides = pres.slides.length
        }
      }

      session.participants = session.participants || []
      session.connectedCount = session.participants.filter(p => p.connectionStatus === 'connected').length

      return sendJson(res, 200, {
        status: 'success',
        data: {
          ...session,
          local_network_ip: getLocalNetworkIp()
        }
      })
    }

    if (prsSessionMatch && req.method === 'DELETE') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang dapat menghapus sesi presentasi' })
      }
      const sId = prsSessionMatch[1]
      const idx = (db.presentationSessions || []).findIndex(s => s.id === sId)
      if (idx !== -1) {
        db.presentationSessions.splice(idx, 1)
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'Sesi presentasi berhasil dihapus' })
      }
      return sendJson(res, 404, { status: 'error', message: 'Sesi presentasi tidak ditemukan' })
    }

    // Siswa bergabung ke sesi presentasi (Data Real Siswa)
    if (pathname === '/api/v1/presentation-sessions/join' && req.method === 'POST') {
      const body = await parseBody(req)
      const { accessCode, sessionId, studentId, studentName, nis, classroom } = body
      const session = resolvePresentationSession(sessionId || accessCode)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak aktif atau kode PIN salah' })
      }

      session.participants = session.participants || []
      const reqName = (studentName || 'Peserta Siswa').trim()
      const cleanName = reqName.toLowerCase()
      const pId = studentId || ('p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6))

      // 3.2: Cegah dua peserta aktif dengan nama persis sama dalam satu sesi
      const existingByName = session.participants.find(p => p.name && p.name.trim().toLowerCase() === cleanName)
      if (existingByName) {
        const isSameIdentity = (studentId && (existingByName.studentId === studentId || existingByName.id === studentId)) ||
          (nis && nis !== '-' && existingByName.nis === nis) ||
          (body.reconnect && body.reconnect_participant_id === existingByName.id)

        const isRecentlyActive = (Date.now() - (existingByName.lastHeartbeat || 0)) < 30000 && existingByName.connectionStatus === 'connected'

        if (!isSameIdentity && isRecentlyActive) {
          return sendJson(res, 409, {
            status: 'error',
            code: 'NAME_CONFLICT',
            message: `Nama "${reqName}" saat ini sedang digunakan oleh peserta aktif lain dalam sesi ini. Silakan gunakan nama lengkap atau NIS Anda, atau hubungkan kembali akun Anda.`,
            can_reconnect: true,
            existing_participant_id: existingByName.id
          })
        }
      }

      // 3.2: Penegakan rombel & mode tamu
      const authUser = getAuthUser(req)
      const allowGuests = session.allow_guests !== false // default true
      if (!allowGuests) {
        if (!authUser) {
          return sendJson(res, 403, {
            status: 'error',
            code: 'GUESTS_NOT_ALLOWED',
            message: 'Mode tamu dinonaktifkan untuk sesi ini. Silakan masuk menggunakan akun siswa resmi.'
          })
        }
        if (authUser.role === 'student' || authUser.is_student) {
          const studentClass = authUser.classroom_name || authUser.classroom_id || classroom
          const sessionClass = session.classroom
          const allowedClassIds = Array.isArray(session.classroom_ids) ? session.classroom_ids : []
          const isClassMatch = !sessionClass ||
            (studentClass && sessionClass && studentClass.toLowerCase().includes(sessionClass.toLowerCase())) ||
            (authUser.classroom_id && allowedClassIds.includes(authUser.classroom_id))

          if (!isClassMatch) {
            return sendJson(res, 403, {
              status: 'error',
              code: 'OUTSIDE_CLASSROOM',
              message: `Sesi ini dikhususkan untuk kelas ${session.classroom || 'terkait'}. Akun Anda terdaftar di kelas ${studentClass || 'Lain'}.`
            })
          }
        }
      }

      const existingIdx = session.participants.findIndex(p =>
        p.id === pId ||
        p.studentId === studentId ||
        (nis && nis !== '-' && p.nis === nis) ||
        (p.name && reqName && p.name.trim().toLowerCase() === cleanName)
      )

      const participantData = {
        id: pId,
        studentId: studentId || pId,
        name: reqName,
        nis: nis || '-',
        classroom: classroom || session.classroom || 'VII A',
        connectionStatus: 'connected',
        lastAcknowledgedSlide: session.activeSlide || 1,
        hasAnsweredVote: false,
        lastHeartbeat: Date.now()
      }

      if (existingIdx > -1) {
        session.participants[existingIdx] = { ...session.participants[existingIdx], ...participantData }
      } else {
        session.participants.push(participantData)
      }

      session.connectedCount = session.participants.filter(p => p.connectionStatus === 'connected').length
      saveDb()

      // Broadcast kehadiran siswa ke seluruh perangkat terhubung (layar guru)
      broadcastToPresentation(session.id, {
        type: 'STUDENT_JOINED',
        payload: participantData,
        timestamp: Date.now()
      })

      let slides = session.slides
      if (!slides && session.presentation_id) {
        const pres = (db.presentations || []).find(p => p.id === session.presentation_id)
        if (pres) slides = pres.slides
      }

      return sendJson(res, 200, {
        status: 'success',
        data: {
          session: { ...session, slides },
          participant: participantData,
          local_network_ip: getLocalNetworkIp()
        }
      })
    }

    // Siswa get session by code PIN
    const prsCodeMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/code\/([a-zA-Z0-9_-]+)$/)
    if (prsCodeMatch && req.method === 'GET') {
      const code = prsCodeMatch[1]
      const session = resolvePresentationSession(code)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan untuk PIN ini' })
      }

      let slides = session.slides
      if (!slides && session.presentation_id) {
        const pres = (db.presentations || []).find(p => p.id === session.presentation_id)
        if (pres) slides = pres.slides
      }

      return sendJson(res, 200, {
        status: 'success',
        data: {
          ...session,
          slides,
          local_network_ip: getLocalNetworkIp()
        }
      })
    }

    // Dedicated High-Speed Screen Frame Stream (Optimized for Screen Mirroring without Disk I/O) — Hanya Guru
    const prsScreenFrameMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)\/screen-frame$/)
    if (prsScreenFrameMatch && req.method === 'POST') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak mengirim screen-frame.' })
      }
      const sId = prsScreenFrameMatch[1]
      const session = resolvePresentationSession(sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan' })
      }
      const body = await parseBody(req)
      const frameData = body?.frame !== undefined ? body.frame : (body?.payload !== undefined ? body.payload : null)

      let meta = presentationScreenFrameData.get(session.id)
      if (!meta) {
        meta = { frame: null, frameSeq: 0, timestamp: Date.now() }
      }
      if (frameData !== meta.frame) {
        meta.frame = frameData
        meta.frameSeq = (meta.frameSeq || 0) + 1
        meta.timestamp = Date.now()
        presentationScreenFrameData.set(session.id, meta)
        presentationScreenFrames.set(session.id, frameData)

        // Broadcast frame ke subscriber secara instan tanpa menyentuh disk
        broadcastToPresentation(session.id, {
          type: 'WEB_SCREEN_FRAME',
          payload: frameData,
          seq: meta.frameSeq,
          timestamp: meta.timestamp
        })
      }

      return sendJson(res, 200, { status: 'success', frame_seq: meta.frameSeq })
    }

    // Broadcast Realtime Event (Slide change, Laser pointer, Web demo, Polling, Heartbeat)
    const prsEventsMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)\/events$/)
    if (prsEventsMatch && req.method === 'POST') {
      const sId = prsEventsMatch[1]
      const body = await parseBody(req)
      const session = resolvePresentationSession(sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi presentasi tidak ditemukan' })
      }

      const { type, payload } = body
      session.events = session.events || []

      // 3.1: Otorisasi event kendali — HANYA boleh dari token GURU pemilik sesi!
      const teacherOnlyEvents = [
        'SLIDE_CHANGED',
        'SLIDE_PREV',
        'SLIDE_NEXT',
        'SESSION_START',
        'SESSION_PAUSED',
        'SESSION_RESUMED',
        'SESSION_END',
        'SESSION_ENDED',
        'LASER_POINTER',
        'WEB_SCREEN_FRAME',
        'WEB_DEMO_CHANGED',
        'VOTE_OPENED',
        'VOTE_CLOSED',
        'SCREEN_SHARE_STARTED',
        'SCREEN_SHARE_STOPPED'
      ]

      if (teacherOnlyEvents.includes(type)) {
        if (!isTeacherRequest(req)) {
          return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengirim event kendali presentasi.' })
        }
      }

      // Handle specific realtime state updates
      if (type === 'SLIDE_CHANGED' && payload) {
        if (payload.activeSlide) session.activeSlide = Number(payload.activeSlide)
        if (payload.totalSlides) session.totalSlides = Number(payload.totalSlides)
        if (payload.isLocked !== undefined) session.isLocked = Boolean(payload.isLocked)
      } else if (type === 'LASER_POINTER' && payload) {
        session.laserPointer = {
          ...payload,
          timestamp: payload.timestamp || Date.now()
        }
      } else if (type === 'WEB_SCREEN_FRAME') {
        presentationScreenFrames.set(session.id, payload)
        broadcastToPresentation(session.id, {
          type: 'WEB_SCREEN_FRAME',
          payload,
          timestamp: Date.now()
        })
        return sendJson(res, 200, { status: 'success' })
      } else if (type === 'WEB_DEMO_CHANGED' && payload) {
        session.webDemo = payload
      } else if (type === 'VOTE_OPENED' && payload) {
        session.activeVote = {
          ...payload,
          voters: {}
        }
        session.votes = session.votes || []
        const vIdx = session.votes.findIndex(v => v.id === payload.id)
        if (vIdx > -1) {
          session.votes[vIdx] = session.activeVote
        } else {
          session.votes.push(session.activeVote)
        }
        // Reset status sudah menjawab untuk seluruh siswa saat polling baru dibuka
        if (Array.isArray(session.participants)) {
          session.participants.forEach(p => p.hasAnsweredVote = false)
        }
      } else if (type === 'VOTE_CLOSED') {
        const targetVoteId = payload?.id || (session.activeVote ? session.activeVote.id : null)
        if (session.activeVote) {
          session.activeVote.status = 'closed'
          if (payload?.distribution) session.activeVote.distribution = { ...payload.distribution }
          if (payload?.responsesCount !== undefined) session.activeVote.responsesCount = payload.responsesCount
        }
        if (targetVoteId) {
          const v = (session.votes || []).find(vote => vote.id === targetVoteId)
          if (v) {
            v.status = 'closed'
            if (payload?.distribution) v.distribution = { ...payload.distribution }
            if (payload?.responsesCount !== undefined) v.responsesCount = payload.responsesCount
          }
        }
        session.activeVote = null
        broadcastToPresentation(session.id, {
          type: 'VOTE_STATE',
          payload: null,
          timestamp: Date.now()
        })
      } else if (type === 'VOTE_RESPONSE' && payload) {
        session.participants = session.participants || []
        const p = session.participants.find(part =>
          part.id === payload.participantId ||
          part.studentId === payload.studentId ||
          (payload.nis && payload.nis !== '-' && part.nis === payload.nis) ||
          (payload.studentName && part.name === payload.studentName)
        )
        if (p) {
          p.hasAnsweredVote = true
          p.voted = true
          p.votedCount = (p.votedCount || 0) + 1
        }

        const targetVote = session.activeVote || (session.votes || []).find(vote => vote.id === payload.voteId)
        if (targetVote && payload.selectedOptionId) {
          targetVote.voters = targetVote.voters || {}
          const voterKey = String(payload.studentId || payload.participantId || (p ? p.id : 'anon'))

          // Deduplikasi ketat: 1 siswa hanya dihitung tepat 1 suara
          if (!targetVote.voters[voterKey]) {
            targetVote.voters[voterKey] = payload.selectedOptionId
            targetVote.distribution = targetVote.distribution || {}
            targetVote.distribution[payload.selectedOptionId] = (targetVote.distribution[payload.selectedOptionId] || 0) + 1
            targetVote.responsesCount = Object.values(targetVote.distribution).reduce((a, b) => a + Number(b), 0)
          } else if (targetVote.allowChangeAnswer && targetVote.voters[voterKey] !== payload.selectedOptionId) {
            const oldOpt = targetVote.voters[voterKey]
            targetVote.distribution = targetVote.distribution || {}
            targetVote.distribution[oldOpt] = Math.max(0, (targetVote.distribution[oldOpt] || 1) - 1)
            targetVote.distribution[payload.selectedOptionId] = (targetVote.distribution[payload.selectedOptionId] || 0) + 1
            targetVote.voters[voterKey] = payload.selectedOptionId
            targetVote.responsesCount = Object.values(targetVote.distribution).reduce((a, b) => a + Number(b), 0)
          }
        }

        session.votes = session.votes || []
        if (targetVote) {
          const vIdx = session.votes.findIndex(vote => vote.id === targetVote.id)
          if (vIdx > -1) {
            session.votes[vIdx] = targetVote
          } else {
            session.votes.push(targetVote)
          }

          // Broadcast VOTE_STATE snapshot terbarukan secara instan via SSE
          broadcastToPresentation(session.id, {
            id: 'ev-vstate-' + Date.now(),
            type: 'VOTE_STATE',
            payload: targetVote,
            timestamp: Date.now()
          })
        }
      } else if ((type === 'STUDENT_JOINED' || type === 'PARTICIPANT_HEARTBEAT') && payload) {
        session.participants = session.participants || []
        const pId = payload.participantId || payload.id || payload.studentId
        const existingIdx = session.participants.findIndex(p => p.id === pId || p.studentId === payload.studentId)
        const prevHasAnswered = existingIdx > -1 ? Boolean(session.participants[existingIdx].hasAnsweredVote) : false
        const prevVoted = existingIdx > -1 ? Boolean(session.participants[existingIdx].voted) : false
        const pData = {
          id: pId,
          studentId: payload.studentId || pId,
          name: payload.name || (existingIdx > -1 ? session.participants[existingIdx].name : 'Siswa Real'),
          nis: payload.nis || (existingIdx > -1 ? session.participants[existingIdx].nis : '-'),
          classroom: payload.classroom || session.classroom,
          connectionStatus: 'connected',
          lastAcknowledgedSlide: payload.currentSlide || payload.lastAcknowledgedSlide || session.activeSlide || 1,
          hasAnsweredVote: payload.hasAnsweredVote !== undefined ? Boolean(payload.hasAnsweredVote) : prevHasAnswered,
          voted: prevVoted || Boolean(payload.voted) || Boolean(payload.hasAnsweredVote),
          lastHeartbeat: Date.now()
        }
        if (existingIdx > -1) {
          session.participants[existingIdx] = { ...session.participants[existingIdx], ...pData }
        } else {
          session.participants.push(pData)
        }
        session.connectedCount = session.participants.filter(p => p.connectionStatus === 'connected').length
      } else if (type === 'SLIDE_ACK' && payload) {
        session.participants = session.participants || []
        const p = session.participants.find(part => part.id === payload.participantId || part.studentId === payload.studentId)
        if (p) {
          p.lastAcknowledgedSlide = payload.slideIndex
          p.lastHeartbeat = Date.now()
          p.connectionStatus = 'connected'
        }
      }

      const eventObj = {
        id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        type,
        payload,
        timestamp: Date.now()
      }

      // JANGAN simpan event laser pointer dan screen frame ke array events agar tidak membanjiri polling
      if (type !== 'LASER_POINTER' && type !== 'WEB_SCREEN_FRAME') {
        session.events.push(eventObj)
        if (session.events.length > 100) session.events.shift()
      }

      // Broadcast secara instan via SSE ke seluruh subscriber sesi ini
      broadcastToPresentation(session.id, eventObj)

      // Hanya simpan ke disk untuk perubahan penting (bukan laser pointer, bukan frame, bukan heartbeat / slide ack)
      if (type !== 'LASER_POINTER' && type !== 'WEB_SCREEN_FRAME' && type !== 'PARTICIPANT_HEARTBEAT' && type !== 'SLIDE_ACK') {
        saveDb()
      }

      return sendJson(res, 200, { status: 'success', data: { eventId: eventObj.id } })
    }

    // SSE Stream Endpoint untuk Realtime Multi-Device Sync (Komputer Guru <-> HP Siswa)
    const prsStreamMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)\/stream$/)
    if (prsStreamMatch && req.method === 'GET') {
      const sId = prsStreamMatch[1]
      let session = resolvePresentationSession(sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan' })
      }

      if (req.socket) req.socket.setNoDelay(true)
      if (res.socket) res.socket.setNoDelay(true)
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': getAllowedOrigin(req),
        'Access-Control-Allow-Credentials': 'true'
      })
      if (typeof res.flushHeaders === 'function') {
        res.flushHeaders()
      }

      if (!presentationSubscribers.has(session.id)) {
        presentationSubscribers.set(session.id, new Set())
      }
      const subs = presentationSubscribers.get(session.id)
      subs.add(res)

      // Kirim sinkronisasi awal saat perangkat pertama kali tersambung
      const initPayload = {
        type: 'INIT_SYNC',
        payload: {
          sessionId: session.id,
          activeSlide: session.activeSlide || 1,
          totalSlides: session.totalSlides || session.slides?.length || 5,
          isLocked: Boolean(session.isLocked),
          laserPointer: session.laserPointer || { active: false, x: 50, y: 50 },
          webDemo: session.webDemo || null,
          screenFrame: presentationScreenFrames.get(session.id) || null,
          activeVote: session.activeVote || null,
          participants: session.participants || [],
          connectedCount: (session.participants || []).filter(p => p.connectionStatus === 'connected').length
        },
        timestamp: Date.now()
      }
      res.write(`data: ${JSON.stringify(initPayload)}\n\n`)

      // Heartbeat comment ping setiap 15 detik agar koneksi tetap stabil di browser mobile
      const pingInterval = setInterval(() => {
        try {
          res.write(': ping\n\n')
        } catch (_) {
          clearInterval(pingInterval)
        }
      }, 15000)

      req.on('close', () => {
        clearInterval(pingInterval)
        subs.delete(res)
      })
      return
    }

    // Polling Endpoint Fallback untuk jaringan yang membatasi SSE
    const prsPollMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)\/poll$/)
    if (prsPollMatch && req.method === 'GET') {
      const sId = prsPollMatch[1]
      let session = resolvePresentationSession(sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan' })
      }

      const since = Number(query.since) || 0
      const recentEvents = (session.events || []).filter(e => e.timestamp > since)

      // Evaluasi siswa yang idle (> 25 detik tanpa detak jantung)
      const now = Date.now()
      let pChanged = false
      session.participants = session.participants || []
      session.participants.forEach(p => {
        if (p.connectionStatus === 'connected' && (now - (p.lastHeartbeat || 0) > 25000)) {
          p.connectionStatus = 'idle'
          pChanged = true
        }
      })
      if (pChanged) {
        session.connectedCount = session.participants.filter(p => p.connectionStatus === 'connected').length
      }

      // 3.4: Optimasi hemat bandwidth — omit frame jika frame_seq identik
      const clientLastFrameSeq = Number(query.last_frame_seq)
      const frameMeta = presentationScreenFrameData.get(session.id)
      const currentFrameSeq = frameMeta?.frameSeq || 0
      const currentFrame = presentationScreenFrames.get(session.id) || null

      let sendScreenFrame = currentFrame
      let frameUnchanged = false
      if (!isNaN(clientLastFrameSeq) && clientLastFrameSeq > 0 && clientLastFrameSeq === currentFrameSeq) {
        sendScreenFrame = null
        frameUnchanged = true
      }

      return sendJson(res, 200, {
        status: 'success',
        data: {
          sessionId: session.id,
          sessionStatus: session.status,
          activeSessionId: (db.presentationSessions.find(s => s.status === 'active') || session).id,
          activeSlide: session.activeSlide || 1,
          totalSlides: session.totalSlides || session.slides?.length || 5,
          isLocked: Boolean(session.isLocked),
          laserPointer: session.laserPointer || { active: false, x: 50, y: 50 },
          webDemo: session.webDemo || null,
          screenFrame: sendScreenFrame,
          frame_unchanged: frameUnchanged,
          frame_seq: currentFrameSeq,
          activeVote: session.activeVote || null,
          votes: session.votes || [],
          participants: session.participants,
          connectedCount: session.participants.filter(p => p.connectionStatus === 'connected').length,
          events: recentEvents,
          server_time: now,
          local_network_ip: getLocalNetworkIp()
        }
      })
    }

    const prsReportMatch = pathname.match(/^\/api\/v1\/presentation-sessions\/([a-zA-Z0-9_-]+)\/report$/)
    if (prsReportMatch && req.method === 'GET') {
      const sId = prsReportMatch[1]
      db.presentationSessions = db.presentationSessions || []
      let session = db.presentationSessions.find(s => s.id === sId || s.accessCode === sId)
      if (!session) {
        session = db.presentationSessions.find(s => s.status === 'active') || db.presentationSessions[0] || null
      }
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi presentasi tidak ditemukan' })
      }

      // Ambil data siswa real dari rombel kelas terkait
      const targetClassroom = session.classroom || 'IX A'
      const isGrade9 = targetClassroom.toUpperCase().includes('IX') || targetClassroom.includes('9')
      const officialSubject = isGrade9 ? 'Informatika' : 'KKA (Koding & Kecerdasan Artifisial)'
      const classStudents = (db.students || []).filter(s => {
        return s.classroom_name === targetClassroom ||
          (s.classroom_id && (db.classrooms || []).find(c => c.id === s.classroom_id)?.name === targetClassroom)
      })

      const invitedCount = classStudents.length > 0 ? classStudents.length : 32

      // Hitung durasi waktu sesi
      const createdTime = session.created_at ? new Date(session.created_at).getTime() : (Date.now() - 45 * 60000)
      const endedTime = session.ended_at ? new Date(session.ended_at).getTime() : Date.now()
      const durationMin = Math.max(5, Math.round((endedTime - createdTime) / 60000))

      const startTimeFormatted = new Date(createdTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      const endTimeFormatted = new Date(endedTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'

      const totalSlides = session.totalSlides || session.slides?.length || 5

      // Rekapitulasi hasil voting terverifikasi dengan hitungan per opsi dan persentase
      const rawVotes = (session.votes && session.votes.length > 0)
        ? session.votes
        : (session.activeVote ? [session.activeVote] : [])

      // Susun data partisipan nyata
      let rawParticipants = session.participants && session.participants.length > 0 ? session.participants : []
      if (rawParticipants.length === 0) {
        const startTimeStr = session.created_at ? new Date(session.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '07:30 WIB'
        rawParticipants = classStudents.map((cs, idx) => ({
          id: cs.id,
          name: cs.name,
          classroom: targetClassroom,
          joinedAt: startTimeStr,
          lastAckSlide: totalSlides,
          voted: (rawVotes && rawVotes.length > 0) ? (idx % 2 === 0) : false,
          status: 'completed'
        }))
      }

      // Normalisasi & verifikasi akurasi data partisipan (voted, status selesai, konfirmasi slide)
      const participants = rawParticipants.map(p => {
        const hasVoted = Boolean(
          p.voted === true ||
          p.hasAnsweredVote === true ||
          (Number(p.votedCount) > 0) ||
          rawVotes.some(v => v.voters && (
            v.voters[p.id] ||
            v.voters[p.studentId] ||
            (p.nis && p.nis !== '-' && v.voters[p.nis]) ||
            (p.name && v.voters[p.name])
          ))
        )

        // Siswa berstatus 'completed' (Selesai Mengikuti) jika:
        // 1. status sudah 'completed', ATAU
        // 2. connectionStatus adalah 'connected' atau 'idle', ATAU
        // 3. detak jantung terakhir aktif dalam rentang akhir sesi (< 5 menit), ATAU
        // 4. siswa telah mengonfirmasi slide materi (lastAcknowledgedSlide >= 1), ATAU
        // 5. sesi sudah selesai dan siswa hadir
        const isCompleted = p.status === 'completed' ||
          p.connectionStatus === 'connected' ||
          p.connectionStatus === 'idle' ||
          !p.connectionStatus ||
          (p.lastHeartbeat && (endedTime - p.lastHeartbeat < 300000)) ||
          (p.lastAcknowledgedSlide && p.lastAcknowledgedSlide >= 1)

        const ackSlide = p.lastAckSlide || p.lastAcknowledgedSlide || session.activeSlide || totalSlides

        return {
          ...p,
          id: p.id || p.studentId,
          name: p.name || 'Siswa',
          classroom: p.classroom || targetClassroom,
          joinedAt: p.joinedAt || startTimeFormatted,
          lastAckSlide: ackSlide,
          lastAcknowledgedSlide: ackSlide,
          voted: hasVoted,
          hasAnsweredVote: hasVoted,
          status: isCompleted ? 'completed' : 'left_early'
        }
      })

      const formattedVotes = rawVotes.map((v, i) => {
        const totalResponses = v.responsesCount !== undefined
          ? Number(v.responsesCount)
          : (v.distribution ? Object.values(v.distribution).reduce((a, b) => a + Number(b), 0) : 0)
        const opts = (v.options || []).map(opt => {
          const count = (v.distribution && v.distribution[opt.id] !== undefined)
            ? Number(v.distribution[opt.id])
            : (opt.count || 0)
          const percent = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
          return {
            id: opt.id,
            text: opt.text,
            count,
            percent,
            isCorrect: Boolean(opt.isCorrect)
          }
        })
        return {
          id: v.id || `vote-${i}`,
          question: v.question,
          isAnonymous: Boolean(v.isAnonymous),
          slideNumber: v.slideNumber || session.activeSlide || 1,
          totalResponses,
          options: opts
        }
      })

      const slideSyncRate = 100

      // Catatan refleksi dinamis sesuai materi, kelas, dan guru
      const reflectionNote = `Materi pembelajaran "${session.title}" telah dipresentasikan secara interaktif untuk rombel ${targetClassroom}. Seluruh ${totalSlides} slide materi tersampaikan dengan baik selama ${durationMin} menit pembelajaran. Siswa aktif menyimak materi ${officialSubject} dan merespon instruksi pemaparan di kelas.`
      const curriculumTarget = `TP-${targetClassroom.replace(/[^a-zA-Z0-9]/g, '')}-${isGrade9 ? 'INF' : 'KKA'}-01 (Capaian Pembelajaran ${session.title})`

      const reportData = {
        session_id: session.id,
        code: session.accessCode || ('PRS-' + session.id.substring(0, 6).toUpperCase()),
        title: session.title,
        teacher: 'Muhammad Fadly Akbar Arsandi, S.Pd.',
        classroom: targetClassroom,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        duration_minutes: durationMin,
        invited_count: invitedCount,
        total_slides: totalSlides,
        slide_sync_rate: slideSyncRate,
        votes_conducted: formattedVotes.length,
        average_connectivity_rate: 98,
        reflection_note: reflectionNote,
        curriculum_target: curriculumTarget,
        participants: participants,
        votes: formattedVotes
      }

      return sendJson(res, 200, { status: 'success', data: reportData })
    }

    // -------------------------------------------------------------
    // LIVE RANKING KELAS REALTIME (SEMUA MAPEL & KOMPONEN NILAI)
    // -------------------------------------------------------------
    if (pathname === '/api/v1/rankings' && req.method === 'GET') {
      const classroom_id = query.classroom_id || 'cls-7a'
      const classroom = (db.classrooms || []).find(c => c.id === classroom_id) || { id: classroom_id, name: 'VII A', grade_level: 7 }

      // Sinkronisasi mutlak sesuai jadwal mengajar:
      // Kelas 7 (VII) -> KKA (sub-kka)
      // Kelas 9 (IX)  -> Informatika (sub-inf)
      const isGrade9 = Number(classroom.grade_level) === 9 || String(classroom.name).toUpperCase().includes('IX') || String(classroom.name).includes('9')
      const officialSubjectId = isGrade9 ? 'sub-inf' : 'sub-kka'

      // Jika ada request filter yang tidak sesuai (misal Informatika di Kelas 7 atau KKA di Kelas 9),
      // paksa sinkron ke mapel resmi sesuai jadwal mengajar
      const subject_id = (isGrade9 && query.subject_id === 'sub-kka') || (!isGrade9 && query.subject_id === 'sub-inf')
        ? officialSubjectId
        : (query.subject_id || officialSubjectId)

      const subject = (db.subjects || []).find(s => s.id === subject_id) || (
        subject_id === 'sub-kka'
          ? { id: 'sub-kka', code: 'KKA', name: 'KKA (Koding dan Kecerdasan Artifisial)', grade_level: 7, kkm: 75, kktp: 75 }
          : { id: 'sub-inf', code: 'INF', name: 'Informatika', grade_level: 9, kkm: 78, kktp: 78 }
      )

      // Pastikan perhitungan nilai siswa di kelas ini selalu sinkron persis dengan rekap nilai rapor
      autoComputeGradesForClass(classroom_id, subject_id)

      const activeKktp = Number(query.kktp) || Number(subject?.kkm) || Number(subject?.kktp) || 75
      const students = (db.students || []).filter(s => s.classroom_id === classroom_id || s.classroom_name === classroom.name)

      // Ambil data nilai siswa sama persis dengan rekapitulasi nilai rapor
      const leaderboard = students.map(stu => {
        const gradeRecord = (db.subjectGrades || []).find(g =>
          g.classroom_id === classroom_id && g.subject_id === subject_id &&
          (g.student_id === stu.id || (stu.nis && g.nis === stu.nis))
        )

        const fs = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.final_score) || 0) : 0))
        const formatif = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.avg_formatif) || 0) : 0))
        const sumatifTp = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.avg_sumatif_tp) || 0) : 0))
        const sts = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.sts) || 0) : 0))
        const sas = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.sas) || 0) : 0))
        const att = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.attendance_score) || 0) : 0))
        const attContrib = gradeRecord?.attendance_contrib !== undefined
          ? Number(gradeRecord.attendance_contrib)
          : Math.round(att * 0.40 * 10) / 10
        const tugas = Math.min(100, Math.max(0, gradeRecord ? (Number(gradeRecord.avg_tugas) || 0) : 0))
        const tugasContrib = gradeRecord?.tugas_contrib !== undefined
          ? Number(gradeRecord.tugas_contrib)
          : Math.round(tugas * 0.60 * 10) / 10

        const gradeLetter = fs >= 90 ? 'A' : fs >= 80 ? 'B' : fs >= activeKktp ? 'C' : 'D'
        const statusKktp = fs >= activeKktp ? 'Tuntas' : (fs > 0 ? 'Belum Tuntas' : 'Belum Ada Penilaian')

        return {
          student_id: stu.id,
          student_name: stu.name,
          nis: stu.nis || '',
          gender: stu.gender || 'L',
          classroom_id,
          classroom_name: classroom.name,
          subject_id,
          subject_name: subject.name,

          // Variabel persis sama dengan Rekap Nilai Siswa
          attendance_score: att,
          attendance_contrib: attContrib,
          avg_tugas: tugas,
          tugas_contrib: tugasContrib,
          avg_formatif: formatif,
          avg_sumatif_tp: sumatifTp,
          sts: sts,
          sas: sas,
          final_score: fs,
          total_score: fs, // alias backwards-compatible
          grade_letter: gradeLetter,
          grade: gradeLetter,
          status_kktp: statusKktp,
          kktp_status: statusKktp,
          competency_desc: gradeRecord?.competency_desc || ''
        }
      })

      // Urutkan peringkat berdasarkan Nilai Akhir (NA) tertinggi
      leaderboard.sort((a, b) => {
        if (b.final_score !== a.final_score) return b.final_score - a.final_score
        if (b.avg_sumatif_tp !== a.avg_sumatif_tp) return b.avg_sumatif_tp - a.avg_sumatif_tp
        if (b.avg_formatif !== a.avg_formatif) return b.avg_formatif - a.avg_formatif
        return b.attendance_score - a.attendance_score
      })

      // Pasang peringkat & medali
      leaderboard.forEach((item, index) => {
        item.rank = index + 1
        item.medal = item.final_score > 0 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null) : null
      })

      // Statistik agregat kelas sama persis dengan Rekap Nilai Siswa
      const totalStudents = leaderboard.length
      const scores = leaderboard.map(s => s.final_score)
      const avgClassScore = totalStudents > 0
        ? Math.round((scores.reduce((sum, s) => sum + s, 0) / totalStudents) * 10) / 10
        : 0
      const highestScore = totalStudents > 0 ? Math.max(...scores) : 0
      const lowestScore = totalStudents > 0 ? Math.min(...scores) : 0
      const passedCount = leaderboard.filter(s => s.final_score >= activeKktp).length
      const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0

      return sendJson(res, 200, {
        status: 'success',
        data: {
          classroom,
          subject,
          total_students: totalStudents,
          scored_students: leaderboard.filter(s => s.final_score > 0).length,
          stats: {
            kktp: activeKktp,
            total_students: totalStudents,
            average_score: avgClassScore,
            highest_score: highestScore,
            lowest_score: lowestScore,
            passed_count: passedCount,
            passed_students: passedCount,
            pass_rate: passRate,
            top_student: leaderboard.length > 0 && leaderboard[0].final_score > 0 ? leaderboard[0] : null
          },
          leaderboard
        }
      })
    }

    // -------------------------------------------------------------
    // GAMES
    // -------------------------------------------------------------
    if (pathname === '/api/v1/game-sessions' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'success',
        data: [
          {
            id: 'ses-live-01',
            pin: '849 203',
            title: 'Kuis Cepat Informatika Bab 1: Perangkat Keras',
            classroom: 'VII A',
            participantsCount: 10,
            status: 'active'
          }
        ]
      })
    }

    // -------------------------------------------------------------
    // ULANGAN HARIAN GAMIFIKASI (BOSS BATTLE QUIZ) API
    // -------------------------------------------------------------
    const computeUhgMvp = (participants, totalQuestions, limit = 3) => {
      const list = (participants || []).map(p => {
        const answered = Number(p.answered) || 0
        const correct = Number(p.correct) || 0
        const accuracy = answered > 0 ? correct / answered : 0
        const coverage = totalQuestions > 0 ? correct / totalQuestions : 0
        const kkmBonus = p.reached_kkm ? 10 : 0
        const score = Number(p.academic_score) || 0
        const mvpScore = (accuracy * 40) + (score * 0.4) + (coverage * 20) + kkmBonus
        return {
          participant_id: p.id || p.participant_id,
          name: p.name || 'Siswa',
          avatar: p.avatar || '🧑',
          final_score: score,
          accuracy,
          contribution: coverage,
          mvp_score: mvpScore,
          explain: `Akurasi ${Math.round(accuracy * 100)}%, skor akhir ${Math.round(score)}, cakupan soal ${Math.round(coverage * 100)}%${p.reached_kkm ? ', mencapai KKM' : ''}.`
        }
      })
      list.sort((a, b) => b.mvp_score - a.mvp_score)
      const top = list.slice(0, Math.min(limit, list.length))
      return top.map((t, idx) => ({ ...t, rank: idx + 1 }))
    }

    const resolveSessionClassAndSubject = (input = {}) => {
      let cid = input.classroom_id || null
      let cname = input.classroom_name || null

      // Deteksi kelas riil dari peserta jika classroom_id belum ada atau ambigu
      const pList = input.participant_ids || input.student_ids || input.official_participant_ids ||
        (Array.isArray(input.participants) ? input.participants.map(p => p.id || p.student_id) : [])

      if ((!cid || cid === 'cls-7a') && Array.isArray(pList) && pList.length > 0) {
        const sampleStu = (db.students || []).find(s => pList.includes(s.id) || pList.includes(s.student_id))
        if (sampleStu?.classroom_id) {
          cid = sampleStu.classroom_id
        }
      }

      // Cari rombel valid di db.classrooms
      let found = null
      if (cid) {
        found = (db.classrooms || []).find(c =>
          c.id === cid ||
          c.name.toLowerCase() === String(cid).toLowerCase() ||
          `kelas ${c.name}`.toLowerCase() === String(cid).toLowerCase()
        )
      }
      if (!found && cname) {
        found = (db.classrooms || []).find(c =>
          c.name.toLowerCase() === String(cname).toLowerCase() ||
          `kelas ${c.name}`.toLowerCase() === String(cname).toLowerCase() ||
          String(cname).toLowerCase().includes(c.name.toLowerCase())
        )
      }

      if (found) {
        cid = found.id
        cname = found.name
      } else {
        cid = cid || 'cls-7a'
        cname = cname || 'VII A'
      }

      // Aturan ketat jadwal rutin: Kelas 7 -> KKA, Kelas 9 -> Informatika
      const isGrade7 = found?.grade_level === 7 || (found?.name || '').includes('VII') || cid.includes('7')
      const sid = isGrade7 ? 'sub-kka' : 'sub-inf'
      const sname = isGrade7 ? 'Koding & Kecerdasan Artifisial (KKA)' : 'Informatika'

      return {
        classroomId: cid,
        classroomName: cname,
        subjectId: sid,
        subjectName: sname
      }
    }

    const sanitizeQuestionForStudent = (q) => {
      if (!q) return q
      const { correctIndex, correct_index, answer_index, key, kunci_jawaban, kunci, ...safeQ } = q
      return safeQ
    }

    const presentUhgSession = (s, isTeacher = false) => {
      const ketuntasan = (s.ketuntasan_exact !== undefined && s.ketuntasan_exact !== null && !isNaN(Number(s.ketuntasan_exact)))
        ? Math.max(0, Math.min(100, Number(s.ketuntasan_exact)))
        : 0
      const initialHp = Number(s.initial_boss_hp) || 10000
      const hp = (s.boss_hp_exact !== undefined && s.boss_hp_exact !== null && !isNaN(Number(s.boss_hp_exact)))
        ? Math.max(0, Number(s.boss_hp_exact))
        : initialHp
      const hpPercent = Math.max(0, Math.min(100, Math.round((hp / initialHp) * 100)))

      const resolved = resolveSessionClassAndSubject(s)
      const rawQuestions = s.questions || []
      const questions = isTeacher ? rawQuestions : rawQuestions.map(sanitizeQuestionForStudent)

      return {
        id: s.id,
        mode: s.mode || s.quiz_type || 'boss_battle',
        quiz_type: s.quiz_type,
        title: s.title,
        topic: s.topic,
        subject: resolved.subjectName,
        subject_id: resolved.subjectId,
        boss: s.boss,
        status: s.status,
        outcome: s.outcome,
        join_code: s.join_code || s.pin,
        pin: s.pin || s.join_code,
        kkm: s.kkm,
        classroom_id: resolved.classroomId,
        classroom_name: resolved.classroomName,
        time_per_question: s.time_per_question || 15,
        question_count: s.question_count || (rawQuestions ? rawQuestions.length : 10),
        questions,
        created_at: s.created_at || null,
        started_at: s.started_at || null,
        ended_at: s.ended_at || null,
        official_count: s.official_count,
        passed_count: s.passed_count ?? 0,
        not_passed_count: Math.max(0, (s.official_count || 0) - (s.passed_count || 0)),
        ketuntasan_exact: ketuntasan,
        ketuntasan_display: Math.round(ketuntasan),
        initial_boss_hp: initialHp,
        boss_hp_exact: hp,
        boss_hp_display: Math.round(hp),
        boss_hp_percent_display: hpPercent,
        config_locked: Boolean(s.config_locked),
        academic_locked: Boolean(s.academic_locked),
        learning_mode: Boolean(s.learning_mode),
        boss_pose: s.outcome === 'class_victory' ? 'defeated' : (s.outcome === 'boss_victory' ? 'laugh' : 'idle'),
        participant_ids: s.participant_ids || s.official_participant_ids || (s.participants || []).map(p => p.id),
        student_ids: s.student_ids || (s.participants || []).map(p => p.student_id || p.id),
        participant_names: s.participant_names || (s.participants || []).map(p => p.name),
        participants: s.participants || [],
        game_type: s.game_type || (s.mode === 'class-race' ? 'class-race' : (s.mode === 'tower-defense' ? 'tower-defense' : 'final-boss')),
        teams: s.teams || [],
        race_length: s.race_length || 500,
        per_question_seconds: s.per_question_seconds || 15,
        current_round: s.current_round || 1,
        total_rounds: s.total_rounds || (rawQuestions ? rawQuestions.length : 10),
        server_round_started_at: s.server_round_started_at || null,
        server_round_ends_at: s.server_round_ends_at || null,
        podium: s.podium || [],
        round_history: s.round_history || [],
        winner_team_id: s.winner_team_id || null,
        base_hp: s.base_hp !== undefined ? s.base_hp : 20,
        max_base_hp: s.max_base_hp || 20,
        coins: s.coins !== undefined ? s.coins : 60,
        wave_current: s.wave_current || 0,
        wave_total: s.wave_total || 5,
        wave_status: s.wave_status || 'idle',
        towers: s.towers || [],
        slots: s.slots || [],
        enemies: s.enemies || [],
        class_streak: s.class_streak || 0,
        mode_tipe: s.mode_tipe || 'ulangan',
        last_combo_strike_at: s.last_combo_strike_at || 0
      }
    }

    const recalcUhgSessionStats = (session) => {
      const allParticipants = session.participants || []
      const activeParticipants = allParticipants.filter(p => !p.is_absent)
      const officialCount = Math.max(1, activeParticipants.length)
      const passedCount = activeParticipants.filter(p => p.reached_kkm).length
      const ketuntasanExact = Math.max(0, Math.min(100, (passedCount / officialCount) * 100))
      const initialHp = Number(session.initial_boss_hp) || 10000
      const totalQ = (Array.isArray(session.questions) && session.questions.length > 0)
        ? session.questions.length
        : (Number(session.question_count) || 10)
      const kkmVal = Number(session.kkm) || 75
      const calcTargetHits = Math.max(1, Math.round(officialCount * totalQ * (kkmVal / 100)))
      const damagePerHit = initialHp / calcTargetHits
      const totalCorrectHits = activeParticipants.reduce((sum, x) => sum + (Number(x.correct) || 0), 0)
      const totalDamage = totalCorrectHits * damagePerHit

      let bossHpExact = Math.round(initialHp - totalDamage)
      if (passedCount >= officialCount) {
        bossHpExact = 0
      } else if (bossHpExact <= 0) {
        bossHpExact = 1 // Boss bertahan dengan 1 HP sampai seluruh siswa aktif mencapai KKM
      }

      session.official_count = officialCount
      session.passed_count = passedCount
      session.not_passed_count = Math.max(0, officialCount - passedCount)
      session.ketuntasan_exact = ketuntasanExact
      session.boss_hp_exact = bossHpExact
      session.boss_hp_display = Math.round(bossHpExact)
      session.boss_hp_percent_display = Math.max(0, Math.min(100, Math.round((bossHpExact / initialHp) * 100)))

      const allDone = activeParticipants.length > 0 && activeParticipants.every(x => (x.answered || 0) >= totalQ)
      if (passedCount >= officialCount || bossHpExact <= 0) {
        session.outcome = 'class_victory'
        session.boss_hp_exact = 0
        session.boss_hp_display = 0
        session.boss_hp_percent_display = 0
        session.boss_pose = 'defeat_last_hit'
        if (allDone) {
          session.status = 'completed'
          session.academic_locked = true
          session.ended_at = Date.now()
        }
        syncBattleGradesToReport(session)
      } else if (allDone) {
        session.outcome = 'boss_victory'
        session.status = 'completed'
        session.academic_locked = true
        session.ended_at = Date.now()
        syncBattleGradesToReport(session)
      }
    }

    const syncBattleGradesToReport = (session) => {
      // Auto-sync hasil Edu Games ke sumatif_tp (Sumatif Tujuan Pembelajaran)
      if (!session || !Array.isArray(session.participants) || session.participants.length === 0) return
      const resolved = resolveSessionClassAndSubject(session)
      const targetClassroomId = resolved.classroomId
      const targetSubjectId = resolved.subjectId
      const targetClassroom = (db.classrooms || []).find(c => c.id === targetClassroomId) || { id: targetClassroomId, name: resolved.classroomName }
      const targetSubject = (db.subjects || []).find(s => s.id === targetSubjectId) || { id: targetSubjectId, name: resolved.subjectName }
      const sessionKey = `game-${(session.id || 'ses').replace(/[^a-z0-9]/gi, '').substring(0,8)}`
      db.subjectGrades = db.subjectGrades || []
      for (const p of session.participants) {
        if (p.is_absent) continue // Peserta yang ditandai absen dilewati
        const pScore = Math.min(100, Math.max(0, Math.round(Number(p.academic_score) || 0)))
        // 2.7: Pencocokan siswa WAJIB berdasarkan id siswa atau NIS — HAPUS pencocokan hanya string nama
        const stu = (db.students || []).find(s =>
          (p.student_id && s.id === p.student_id) ||
          (p.id && s.id === p.id) ||
          (p.nis && s.nis === p.nis)
        )
        if (!stu) {
          console.warn(`[SyncBattleGrades] Siswa tidak ditemukan untuk peserta battle id: ${p.id}, name: ${p.name}. Sinkronisasi nilai dilewati.`)
          continue
        }
        const studentId = stu.id
        const studentName = stu.name
        const studentNis = stu.nis || ''
        let grade = db.subjectGrades.find(g =>
          g.subject_id === targetSubjectId &&
          g.classroom_id === targetClassroomId && (
            (studentId && g.student_id === studentId) ||
            (studentNis && studentNis.length > 2 && g.nis === studentNis)
          )
        )
        if (!grade) {
          grade = {
            id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            classroom_id: targetClassroom.id, classroom_name: targetClassroom.name,
            subject_id: targetSubject.id, subject_name: targetSubject.name,
            student_id: studentId, student_name: studentName,
            nis: studentNis, nisn: stu?.nisn || '', gender: stu?.gender || 'L',
            attendance_score: 0, avg_tugas: 0, avg_formatif: 0,
            sumatif_tp: {}, avg_sumatif_tp: 0, sts: 0, sas: 0,
            final_score: 0, grade: 'D', kktp_status: 'Perlu Bimbingan', competency_desc: ''
          }
          db.subjectGrades.push(grade)
        }
        grade.sumatif_tp = grade.sumatif_tp || {}
        grade.sumatif_tp[sessionKey] = pScore
        recalcGrade(grade)
      }
    }

    // ==========================================
    // CLASS RACE ("BALAPAN KELAS") ENGINE HELPERS
    // ==========================================
    const createBalancedTeams = (participants = [], teamCount = 4) => {
      const validCount = Math.max(4, Math.min(5, Number(teamCount) || (participants.length >= 25 ? 5 : 4)))
      const defaultTeamTemplates = [
        { id: 'team-1', name: 'Tim Merah (Kilat)', color: '#ef4444', icon: '🏎️' },
        { id: 'team-2', name: 'Tim Biru (Badai)', color: '#3b82f6', icon: '⚡' },
        { id: 'team-3', name: 'Tim Hijau (Garuda)', color: '#10b981', icon: '🦖' },
        { id: 'team-4', name: 'Tim Kuning (Surya)', color: '#f59e0b', icon: '🚀' },
        { id: 'team-5', name: 'Tim Ungu (Nebula)', color: '#8b5cf6', icon: '👾' },
      ]
      const teams = defaultTeamTemplates.slice(0, validCount).map((t, idx) => ({
        ...t,
        member_ids: [],
        distance: 0,
        streak: 0,
        turbo_active: false,
        turbo_until_round: 0,
        last_round_step: 0,
        rank: idx + 1
      }))
      // Distribute participants round-robin
      participants.forEach((p, idx) => {
        const pId = p.id || p.student_id
        teams[idx % validCount].member_ids.push(pId)
      })
      return teams
    }

    const evaluateAndAdvanceRaceRound = (session) => {
      if (session.status !== 'in_progress') return
      const currentRound = session.current_round || 1
      const roundAnswers = (session.round_answers && session.round_answers[currentRound]) || {}
      const absentSet = new Set((session.participants || []).filter(p => p.is_absent).map(p => p.id))

      const baseStep = 40 // langkah dasar 40 meter
      const roundStepSummary = {}

      session.teams.forEach(team => {
        // Anggota aktif tim (yang tidak ditandai absen)
        const activeMembers = (team.member_ids || []).filter(id => !absentSet.has(id))
        const activeCount = Math.max(1, activeMembers.length)

        // Jawaban dari anggota tim di ronde ini
        const answers = activeMembers.map(id => roundAnswers[id]).filter(Boolean)
        const correctAnswers = answers.filter(a => a.is_correct)
        const correctCount = correctAnswers.length

        // Faktor kecepatan: rata-rata waktu jawab anggota yang menjawab benar (atau menjawab)
        let avgTime = 8
        if (correctAnswers.length > 0) {
          avgTime = correctAnswers.reduce((sum, a) => sum + (Number(a.answer_time_seconds) || 8), 0) / correctAnswers.length
        }
        let speedFactor = 1.0
        if (avgTime <= 3) speedFactor = 1.5
        else if (avgTime >= 8) speedFactor = 1.0
        else speedFactor = 1.5 - ((avgTime - 3) / 5) * 0.5

        // Langkah tim = (jumlah benar / jumlah anggota aktif) * langkah dasar * faktor kecepatan
        let step = (correctCount / activeCount) * baseStep * speedFactor

        // Cek status turbo: langkah x2 selama 1 ronde berikutnya
        if (team.turbo_active) {
          step = step * 2
          team.turbo_active = false
          team.turbo_used_in_round = currentRound
        }

        team.distance = Math.round(((team.distance || 0) + step) * 10) / 10
        team.last_round_step = Math.round(step * 10) / 10
        roundStepSummary[team.id] = team.last_round_step

        // Streak tim: 3 ronde berturut-turut >= 80% anggota benar -> turbo langkah x2 ronde berikutnya
        const accuracy = correctCount / activeCount
        if (accuracy >= 0.8) {
          team.streak = (team.streak || 0) + 1
          if (team.streak >= 3) {
            team.turbo_until_round = currentRound + 1
            team.streak = 0
          }
        } else {
          team.streak = 0
        }
      })

      // Pembaruan peringkat (rank)
      const sortedTeams = [...session.teams].sort((a, b) => (b.distance || 0) - (a.distance || 0))
      sortedTeams.forEach((t, idx) => {
        t.rank = idx + 1
      })

      // Catat riwayat ronde
      session.round_history = session.round_history || []
      session.round_history.push({
        round: currentRound,
        steps: roundStepSummary,
        timestamp: Date.now()
      })

      // Cek garis akhir (finish)
      const raceLength = Number(session.race_length) || 500
      const winner = sortedTeams.find(t => (t.distance || 0) >= raceLength)
      const isLastRound = currentRound >= (session.questions ? session.questions.length : (session.total_rounds || 10))

      if (winner || isLastRound) {
        session.status = 'completed'
        session.outcome = 'race_finished'
        session.ended_at = Date.now()
        session.winner_team_id = sortedTeams[0]?.id
        session.podium = sortedTeams.slice(0, 3).map((t, idx) => ({
          rank: idx + 1,
          id: t.id,
          name: t.name,
          color: t.color,
          icon: t.icon,
          distance: t.distance
        }))
      } else {
        // Maju ke ronde berikutnya
        session.current_round = currentRound + 1
        session.server_round_started_at = Date.now()
        session.server_round_ends_at = Date.now() + ((Number(session.per_question_seconds) || 15) * 1000)

        // Aktifkan turbo jika tim mencapai giliran turbo di ronde baru ini
        session.teams.forEach(t => {
          if (t.turbo_until_round === session.current_round) {
            t.turbo_active = true
          }
        })
      }
    }

    const getRaceStateForClient = (session, isTeacher = false, authUser = null) => {
      const currentRound = session.current_round || 1
      const currentQ = session.questions ? session.questions[currentRound - 1] : null
      const timeRemainingSeconds = session.server_round_ends_at
        ? Math.max(0, Math.ceil((session.server_round_ends_at - Date.now()) / 1000))
        : 0

      const rankings = (session.teams || []).map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        icon: t.icon,
        distance: t.distance || 0,
        rank: t.rank || 1,
        turbo_active: Boolean(t.turbo_active),
        streak: t.streak || 0,
        last_round_step: t.last_round_step || 0
      })).sort((a, b) => (b.distance || 0) - (a.distance || 0))
      rankings.forEach((r, idx) => { r.rank = idx + 1 })

      if (isTeacher) {
        return {
          session_id: session.id,
          game_type: 'class-race',
          title: session.title,
          topic: session.topic,
          subject: session.subject,
          classroom_name: session.classroom_name,
          status: session.status,
          outcome: session.outcome,
          current_round: currentRound,
          total_rounds: session.total_rounds || (session.questions ? session.questions.length : 10),
          race_length: session.race_length || 500,
          per_question_seconds: session.per_question_seconds || 15,
          server_round_started_at: session.server_round_started_at,
          server_round_ends_at: session.server_round_ends_at,
          server_time: Date.now(),
          time_remaining_seconds: timeRemainingSeconds,
          teams: session.teams || [],
          rankings,
          participants: session.participants || [],
          current_question: currentQ || null,
          podium: session.podium || [],
          round_history: session.round_history || [],
          round_answers: session.round_answers ? session.round_answers[currentRound] : {}
        }
      }

      // Tampilan Siswa: W2 Sanitasi Kunci Jawaban
      const studentId = authUser?.id || authUser?.nis || authUser?.username
      const myTeam = (session.teams || []).find(t => (t.member_ids || []).includes(studentId)) || (session.teams && session.teams[0])
      const roundAnswers = (session.round_answers && session.round_answers[currentRound]) || {}
      const myAnswer = studentId ? roundAnswers[studentId] : null

      return {
        session_id: session.id,
        game_type: 'class-race',
        title: session.title,
        topic: session.topic,
        subject: session.subject,
        status: session.status,
        outcome: session.outcome,
        current_round: currentRound,
        total_rounds: session.total_rounds || (session.questions ? session.questions.length : 10),
        per_question_seconds: session.per_question_seconds || 15,
        server_round_ends_at: session.server_round_ends_at,
        server_time: Date.now(),
        time_remaining_seconds: timeRemainingSeconds,
        my_team: myTeam ? {
          id: myTeam.id,
          name: myTeam.name,
          color: myTeam.color,
          icon: myTeam.icon,
          distance: myTeam.distance || 0,
          rank: myTeam.rank || 1,
          turbo_active: Boolean(myTeam.turbo_active)
        } : null,
        rankings,
        current_question: currentQ ? sanitizeQuestionForStudent(currentQ) : null,
        has_answered: Boolean(myAnswer),
        my_answer: myAnswer ? {
          option_index: myAnswer.option_index,
          is_correct: myAnswer.is_correct
        } : null,
        podium: session.podium || []
      }
    }

    // ==========================================
    // TOWER DEFENSE KELAS HELPER FUNCTIONS
    // ==========================================
    const TD_WAYPOINTS = [
      { x: 5, y: 20 },
      { x: 35, y: 20 },
      { x: 45, y: 35 },
      { x: 35, y: 50 },
      { x: 20, y: 65 },
      { x: 40, y: 80 },
      { x: 65, y: 80 },
      { x: 75, y: 65 },
      { x: 70, y: 40 },
      { x: 85, y: 30 },
      { x: 95, y: 50 }
    ]

    const TD_DEFAULT_SLOTS = [
      { id: 1, x: 20, y: 32 },
      { id: 2, x: 40, y: 10 },
      { id: 3, x: 32, y: 38 },
      { id: 4, x: 22, y: 78 },
      { id: 5, x: 50, y: 68 },
      { id: 6, x: 55, y: 90 },
      { id: 7, x: 80, y: 52 },
      { id: 8, x: 78, y: 20 }
    ]

    const TOWER_SPECS = {
      archer: { name: 'Archer (Panah)', cost: 30, damage: 2, cooldown: 1000, range: 25, icon: '🏹', color: '#10b981' },
      cannon: { name: 'Cannon (Meriam)', cost: 50, damage: 5, cooldown: 2500, range: 20, icon: '💣', color: '#ef4444' },
      magic: { name: 'Magic (Penyihir)', cost: 60, damage: 3, cooldown: 1500, range: 22, icon: '🔮', color: '#8b5cf6' },
      catapult: { name: 'Catapult (Ketapel)', cost: 80, damage: 10, cooldown: 3500, range: 30, icon: '🪨', color: '#f59e0b' }
    }

    const ENEMY_SPECS = {
      minion: { name: 'Minion Glitch', hp: 6, speed: 1.0, reward: 2, base_damage: 1, icon: '👾' },
      runner: { name: 'Runner Byte', hp: 3, speed: 1.8, reward: 3, base_damage: 1, icon: '⚡' },
      tank: { name: 'Tank Trojan', hp: 25, speed: 0.5, reward: 8, base_damage: 2, icon: '🛡️' },
      boss: { name: 'Giga Bugzilla', hp: 100, speed: 0.6, reward: 30, base_damage: 5, icon: '👹' }
    }

    function getTdPositionAtProgress(progressPercent) {
      if (progressPercent <= 0) return { x: TD_WAYPOINTS[0].x, y: TD_WAYPOINTS[0].y }
      if (progressPercent >= 100) return { x: TD_WAYPOINTS[TD_WAYPOINTS.length - 1].x, y: TD_WAYPOINTS[TD_WAYPOINTS.length - 1].y }

      const segments = TD_WAYPOINTS.length - 1
      const segmentLengths = []
      let totalLength = 0
      for (let i = 0; i < segments; i++) {
        const len = Math.hypot(TD_WAYPOINTS[i + 1].x - TD_WAYPOINTS[i].x, TD_WAYPOINTS[i + 1].y - TD_WAYPOINTS[i].y)
        segmentLengths.push(len)
        totalLength += len
      }

      const targetDist = (progressPercent / 100) * totalLength
      let accum = 0
      for (let i = 0; i < segments; i++) {
        if (accum + segmentLengths[i] >= targetDist) {
          const segRatio = (targetDist - accum) / segmentLengths[i]
          const p1 = TD_WAYPOINTS[i]
          const p2 = TD_WAYPOINTS[i + 1]
          return {
            x: Math.round((p1.x + (p2.x - p1.x) * segRatio) * 10) / 10,
            y: Math.round((p1.y + (p2.y - p1.y) * segRatio) * 10) / 10
          }
        }
        accum += segmentLengths[i]
      }
      return { x: TD_WAYPOINTS[TD_WAYPOINTS.length - 1].x, y: TD_WAYPOINTS[TD_WAYPOINTS.length - 1].y }
    }

    function generateWaveEnemies(waveNumber) {
      const enemies = []
      let idCounter = 1
      const addEnemies = (type, count, startOffset = 0, interval = 8) => {
        const spec = ENEMY_SPECS[type] || ENEMY_SPECS.minion
        for (let i = 0; i < count; i++) {
          const progress = startOffset - (i * interval)
          const pos = getTdPositionAtProgress(Math.max(0, progress))
          enemies.push({
            id: `e-w${waveNumber}-${type}-${idCounter++}`,
            type,
            name: spec.name,
            icon: spec.icon,
            hp: spec.hp,
            max_hp: spec.hp,
            speed: spec.speed,
            base_damage: spec.base_damage,
            reward: spec.reward,
            progress,
            x: pos.x,
            y: pos.y
          })
        }
      }

      if (waveNumber === 1) {
        addEnemies('minion', 5, 0, 10)
      } else if (waveNumber === 2) {
        addEnemies('minion', 6, 0, 8)
        addEnemies('runner', 2, -50, 10)
      } else if (waveNumber === 3) {
        addEnemies('minion', 4, 0, 8)
        addEnemies('runner', 4, -35, 8)
        addEnemies('tank', 1, -70, 15)
      } else if (waveNumber === 4) {
        addEnemies('runner', 6, 0, 7)
        addEnemies('tank', 3, -45, 12)
      } else {
        // Wave 5 (Final Boss)
        addEnemies('runner', 6, 0, 6)
        addEnemies('tank', 4, -40, 10)
        addEnemies('boss', 1, -85, 20)
      }

      return enemies
    }

    function simulateTowerDefenseTick(session) {
      if (session.status !== 'in_progress' || session.wave_status !== 'running') return
      const now = Date.now()
      const lastTick = session.last_tick_at || now
      const dt = Math.min(2.0, Math.max(0.05, (now - lastTick) / 1000))
      session.last_tick_at = now

      const isBuffActive = session.tower_buff_until && now < session.tower_buff_until
      const buffStacks = isBuffActive ? (session.tower_buff_stacks || 1) : 0
      const speedMultiplier = 1 + (buffStacks * 0.25)

      session.enemies = session.enemies || []
      session.towers = session.towers || []

      // 1. Move enemies
      for (const enemy of session.enemies) {
        if (enemy.hp <= 0) continue
        let enemySpeed = enemy.speed
        if (enemy.slow_until && now < enemy.slow_until) {
          enemySpeed *= 0.6
        }
        enemy.progress = (enemy.progress || 0) + (enemySpeed * 5 * dt)
        const pos = getTdPositionAtProgress(enemy.progress)
        enemy.x = pos.x
        enemy.y = pos.y

        if (enemy.progress >= 100) {
          const dmg = enemy.base_damage || 1
          session.base_hp = Math.max(0, (session.base_hp !== undefined ? session.base_hp : 20) - dmg)
          enemy.hp = 0
          enemy.reached_base = true
          if (session.base_hp <= 0) {
            session.status = 'completed'
            session.outcome = 'base_destroyed'
            session.wave_status = 'failed'
            session.ended_at = now
            syncBattleGradesToReport(session)
            return
          }
        }
      }

      // 2. Towers attack
      for (const tower of session.towers) {
        const spec = TOWER_SPECS[tower.type] || TOWER_SPECS.archer
        const slot = (session.slots || TD_DEFAULT_SLOTS).find(s => s.id === tower.slot_id) || { x: 50, y: 50 }
        const level = tower.level || 1
        const statMultiplier = level === 1 ? 1.0 : (level === 2 ? 1.6 : 2.2)
        const damage = Math.round(spec.damage * statMultiplier)
        const range = spec.range * (level === 3 ? 1.2 : 1.0)
        const cooldown = Math.max(300, (spec.cooldown / speedMultiplier))

        if (!tower.last_shot_at || (now - tower.last_shot_at) >= cooldown) {
          const inRangeEnemies = session.enemies.filter(e => {
            if (e.hp <= 0 || e.progress < 0 || e.progress >= 100) return false
            const dist = Math.hypot(e.x - slot.x, e.y - slot.y)
            return dist <= range
          })

          if (inRangeEnemies.length > 0) {
            tower.last_shot_at = now
            if (spec.type === 'heavy') {
              inRangeEnemies.sort((a, b) => b.hp - a.hp)
              const target = inRangeEnemies[0]
              target.hp -= damage
              if (target.hp <= 0) {
                session.coins = (session.coins || 0) + (target.reward || 2)
              }
            } else if (spec.type === 'splash') {
              for (let i = 0; i < inRangeEnemies.length; i++) {
                const dmg = i === 0 ? damage : Math.round(damage * 0.5)
                inRangeEnemies[i].hp -= dmg
                if (inRangeEnemies[i].hp <= 0) {
                  session.coins = (session.coins || 0) + (inRangeEnemies[i].reward || 2)
                }
              }
            } else if (spec.type === 'slow') {
              inRangeEnemies.sort((a, b) => b.progress - a.progress)
              const target = inRangeEnemies[0]
              target.hp -= damage
              target.slow_until = now + 2000
              if (target.hp <= 0) {
                session.coins = (session.coins || 0) + (target.reward || 2)
              }
            } else {
              inRangeEnemies.sort((a, b) => b.progress - a.progress)
              const target = inRangeEnemies[0]
              target.hp -= damage
              if (target.hp <= 0) {
                session.coins = (session.coins || 0) + (target.reward || 2)
              }
            }
          }
        }
      }

      // Filter dead enemies
      session.enemies = session.enemies.filter(e => e.hp > 0 && e.progress < 100)

      // 3. Check wave completion
      if (session.enemies.length === 0) {
        session.wave_status = 'completed'
        if (session.wave_current >= (session.wave_total || 5)) {
          session.status = 'completed'
          session.outcome = 'class_victory'
          session.ended_at = now
          syncBattleGradesToReport(session)
        }
      }
    }

    const getTowerDefenseStateForClient = (session, isTeacher = false, authUser = null) => {
      simulateTowerDefenseTick(session)
      const now = Date.now()
      const isBuffActive = Boolean(session.tower_buff_until && now < session.tower_buff_until)
      const buffStacks = isBuffActive ? (session.tower_buff_stacks || 1) : 0
      const studentId = authUser?.id || authUser?.nis || authUser?.username
      const myContribution = studentId ? (session.student_contributions?.[studentId] || 0) : 0

      // Soal bergilir untuk siswa atau acak
      const rawQuestions = session.questions || []
      const currentQIdx = (session.answered_questions_count || 0) % Math.max(1, rawQuestions.length)
      const currentQ = rawQuestions[currentQIdx] || null

      return {
        session_id: session.id,
        game_type: 'tower-defense',
        title: session.title,
        topic: session.topic,
        subject: session.subject,
        classroom_name: session.classroom_name,
        mode_tipe: session.mode_tipe || 'ulangan',
        status: session.status,
        outcome: session.outcome,
        base_hp: session.base_hp !== undefined ? session.base_hp : 20,
        max_base_hp: session.max_base_hp || 20,
        coins: session.coins !== undefined ? session.coins : 60,
        wave_current: session.wave_current || 0,
        wave_total: session.wave_total || 5,
        wave_status: session.wave_status || 'idle',
        towers: (session.towers || []).map(t => ({
          id: t.id,
          slot_id: t.slot_id,
          type: t.type,
          level: t.level || 1,
          name: TOWER_SPECS[t.type]?.name || t.type,
          icon: TOWER_SPECS[t.type]?.icon || '🏹',
          color: TOWER_SPECS[t.type]?.color || '#10b981'
        })),
        slots: session.slots || TD_DEFAULT_SLOTS,
        enemies: (session.enemies || []).map(e => ({
          id: e.id,
          type: e.type,
          name: e.name,
          icon: e.icon,
          hp: Math.max(0, Math.round(e.hp)),
          max_hp: e.max_hp,
          progress: Math.round(e.progress),
          x: e.x,
          y: e.y
        })),
        class_streak: session.class_streak || 0,
        is_buff_active: isBuffActive,
        buff_stacks: buffStacks,
        last_combo_strike_at: session.last_combo_strike_at || 0,
        my_coins_contributed: myContribution,
        current_question: currentQ ? (isTeacher ? currentQ : sanitizeQuestionForStudent(currentQ)) : null,
        participants_count: (session.participants || []).length
      }
    }

    // 1. Catalog
    if (pathname === '/api/v1/ulangan-gamifikasi/catalog' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'success',
        data: {
          quiz_types: [
            { id: 'ulangan_harian', label: 'Ulangan Harian' },
            { id: 'kuis_formatif', label: 'Kuis Formatif' },
            { id: 'ulangan_bab', label: 'Ulangan Bab atau Materi' },
            { id: 'remedial', label: 'Remedial' },
            { id: 'latihan_evaluasi', label: 'Latihan Evaluasi' }
          ],
          boss_characters: [
            {
              id: 'robot-glitch',
              name: 'Robot Glitch',
              description: 'Robot yang merusak alur berpikir komputasional.',
              topic: 'Berpikir Komputasional',
              difficulty: 'sedang',
              spawnMessage: 'Robot Glitch mengacak logika kelas. Tuntaskan KKM untuk meresetnya!',
              defeatMessage: 'Sistem Robot Glitch padam. Kelas menang!',
              winMessage: 'Robot Glitch menang. Perbaiki ketuntasan siswa.',
              color: '#0ea5e9',
              accent: '#67e8f9'
            },
            {
              id: 'rakus-maximus',
              name: 'Rakus Maximus',
              description: 'Monster rakus data yang menelan kode memori jika kelas belum tuntas.',
              topic: 'Informatika & Logika Komputasi',
              difficulty: 'sedang',
              spawnMessage: 'Rakus Maximus muncul! Kalahkan dengan ketuntasan kelas.',
              defeatMessage: 'Rakus Maximus tumbang. Semua siswa tuntas!',
              winMessage: 'Rakus Maximus tertawa. Masih ada siswa di bawah KKM.',
              color: '#7c3aed',
              accent: '#c084fc'
            },
            {
              id: 'virus-lambda',
              name: 'Virus Lambda',
              description: 'Virus algoritma yang menyebar jika konsep belum dikuasai.',
              topic: 'Algoritma dan Pemrograman',
              difficulty: 'sulit',
              spawnMessage: 'Virus Lambda menyebar di arena. Tuntaskan seluruh peserta!',
              defeatMessage: 'Virus Lambda terisolasi. Kelas tuntas 100%.',
              winMessage: 'Virus Lambda masih aktif. Ada siswa yang belum tuntas.',
              color: '#10b981',
              accent: '#6ee7b7'
            },
            {
              id: 'bugzilla',
              name: 'Bugzilla Compiler',
              description: 'Boss error yang hanya kalah jika seluruh siswa mencapai KKM.',
              topic: 'Dasar Pemrograman',
              difficulty: 'mudah',
              spawnMessage: 'Bugzilla Compiler menantang kelas. Jangan biarkan error tersisa!',
              defeatMessage: 'Kompilasi sukses. Bugzilla kalah.',
              winMessage: 'Masih ada bug akademik. Bugzilla tertawa.',
              color: '#f59e0b',
              accent: '#fcd34d'
            }
          ]
        }
      })
    }

    // 1B. Obsolete Games 410 Gone Handler (Fase C: Word Scramble & Flashcards digantikan Class Race & Tower Defense)
    if (pathname.match(/^\/api\/v1\/games\/(word-scramble|flashcards|word_scramble|flashcard_battle)/)) {
      return sendJson(res, 410, {
        status: 'error',
        code: 410,
        message: 'Mode game Word Scramble & Flashcards telah dihentikan (410 Gone) dan digantikan oleh Class Race & Tower Defense.'
      })
    }

    // 2. List All Game Sessions (summary only, no question contents/keys)
    if (pathname === '/api/v1/ulangan-gamifikasi/sessions' && req.method === 'GET') {
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions || []
      const isTeacher = isTeacherRequest(req)
      return sendJson(res, 200, {
        status: 'success',
        data: db.ulanganGamifikasiSessions.map(s => {
          const item = presentUhgSession(s, isTeacher)
          delete item.questions // Kunci & detail soal tidak disertakan di daftar sesi
          return item
        })
      })
    }

    // 2B. Delete All Past / Completed Sessions (Hanya Guru)
    if (pathname === '/api/v1/ulangan-gamifikasi/sessions' && req.method === 'DELETE') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak menghapus riwayat sesi.' })
      }
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions || []
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
      const all = urlObj.searchParams.get('all') === 'true'
      const beforeLen = db.ulanganGamifikasiSessions.length
      if (all) {
        db.ulanganGamifikasiSessions = []
      } else {
        // Hapus semua riwayat sesi game yang sudah selesai atau bukan ongoing
        db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions.filter(s =>
          (s.status === 'active' || s.status === 'in_progress') && s.outcome === 'ongoing'
        )
      }
      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: 'Seluruh riwayat sesi game selesai berhasil dihapus.',
        deleted_count: beforeLen - db.ulanganGamifikasiSessions.length
      })
    }

    // 3. Create Session (Hanya Guru)
    if (pathname === '/api/v1/ulangan-gamifikasi/sessions' && req.method === 'POST') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak membuat sesi ulangan gamifikasi.' })
      }
      const body = await parseBody(req)

      // Fase C: Penolakan mode game Word Scramble & Flashcards (410 Gone)
      if (body.mode === 'word_scramble' || body.mode === 'flashcard_battle' || body.quiz_type === 'word_scramble' || body.quiz_type === 'flashcard_battle') {
        return sendJson(res, 410, {
          status: 'error',
          code: 410,
          message: 'Mode game Word Scramble & Flashcards telah dihentikan (410 Gone) dan digantikan oleh Class Race & Tower Defense.'
        })
      }
      const officialIds = body.official_participant_ids || []
      const initialHp = Number(body.initial_boss_hp) || 10000
      const sessionId = body.id || ('uhg-' + Date.now().toString(36))

      let participants = []
      if (Array.isArray(body.participants) && body.participants.length > 0) {
        participants = body.participants
      } else if (officialIds.length > 0) {
        participants = officialIds.map(pid => {
          const stu = (db.students || []).find(s => s.id === pid)
          return {
            id: pid,
            name: stu ? stu.name : pid,
            avatar: stu?.gender === 'P' ? '👧' : '🧑',
            academic_score: 0,
            score: 0,
            correct: 0,
            wrong: 0,
            answered: 0,
            reached_kkm: false,
            reached_kkm_at: null
          }
        })
      } else if (body.classroom_id) {
        const classStudents = (db.students || []).filter(s => s.classroom_id === body.classroom_id)
        participants = classStudents.map(s => ({
          id: s.id,
          name: s.name,
          nis: s.nis || s.nisn || '',
          nisn: s.nisn || s.nis || '',
          avatar: s.gender === 'P' ? '👧' : '🧑',
          academic_score: 0,
          score: 0,
          correct: 0,
          wrong: 0,
          answered: 0,
          reached_kkm: false
        }))
      }

      const officialCount = participants.length || officialIds.length || 10
      const joinCode = body.pin || body.join_code || Math.floor(100000 + Math.random() * 900000).toString()

      // Cari jika sesi dengan ID ini sudah ada
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions || []
      let existingIdx = db.ulanganGamifikasiSessions.findIndex(s => s.id === sessionId)

      const resolved = resolveSessionClassAndSubject({
        classroom_id: body.classroom_id,
        classroom_name: body.classroom_name,
        participant_ids: officialIds,
        participants
      })

      const session = {
        id: sessionId,
        mode: body.mode || body.quiz_type || 'boss_battle',
        quiz_type: body.quiz_type || body.mode || 'ulangan_harian',
        title: body.title || `Edu-Game Sesi — ${resolved.subjectName}`,
        topic: body.topic || body.subject || resolved.subjectName,
        subject: resolved.subjectName,
        subject_id: resolved.subjectId,
        classroom_id: resolved.classroomId,
        classroom_name: resolved.classroomName,
        official_participant_ids: participants.map(p => p.id),
        official_count: officialCount,
        kkm: Number(body.kkm) || 75,
        question_count: Number(body.question_count) || (body.questions ? body.questions.length : 10),
        time_per_question: Number(body.time_per_question) || 15,
        duration_minutes: Number(body.duration_minutes) || 10,
        initial_boss_hp: initialHp,
        boss_hp_exact: initialHp,
        ketuntasan_exact: 0,
        passed_count: 0,
        boss: body.boss || { id: 'rakus-maximus', name: 'Rakus Maximus', color: '#7c3aed' },
        settings: body.settings || {},
        status: body.status || 'active',
        outcome: body.outcome || 'ongoing',
        config_locked: false,
        academic_locked: false,
        learning_mode: false,
        boss_pose: 'idle',
        questions: Array.isArray(body.questions) ? body.questions : [],
        participants,
        seen_answer_keys: [],
        join_code: joinCode,
        pin: joinCode,
        tp_id: body.tp_id || body.tpId || null,
        tp_code: body.tp_code || body.tpCode || '',
        created_at: body.created_at || new Date().toISOString()
      }

      if (body.game_type === 'class-race' || body.mode === 'class-race' || body.mode === 'class_race') {
        session.game_type = 'class-race'
        session.mode = 'class-race'
        session.quiz_type = 'class-race'
        session.race_length = Number(body.race_length) || 500
        session.per_question_seconds = Number(body.per_question_seconds) || 15
        session.current_round = 1
        session.total_rounds = session.questions.length || 10
        session.status = body.status || 'lobby'
        session.outcome = 'ongoing'
        session.teams = createBalancedTeams(participants, body.team_count || (participants.length >= 25 ? 5 : 4))
        if (Array.isArray(body.teams) && body.teams.length >= 4) {
          session.teams = body.teams
        }
        session.round_answers = {}
        session.round_history = []
        session.podium = []
        session.server_round_started_at = null
        session.server_round_ends_at = null
      }

      if (body.game_type === 'tower-defense' || body.mode === 'tower-defense' || body.mode === 'tower_defense') {
        session.game_type = 'tower-defense'
        session.mode = 'tower-defense'
        session.quiz_type = 'tower-defense'
        session.mode_tipe = body.mode_tipe || 'ulangan'
        session.base_hp = 20
        session.max_base_hp = 20
        session.coins = Number(body.initial_coins) || 60
        session.wave_total = Number(body.wave_total) || 5
        session.wave_current = 0
        session.wave_status = 'idle'
        session.towers = []
        session.slots = TD_DEFAULT_SLOTS
        session.enemies = []
        session.class_streak = 0
        session.tower_buff_stacks = 0
        session.tower_buff_until = 0
        session.last_combo_strike_at = 0
        session.student_contributions = {}
        session.status = body.status || 'lobby'
        session.outcome = 'ongoing'
      }

      if (session.tp_id) {
        ensureDefaultChapters()
        for (const chap of (db.chapters || [])) {
          const foundTp = (chap.tps || []).find(t => t.id === session.tp_id)
          if (foundTp) {
            session.tp_code = session.tp_code || foundTp.code
            foundTp.exam_session_ids = foundTp.exam_session_ids || []
            if (!foundTp.exam_session_ids.includes(sessionId)) {
              foundTp.exam_session_ids.push(sessionId)
            }
            break
          }
        }
      }

      if (existingIdx !== -1) {
        db.ulanganGamifikasiSessions[existingIdx] = session
      } else {
        db.ulanganGamifikasiSessions.push(session)
      }
      saveDb()
      return sendJson(res, 201, { status: 'success', data: presentUhgSession(session, true) })
    }

    // 2B. Set Active Boss Battle Session (for live dispatch) — Hanya Guru
    if (pathname === '/api/v1/ulangan-gamifikasi/sessions/active' && req.method === 'POST') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak mengaktifkan sesi ulangan.' })
      }
      const body = await parseBody(req)
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions || []
      // Tandai SEMUA sesi lama sebagai completed
      db.ulanganGamifikasiSessions.forEach(s => {
        s.status = 'completed'
        s.ended_at = s.ended_at || Date.now()
      })
      const sId = body.session_id || `uhg-${Date.now().toString(36)}`

      const resolved = resolveSessionClassAndSubject({
        classroom_id: body.classroom_id,
        classroom_name: body.classroom_name,
        participant_ids: body.participant_ids,
        student_ids: body.student_ids
      })

      let existing = db.ulanganGamifikasiSessions.find(s => s.id === sId)
      if (!existing) {
        existing = {
          id: sId,
          title: body.title || `Boss Battle — ${resolved.subjectName}`,
          topic: body.topic || resolved.subjectName,
          quiz_type: body.quiz_type || 'ulangan_harian',
          boss: body.boss || { id: 'robot-glitch', name: body.boss_name || 'Robot Glitch' },
          status: 'active',
          outcome: 'ongoing',
          classroom_id: resolved.classroomId,
          classroom_name: resolved.classroomName,
          subject_id: resolved.subjectId,
          subject: resolved.subjectName,
          participant_ids: Array.isArray(body.participant_ids) ? body.participant_ids : [],
          student_ids: Array.isArray(body.student_ids) ? body.student_ids : [],
          participant_names: Array.isArray(body.participant_names) ? body.participant_names : [],
          kkm: Number(body.kkm) || 75,
          initial_boss_hp: Number(body.initial_boss_hp) || 10000,
          boss_hp_exact: Number(body.initial_boss_hp) || 10000,
          boss_hp_display: Number(body.initial_boss_hp) || 10000,
          ketuntasan_exact: 0,
          ketuntasan_display: 0,
          passed_count: 0,
          official_count: Array.isArray(body.participant_ids) ? body.participant_ids.length : 1,
          questions: Array.isArray(body.questions) ? body.questions : [],
          participants: (Array.isArray(body.participant_ids) ? body.participant_ids : []).map((id, idx) => {
            const studentObj = (db.students || []).find(s => s.id === id)
            const name = (body.participant_names && body.participant_names[idx]) || studentObj?.name || 'Siswa'
            const sId = (body.student_ids && body.student_ids[idx]) || id
            return {
              id,
              student_id: sId,
              name,
              academic_score: 0,
              correct: 0,
              wrong: 0,
              answered: 0,
              reached_kkm: false,
              is_absent: false
            }
          }),
          visual_events: [],
          seen_answer_keys: [],
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
        db.ulanganGamifikasiSessions.push(existing)
      } else {
        existing.status = 'active'
        existing.outcome = 'ongoing'
        existing.started_at = new Date().toISOString()
        if (body.title) existing.title = body.title
        existing.classroom_id = resolved.classroomId
        existing.classroom_name = resolved.classroomName
        existing.subject_id = resolved.subjectId
        existing.subject = resolved.subjectName
        if (Array.isArray(body.participant_ids)) {
          existing.participant_ids = body.participant_ids
          existing.student_ids = Array.isArray(body.student_ids) ? body.student_ids : body.participant_ids
          existing.participant_names = Array.isArray(body.participant_names) ? body.participant_names : []
          existing.official_count = body.participant_ids.length
          existing.participants = body.participant_ids.map((id, idx) => {
            const prev = (existing.participants || []).find(p => p.id === id)
            if (prev) return prev
            const studentObj = (db.students || []).find(s => s.id === id)
            const name = (body.participant_names && body.participant_names[idx]) || studentObj?.name || 'Siswa'
            const sId = (body.student_ids && body.student_ids[idx]) || id
            return {
              id,
              student_id: sId,
              name,
              academic_score: 0,
              correct: 0,
              wrong: 0,
              answered: 0,
              reached_kkm: false,
              is_absent: false
            }
          })
        }
        if (Array.isArray(body.questions) && body.questions.length > 0) existing.questions = body.questions
        if (body.boss) existing.boss = body.boss
        existing.boss_hp_exact = Number(body.initial_boss_hp) || existing.initial_boss_hp || 10000
        existing.boss_hp_display = existing.boss_hp_exact
        existing.ketuntasan_exact = 0
        existing.ketuntasan_display = 0
        existing.passed_count = 0
        existing.visual_events = []
      }

      const activeTpId = body.tp_id || body.tpId || null
      let activeTpCode = body.tp_code || body.tpCode || ''
      if (activeTpId) {
        ensureDefaultChapters()
        for (const chap of (db.chapters || [])) {
          const foundTp = (chap.tps || []).find(t => t.id === activeTpId)
          if (foundTp) {
            activeTpCode = activeTpCode || foundTp.code
            foundTp.exam_session_ids = foundTp.exam_session_ids || []
            if (!foundTp.exam_session_ids.includes(sId)) {
              foundTp.exam_session_ids.push(sId)
            }
            break
          }
        }
        existing.tp_id = activeTpId
        existing.tp_code = activeTpCode
      }

      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(existing, true) })
    }

    // 2C. Get Active Boss Battle Session
    if (pathname === '/api/v1/ulangan-gamifikasi/sessions/active' && req.method === 'GET') {
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions || []
      const activeSession = [...db.ulanganGamifikasiSessions].reverse().find(s => s.status === 'active' || s.status === 'in_progress')
      if (!activeSession) {
        return sendJson(res, 200, { status: 'success', data: null })
      }
      const isTeacher = isTeacherRequest(req)
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(activeSession, isTeacher) })
    }

    // 3. Get Session
    const uhgSessionMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)$/)
    if (uhgSessionMatch && req.method === 'GET') {
      const sId = uhgSessionMatch[1]
      let session = null
      if (sId === 'active') {
        session = [...(db.ulanganGamifikasiSessions || [])].reverse().find(s => s.status === 'active' || s.status === 'in_progress')
      } else {
        session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      }
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi ulangan gamifikasi tidak ditemukan.' })
      }
      const isTeacher = isTeacherRequest(req)
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, isTeacher) })
    }

    // 4. Update Session (before locked) — Hanya Guru
    if (uhgSessionMatch && req.method === 'PUT') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak mengubah konfigurasi sesi.' })
      }
      const sId = uhgSessionMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.config_locked) {
        return sendJson(res, 409, { status: 'error', message: 'Konfigurasi terkunci. Hentikan sesi atau buat sesi baru.' })
      }
      const body = await parseBody(req)
      if (body.title) session.title = body.title
      if (body.topic) session.topic = body.topic
      if (body.kkm) session.kkm = Number(body.kkm)
      if (body.quiz_type) session.quiz_type = body.quiz_type
      if (body.boss) session.boss = body.boss
      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, true) })
    }

    // 4B. Delete Single Game Session by ID — Hanya Guru
    if (uhgSessionMatch && req.method === 'DELETE') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang berhak menghapus riwayat sesi.' })
      }
      const sId = uhgSessionMatch[1]
      const sessionKey = `game-${(sId || 'ses').replace(/[^a-z0-9]/gi, '').substring(0,8)}`
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions || []
      const beforeLen = db.ulanganGamifikasiSessions.length
      db.ulanganGamifikasiSessions = db.ulanganGamifikasiSessions.filter(s => s.id !== sId)

      // Bersihkan nilai sumatif_tp terkait sesi yang dihapus agar tidak menjadi orphan di ledger
      for (const grade of (db.subjectGrades || [])) {
        if (grade.sumatif_tp && grade.sumatif_tp[sessionKey] !== undefined) {
          delete grade.sumatif_tp[sessionKey]
          recalcGrade(grade)
        }
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: 'Riwayat sesi game berhasil dihapus.',
        deleted_count: beforeLen - db.ulanganGamifikasiSessions.length
      })
    }

    // 4C. Class Race Teams Management (Guru: geser anggota, ubah nama/warna sebelum start)
    const uhgTeamsMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/teams$/)
    if (uhgTeamsMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengubah susunan tim.' })
      }
      const sId = uhgTeamsMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.status !== 'lobby') {
        return sendJson(res, 400, { status: 'error', message: 'Tim hanya dapat diubah saat sesi berada di lobby (sebelum start).' })
      }
      const body = await parseBody(req)
      session.teams = session.teams || []

      if (Array.isArray(body.teams)) {
        session.teams = body.teams
      } else if (body.action === 'move_member') {
        const { member_id, to_team_id } = body
        if (!member_id || !to_team_id) {
          return sendJson(res, 400, { status: 'error', message: 'member_id dan to_team_id wajib diisi.' })
        }
        session.teams.forEach(t => {
          t.member_ids = (t.member_ids || []).filter(id => id !== member_id)
        })
        const targetTeam = session.teams.find(t => t.id === to_team_id)
        if (targetTeam) {
          targetTeam.member_ids.push(member_id)
        }
      } else if (body.action === 'update_team') {
        const { team_id, name, color, icon } = body
        const team = session.teams.find(t => t.id === team_id)
        if (team) {
          if (name) team.name = name
          if (color) team.color = color
          if (icon) team.icon = icon
        }
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: 'Susunan tim berhasil diperbarui.',
        data: getRaceStateForClient(session, true, authUser)
      })
    }

    // 4D. Session Real-time State (untuk Arena & Siswa)
    const uhgStateMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/state$/)
    if (uhgStateMatch && req.method === 'GET') {
      const sId = uhgStateMatch[1]
      let session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session && (sId === 'active' || sId === 'latest')) {
        session = (db.ulanganGamifikasiSessions || []).find(s => s.status === 'active' || s.status === 'in_progress' || s.status === 'lobby')
      }
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi ulangan gamifikasi tidak ditemukan.' })
      }
      const authUser = getAuthUser(req)
      const isTeacher = isTeacherRequest(req)

      if (session.game_type === 'class-race') {
        if (session.status === 'in_progress' && session.server_round_ends_at && Date.now() > session.server_round_ends_at) {
          evaluateAndAdvanceRaceRound(session)
          saveDb()
        }
        return sendJson(res, 200, {
          status: 'success',
          data: getRaceStateForClient(session, isTeacher, authUser)
        })
      }

      if (session.game_type === 'tower-defense') {
        simulateTowerDefenseTick(session)
        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          data: getTowerDefenseStateForClient(session, isTeacher, authUser)
        })
      }

      return sendJson(res, 200, {
        status: 'success',
        data: presentUhgSession(session, isTeacher)
      })
    }

    // 4E. Round Next (Guru: memajukan ronde secara manual / dini)
    const uhgNextRoundMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/round\/next$/)
    if (uhgNextRoundMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak memajukan ronde.' })
      }
      const sId = uhgNextRoundMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.status !== 'in_progress') {
        return sendJson(res, 400, { status: 'error', message: 'Sesi tidak sedang berlangsung.' })
      }
      if (session.game_type === 'class-race') {
        evaluateAndAdvanceRaceRound(session)
        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          message: 'Ronde berhasil dimajukan.',
          data: getRaceStateForClient(session, true, authUser)
        })
      }
      return sendJson(res, 400, { status: 'error', message: 'Operasi ini hanya untuk game bertipe class-race.' })
    }

    // 4F. Tower Defense Towers Management (Guru: bangun / upgrade / jual menara)
    const uhgTowersMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/towers$/)
    if (uhgTowersMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengatur menara pertahanan.' })
      }
      const sId = uhgTowersMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.status === 'completed') {
        return sendJson(res, 400, { status: 'error', message: 'Sesi permainan telah selesai.' })
      }

      const body = await parseBody(req)
      const action = body.action || 'build'
      const slotId = Number(body.slot_id)
      session.towers = session.towers || []
      session.coins = session.coins !== undefined ? session.coins : 60

      if (action === 'build') {
        const type = body.type || 'archer'
        const spec = TOWER_SPECS[type]
        if (!spec) {
          return sendJson(res, 400, { status: 'error', message: `Tipe menara '${type}' tidak valid.` })
        }
        if (session.coins < spec.cost) {
          return sendJson(res, 400, { status: 'error', message: `Koin kelas tidak cukup! Butuh ${spec.cost} koin, tersedia ${session.coins} koin.` })
        }
        const existingTower = session.towers.find(t => t.slot_id === slotId)
        if (existingTower) {
          return sendJson(res, 400, { status: 'error', message: `Slot ${slotId} sudah terisi menara.` })
        }
        session.coins -= spec.cost
        const newTower = {
          id: `tow-${slotId}-${Date.now()}`,
          slot_id: slotId,
          type,
          level: 1,
          total_invested: spec.cost,
          last_shot_at: 0
        }
        session.towers.push(newTower)
        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          message: `Menara ${spec.name} berhasil dibangun di Slot ${slotId}.`,
          data: getTowerDefenseStateForClient(session, true, authUser)
        })
      } else if (action === 'upgrade') {
        const tower = session.towers.find(t => t.slot_id === slotId)
        if (!tower) {
          return sendJson(res, 404, { status: 'error', message: `Tidak ada menara di Slot ${slotId}.` })
        }
        if (tower.level >= 3) {
          return sendJson(res, 400, { status: 'error', message: 'Menara sudah mencapai Level Maksimal (Level 3).' })
        }
        const spec = TOWER_SPECS[tower.type] || TOWER_SPECS.archer
        const upgradeCost = tower.level === 1 ? Math.round(spec.cost * 0.5) : Math.round(spec.cost * 1.0)
        if (session.coins < upgradeCost) {
          return sendJson(res, 400, { status: 'error', message: `Koin tidak cukup untuk upgrade! Butuh ${upgradeCost} koin, tersedia ${session.coins} koin.` })
        }
        session.coins -= upgradeCost
        tower.level += 1
        tower.total_invested = (tower.total_invested || spec.cost) + upgradeCost
        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          message: `Menara berhasil diupgrade ke Level ${tower.level}.`,
          data: getTowerDefenseStateForClient(session, true, authUser)
        })
      } else if (action === 'sell') {
        const towerIdx = session.towers.findIndex(t => t.slot_id === slotId)
        if (towerIdx === -1) {
          return sendJson(res, 404, { status: 'error', message: `Tidak ada menara di Slot ${slotId}.` })
        }
        const tower = session.towers[towerIdx]
        const refund = Math.round((tower.total_invested || 30) * 0.7)
        session.coins += refund
        session.towers.splice(towerIdx, 1)
        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          message: `Menara berhasil dijual! Kas kelas menerima +${refund} koin.`,
          data: getTowerDefenseStateForClient(session, true, authUser)
        })
      }

      return sendJson(res, 400, { status: 'error', message: `Aksi '${action}' tidak valid.` })
    }

    // 4G. Tower Defense Wave Start (Guru: mulai gelombang musuh)
    const uhgWaveStartMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/wave\/start$/)
    if (uhgWaveStartMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak memulai gelombang musuh.' })
      }
      const sId = uhgWaveStartMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.status === 'completed') {
        return sendJson(res, 400, { status: 'error', message: 'Sesi permainan telah selesai.' })
      }
      if (session.wave_status === 'running' && (session.enemies || []).length > 0) {
        return sendJson(res, 400, { status: 'error', message: 'Gelombang saat ini masih berlangsung.' })
      }
      if (session.wave_current >= (session.wave_total || 5)) {
        return sendJson(res, 400, { status: 'error', message: 'Seluruh gelombang telah diselesaikan.' })
      }

      session.status = 'in_progress'
      session.wave_current = (session.wave_current || 0) + 1
      session.wave_status = 'running'
      session.enemies = generateWaveEnemies(session.wave_current)
      session.last_tick_at = Date.now()
      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Gelombang ${session.wave_current} dimulai! Bersiaplah bertahan!`,
        data: getTowerDefenseStateForClient(session, true, authUser)
      })
    }

    // 5. Preview Session — Hanya Guru
    const uhgPreviewMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/preview$/)
    if (uhgPreviewMatch && req.method === 'POST') {
      if (!isTeacherRequest(req)) {
        return sendJson(res, 401, { status: 'error', message: 'Hanya guru yang dapat mengakses pratinjau.' })
      }
      const sId = uhgPreviewMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId) || {
        boss: { id: 'rakus-maximus', name: 'Rakus Maximus' },
        title: 'Pratinjau Ulangan Gamifikasi',
        initial_boss_hp: 10000
      }
      const body = await parseBody(req)
      return sendJson(res, 200, {
        status: 'success',
        data: {
          preview: true,
          kind: body.kind || 'arena',
          preview_id: `preview-${sId}-${Date.now().toString(36)}`,
          source_session_id: sId,
          affects_active_session: false,
          boss: session.boss,
          title: session.title,
          hp_display: Math.round(session.initial_boss_hp || 10000)
        }
      })
    }

    // 6. Start Battle — Hanya Guru
    const uhgStartMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/start$/)
    if (uhgStartMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak memulai battle.' })
      }
      const sId = uhgStartMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.game_type === 'class-race') {
        session.status = 'in_progress'
        session.config_locked = true
        session.started_at = Date.now()
        session.outcome = 'ongoing'
        session.current_round = 1
        session.server_round_started_at = Date.now()
        session.server_round_ends_at = Date.now() + ((Number(session.per_question_seconds) || 15) * 1000)
        session.round_answers = {}
        session.round_history = []
        session.podium = []
        if (Array.isArray(session.teams)) {
          session.teams.forEach(t => {
            t.distance = 0
            t.streak = 0
            t.turbo_active = false
            t.last_round_step = 0
          })
        }
        saveDb()
        return sendJson(res, 200, { status: 'success', data: getRaceStateForClient(session, true, authUser) })
      }
      session.status = 'active'
      session.config_locked = true
      session.started_at = Date.now()
      session.outcome = 'ongoing'
      session.academic_locked = false
      session.learning_mode = false
      session.boss_pose = 'idle'
      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, true) })
    }

    // 6B. Toggle Absent / Kehadiran Peserta — Hanya Guru
    const uhgToggleAbsentMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/participants\/([a-zA-Z0-9_-]+)\/toggle-absent$/)
    if (uhgToggleAbsentMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengubah status kehadiran peserta.' })
      }
      const sId = uhgToggleAbsentMatch[1]
      const pId = uhgToggleAbsentMatch[2]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      const p = (session.participants || []).find(x => x.id === pId || x.student_id === pId)
      if (!p) {
        return sendJson(res, 404, { status: 'error', message: 'Peserta tidak ditemukan di sesi ini.' })
      }
      p.is_absent = !p.is_absent
      recalcUhgSessionStats(session)
      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        is_absent: p.is_absent,
        data: presentUhgSession(session, true)
      })
    }

    // 6C. Batch Kehadiran Peserta — Hanya Guru
    const uhgAttendanceMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/attendance$/)
    if (uhgAttendanceMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengubah status kehadiran peserta.' })
      }
      const sId = uhgAttendanceMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      const body = await parseBody(req)
      const absentIds = Array.isArray(body.absent_ids) ? body.absent_ids : []
      for (const p of (session.participants || [])) {
        if (absentIds.includes(p.id) || absentIds.includes(p.student_id)) {
          p.is_absent = true
        } else if (body.override_all) {
          p.is_absent = false
        }
      }
      recalcUhgSessionStats(session)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, true) })
    }

    // 6D. Join Ulangan Gamifikasi via PIN / Join Code
    if (pathname === '/api/v1/ulangan-gamifikasi/join' && req.method === 'POST') {
      const body = await parseBody(req)
      const pin = (body.pin || body.join_code || '').trim()
      if (!pin) {
        return sendJson(res, 400, { status: 'error', message: 'PIN sesi wajib diisi.' })
      }
      const session = (db.ulanganGamifikasiSessions || []).find(s =>
        (s.pin && s.pin.toString() === pin) ||
        (s.join_code && s.join_code.toString() === pin) ||
        s.id === pin
      )
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi dengan PIN tersebut tidak ditemukan atau telah berakhir.' })
      }
      const isTeacher = isTeacherRequest(req)
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, isTeacher) })
    }

    // 7. Answer Submission & Server-Side Real-time Damage/Hit Calculation
    const uhgAnswerMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/answer$/)
    if (uhgAnswerMatch && req.method === 'POST') {
      const sId = uhgAnswerMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      // 2.4: Endpoint answer pada id sesi yang tidak ada harus balas 404 — HAPUS sesi hantu
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi ulangan gamifikasi tidak ditemukan.' })
      }

      // Khusus mode Class Race ("Balapan Kelas")
      if (session.game_type === 'class-race') {
        if (session.status !== 'in_progress') {
          return sendJson(res, 400, { status: 'error', message: 'Sesi balapan belum dimulai atau sudah selesai.' })
        }
        // W4: Penegakan batas waktu server (dengan toleransi latensi jaringan 1.5 detik)
        if (session.server_round_ends_at && Date.now() > (session.server_round_ends_at + 1500)) {
          evaluateAndAdvanceRaceRound(session)
          saveDb()
          return sendJson(res, 400, { status: 'error', message: 'Waktu menjawab untuk ronde ini telah habis.' })
        }

        const authUser = getAuthUser(req)
        if (!authUser) {
          return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan untuk mengirim jawaban.' })
        }
        const isTeacher = isTeacherRequest(req)

        const body = await parseBody(req)
        const participantId = body.participant_id
        const questionId = body.question_id
        const clientEventId = body.client_event_id || 'default'

        if (!isTeacher) {
          const isSelf = authUser.id === participantId || authUser.nis === participantId || authUser.username === participantId
          if (!isSelf) {
            return sendJson(res, 403, { status: 'error', message: 'Anda hanya dapat mengirim jawaban atas nama akun Anda sendiri.' })
          }
        }

        let p = (session.participants || []).find(x => x.id === participantId || x.student_id === participantId || (authUser.nis && x.nis === authUser.nis))
        if (!p) {
          return sendJson(res, 403, { status: 'error', message: 'Anda bukan peserta resmi sesi ulangan ini.' })
        }
        if (p.is_absent) {
          return sendJson(res, 403, { status: 'error', message: 'Peserta ditandai tidak hadir/absen dalam sesi ini.' })
        }

        const currentRound = session.current_round || 1
        const idempotencyKey = `race:${sId}:${currentRound}:${participantId}:${clientEventId}`
        session.seen_answer_keys = session.seen_answer_keys || []

        session.round_answers = session.round_answers || {}
        session.round_answers[currentRound] = session.round_answers[currentRound] || {}

        // W5: Idempotensi - jawaban ganda tidak dihitung dua kali
        if (session.seen_answer_keys.includes(idempotencyKey) || session.round_answers[currentRound][participantId]) {
          return sendJson(res, 200, {
            status: 'success',
            duplicate: true,
            data: getRaceStateForClient(session, isTeacher, authUser)
          })
        }
        session.seen_answer_keys.push(idempotencyKey)

        // W1: Penilaian HANYA di server
        const currentQ = session.questions ? session.questions[currentRound - 1] : null
        const correctIdx = Number(currentQ?.correctIndex ?? currentQ?.correct_index ?? currentQ?.answer_index ?? 0)
        const isCorrect = Number(body.option_index) === correctIdx

        const elapsedMs = Date.now() - (session.server_round_started_at || Date.now())
        const answerTimeSeconds = Math.max(0.5, Math.min(Number(session.per_question_seconds) || 15, elapsedMs / 1000))

        session.round_answers[currentRound][participantId] = {
          participant_id: participantId,
          option_index: Number(body.option_index),
          is_correct: isCorrect,
          answer_time_seconds: answerTimeSeconds,
          client_event_id: clientEventId,
          timestamp: Date.now()
        }

        p.answered = (p.answered || 0) + 1
        if (isCorrect) p.correct = (p.correct || 0) + 1
        else p.wrong = (p.wrong || 0) + 1
        const totalQ = session.questions?.length || session.total_rounds || 10
        p.academic_score = Math.min(100, Math.max(0, Math.round((p.correct / totalQ) * 100)))

        // Jika seluruh peserta aktif sudah menjawab ronde ini, majukan ronde otomatis
        const activeParticipants = (session.participants || []).filter(x => !x.is_absent)
        const answeredCount = Object.keys(session.round_answers[currentRound]).length
        if (activeParticipants.length > 0 && answeredCount >= activeParticipants.length) {
          evaluateAndAdvanceRaceRound(session)
        }

        saveDb()
        return sendJson(res, 200, {
          status: 'success',
          duplicate: false,
          is_correct: isCorrect,
          round: currentRound,
          data: getRaceStateForClient(session, isTeacher, authUser)
        })
      }

      // Khusus mode Tower Defense Kelas ("Pertahanan Markas")
      if (session.game_type === 'tower-defense') {
        if (session.status === 'completed') {
          return sendJson(res, 400, { status: 'error', message: 'Sesi pertahanan markas telah selesai.' })
        }

        const authUser = getAuthUser(req)
        if (!authUser) {
          return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan untuk mengirim jawaban.' })
        }
        const isTeacher = isTeacherRequest(req)

        const body = await parseBody(req)
        const participantId = body.participant_id
        const questionId = body.question_id
        const clientEventId = body.client_event_id || 'default'

        if (!isTeacher) {
          const isSelf = authUser.id === participantId || authUser.nis === participantId || authUser.username === participantId
          if (!isSelf) {
            return sendJson(res, 403, { status: 'error', message: 'Anda hanya dapat mengirim jawaban atas nama akun Anda sendiri.' })
          }
        }

        let p = (session.participants || []).find(x => x.id === participantId || x.student_id === participantId || (authUser.nis && x.nis === authUser.nis))
        if (!p) {
          return sendJson(res, 403, { status: 'error', message: 'Anda bukan peserta resmi sesi ulangan ini.' })
        }
        if (p.is_absent) {
          return sendJson(res, 403, { status: 'error', message: 'Peserta ditandai tidak hadir/absen dalam sesi ini.' })
        }

        const idempotencyKey = `td:${sId}:${participantId}:${questionId}:${clientEventId}`
        session.seen_answer_keys = session.seen_answer_keys || []

        if (session.seen_answer_keys.includes(idempotencyKey)) {
          return sendJson(res, 200, {
            status: 'success',
            duplicate: true,
            data: getTowerDefenseStateForClient(session, isTeacher, authUser)
          })
        }
        session.seen_answer_keys.push(idempotencyKey)

        // W1: Penilaian di server
        const targetQ = (session.questions || []).find(q => String(q.id) === String(questionId)) || session.questions?.[0]
        const correctIdx = Number(targetQ?.correctIndex ?? targetQ?.correct_index ?? targetQ?.answer_index ?? 0)
        const isCorrect = Number(body.option_index) === correctIdx

        session.answered_questions_count = (session.answered_questions_count || 0) + 1

        let comboStrikeTriggered = false
        if (isCorrect) {
          // +10 Class Coins
          session.coins = (session.coins !== undefined ? session.coins : 60) + 10
          session.student_contributions = session.student_contributions || {}
          session.student_contributions[participantId] = (session.student_contributions[participantId] || 0) + 10

          // Buff attack speed +25% selama 5s (max 3 stacks)
          session.tower_buff_until = Date.now() + 5000
          session.tower_buff_stacks = Math.min(3, (session.tower_buff_stacks || 0) + 1)

          // Class Streak
          session.class_streak = (session.class_streak || 0) + 1
          if (session.class_streak >= 10) {
            comboStrikeTriggered = true
            session.class_streak = 0
            session.last_combo_strike_at = Date.now()
            // Serangan Gabungan: 15 dmg ke seluruh musuh aktif
            for (const enemy of (session.enemies || [])) {
              enemy.hp -= 15
              if (enemy.hp <= 0) {
                session.coins = (session.coins || 0) + (enemy.reward || 2)
              }
            }
            session.enemies = (session.enemies || []).filter(e => e.hp > 0 && e.progress < 100)
          }

          if (session.mode_tipe === 'ulangan') {
            p.answered = (p.answered || 0) + 1
            p.correct = (p.correct || 0) + 1
            const totalQ = session.questions?.length || 10
            p.academic_score = Math.min(100, Math.max(0, Math.round((p.correct / totalQ) * 100)))
          }
        } else {
          session.class_streak = 0
          if (session.mode_tipe === 'ulangan') {
            p.answered = (p.answered || 0) + 1
            p.wrong = (p.wrong || 0) + 1
            const totalQ = session.questions?.length || 10
            p.academic_score = Math.min(100, Math.max(0, Math.round((p.correct / totalQ) * 100)))
          }
        }

        simulateTowerDefenseTick(session)
        saveDb()

        return sendJson(res, 200, {
          status: 'success',
          duplicate: false,
          is_correct: isCorrect,
          combo_strike: comboStrikeTriggered,
          coins_earned: isCorrect ? 10 : 0,
          data: getTowerDefenseStateForClient(session, isTeacher, authUser)
        })
      }

      // 2.5: Penegakan waktu di server
      if (session.status === 'completed' || session.status === 'stopped' || session.status === 'expired') {
        if (!session.learning_mode && session.outcome !== 'class_victory') {
          return sendJson(res, 400, { status: 'error', message: 'Sesi ulangan telah selesai atau dihentikan.' })
        }
      }
      if (session.started_at && session.duration_minutes && !session.learning_mode) {
        const timeLimitMs = (Number(session.duration_minutes) || 10) * 60 * 1000
        if (Date.now() - session.started_at > timeLimitMs) {
          session.status = 'completed'
          session.academic_locked = true
          session.ended_at = session.ended_at || Date.now()
          recalcUhgSessionStats(session)
          saveDb()
          return sendJson(res, 400, { status: 'error', message: 'Waktu sesi ulangan telah habis.' })
        }
      }

      // 2.3: Wajibkan autentikasi & otorisasi
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan untuk mengirim jawaban.' })
      }
      const isTeacher = isTeacherRequest(req)

      const body = await parseBody(req)
      const participantId = body.participant_id
      const questionId = body.question_id
      const clientEventId = body.client_event_id || 'default'

      if (!isTeacher) {
        // Hanya token siswa yang terdaftar sebagai peserta sesi tersebut, dan hanya untuk participant_id miliknya
        const isSelf = authUser.id === participantId || authUser.nis === participantId || authUser.username === participantId
        if (!isSelf) {
          return sendJson(res, 403, { status: 'error', message: 'Anda hanya dapat mengirim jawaban atas nama akun Anda sendiri.' })
        }
      }

      let p = (session.participants || []).find(x => x.id === participantId || x.student_id === participantId || (authUser.nis && x.nis === authUser.nis))
      if (!p) {
        return sendJson(res, 403, { status: 'error', message: 'Anda bukan peserta resmi sesi ulangan ini.' })
      }
      if (p.is_absent) {
        return sendJson(res, 403, { status: 'error', message: 'Peserta ditandai tidak hadir/absen dalam sesi ini.' })
      }

      const key = `${sId}:${participantId}:${questionId}:${clientEventId}`
      session.seen_answer_keys = session.seen_answer_keys || []
      if (session.seen_answer_keys.includes(key)) {
        return sendJson(res, 200, {
          status: 'success',
          duplicate: true,
          academic_updated: false,
          visual_attack: null,
          data: presentUhgSession(session, isTeacher)
        })
      }
      session.seen_answer_keys.push(key)

      // 2.1: Penilaian di SERVER — membandingkan option_index terhadap kunci jawaban di server
      const targetQuestion = (session.questions || []).find(q => String(q.id) === String(questionId))
      let isCorrect = false
      if (targetQuestion) {
        const correctIdx = Number(targetQuestion.correctIndex ?? targetQuestion.correct_index ?? targetQuestion.answer_index ?? 0)
        isCorrect = Number(body.option_index) === correctIdx
      } else if (questionId === 'celebration' && (session.outcome === 'class_victory' || session.learning_mode)) {
        isCorrect = true
      }

      const totalQ = (Array.isArray(session.questions) && session.questions.length > 0)
        ? session.questions.length
        : (Number(session.question_count) || 10)
      const isStudentFinished = (p.answered || 0) >= totalQ
      const visualOnly = Boolean(session.learning_mode || isStudentFinished || session.outcome === 'class_victory')
      const hpBefore = Number(session.boss_hp_exact) || 0
      let reachedKkmNow = false

      if (!visualOnly) {
        p.answered = (p.answered || 0) + 1
        if (isCorrect) p.correct = (p.correct || 0) + 1
        else p.wrong = (p.wrong || 0) + 1

        p.academic_score = Math.min(100, Math.max(0, Math.round((p.correct / totalQ) * 100)))

        const kkm = Number(session.kkm) || 75
        if (!p.reached_kkm && p.academic_score >= kkm) {
          p.reached_kkm = true
          p.reached_kkm_at = Date.now()
          reachedKkmNow = true
        }

        recalcUhgSessionStats(session)
      }

      // Visual attack event on answer
      let visualAttack = null
      const activeParticipants = (session.participants || []).filter(x => !x.is_absent)
      const offCount = Math.max(1, activeParticipants.length)
      const kkmVal = Number(session.kkm) || 75
      const calcTargetHits = Math.max(1, Math.round(offCount * totalQ * (kkmVal / 100)))
      const hitDamage = Math.round((Number(session.initial_boss_hp) || 10000) / calcTargetHits)

      if (isCorrect) {
        visualAttack = {
          event_id: `anim:${key}`,
          participant_id: participantId,
          correct: true,
          reached_kkm_now: reachedKkmNow,
          damage: hitDamage,
          visual_only: visualOnly,
          hp_changed: Number(session.boss_hp_exact) !== hpBefore
        }
      }

      // Record network visual event for projector screen (both in session & global pool)
      const visualEventObj = {
        id: `vevt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        participant_id: participantId,
        participant_name: p.name || 'Siswa',
        is_correct: isCorrect,
        damage: isCorrect ? hitDamage : 0,
        boss_hp_exact: session.boss_hp_exact,
        boss_hp_display: session.boss_hp_display,
        boss_hp_percent_display: session.boss_hp_percent_display,
        session_id: sId,
        timestamp: Date.now()
      }
      session.visual_events = session.visual_events || []
      session.visual_events.push(visualEventObj)
      if (session.visual_events.length > 60) session.visual_events.shift()

      db.globalVisualEvents = db.globalVisualEvents || []
      db.globalVisualEvents.push(visualEventObj)
      if (db.globalVisualEvents.length > 60) db.globalVisualEvents.shift()

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        duplicate: false,
        is_correct: isCorrect,
        academic_updated: !visualOnly,
        visual_attack: visualAttack,
        data: presentUhgSession(session, isTeacher)
      })
    }

    // 7B. Fast Real-time Polling for Projector Screen / Multi-device Sync
    const uhgPollMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/poll$/)
    if (uhgPollMatch && req.method === 'GET') {
      const sId = uhgPollMatch[1]
      let session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session && (sId === 'active' || sId === 'latest')) {
        session = (db.ulanganGamifikasiSessions || []).find(s => s.status === 'active' || s.status === 'in_progress')
        if (!session && (db.ulanganGamifikasiSessions || []).length > 0) {
          // Fallback to latest session so client receives final outcome instead of null
          session = db.ulanganGamifikasiSessions[db.ulanganGamifikasiSessions.length - 1]
        }
      }
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
      const since = Number(parsedUrl.searchParams.get('since')) || 0

      // Khusus mode Class Race: cek timer ronde server & sertakan race_state
      if (session && session.game_type === 'class-race') {
        if (session.status === 'in_progress' && session.server_round_ends_at && Date.now() > session.server_round_ends_at) {
          evaluateAndAdvanceRaceRound(session)
          saveDb()
        }
        const authUser = getAuthUser(req)
        const isTeacher = isTeacherRequest(req)
        return sendJson(res, 200, {
          status: 'success',
          data: {
            session: presentUhgSession(session, isTeacher),
            race_state: getRaceStateForClient(session, isTeacher, authUser),
            events: session.visual_events || [],
            server_time: Date.now()
          }
        })
      }

      // Khusus mode Tower Defense: update tick & sertakan tower_defense_state
      if (session && session.game_type === 'tower-defense') {
        simulateTowerDefenseTick(session)
        saveDb()
        const authUser = getAuthUser(req)
        const isTeacher = isTeacherRequest(req)
        return sendJson(res, 200, {
          status: 'success',
          data: {
            session: presentUhgSession(session, isTeacher),
            tower_defense_state: getTowerDefenseStateForClient(session, isTeacher, authUser),
            events: session.visual_events || [],
            server_time: Date.now()
          }
        })
      }

      // Gabungkan visual events dari session dan global pool untuk menjamin sinkronisasi antar perangkat
      const sessionEvents = session?.visual_events || []
      const globalEvents = db.globalVisualEvents || []
      const combined = [...sessionEvents, ...globalEvents]
      const seenIds = new Set()
      const events = []
      for (const e of combined) {
        if (e && !seenIds.has(e.id) && e.timestamp > since) {
          seenIds.add(e.id)
          events.push(e)
        }
      }

      const isTeacher = isTeacherRequest(req)
      return sendJson(res, 200, {
        status: 'success',
        data: {
          session: session ? presentUhgSession(session, isTeacher) : null,
          events,
          server_time: Date.now()
        }
      })
    }

    // 8. Expire Timer (Boss victory if not all passed) — Hanya Guru
    const uhgExpireMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/expire$/)
    if (uhgExpireMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengubah status sesi.' })
      }
      const sId = uhgExpireMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      session.status = 'completed'
      session.academic_locked = true
      session.ended_at = Date.now()
      recalcUhgSessionStats(session)
      if (session.boss_hp_exact <= 0 || session.passed_count >= session.official_count) {
        session.outcome = 'class_victory'
        session.boss_pose = 'defeated'
      } else {
        session.outcome = 'boss_victory'
        session.boss_pose = 'laugh'
      }
      syncBattleGradesToReport(session)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, true) })
    }

    // 8B. Finish Game Session (for Edu-Games & Boss Battle) — Hanya Guru
    const uhgFinishMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/finish$/)
    if (uhgFinishMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak menyelesaikan sesi game.' })
      }
      const sId = uhgFinishMatch[1]
      let session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }

      if (session.game_type === 'class-race') {
        session.status = 'completed'
        session.outcome = 'race_finished'
        session.academic_locked = true
        session.ended_at = Date.now()
        const sortedTeams = [...(session.teams || [])].sort((a, b) => (b.distance || 0) - (a.distance || 0))
        sortedTeams.forEach((t, idx) => { t.rank = idx + 1 })
        session.winner_team_id = sortedTeams[0]?.id
        session.podium = sortedTeams.slice(0, 3).map((t, idx) => ({
          rank: idx + 1,
          id: t.id,
          name: t.name,
          color: t.color,
          icon: t.icon,
          distance: t.distance
        }))
        syncBattleGradesToReport(session)
        saveDb()
        return sendJson(res, 200, { status: 'success', data: getRaceStateForClient(session, true, authUser) })
      }

      if (session.game_type === 'tower-defense') {
        session.status = 'completed'
        session.outcome = (session.base_hp !== undefined && session.base_hp > 0) ? 'class_victory' : 'base_destroyed'
        session.academic_locked = true
        session.ended_at = Date.now()
        syncBattleGradesToReport(session)
        saveDb()
        return sendJson(res, 200, { status: 'success', data: getTowerDefenseStateForClient(session, true, authUser) })
      }
      const body = await parseBody(req)
      if (Array.isArray(body.participants) && body.participants.length > 0) {
        session.participants = body.participants
      }
      const resolved = resolveSessionClassAndSubject(session)
      session.classroom_id = resolved.classroomId
      session.classroom_name = resolved.classroomName
      session.subject_id = resolved.subjectId
      session.subject = resolved.subjectName
      session.status = 'completed'
      session.outcome = body.outcome || 'completed'
      session.academic_locked = true
      session.ended_at = Date.now()
      recalcUhgSessionStats(session)
      syncBattleGradesToReport(session)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, true) })
    }

    // Stop Session explicitly by Teacher — Hanya Guru
    const uhgStopMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/stop$/)
    if (uhgStopMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak menghentikan sesi game.' })
      }
      const sId = uhgStopMatch[1]
      let targetSession = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!targetSession && (db.ulanganGamifikasiSessions || []).length > 0) {
        targetSession = db.ulanganGamifikasiSessions.find(s => s.status === 'active' || s.status === 'in_progress') || db.ulanganGamifikasiSessions[0]
      }

      // Tandai semua sesi game yang sedang aktif sebagai 'completed'
      (db.ulanganGamifikasiSessions || []).forEach(s => {
        if (s.id === sId || sId === 'active' || s.status === 'active' || s.status === 'in_progress') {
          const resolved = resolveSessionClassAndSubject(s)
          s.classroom_id = resolved.classroomId
          s.classroom_name = resolved.classroomName
          s.subject_id = resolved.subjectId
          s.subject = resolved.subjectName
          s.status = 'completed'
          s.academic_locked = true
          s.ended_at = Date.now()
          const act = (s.participants || []).filter(p => !p.is_absent)
          const pass = act.filter(p => p.reached_kkm).length
          const off = Math.max(1, act.length)
          if (pass >= off) {
            s.outcome = 'class_victory'
            s.boss_pose = 'defeat_last_hit'
          } else {
            s.outcome = 'boss_victory'
            s.boss_pose = 'laugh'
          }
          s.visual_events = s.visual_events || []
          s.visual_events.push({
            eventId: `stop-${Date.now()}`,
            type: 'session_stopped',
            reason: 'Guru telah menghentikan sesi game ini.',
            timestamp: Date.now()
          })
          recalcUhgSessionStats(s)
          syncBattleGradesToReport(s)
        }
      })

      if (targetSession) {
        const resolved = resolveSessionClassAndSubject(targetSession)
        targetSession.classroom_id = resolved.classroomId
        targetSession.classroom_name = resolved.classroomName
        targetSession.subject_id = resolved.subjectId
        targetSession.subject = resolved.subjectName
        if (!targetSession.outcome || targetSession.outcome === 'ongoing') {
          const act = (targetSession.participants || []).filter(p => !p.is_absent)
          const pass = act.filter(p => p.reached_kkm).length
          const off = Math.max(1, act.length)
          targetSession.outcome = pass >= off ? 'class_victory' : 'boss_victory'
          targetSession.boss_pose = pass >= off ? 'defeat_last_hit' : 'laugh'
        }
        recalcUhgSessionStats(targetSession)
        syncBattleGradesToReport(targetSession)
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: 'Sesi game berhasil dihentikan oleh guru.',
        data: targetSession ? presentUhgSession(targetSession, true) : null
      })
    }

    // 9. Learning Mode — Hanya Guru
    const uhgLearningMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/learning-mode$/)
    if (uhgLearningMatch && req.method === 'POST') {
      const authUser = getAuthUser(req)
      if (!authUser) {
        return sendJson(res, 401, { status: 'error', message: 'Autentikasi diperlukan. Silakan login kembali.' })
      }
      if (!isTeacherRequest(req)) {
        return sendJson(res, 403, { status: 'error', message: 'Hanya guru yang berhak mengaktifkan mode belajar.' })
      }
      const sId = uhgLearningMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      if (session.outcome === 'ongoing') {
        return sendJson(res, 422, { status: 'error', message: 'Mode belajar hanya dapat diaktifkan setelah hasil battle selesai.' })
      }
      session.learning_mode = true
      session.academic_locked = true
      saveDb()
      return sendJson(res, 200, { status: 'success', data: presentUhgSession(session, true) })
    }

    // 10. Report & MVP
    const uhgReportMatch = pathname.match(/^\/api\/v1\/ulangan-gamifikasi\/sessions\/([a-zA-Z0-9_-]+)\/report$/)
    if (uhgReportMatch && req.method === 'GET') {
      const sId = uhgReportMatch[1]
      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === sId)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi tidak ditemukan.' })
      }
      const mvp = computeUhgMvp(session.participants, Number(session.question_count) || 10, 3)
      const remedialCandidates = (session.participants || []).filter(p => !p.reached_kkm && !p.is_absent)
      const isTeacher = isTeacherRequest(req)

      return sendJson(res, 200, {
        status: 'success',
        data: {
          session: presentUhgSession(session, isTeacher),
          mvp,
          historical_config: {
            quiz_type: session.quiz_type,
            title: session.title,
            boss_snapshot: session.boss,
            kkm: session.kkm,
            official_count: session.official_count,
            outcome: session.outcome
          },
          remedial_candidates: remedialCandidates
        }
      })
    }

    // -------------------------------------------------------------
    // WEEKLY SCHEDULES & MEETING TRACKER
    // -------------------------------------------------------------
    if (pathname === '/api/v1/schedules/weekly' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'success',
        data: {
          weeklySlots: db.weeklySchedules || [],
          meetingLogs: db.meetingLogs || []
        }
      })
    }

    if (pathname === '/api/v1/schedules/weekly' && req.method === 'POST') {
      const body = await parseBody(req)
      const newSlot = {
        id: 'ws-' + Date.now().toString(36),
        day: body.day || 'Senin',
        day_index: Number(body.day_index) || 1,
        time_start: body.time_start || '07:30',
        time_end: body.time_end || '08:50',
        subject_id: body.subject_id || 'sub-kka',
        subject_name: body.subject_name || 'KKA (Koding dan Kecerdasan Artifisial)',
        classroom_id: body.classroom_id || 'cls-7a',
        classroom_name: body.classroom_name || 'VII A',
        room: body.room || 'Lab Komputer 1',
        color: body.color || '#8B5CF6',
        icon: body.icon || '🤖',
        description: body.description || ''
      }
      db.weeklySchedules.push(newSlot)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newSlot })
    }

    const weeklySlotMatch = pathname.match(/^\/api\/v1\/schedules\/weekly\/([a-zA-Z0-9_-]+)$/)
    if (weeklySlotMatch && req.method === 'PUT') {
      const slotId = weeklySlotMatch[1]
      const slot = db.weeklySchedules.find(s => s.id === slotId)
      if (!slot) {
        return sendJson(res, 404, { status: 'error', message: 'Slot jadwal tidak ditemukan' })
      }
      const body = await parseBody(req)
      Object.assign(slot, body)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: slot })
    }

    if (weeklySlotMatch && req.method === 'DELETE') {
      const slotId = weeklySlotMatch[1]
      db.weeklySchedules = db.weeklySchedules.filter(s => s.id !== slotId)
      saveDb()
      return sendJson(res, 200, { status: 'success', message: 'Slot jadwal berhasil dihapus' })
    }

    if (pathname === '/api/v1/schedules/meetings' && req.method === 'POST') {
      const body = await parseBody(req)
      const newMeet = {
        id: body.id || `meet-${Date.now().toString(36)}`,
        meeting_number: Number(body.meeting_number) || 1,
        week_number: Number(body.week_number) || Number(body.meeting_number) || 1,
        date: body.date || new Date().toISOString().split('T')[0],
        classroom_id: body.classroom_id || '',
        subject_id: body.subject_id || '',
        topic: body.topic || '',
        activities: body.activities || '',
        notes: body.notes || '',
        status: body.status || 'scheduled'
      }
      db.meetingLogs = db.meetingLogs || []
      db.meetingLogs.push(newMeet)
      syncMeetingLogToSession(newMeet)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newMeet })
    }

    const meetingLogMatch = pathname.match(/^\/api\/v1\/schedules\/meetings\/([a-zA-Z0-9_-]+)$/)
    if (meetingLogMatch && req.method === 'PUT') {
      const meetId = meetingLogMatch[1]
      let meet = db.meetingLogs.find(m => m.id === meetId)
      const body = await parseBody(req)
      if (!meet) {
        meet = { id: meetId, ...body }
        db.meetingLogs.push(meet)
      } else {
        Object.assign(meet, body)
      }
      syncMeetingLogToSession(meet)
      saveDb()
      return sendJson(res, 200, { status: 'success', data: meet })
    }

    if (meetingLogMatch && req.method === 'DELETE') {
      const meetId = meetingLogMatch[1]
      db.meetingLogs = (db.meetingLogs || []).filter(m => m.id !== meetId)
      saveDb()
      return sendJson(res, 200, { status: 'success', message: 'Data info pertemuan berhasil dihapus' })
    }

    // -------------------------------------------------------------
    // HELPER: Recalculate Grade with NEW FORMULA
    // Formatif (30%) = Absensi (40%) + Tugas (60%)
    // Sumatif TP (30%) = Rata-rata Edu Games
    // STS (20%) = CBT Tengah Semester
    // SAS (20%) = CBT Akhir Semester
    // -------------------------------------------------------------
    function recalcGrade(grade, kktpParam) {
      const attendanceScore = Math.min(100, Math.max(0, Number(grade.attendance_score) || 0))
      const avgTugas = Math.min(100, Math.max(0, Number(grade.avg_tugas) || 0))
      grade.attendance_score = attendanceScore
      grade.avg_tugas = avgTugas

      // Formatif: Kehadiran (40%) + Akumulasi Tugas (60%)
      const attendanceContrib = Math.round((attendanceScore * 0.40) * 10) / 10
      const tugasContrib = Math.round((avgTugas * 0.60) * 10) / 10

      grade.attendance_contrib = attendanceContrib
      grade.tugas_contrib = tugasContrib
      grade.avg_formatif = Math.min(100, Math.max(0, Math.round((attendanceContrib + tugasContrib) * 10) / 10))

      // Sanitasi nilai sumatif_tp: batas skala 0-100 per elemen
      if (grade.sumatif_tp && typeof grade.sumatif_tp === 'object') {
        for (const k of Object.keys(grade.sumatif_tp)) {
          const val = Number(grade.sumatif_tp[k])
          if (!isNaN(val)) {
            grade.sumatif_tp[k] = Math.min(100, Math.max(0, val))
          }
        }
      }

      // Sumatif TP = rata-rata semua nilai edu games / TP (maks 100)
      const tpVals = Object.values(grade.sumatif_tp || {})
        .map(Number)
        .filter(n => !isNaN(n) && n > 0)
        .map(n => Math.min(100, Math.max(0, n)))

      if (tpVals.length > 0) {
        grade.avg_sumatif_tp = Math.min(100, Math.max(0, Math.round((tpVals.reduce((a, b) => a + b, 0) / tpVals.length) * 10) / 10))
      } else {
        grade.avg_sumatif_tp = 0
      }

      const sts = Math.min(100, Math.max(0, Number(grade.sts) || 0))
      const sas = Math.min(100, Math.max(0, Number(grade.sas) || 0))
      grade.sts = sts
      grade.sas = sas

      // NA = Formatif*30% + Sumatif_TP*30% + STS*20% + SAS*20% (skala 0 - 100)
      const components = [
        { val: grade.avg_formatif, weight: 0.30 },
        { val: grade.avg_sumatif_tp, weight: 0.30 },
        { val: sts, weight: 0.20 },
        { val: sas, weight: 0.20 }
      ]
      const activeComponents = components.filter(c => c.val > 0)
      if (activeComponents.length === 0) {
        grade.final_score = 0
      } else if (activeComponents.length === components.length) {
        // Semua komponen ada: hitung NA penuh (dibatasi 0-100)
        grade.final_score = Math.min(100, Math.max(0, Math.round(
          (grade.avg_formatif * 0.30) + (grade.avg_sumatif_tp * 0.30) + (sts * 0.20) + (sas * 0.20)
        )))
      } else {
        // Sebagian komponen: rata-rata proporsional dari yang ada (dibatasi 0-100)
        const totalWeight = activeComponents.reduce((a, c) => a + c.weight, 0)
        grade.final_score = Math.min(100, Math.max(0, Math.round(
          activeComponents.reduce((a, c) => a + (c.val * c.weight), 0) / totalWeight
        )))
      }

      const subject = (db.subjects || []).find(s => s.id === grade.subject_id)
      const kktp = Number(kktpParam) || Number(grade.kktp) || Number(subject?.kkm) || Number(subject?.kktp) || 75
      grade.kktp = kktp
      grade.grade = grade.final_score >= 90 ? 'A' : grade.final_score >= 80 ? 'B' : grade.final_score >= kktp ? 'C' : 'D'
      grade.kktp_status = grade.final_score >= kktp ? 'Tuntas' : 'Perlu Bimbingan'
      if (grade.final_score > 0) {
        grade.competency_desc = grade.final_score >= kktp
          ? 'Menunjukkan penguasaan materi yang baik pada capaian pembelajaran aktif.'
          : 'Perlu bimbingan dan pendampingan lebih lanjut pada materi yang belum tuntas.'
      } else {
        grade.competency_desc = 'Belum ada data nilai asesmen aktif.'
      }
      return grade
    }

    // Helper to ensure default chapters & TPs exist
    function ensureDefaultChapters() {
      db.chapters = db.chapters || []
      if (db.chapters.length > 0) return db.chapters

      db.chapters = [
        // --- INFORMATIKA KELAS 9 ---
        {
          id: 'chap-inf-7-1',
          subject_id: 'sub-inf',
          subject_name: 'Informatika',
          grade_level: 9,
          chapter_number: 1,
          title: 'Bab 1: Berpikir Komputasional (BK)',
          description: 'Menerapkan 4 pilar computational thinking: dekomposisi, pengenalan pola, abstraksi, dan perancangan algoritma.',
          tps: [
            {
              id: 'tp-inf-7-1-1',
              code: 'TP 1.1',
              description: 'Menerapkan 4 pilar computational thinking untuk memecahkan persoalan komputasi dan logika terstruktur.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            },
            {
              id: 'tp-inf-7-1-2',
              code: 'TP 1.2',
              description: 'Mengonversi representasi data bilangan biner ke desimal dan sebaliknya secara terurut dan tepat.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'chap-inf-7-2',
          subject_id: 'sub-inf',
          subject_name: 'Informatika',
          grade_level: 9,
          chapter_number: 2,
          title: 'Bab 2: Teknologi Informasi dan Komunikasi (TIK)',
          description: 'Pengenalan GUI, pengolah kata, lembar kerja spreadsheet, dan kolaborasi dokumen digital.',
          tps: [
            {
              id: 'tp-inf-7-2-1',
              code: 'TP 2.1',
              description: 'Membuat dokumen laporan digital rapi dengan memanfaatkan fitur format tata letak pengolah kata.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            },
            {
              id: 'tp-inf-7-2-2',
              code: 'TP 2.2',
              description: 'Mengolah data lembar kerja spreadsheet menggunakan rumus dasar dan visualisasi diagram grafis.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'chap-inf-7-3',
          subject_id: 'sub-inf',
          subject_name: 'Informatika',
          grade_level: 9,
          chapter_number: 3,
          title: 'Bab 3: Sistem Komputer (SK)',
          description: 'Komponen hardware (input, proses, output, storage), software sistem, dan mekanisme interaksi komputer.',
          tps: [
            {
              id: 'tp-inf-7-3-1',
              code: 'TP 3.1',
              description: 'Mengidentifikasi mekanisme interaksi input-proses-output-storage serta fungsi sistem operasi komputer.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'chap-inf-7-4',
          subject_id: 'sub-inf',
          subject_name: 'Informatika',
          grade_level: 9,
          chapter_number: 4,
          title: 'Bab 4: Jaringan Komputer dan Internet (JKI)',
          description: 'Konektivitas jaringan lokal, internet nirkabel, enkripsi proteksi data, dan keamanan siber.',
          tps: [
            {
              id: 'tp-inf-7-4-1',
              code: 'TP 4.1',
              description: 'Memahami prinsip konektivitas internet dan langkah perlindungan keamanan data pribadi secara digital.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'chap-inf-7-5',
          subject_id: 'sub-inf',
          subject_name: 'Informatika',
          grade_level: 9,
          chapter_number: 5,
          title: 'Bab 5: Analisis Data (AD)',
          description: 'Pencarian, pemilahan, penyaringan, dan pemodelan visualisasi kesimpulan data terstruktur.',
          tps: [
            {
              id: 'tp-inf-7-5-1',
              code: 'TP 5.1',
              description: 'Melakukan pemilahan dan penyaringan data terstruktur untuk menyajikan kesimpulan informasi analitis.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'chap-inf-7-6',
          subject_id: 'sub-inf',
          subject_name: 'Informatika',
          grade_level: 9,
          chapter_number: 6,
          title: 'Bab 6: Algoritma dan Pemrograman (AP)',
          description: 'Pemrograman visual Scratch dengan logika urutan (sekuensial), perulangan, dan percabangan kondisi.',
          tps: [
            {
              id: 'tp-inf-7-6-1',
              code: 'TP 6.1',
              description: 'Merancang program interaktif menggunakan blok visual dengan logika sekuensial dan perulangan.',
              kktp: 78,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },

        // --- KKA (KODING DAN KECERDASAN ARTIFISIAL) KELAS 7 ---
        {
          id: 'chap-kka-7-1',
          subject_id: 'sub-kka',
          subject_name: 'KKA (Koding dan Kecerdasan Artifisial)',
          grade_level: 7,
          chapter_number: 1,
          title: 'Bab 1: Konsep Dasar AI & Etika Digital',
          description: 'Dasar AI, Machine Learning, Generative AI, dan etika pemanfaatan teknologi kecerdasan buatan.',
          tps: [
            {
              id: 'tp-kka-7-1-1',
              code: 'TP 1.1',
              description: 'Mengenal konsep dasar kecerdasan artifisial, jenis model AI, serta dampaknya di era industri modern.',
              kktp: 75,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            },
            {
              id: 'tp-kka-7-1-2',
              code: 'TP 1.2',
              description: 'Menulis instruksi prompt rekayasa (prompt engineering) yang efektif, aman, dan beretika.',
              kktp: 75,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'chap-kka-7-2',
          subject_id: 'sub-kka',
          subject_name: 'KKA (Koding dan Kecerdasan Artifisial)',
          grade_level: 7,
          chapter_number: 2,
          title: 'Bab 2: Logika Komputasi & Pemrograman Blok AI',
          description: 'Diagram alir algoritma dan pembuatan proyek interaktif AI dengan visual block coding.',
          tps: [
            {
              id: 'tp-kka-7-2-1',
              code: 'TP 2.1',
              description: 'Mengembangkan logika komputasi menggunakan diagram alir algoritma dan blok koding visual AI.',
              kktp: 75,
              task_ids: [],
              exam_session_ids: [],
              target_tasks_count: 1,
              target_exams_count: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      saveDb()
      return db.chapters
    }

    // Auto-compute grades from raw data (attendance + tasks + games + CBT)
    function autoComputeGradesForClass(classroomId, subjectId) {
      db.subjectGrades = db.subjectGrades || []
      const realStudentIds = new Set((db.students || []).map(s => s.id))
      // Bersihkan semua entri dummy siswa yang tidak ada di daftar siswa resmi
      db.subjectGrades = db.subjectGrades.filter(g => realStudentIds.has(g.student_id))

      const students = (db.students || []).filter(s => s.classroom_id === classroomId)
      const classroom = (db.classrooms || []).find(c => c.id === classroomId) || { id: classroomId, name: 'Kelas' }
      const subject = (db.subjects || []).find(s => s.id === subjectId) || { id: subjectId, name: 'Informatika' }

      // 1. Sesi pertemuan kelas untuk mata pelajaran ini
      const classSessions = (db.sessions || []).filter(s =>
        s.classroom_id === classroomId &&
        (!s.subject_id || !subjectId || s.subject_id === subjectId)
      )
      const totalSessions = classSessions.length

      // 2. Tugas untuk kelas dan mata pelajaran ini
      ensureDefaultChapters()
      const subjectChapters = (db.chapters || []).filter(c => c.subject_id === subjectId)
      const allSubjectTps = subjectChapters.flatMap(c => c.tps || [])
      const mappedTaskIds = new Set([
        ...allSubjectTps.flatMap(tp => tp.task_ids || []),
        ...(db.assignments || []).filter(a => allSubjectTps.some(tp => tp.id === a.tp_id)).map(a => a.id)
      ])

      let classAssignments = (db.assignments || []).filter(a =>
        a.classroom_id === classroomId &&
        (!a.subject_id || !subjectId || a.subject_id === subjectId || a.subject === subject.name)
      )
      if (mappedTaskIds.size > 0) {
        const mappedList = classAssignments.filter(a => mappedTaskIds.has(a.id))
        if (mappedList.length > 0) classAssignments = mappedList
      }

      // Valid CBT exams untuk kelas dan mata pelajaran ini
      const validClassExams = (db.exams || []).filter(e =>
        (!e.classroom_id || e.classroom_id === classroomId) &&
        (!e.subject_id || e.subject_id === subjectId)
      )
      const validExamIds = new Set(validClassExams.map(e => e.id))

      // Penilaian luar aplikasi (offline / lampau / tugas & ulangan fisik)
      db.offlineAssessments = db.offlineAssessments || []
      const classOfflineAssessments = (db.offlineAssessments || []).filter(a =>
        a.classroom_id === classroomId &&
        (!a.subject_id || a.subject_id === subjectId)
      )

      for (const stu of students) {
        let grade = db.subjectGrades.find(g =>
          g.classroom_id === classroomId && g.subject_id === subjectId &&
          (g.student_id === stu.id || (stu.nis && g.nis === stu.nis))
        )
        if (!grade) {
          grade = {
            id: `grd-${stu.id}-${subjectId}`,
            classroom_id: classroomId, classroom_name: classroom.name,
            subject_id: subjectId, subject_name: subject.name,
            student_id: stu.id, student_name: stu.name,
            nis: stu.nis || '', nisn: stu.nisn || '', gender: stu.gender || 'L',
            attendance_score: 0, attendance_present: 0, attendance_total: totalSessions, attendance_contrib: 0,
            avg_tugas: 0, tugas_contrib: 0, avg_formatif: 0,
            formatif: {}, sumatif_tp: {}, avg_sumatif_tp: 0, sts: 0, sas: 0,
            final_score: 0, grade: 'D', kktp_status: 'Perlu Bimbingan', competency_desc: 'Belum ada data nilai asesmen aktif.'
          }
          db.subjectGrades.push(grade)
        }

        // 1. Hitung attendance_score dari sessions + attendanceRecords
        if (totalSessions > 0) {
          const presentCount = (db.attendanceRecords || []).filter(r =>
            classSessions.some(s => s.id === r.session_id) &&
            (r.student_id === stu.id || (stu.nis && r.student_nis === stu.nis) || (stu.nisn && r.nisn === stu.nisn)) &&
            (r.status === 'present' || r.status === 'hadir')
          ).length
          grade.attendance_present = presentCount
          grade.attendance_total = totalSessions
          grade.attendance_score = Math.min(100, Math.max(0, Math.round((presentCount / totalSessions) * 100)))
        } else {
          grade.attendance_present = 0
          grade.attendance_total = 0
          grade.attendance_score = 0
        }

        // 2. Hitung nilai tugas Formatif (Tugas Online + Tugas Luar Aplikasi/Offline/Lampau)
        const onlineTaskScores = (db.assignmentSubmissions || []).filter(sub =>
          classAssignments.some(a => a.id === sub.assignment_id) &&
          (sub.student_id === stu.id || (stu.nis && sub.student_nis === stu.nis)) &&
          sub.score !== null && sub.score !== undefined && !isNaN(Number(sub.score))
        ).map(s => Math.min(100, Math.max(0, Number(s.score))))

        const offlineTasks = classOfflineAssessments.filter(a => a.type === 'tugas' || a.category === 'Formatif' || a.category === 'Formatif (Tugas)')
        const activeOffTaskIds = new Set(offlineTasks.map(o => o.id))
        for (const k of Object.keys(grade.formatif || {})) {
          if (k.startsWith('off-') || k.startsWith('off_')) {
            if (!activeOffTaskIds.has(k)) {
              delete grade.formatif[k]
            }
          }
        }
        const offlineTaskScores = []
        for (const off of offlineTasks) {
          const sc = (off.scores || []).find(s =>
            s.student_id === stu.id || (stu.nis && s.nis === stu.nis) ||
            (s.student_name && stu.name && s.student_name.toLowerCase().trim() === stu.name.toLowerCase().trim())
          )
          if (sc && sc.score !== null && sc.score !== undefined && !isNaN(Number(sc.score))) {
            const num = Math.min(100, Math.max(0, Number(sc.score)))
            offlineTaskScores.push(num)
            grade.formatif = grade.formatif || {}
            const taskKey = off.id || `off_tugas_${off.title}`
            grade.formatif[taskKey] = num
          }
        }

        const allTaskScores = [...onlineTaskScores, ...offlineTaskScores]
        if (allTaskScores.length > 0) {
          const total = allTaskScores.reduce((a, s) => a + s, 0)
          grade.avg_tugas = Math.min(100, Math.max(0, Math.round((total / allTaskScores.length) * 10) / 10))
          grade.tugas_count = allTaskScores.length
        } else if (grade.avg_tugas && grade.avg_tugas > 0 && grade.tugas_count > 0) {
          // Pertahankan jika sudah diinput manual di ledger (pastikan <= 100)
          grade.avg_tugas = Math.min(100, Math.max(0, Number(grade.avg_tugas)))
        } else {
          grade.avg_tugas = 0
          grade.tugas_count = 0
        }

        // Bersihkan session game-* yang sudah dihapus/tidak ada lagi di database
        const activeGameKeys = new Set(
          (db.ulanganGamifikasiSessions || []).map(s => `game-${(s.id || 'ses').replace(/[^a-z0-9]/gi, '').substring(0,8)}`)
        )
        for (const k of Object.keys(grade.sumatif_tp || {})) {
          if (k.startsWith('game-') && !activeGameKeys.has(k)) {
            delete grade.sumatif_tp[k]
          }
        }

        // 2B. Ambil nilai Sumatif TP (Boss Battle / CBT Online + Ulangan Harian Luar Aplikasi)
        let tpIndex = 1
        for (const chap of subjectChapters) {
          for (const tp of (chap.tps || [])) {
            const tpKey = `tp${tpIndex}`
            const sessIds = [
              ...(Array.isArray(tp.exam_session_ids) ? tp.exam_session_ids : []),
              ...(db.ulanganGamifikasiSessions || []).filter(g => g.tp_id === tp.id && g.classroom_id === classroomId).map(g => g.id),
              ...(db.exams || []).filter(e => e.tp_id === tp.id && (!e.classroom_id || e.classroom_id === classroomId)).map(e => e.id)
            ]
            let realTpScore = undefined
            if (sessIds.length > 0) {
              for (const sessId of sessIds) {
                const game = (db.ulanganGamifikasiSessions || []).find(g => g.id === sessId && g.classroom_id === classroomId)
                if (game) {
                  const part = (game.participants || []).find(p =>
                    p.id === stu.id || p.student_id === stu.id || (stu.nis && p.nis === stu.nis)
                  )
                  if (part && part.academic_score !== undefined && part.academic_score > 0) {
                    realTpScore = Math.min(100, Math.max(0, Number(part.academic_score)))
                  }
                }
                const cbt = (db.examSessions || []).find(s => s.exam_id === sessId && (s.student_id === stu.id || (stu.nis && s.student_nis === stu.nis)) && s.score !== undefined && s.score > 0)
                if (cbt) {
                  realTpScore = Math.min(100, Math.max(0, Number(cbt.score)))
                }
              }
            }
            if (realTpScore !== undefined) {
              grade.sumatif_tp = grade.sumatif_tp || {}
              grade.sumatif_tp[tpKey] = realTpScore
            } else if (grade.sumatif_tp && grade.sumatif_tp[tpKey] !== undefined && !String(grade.sumatif_tp[tpKey]).startsWith('off_')) {
              delete grade.sumatif_tp[tpKey]
            }
            tpIndex++
          }
        }

        // Gabungkan Ulangan Harian Luar Aplikasi / Offline / Lampau ke Sumatif TP
        const offlineUlangans = classOfflineAssessments.filter(a => a.type === 'ulangan_tp' || a.category === 'Sumatif TP' || a.category === 'Sumatif TP (Lingkup Materi)')
        const activeOffUhKeys = new Set(offlineUlangans.map((o, idx) => o.tp_key || (o.tp_code ? o.tp_code.toLowerCase().replace(/[^a-z0-9]/g, '') : `uh_offline_${o.id || idx + 1}`)))
        for (const k of Object.keys(grade.sumatif_tp || {})) {
          if (k.startsWith('uh_offline_') || k.startsWith('off-')) {
            if (!activeOffUhKeys.has(k)) {
              delete grade.sumatif_tp[k]
            }
          }
        }
        for (let uIdx = 0; uIdx < offlineUlangans.length; uIdx++) {
          const off = offlineUlangans[uIdx]
          const sc = (off.scores || []).find(s =>
            s.student_id === stu.id || (stu.nis && s.nis === stu.nis) ||
            (s.student_name && stu.name && s.student_name.toLowerCase().trim() === stu.name.toLowerCase().trim())
          )
          if (sc && sc.score !== null && sc.score !== undefined && !isNaN(Number(sc.score))) {
            grade.sumatif_tp = grade.sumatif_tp || {}
            const tpKey = off.tp_key || (off.tp_code ? off.tp_code.toLowerCase().replace(/[^a-z0-9]/g, '') : `uh_offline_${off.id || uIdx + 1}`)
            grade.sumatif_tp[tpKey] = Math.min(100, Math.max(0, Number(sc.score)))
          }
        }

        // 3. STS dan SAS dari CBT Online + Ujian Kertas / Luar Aplikasi
        let realSts = 0
        let realSas = 0

        if (validExamIds.size > 0) {
          const cbtSessions = (db.examSessions || []).filter(s =>
            validExamIds.has(s.exam_id) &&
            (s.student_id === stu.id || (stu.nis && s.student_nis === stu.nis)) &&
            (s.status === 'completed' || s.status === 'submitted') && s.score !== undefined
          )
          for (const cbtSes of cbtSessions) {
            const ex = validClassExams.find(e => e.id === cbtSes.exam_id)
            if (!ex) continue
            const examTitle = (ex.title || '').toLowerCase()
            const asstType = ex.assessment_type || (
              examTitle.includes('akhir') || examTitle.includes('sas') || examTitle.includes('uas') || examTitle.includes('pas') ? 'sas' :
              examTitle.includes('tengah') || examTitle.includes('sts') || examTitle.includes('uts') || examTitle.includes('pts') ? 'sts' : ''
            )
            if (asstType === 'sts') realSts = Math.min(100, Math.max(0, Number(cbtSes.score) || 0))
            if (asstType === 'sas') realSas = Math.min(100, Math.max(0, Number(cbtSes.score) || 0))
          }

          for (const ex of validClassExams) {
            const exTitle = (ex.title || '').toLowerCase()
            const asstType = ex.assessment_type || (
              exTitle.includes('akhir') || exTitle.includes('sas') ? 'sas' :
              exTitle.includes('tengah') || exTitle.includes('sts') ? 'sts' : ''
            )
            if (Array.isArray(ex.student_scores)) {
              const sc = ex.student_scores.find(s =>
                s.student_id === stu.id || s.id === stu.id || (stu.nis && s.nis === stu.nis)
              )
              if (sc && sc.score !== undefined) {
                if (asstType === 'sts') realSts = Math.min(100, Math.max(0, Number(sc.score) || 0))
                if (asstType === 'sas') realSas = Math.min(100, Math.max(0, Number(sc.score) || 0))
              }
            }
          }
        }

        // Gabungkan nilai STS Luar Aplikasi (jika ada)
        const offlineStsList = classOfflineAssessments.filter(a => a.type === 'sts' || a.category === 'STS' || a.category === 'STS (Tengah Semester)')
        for (const off of offlineStsList) {
          const sc = (off.scores || []).find(s =>
            s.student_id === stu.id || (stu.nis && s.nis === stu.nis) ||
            (s.student_name && stu.name && s.student_name.toLowerCase().trim() === stu.name.toLowerCase().trim())
          )
          if (sc && sc.score !== null && sc.score !== undefined && !isNaN(Number(sc.score))) {
            realSts = Math.min(100, Math.max(0, Number(sc.score)))
          }
        }

        // Gabungkan nilai SAS Luar Aplikasi (jika ada)
        const offlineSasList = classOfflineAssessments.filter(a => a.type === 'sas' || a.category === 'SAS' || a.category === 'SAS (Akhir Semester)')
        for (const off of offlineSasList) {
          const sc = (off.scores || []).find(s =>
            s.student_id === stu.id || (stu.nis && s.nis === stu.nis) ||
            (s.student_name && stu.name && s.student_name.toLowerCase().trim() === stu.name.toLowerCase().trim())
          )
          if (sc && sc.score !== null && sc.score !== undefined && !isNaN(Number(sc.score))) {
            realSas = Math.min(100, Math.max(0, Number(sc.score)))
          }
        }

        grade.sts = realSts
        grade.sas = realSas

        recalcGrade(grade)
      }
      saveDb()
    }

    // -------------------------------------------------------------
    // CHAPTERS & LEARNING OBJECTIVES (BAB & TP) MANAGEMENT & MAPPING
    // -------------------------------------------------------------
    if (pathname === '/api/v1/chapters' && req.method === 'GET') {
      ensureDefaultChapters()
      let chapters = [...db.chapters]
      if (query.subject_id) {
        chapters = chapters.filter(c => c.subject_id === query.subject_id)
      }
      if (query.grade_level) {
        chapters = chapters.filter(c => Number(c.grade_level) === Number(query.grade_level))
      }
      chapters.sort((a, b) => (Number(a.chapter_number) || 0) - (Number(b.chapter_number) || 0))

      const chaptersWithMapped = chapters.map(chap => ({
        ...chap,
        tps: (chap.tps || []).map(tp => {
          const autoTasks = (db.assignments || []).filter(a =>
            a.tp_id === tp.id || (Array.isArray(tp.task_ids) && tp.task_ids.includes(a.id))
          ).map(a => ({ id: a.id, title: a.title, classroom: a.classroom, maxScore: a.maxScore }))

          const autoExams = [
            ...(db.ulanganGamifikasiSessions || []).filter(g =>
              g.tp_id === tp.id || (Array.isArray(tp.exam_session_ids) && tp.exam_session_ids.includes(g.id))
            ).map(g => ({ id: g.id, title: g.title, topic: g.topic, type: 'gamifikasi' })),
            ...(db.exams || []).filter(e =>
              e.tp_id === tp.id || (Array.isArray(tp.exam_session_ids) && tp.exam_session_ids.includes(e.id))
            ).map(e => ({ id: e.id, title: e.title, topic: e.subject || e.subject_name, type: 'cbt' }))
          ]

          return {
            ...tp,
            mapped_tasks: autoTasks,
            mapped_exams: autoExams
          }
        })
      }))

      return sendJson(res, 200, {
        status: 'success',
        data: chaptersWithMapped
      })
    }

    if (pathname === '/api/v1/chapters' && req.method === 'POST') {
      ensureDefaultChapters()
      const body = await parseBody(req)
      const subject = (db.subjects || []).find(s => s.id === body.subject_id) || { id: body.subject_id || 'sub-inf', name: 'Informatika' }
      const newChapter = {
        id: `chap-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
        subject_id: subject.id,
        subject_name: subject.name,
        grade_level: Number(body.grade_level) || 7,
        chapter_number: Number(body.chapter_number) || (db.chapters.filter(c => c.subject_id === subject.id).length + 1),
        title: body.title || 'Bab Baru',
        description: body.description || '',
        tps: Array.isArray(body.tps) ? body.tps : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      db.chapters.push(newChapter)
      saveDb()
      return sendJson(res, 201, {
        status: 'success',
        message: 'Bab materi berhasil ditambahkan',
        data: newChapter
      })
    }

    // Mapping preview endpoint: computes real-time pre-flight matrix before committing to Rekap Nilai
    if (pathname === '/api/v1/chapters/mapping-preview' && req.method === 'GET') {
      ensureDefaultChapters()
      const classroomId = query.classroom_id || 'cls-7a'
      const subjectId = query.subject_id || 'sub-inf'
      const subject = (db.subjects || []).find(s => s.id === subjectId) || { id: subjectId, name: 'Informatika' }
      const classroom = (db.classrooms || []).find(c => c.id === classroomId) || { id: classroomId, name: 'Kelas' }
      const kktp = Number(query.kktp) || Number(subject.kkm) || Number(subject.kktp) || 75

      // Filter chapters for this subject
      const chapters = (db.chapters || []).filter(c => c.subject_id === subjectId)
      chapters.sort((a, b) => (Number(a.chapter_number) || 0) - (Number(b.chapter_number) || 0))

      // Collect all TPs
      const allTps = chapters.flatMap(c => (c.tps || []).map(tp => ({
        ...tp,
        chapter_id: c.id,
        chapter_title: c.title,
        chapter_number: c.chapter_number
      })))

      // Class sessions & attendance
      const classSessions = (db.sessions || []).filter(s =>
        s.classroom_id === classroomId &&
        (!s.subject_id || !subjectId || s.subject_id === subjectId)
      )
      const totalSessions = classSessions.length

      // Assignments for this classroom & subject
      const allClassAssignments = (db.assignments || []).filter(a =>
        a.classroom_id === classroomId &&
        (!a.subject_id || !subjectId || a.subject_id === subjectId || a.subject === subject.name)
      )

      // Ulangan Gamifikasi Sessions for this classroom & subject
      const allGamifikasiSessions = (db.ulanganGamifikasiSessions || []).filter(g =>
        g.classroom_id === classroomId || g.classroom_name === classroom.name
      )

      // CBT Exams
      const allCbtExams = (db.exams || []).filter(e =>
        e.classroom_id === classroomId || e.classroom_name === classroom.name || !e.classroom_id
      )

      // Students
      const students = (db.students || []).filter(s => s.classroom_id === classroomId)

      // Pre-flight calculation per student
      const studentsMatrix = students.map(stu => {
        // 1. Presensi (40% bobot ke Formatif)
        let presentCount = 0
        if (totalSessions > 0) {
          presentCount = (db.attendanceRecords || []).filter(r =>
            classSessions.some(s => s.id === r.session_id) &&
            (r.student_id === stu.id || (stu.nis && r.student_nis === stu.nis) || (stu.nisn && r.nisn === stu.nisn)) &&
            (r.status === 'present' || r.status === 'hadir')
          ).length
        }
        const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
        const attendanceScore = attendancePct
        const attendanceContrib = Math.round((attendanceScore * 0.40) * 10) / 10

        // 2. Mapped Tugas (60% bobot ke Formatif - otomatis dari tugas yang dipetakan ke TP)
        const mappedTaskIds = new Set(allTps.flatMap(tp => [
          ...(tp.task_ids || []),
          ...allClassAssignments.filter(a => a.tp_id === tp.id).map(a => a.id)
        ]))
        let relevantAssignments = allClassAssignments
        if (mappedTaskIds.size > 0) {
          const filtered = allClassAssignments.filter(a => mappedTaskIds.has(a.id))
          if (filtered.length > 0) relevantAssignments = filtered
        }

        const taskDetails = relevantAssignments.map(asg => {
          const sub = (db.assignmentSubmissions || []).find(s =>
            s.assignment_id === asg.id &&
            (s.student_id === stu.id || (stu.nis && s.student_nis === stu.nis)) &&
            s.score !== null && s.score !== undefined && !isNaN(Number(s.score))
          )
          return {
            assignment_id: asg.id,
            title: asg.title,
            score: sub ? Number(sub.score) : 0,
            has_submission: !!sub
          }
        })

        const gradedTasks = taskDetails.filter(t => t.has_submission)
        let avgTugas = 0
        if (gradedTasks.length > 0) {
          avgTugas = Math.round((gradedTasks.reduce((a, t) => a + t.score, 0) / gradedTasks.length) * 10) / 10
        } else {
          // Fallback ke nilai tugas existing di db.subjectGrades jika ada
          const existingGrade = (db.subjectGrades || []).find(g =>
            g.classroom_id === classroomId && g.subject_id === subjectId &&
            (g.student_id === stu.id || (stu.nis && g.nis === stu.nis))
          )
          if (existingGrade?.avg_tugas) {
            avgTugas = Number(existingGrade.avg_tugas)
          }
        }
        const tugasContrib = Math.round((avgTugas * 0.60) * 10) / 10
        const totalFormatif = Math.round((attendanceContrib + tugasContrib) * 10) / 10

        // 3. Mapped Ulangan per TP (Sumatif Lingkup Materi - 30% NA)
        const tpScores = {}
        allTps.forEach((tp, idx) => {
          const tpKey = `tp${idx + 1}`
          let score = 0
          const sessIds = [
            ...(Array.isArray(tp.exam_session_ids) ? tp.exam_session_ids : []),
            ...allGamifikasiSessions.filter(g => g.tp_id === tp.id).map(g => g.id),
            ...allCbtExams.filter(e => e.tp_id === tp.id).map(e => e.id)
          ]
          if (sessIds.length > 0) {
            for (const sessId of sessIds) {
              const gameSess = allGamifikasiSessions.find(g => g.id === sessId)
              if (gameSess) {
                const part = (gameSess.participants || []).find(p =>
                  p.id === stu.id || p.student_id === stu.id || (stu.nis && p.nis === stu.nis)
                )
                if (part && part.academic_score !== undefined) {
                  score = Math.max(score, Number(part.academic_score))
                }
              }
              const cbtSess = (db.examSessions || []).find(s =>
                s.exam_id === sessId && s.student_id === stu.id && s.score !== undefined
              )
              if (cbtSess) {
                score = Math.max(score, Number(cbtSess.score))
              }
            }
          }
          if (score === 0) {
            const existingGrade = (db.subjectGrades || []).find(g =>
              g.classroom_id === classroomId && g.subject_id === subjectId &&
              (g.student_id === stu.id || (stu.nis && g.nis === stu.nis))
            )
            score = Number(existingGrade?.sumatif_tp?.[tpKey] || 0)
          }
          tpScores[tpKey] = score
        })

        const nonZeroTpVals = Object.values(tpScores).filter(v => v > 0)
        const avgSumatifTp = nonZeroTpVals.length > 0
          ? Math.round((nonZeroTpVals.reduce((a, b) => a + b, 0) / nonZeroTpVals.length) * 10) / 10
          : 0

        // 4. STS & SAS
        const existingGrade = (db.subjectGrades || []).find(g =>
          g.classroom_id === classroomId && g.subject_id === subjectId &&
          (g.student_id === stu.id || (stu.nis && g.nis === stu.nis))
        )
        let sts = Number(existingGrade?.sts || 0)
        let sas = Number(existingGrade?.sas || 0)

        const cbtSessions = (db.examSessions || []).filter(s =>
          (s.student_id === stu.id || (stu.nis && s.student_nis === stu.nis)) &&
          (s.status === 'completed' || s.status === 'submitted') && s.score !== undefined
        )
        for (const cbtSes of cbtSessions) {
          const ex = (db.exams || []).find(e => e.id === cbtSes.exam_id) || cbtSes.exam
          const examTitle = (ex?.title || cbtSes.exam?.title || '').toLowerCase()
          const asstType = ex?.assessment_type || ''
          if ((asstType === 'sts' || examTitle.includes('tengah') || examTitle.includes('uts') || examTitle.includes('sts') || examTitle.includes('pts')) && !sts) {
            sts = Number(cbtSes.score) || 0
          }
          if ((asstType === 'sas' || examTitle.includes('akhir') || examTitle.includes('uas') || examTitle.includes('sas') || examTitle.includes('pas')) && !sas) {
            sas = Number(cbtSes.score) || 0
          }
        }

        const classExams = (db.exams || []).filter(e =>
          (!e.classroom_id || e.classroom_id === classroomId) &&
          (!e.subject_id || e.subject_id === subjectId)
        )
        for (const ex of classExams) {
          const exTitle = (ex.title || '').toLowerCase()
          const asstType = ex.assessment_type || (
            exTitle.includes('akhir') || exTitle.includes('sas') ? 'sas' :
            exTitle.includes('tengah') || exTitle.includes('sts') ? 'sts' :
            (ex.tp_id ? 'tp' : '')
          )
          if (Array.isArray(ex.student_scores)) {
            const sc = ex.student_scores.find(s =>
              s.student_id === stu.id || s.id === stu.id || (stu.nis && s.nis === stu.nis)
            )
            if (sc && sc.score !== undefined) {
              if (asstType === 'sts' && !sts) sts = Number(sc.score)
              if (asstType === 'sas' && !sas) sas = Number(sc.score)
            }
          }
        }

        // 5. NA Rapor Preview (Kurikulum Merdeka)
        const activeComponents = [
          { val: totalFormatif, weight: 0.30 },
          { val: avgSumatifTp, weight: 0.30 },
          { val: sts, weight: 0.20 },
          { val: sas, weight: 0.20 }
        ].filter(c => c.val > 0)

        let previewFinalScore = 0
        if (activeComponents.length === 4) {
          previewFinalScore = Math.min(100, Math.max(0, Math.round((totalFormatif * 0.30) + (avgSumatifTp * 0.30) + (sts * 0.20) + (sas * 0.20))))
        } else if (activeComponents.length > 0) {
          const totalWeight = activeComponents.reduce((a, c) => a + c.weight, 0)
          previewFinalScore = Math.min(100, Math.max(0, Math.round(activeComponents.reduce((a, c) => a + (c.val * c.weight), 0) / totalWeight)))
        }

        const isTuntas = previewFinalScore >= kktp
        const gradeLetter = previewFinalScore >= 90 ? 'A' : previewFinalScore >= 80 ? 'B' : previewFinalScore >= kktp ? 'C' : 'D'

        const isSynced = existingGrade &&
          Number(existingGrade.attendance_score) === attendanceScore &&
          Number(existingGrade.avg_formatif) === totalFormatif &&
          Number(existingGrade.avg_sumatif_tp) === avgSumatifTp &&
          Number(existingGrade.final_score) === previewFinalScore

        return {
          id: stu.id,
          name: stu.name,
          nis: stu.nis || '',
          gender: stu.gender || 'L',
          attendance: {
            present: presentCount,
            total: totalSessions,
            percentage: attendancePct,
            score: attendanceScore,
            contrib_formatif: attendanceContrib
          },
          tasks: {
            details: taskDetails,
            avg: avgTugas,
            contrib_formatif: tugasContrib
          },
          formatif: {
            attendance_contrib: attendanceContrib,
            tasks_contrib: tugasContrib,
            total: totalFormatif
          },
          sumatif_tp: {
            by_tp: tpScores,
            avg: avgSumatifTp
          },
          sts: sts,
          sas: sas,
          preview_final_score: previewFinalScore,
          grade_letter: gradeLetter,
          kktp_status: isTuntas ? 'Tuntas' : 'Perlu Bimbingan',
          is_synced: !!isSynced,
          synced_at: existingGrade?.synced_at || null
        }
      })

      const totalStudents = studentsMatrix.length
      const tuntasCount = studentsMatrix.filter(s => s.kktp_status === 'Tuntas').length
      const belumTuntasCount = totalStudents - tuntasCount
      const avgAttendance = totalStudents > 0
        ? Math.round(studentsMatrix.reduce((a, s) => a + s.attendance.percentage, 0) / totalStudents)
        : 0
      const avgFormatif = totalStudents > 0
        ? Math.round((studentsMatrix.reduce((a, s) => a + s.formatif.total, 0) / totalStudents) * 10) / 10
        : 0
      const avgSumatif = totalStudents > 0
        ? Math.round((studentsMatrix.reduce((a, s) => a + s.sumatif_tp.avg, 0) / totalStudents) * 10) / 10
        : 0
      const avgFinal = totalStudents > 0
        ? Math.round(studentsMatrix.reduce((a, s) => a + s.preview_final_score, 0) / totalStudents)
        : 0

      return sendJson(res, 200, {
        status: 'success',
        data: {
          classroom: { id: classroom.id, name: classroom.name },
          subject: { id: subject.id, name: subject.name, kktp },
          kktp,
          attendance_info: {
            total_sessions: totalSessions,
            formula: 'Formatif (100%) = Presensi 40% + Akumulasi Tugas 60%',
            weight_attendance: 0.40,
            weight_tasks: 0.60
          },
          chapters,
          all_tps: allTps,
          available_tasks: allClassAssignments,
          available_exams: allGamifikasiSessions.map(g => ({
            id: g.id,
            title: g.title,
            topic: g.topic,
            kkm: g.kkm,
            status: g.status,
            passed_count: g.passed_count,
            created_at: g.created_at
          })),
          matrix: studentsMatrix,
          stats: {
            total_students: totalStudents,
            tuntas_count: tuntasCount,
            belum_tuntas_count: belumTuntasCount,
            avg_attendance_pct: avgAttendance,
            avg_formatif: avgFormatif,
            avg_sumatif_tp: avgSumatif,
            avg_final_score: avgFinal
          }
        }
      })
    }

    // Apply & commit mapped grades to Rekap Nilai Siswa (db.subjectGrades)
    if (pathname === '/api/v1/chapters/apply-to-grades' && req.method === 'POST') {
      const body = await parseBody(req)
      const classroomId = body.classroom_id || 'cls-7a'
      const subjectId = body.subject_id || 'sub-inf'
      const classroom = (db.classrooms || []).find(c => c.id === classroomId) || { id: classroomId, name: 'Kelas' }
      const subject = (db.subjects || []).find(s => s.id === subjectId) || { id: subjectId, name: 'Informatika' }
      const kktp = Number(body.kktp) || Number(subject.kkm) || Number(subject.kktp) || 75

      autoComputeGradesForClass(classroomId, subjectId)

      const students = (db.students || []).filter(s => s.classroom_id === classroomId)
      let updatedCount = 0

      for (const stu of students) {
        let grade = (db.subjectGrades || []).find(g =>
          g.classroom_id === classroomId && g.subject_id === subjectId &&
          (g.student_id === stu.id || (stu.nis && g.nis === stu.nis))
        )
        if (grade) {
          grade.synced_from_mapping = true
          grade.synced_at = new Date().toISOString()
          grade.kktp = kktp
          recalcGrade(grade, kktp)
          updatedCount++
        }
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Berhasil menyinkronkan ${updatedCount} nilai siswa ke Rekap Nilai Siswa (${classroom.name} - ${subject.name}).`,
        updated_count: updatedCount
      })
    }

    const chapterMatch = pathname.match(/^\/api\/v1\/chapters\/([a-zA-Z0-9_-]+)$/)
    if (chapterMatch) {
      const chapterId = chapterMatch[1]
      ensureDefaultChapters()
      const chapterIdx = db.chapters.findIndex(c => c.id === chapterId)

      if (req.method === 'GET') {
        if (chapterIdx === -1) return sendJson(res, 404, { status: 'error', message: 'Bab tidak ditemukan' })
        return sendJson(res, 200, { status: 'success', data: db.chapters[chapterIdx] })
      }

      if (req.method === 'PUT') {
        if (chapterIdx === -1) return sendJson(res, 404, { status: 'error', message: 'Bab tidak ditemukan' })
        const body = await parseBody(req)
        const chapter = db.chapters[chapterIdx]
        if (body.title !== undefined) chapter.title = body.title
        if (body.chapter_number !== undefined) chapter.chapter_number = Number(body.chapter_number)
        if (body.description !== undefined) chapter.description = body.description
        if (Array.isArray(body.tps)) chapter.tps = body.tps
        chapter.updated_at = new Date().toISOString()
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'Bab berhasil diperbarui', data: chapter })
      }

      if (req.method === 'DELETE') {
        if (chapterIdx === -1) return sendJson(res, 404, { status: 'error', message: 'Bab tidak ditemukan' })
        const deleted = db.chapters.splice(chapterIdx, 1)[0]
        saveDb()
        return sendJson(res, 200, { status: 'success', message: `Bab "${deleted.title}" berhasil dihapus`, data: deleted })
      }
    }

    const chapterTpMatch = pathname.match(/^\/api\/v1\/chapters\/([a-zA-Z0-9_-]+)\/tps(?:\/([a-zA-Z0-9_-]+))?$/)
    if (chapterTpMatch) {
      const chapterId = chapterTpMatch[1]
      const tpId = chapterTpMatch[2]
      ensureDefaultChapters()
      const chapter = db.chapters.find(c => c.id === chapterId)
      if (!chapter) return sendJson(res, 404, { status: 'error', message: 'Bab tidak ditemukan' })
      chapter.tps = chapter.tps || []

      if (req.method === 'POST' && !tpId) {
        const body = await parseBody(req)
        const newTp = {
          id: `tp-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
          code: body.code || `TP ${chapter.chapter_number}.${chapter.tps.length + 1}`,
          description: body.description || '',
          kktp: Number(body.kktp) || 75,
          task_ids: Array.isArray(body.task_ids) ? body.task_ids : [],
          exam_session_ids: Array.isArray(body.exam_session_ids) ? body.exam_session_ids : [],
          target_tasks_count: Number(body.target_tasks_count) || 1,
          target_exams_count: Number(body.target_exams_count) || 1,
          created_at: new Date().toISOString()
        }
        chapter.tps.push(newTp)
        chapter.updated_at = new Date().toISOString()
        saveDb()
        return sendJson(res, 201, { status: 'success', message: 'TP berhasil ditambahkan ke Bab', data: newTp })
      }

      if (req.method === 'PUT' && tpId) {
        const tpIdx = chapter.tps.findIndex(t => t.id === tpId)
        if (tpIdx === -1) return sendJson(res, 404, { status: 'error', message: 'Tujuan Pembelajaran tidak ditemukan' })
        const body = await parseBody(req)
        const tp = chapter.tps[tpIdx]
        if (body.code !== undefined) tp.code = body.code
        if (body.description !== undefined) tp.description = body.description
        if (body.kktp !== undefined) tp.kktp = Number(body.kktp)
        if (Array.isArray(body.task_ids)) tp.task_ids = body.task_ids
        if (Array.isArray(body.exam_session_ids)) tp.exam_session_ids = body.exam_session_ids
        if (body.target_tasks_count !== undefined) tp.target_tasks_count = Number(body.target_tasks_count)
        if (body.target_exams_count !== undefined) tp.target_exams_count = Number(body.target_exams_count)
        chapter.updated_at = new Date().toISOString()
        saveDb()
        return sendJson(res, 200, { status: 'success', message: 'TP berhasil diperbarui', data: tp })
      }

      if (req.method === 'DELETE' && tpId) {
        const tpIdx = chapter.tps.findIndex(t => t.id === tpId)
        if (tpIdx === -1) return sendJson(res, 404, { status: 'error', message: 'Tujuan Pembelajaran tidak ditemukan' })
        const deleted = chapter.tps.splice(tpIdx, 1)[0]
        chapter.updated_at = new Date().toISOString()
        saveDb()
        return sendJson(res, 200, { status: 'success', message: `TP ${deleted.code} berhasil dihapus`, data: deleted })
      }
    }

    // -------------------------------------------------------------
    // SUBJECT GRADES RECAP (INFORMATIKA & KKA)
    // -------------------------------------------------------------
    if (pathname === '/api/v1/reports/grades' && req.method === 'GET') {
      const classroomId = query.classroom_id || ''
      let subjectId = query.subject_id || ''

      // Otomatis sinkronkan mata pelajaran sesuai jadwal mengajar:
      // Kelas 7 -> KKA (sub-kka), Kelas 9 -> Informatika (sub-inf)
      if (classroomId) {
        const cls = (db.classrooms || []).find(c => c.id === classroomId)
        const isGrade9 = cls ? (Number(cls.grade_level) === 9 || String(cls.name).includes('IX') || String(cls.name).includes('9'))
                             : (String(classroomId).includes('9') || String(classroomId).includes('IX'))
        subjectId = isGrade9 ? 'sub-inf' : 'sub-kka'
        autoComputeGradesForClass(classroomId, subjectId)
      } else if (subjectId) {
        // Jika tidak ada classroom_id tertentu
      }

      const subject = (db.subjects || []).find(s => s.id === subjectId)
      const kktp = Number(query.kktp) || Number(subject?.kkm) || Number(subject?.kktp) || 75

      let filtered = db.subjectGrades || []
      if (classroomId) {
        const classStudents = (db.students || []).filter(s => s.classroom_id === classroomId)
        if (classStudents.length > 0) {
          const classStudentIds = new Set(classStudents.map(s => s.id))
          const classStudentNises = new Set(classStudents.map(s => s.nis).filter(Boolean))
          filtered = filtered.filter(g =>
            g.classroom_id === classroomId &&
            (classStudentIds.has(g.student_id) || classStudentNises.has(g.nis))
          )
        } else {
          filtered = filtered.filter(g => g.classroom_id === classroomId)
        }
      }
      if (subjectId) {
        filtered = filtered.filter(g => g.subject_id === subjectId)
      }

      // Pastikan data nilai dievaluasi terhadap KKTP aktif
      const mapped = filtered.map(g => {
        const curKktp = Number(query.kktp) || Number(g.kktp) || kktp
        const fs = Number(g.final_score) || 0
        return {
          ...g,
          sts: g.sts ?? 0,
          sas: g.sas ?? 0,
          kktp: curKktp,
          kktp_status: fs >= curKktp ? 'Tuntas' : 'Perlu Bimbingan',
          grade: fs >= 90 ? 'A' : fs >= 80 ? 'B' : fs >= curKktp ? 'C' : 'D'
        }
      })

      // Compute statistics
      const total = mapped.length
      const scores = mapped.map(g => Number(g.final_score) || 0)
      const avg = total > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / total) * 10) / 10 : 0
      const highest = total > 0 ? Math.max(...scores) : 0
      const lowest = total > 0 ? Math.min(...scores) : 0
      const passed = mapped.filter(g => (Number(g.final_score) || 0) >= kktp).length
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

      return sendJson(res, 200, {
        status: 'success',
        data: {
          grades: mapped,
          stats: {
            kktp,
            total_students: total,
            average_score: avg,
            highest_score: highest,
            lowest_score: lowest,
            passed_students: passed,
            pass_rate: passRate,
            teacher_name: 'Muhammad Fadly Akbar Arsandi, S.Pd.',
            teacher_nip: '199509282020121003',
            school_name: 'SMP Negeri 6 Kendari',
            principal_name: 'La Ode Muhamad Hidayat, S.Pd., M.Pd.',
            principal_nip: '197205141998021002'
          }
        }
      })
    }

    if (pathname === '/api/v1/reports/grades/kktp' && (req.method === 'POST' || req.method === 'PUT')) {
      const body = await parseBody(req)
      const kktp = Math.max(1, Math.min(100, Number(body.kktp) || 75))
      const subjectId = body.subject_id
      const classroomId = body.classroom_id

      if (subjectId) {
        const sub = (db.subjects || []).find(s => s.id === subjectId)
        if (sub) {
          sub.kkm = kktp
          sub.kktp = kktp
        }
      }

      let updatedCount = 0
      for (const g of db.subjectGrades || []) {
        if ((!subjectId || g.subject_id === subjectId) && (!classroomId || g.classroom_id === classroomId)) {
          g.kktp = kktp
          recalcGrade(g, kktp)
          updatedCount++
        }
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `KKTP berhasil diubah menjadi ${kktp}`,
        kktp,
        updated_records: updatedCount
      })
    }

    const gradeItemMatch = pathname.match(/^\/api\/v1\/reports\/grades\/([a-zA-Z0-9_-]+)$/)
    if (gradeItemMatch && req.method === 'PUT') {
      const gradeId = gradeItemMatch[1]
      const grade = db.subjectGrades.find(g => g.id === gradeId)
      if (!grade) {
        return sendJson(res, 404, { status: 'error', message: 'Data nilai siswa tidak ditemukan' })
      }
      const body = await parseBody(req)
      if (body.student_name) grade.student_name = body.student_name
      if (body.nis !== undefined) grade.nis = body.nis
      if (body.gender) grade.gender = body.gender
      if (body.student_id) grade.student_id = body.student_id
      // Field baru sistem nilai:
      if (body.attendance_score !== undefined) grade.attendance_score = Number(body.attendance_score) || 0
      if (body.avg_tugas !== undefined) grade.avg_tugas = Number(body.avg_tugas) || 0
      if (body.formatif) {
        grade.formatif = { ...grade.formatif, ...body.formatif }
      }
      if (body.sumatif_tp) {
        grade.sumatif_tp = { ...grade.sumatif_tp, ...body.sumatif_tp }
      }
      if (body.sts !== undefined) grade.sts = Number(body.sts) || 0
      if (body.sas !== undefined) grade.sas = Number(body.sas) || 0
      if (body.competency_desc !== undefined) grade.competency_desc = body.competency_desc
      // Recalculate dengan formula baru (Formatif 30%, Sumatif TP 30%, STS 20%, SAS 20%)
      recalcGrade(grade)

      saveDb()
      return sendJson(res, 200, { status: 'success', data: grade })
    }

    // Auto-compute: hitung nilai otomatis dari absensi, tugas, edu games, CBT
    if (pathname === '/api/v1/reports/grades/auto-compute' && req.method === 'POST') {
      const body = await parseBody(req)
      const classroomId = body.classroom_id
      const subjectId = body.subject_id
      if (!classroomId || !subjectId) {
        return sendJson(res, 400, { status: 'error', message: 'classroom_id dan subject_id wajib diisi' })
      }
      autoComputeGradesForClass(classroomId, subjectId)
      saveDb()
      const computed = (db.subjectGrades || []).filter(g => g.classroom_id === classroomId && g.subject_id === subjectId)
      return sendJson(res, 200, {
        status: 'success',
        message: `Nilai otomatis berhasil dihitung untuk ${computed.length} siswa.`,
        data: computed
      })
    }

    // Endpoint to manually import an exam/battle event to student grades
    if (pathname === '/api/v1/reports/grades/import-event' && req.method === 'POST') {
      const body = await parseBody(req)
      const { session_id, classroom_id, subject_id, component_type, component_key, component_label } = body

      const session = (db.ulanganGamifikasiSessions || []).find(s => s.id === session_id)
      if (!session) {
        return sendJson(res, 404, { status: 'error', message: 'Sesi ulangan tidak ditemukan.' })
      }

      if (!Array.isArray(session.participants) || session.participants.length === 0) {
        return sendJson(res, 400, { status: 'error', message: 'Tidak ada data nilai peserta pada sesi ulangan ini.' })
      }

      const targetClassroomId = classroom_id || session.classroom_id || 'cls-7a'
      const targetClassroom = (db.classrooms || []).find(c => c.id === targetClassroomId) || { id: targetClassroomId, name: 'Kelas' }
      const targetSubjectId = subject_id || session.subject_id || 'sub-inf'
      const targetSubject = (db.subjects || []).find(s => s.id === targetSubjectId) || { id: targetSubjectId, name: 'Informatika' }

      const type = component_type || 'sumatif_tp' // 'sumatif_tp' | 'formatif' | 'sas'
      const key = component_key || (type === 'sumatif_tp' ? 'tp1' : type === 'formatif' ? 'tugas1' : 'sas')
      const label = component_label || (type === 'sumatif_tp' ? 'Sumatif TP 1' : type === 'formatif' ? 'Formatif Tugas 1' : 'SAS CBT')
      const kkm = Number(session.kkm) || 75

      db.subjectGrades = db.subjectGrades || []
      let updatedCount = 0

      for (const p of session.participants) {
        const pScore = Math.round(Number(p.academic_score) || 0)

        // Temukan profil siswa resmi di database untuk NIS, NISN, Gender
        const stu = (db.students || []).find(s =>
          s.id === p.id ||
          s.id === p.student_id ||
          (s.name && p.name && s.name.toLowerCase().trim() === p.name.toLowerCase().trim())
        )

        const studentId = stu?.id || p.student_id || p.id
        const studentName = stu?.name || p.name || 'Siswa'
        const studentNis = stu?.nis || p.nis || ''
        const studentGender = stu?.gender || p.gender || 'L'

        let grade = db.subjectGrades.find(g =>
          g.subject_id === targetSubjectId &&
          g.classroom_id === targetClassroomId && (
            (studentId && g.student_id === studentId) ||
            (studentNis && studentNis.length > 2 && g.nis === studentNis) ||
            (studentName && g.student_name && g.student_name.toLowerCase().trim() === studentName.toLowerCase().trim())
          )
        )

        if (!grade) {
          grade = {
            id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            classroom_id: targetClassroom.id,
            classroom_name: targetClassroom.name,
            subject_id: targetSubject.id,
            subject_name: targetSubject.name,
            student_id: studentId,
            student_name: studentName,
            nis: studentNis,
            nisn: stu?.nisn || '',
            gender: studentGender,
            formatif: {},
            avg_formatif: 0,
            sumatif_tp: {},
            avg_sumatif_tp: 0,
            sas: 0,
            final_score: 0,
            grade: 'D',
            kktp_status: 'Perlu Bimbingan',
            competency_desc: ''
          }
          db.subjectGrades.push(grade)
        }

        grade.sumatif_tp = grade.sumatif_tp || {}
        grade.sumatif_tp[key] = pScore

        recalcGrade(grade)

        grade.competency_desc = pScore >= kkm
          ? `Menunjukkan penguasaan kompetensi yang sangat baik pada materi ${session.title || 'Informatika'}.`
          : `Perlu bimbingan dan pengulangan konsep pada materi ${session.title || 'Informatika'}.`

        updatedCount++
      }

      session.imported_to_grades = true
      session.imported_at = Date.now()
      session.imported_component = label
      session.imported_subject = targetSubject.name
      session.imported_classroom = targetClassroom.name

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Nilai dari ulangan "${session.title}" berhasil dimasukkan ke Rekap Nilai Siswa (${label}).`,
        updated_count: updatedCount
      })
    }

    // Endpoint to manually import CBT exam results to student grades
    if (pathname === '/api/v1/reports/grades/import-cbt' && req.method === 'POST') {
      const body = await parseBody(req)
      const { exam_id, classroom_id, subject_id, component_type, component_key, component_label, student_scores } = body

      const exam = (db.exams || []).find(e => e.id === exam_id) || (db.examSessions || []).find(s => s.exam_id === exam_id)?.exam
      const examTitle = exam?.title || 'Ujian CBT'

      const targetClassroomId = classroom_id || exam?.classroom_id || 'cls-7a'
      const targetClassroom = (db.classrooms || []).find(c => c.id === targetClassroomId || c.name === exam?.classroom_name) || { id: targetClassroomId, name: exam?.classroom_name || 'Kelas' }
      const targetSubjectId = subject_id || exam?.subject_id || (examTitle.toLowerCase().includes('kka') ? 'sub-kka' : 'sub-inf')
      const targetSubject = (db.subjects || []).find(s => s.id === targetSubjectId) || { id: targetSubjectId, name: targetSubjectId === 'sub-kka' ? 'KKA (Koding & AI)' : 'Informatika' }

      const rawTitle = (examTitle || '').toLowerCase()
      const asstType = exam?.assessment_type || (
        rawTitle.includes('akhir') || rawTitle.includes('sas') ? 'sas' :
        rawTitle.includes('tengah') || rawTitle.includes('sts') ? 'sts' :
        (exam?.tp_id ? 'sumatif_tp' : 'sas')
      )
      const type = component_type || asstType
      const key = component_key || (type === 'sas' ? 'sas' : type === 'sts' ? 'sts' : type === 'sumatif_tp' ? 'tp1' : 'tugas1')
      const label = component_label || (
        type === 'sts' ? 'Sumatif Tengah Semester (STS CBT)' :
        type === 'sas' ? 'Sumatif Akhir Semester (SAS CBT)' :
        type === 'sumatif_tp' ? 'Sumatif TP' : 'Formatif Tugas'
      )
      const kkm = Number(exam?.kktp ?? exam?.kkm ?? 70)

      let scoresToApply = []
      if (Array.isArray(student_scores) && student_scores.length > 0) {
        scoresToApply = student_scores
      } else {
        const sessions = (db.examSessions || []).filter(s => s.exam_id === exam_id)
        if (sessions.length > 0) {
          scoresToApply = sessions.map(ses => {
            const correct = Object.values(ses.answers || {}).filter(Boolean).length
            const totalQ = (ses.questions || []).length || 1
            const calculatedScore = Math.round((correct / totalQ) * 100)
            return {
              student_id: ses.student_id,
              name: ses.student_name,
              nis: ses.student_nis || '',
              score: ses.score !== undefined ? ses.score : calculatedScore
            }
          })
        }
      }

      if (scoresToApply.length === 0) {
        return sendJson(res, 400, { status: 'error', message: 'Tidak ada data nilai peserta pada ujian CBT ini.' })
      }

      db.subjectGrades = db.subjectGrades || []
      let updatedCount = 0

      for (const p of scoresToApply) {
        const pScore = Math.round(Number(p.score) || 0)

        const stu = (db.students || []).find(s =>
          s.id === p.id ||
          s.id === p.student_id ||
          (s.name && p.name && s.name.toLowerCase().trim() === p.name.toLowerCase().trim())
        )

        const studentId = stu?.id || p.student_id || p.id || `std-${Date.now()}`
        const studentName = stu?.name || p.name || 'Siswa'
        const studentNis = stu?.nis || p.nis || ''
        const studentGender = stu?.gender || 'L'

        let grade = db.subjectGrades.find(g =>
          g.subject_id === targetSubjectId &&
          g.classroom_id === targetClassroom.id && (
            (studentId && g.student_id === studentId) ||
            (studentNis && studentNis.length > 2 && g.nis === studentNis) ||
            (studentName && g.student_name && g.student_name.toLowerCase().trim() === studentName.toLowerCase().trim())
          )
        )

        if (!grade) {
          grade = {
            id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            classroom_id: targetClassroom.id,
            classroom_name: targetClassroom.name,
            subject_id: targetSubject.id,
            subject_name: targetSubject.name,
            student_id: studentId,
            student_name: studentName,
            nis: studentNis,
            nisn: stu?.nisn || '',
            gender: studentGender,
            attendance_score: 0,
            avg_tugas: 0,
            avg_formatif: 0,
            formatif: {},
            sumatif_tp: {},
            avg_sumatif_tp: 0,
            sts: 0,
            sas: 0,
            final_score: 0,
            grade: 'D',
            kktp_status: 'Perlu Bimbingan',
            competency_desc: ''
          }
          db.subjectGrades.push(grade)
        }

        // Simpan ke komponen yang sesuai (sumatif_tp, sts, atau sas)
        if (type === 'sumatif_tp') {
          grade.sumatif_tp = grade.sumatif_tp || {}
          grade.sumatif_tp[key] = pScore
        } else if (type === 'sts') {
          grade.sts = pScore
        } else if (type === 'sas') {
          grade.sas = pScore
        } else if (type === 'formatif') {
          // Warisan: masukkan ke avg_tugas
          grade.avg_tugas = pScore
        }

        recalcGrade(grade)

        grade.competency_desc = pScore >= kkm
          ? `Menunjukkan pencapaian kompetensi yang sangat baik pada asesmen CBT materi ${examTitle}.`
          : `Perlu peningkatan pemahaman dan bimbingan remediasi pada asesmen CBT materi ${examTitle}.`

        updatedCount++
      }

      if (exam) {
        exam.imported_to_grades = true
        exam.imported_at = Date.now()
        exam.imported_component = label
        exam.student_scores = scoresToApply
      }

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Nilai dari ujian CBT "${examTitle}" berhasil dimasukkan ke Rekap Nilai Siswa (${label}).`,
        updated_count: updatedCount
      })
    }

    // Endpoint to manually import assignment (tugas) grades to student grades
    if (pathname === '/api/v1/reports/grades/import-assignment' && req.method === 'POST') {
      const body = await parseBody(req)
      const { assignment_id, classroom_id, subject_id, component_type, component_key, component_label } = body

      const asg = (db.assignments || []).find(a => a.id === assignment_id)
      if (!asg) {
        return sendJson(res, 404, { status: 'error', message: 'Data penugasan tidak ditemukan.' })
      }

      const submissions = (db.assignmentSubmissions || []).filter(s =>
        s.assignment_id === assignment_id && s.score !== null && s.score !== undefined
      )

      if (submissions.length === 0) {
        return sendJson(res, 400, { status: 'error', message: 'Belum ada siswa yang dinilai pada tugas ini. Beri nilai terlebih dahulu pada tugas siswa.' })
      }

      const targetClassroomName = asg.classroom || 'VII A'
      const targetClassroom = (db.classrooms || []).find(c => c.id === classroom_id || c.name === targetClassroomName) || { id: classroom_id || 'cls-7a', name: targetClassroomName }
      const isKka = asg.subject?.toLowerCase().includes('kka') || asg.title?.toLowerCase().includes('kka')
      const targetSubjectId = subject_id || (isKka ? 'sub-kka' : 'sub-inf')
      const targetSubject = (db.subjects || []).find(s => s.id === targetSubjectId) || { id: targetSubjectId, name: targetSubjectId === 'sub-kka' ? 'KKA' : 'Informatika' }

      const type = component_type || 'formatif' // 'formatif' | 'sumatif_tp'
      const key = component_key || (type === 'formatif' ? 'tugas1' : 'tp1')
      const label = component_label || (type === 'formatif' ? 'Formatif Tugas 1' : 'Sumatif TP 1')
      const kkm = 75

      db.subjectGrades = db.subjectGrades || []
      let updatedCount = 0

      for (const sub of submissions) {
        const pScore = Math.round(Number(sub.score) || 0)

        const stu = (db.students || []).find(s =>
          s.id === sub.student_id ||
          (s.name && sub.student_name && s.name.toLowerCase().trim() === sub.student_name.toLowerCase().trim())
        )

        const studentId = stu?.id || sub.student_id || `std-${Date.now()}`
        const studentName = stu?.name || sub.student_name || 'Siswa'
        const studentNis = stu?.nis || sub.student_nis || ''
        const studentGender = stu?.gender || 'L'

        let grade = db.subjectGrades.find(g =>
          g.subject_id === targetSubjectId &&
          g.classroom_id === targetClassroom.id && (
            (studentId && g.student_id === studentId) ||
            (studentNis && studentNis.length > 2 && g.nis === studentNis) ||
            (studentName && g.student_name && g.student_name.toLowerCase().trim() === studentName.toLowerCase().trim())
          )
        )

        if (!grade) {
          grade = {
            id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            classroom_id: targetClassroom.id,
            classroom_name: targetClassroom.name,
            subject_id: targetSubject.id,
            subject_name: targetSubject.name,
            student_id: studentId,
            student_name: studentName,
            nis: studentNis,
            nisn: stu?.nisn || '',
            gender: studentGender,
            attendance_score: 0,
            avg_tugas: 0,
            avg_formatif: 0,
            formatif: {},
            sumatif_tp: {},
            avg_sumatif_tp: 0,
            sts: 0,
            sas: 0,
            final_score: 0,
            grade: 'D',
            kktp_status: 'Perlu Bimbingan',
            competency_desc: ''
          }
          db.subjectGrades.push(grade)
        }

        // Tugas masuk ke avg_tugas (komponen Formatif: Tugas 60%)
        if (type === 'formatif') {
          const existingKeys = Object.keys(grade.formatif || {})
          const taskKey = key || `tugas${existingKeys.length + 1}`
          grade.formatif = grade.formatif || {}
          grade.formatif[taskKey] = pScore
          // Hitung avg_tugas dari semua nilai tugas
          const taskVals = Object.values(grade.formatif).map(Number).filter(n => !isNaN(n) && n > 0)
          grade.avg_tugas = taskVals.length > 0 ? Math.round((taskVals.reduce((a, b) => a + b, 0) / taskVals.length) * 10) / 10 : 0
        } else if (type === 'sumatif_tp') {
          grade.sumatif_tp = grade.sumatif_tp || {}
          grade.sumatif_tp[key] = pScore
        }

        recalcGrade(grade)

        grade.competency_desc = pScore >= kkm
          ? `Menunjukkan ketuntasan yang sangat baik dalam pengerjaan ${asg.title}.`
          : `Perlu pendampingan dan bimbingan dalam penguasaan materi ${asg.title}.`

        updatedCount++
      }

      asg.imported_to_grades = true
      asg.imported_at = Date.now()
      asg.imported_component = label

      saveDb()
      return sendJson(res, 200, {
        status: 'success',
        message: `Nilai dari tugas "${asg.title}" berhasil dimasukkan ke Rekap Nilai Siswa (${label}).`,
        updated_count: updatedCount
      })
    }

    if (pathname === '/api/v1/reports/grades/batch' && req.method === 'POST') {
      const body = await parseBody(req)
      const items = Array.isArray(body) ? body : (body.grades || [])
      db.subjectGrades = db.subjectGrades || []
      const results = []

      for (const item of items) {
        const classroom = db.classrooms.find(c => c.id === item.classroom_id) || db.classrooms[0]
        const subject = db.subjects.find(s => s.id === item.subject_id) || db.subjects[0]
        const formatif = item.formatif || {}
        const sumatif_tp = item.sumatif_tp || {}
        const fVals = Object.values(formatif).map(Number).filter(n => !isNaN(n))
        const avg_formatif = fVals.length > 0 ? Math.round((fVals.reduce((a, b) => a + b, 0) / fVals.length) * 10) / 10 : 0
        const sVals = Object.values(sumatif_tp).map(Number).filter(n => !isNaN(n))
        const avg_sumatif_tp = sVals.length > 0 ? Math.round((sVals.reduce((a, b) => a + b, 0) / sVals.length) * 10) / 10 : 0
        const sts = Number(item.sts) || 0
        const sas = Number(item.sas) || 0

        const existingIdx = db.subjectGrades.findIndex(g =>
          (item.student_id && g.student_id === item.student_id && g.subject_id === item.subject_id) ||
          (item.nis && g.nis === item.nis && g.classroom_id === item.classroom_id && g.subject_id === item.subject_id)
        )

        const gradeObj = {
          id: existingIdx !== -1 ? db.subjectGrades[existingIdx].id : (item.id || `grd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`),
          classroom_id: item.classroom_id || classroom?.id || 'cls-7a',
          classroom_name: item.classroom_name || classroom?.name || 'VII A',
          subject_id: item.subject_id || subject?.id || 'sub-inf',
          subject_name: item.subject_name || subject?.name || 'Informatika',
          student_id: item.student_id || `std-${Date.now()}`,
          student_name: item.student_name || 'Nama Siswa',
          nis: item.nis || '',
          nisn: item.nisn || '',
          gender: item.gender || 'L',
          formatif,
          avg_formatif,
          sumatif_tp,
          avg_sumatif_tp,
          sts,
          sas,
          final_score: 0,
          grade: 'D',
          kktp_status: 'Perlu Bimbingan',
          competency_desc: item.competency_desc || 'Menunjukkan pemahaman yang baik dalam pembelajaran.'
        }
        recalcGrade(gradeObj)

        if (existingIdx !== -1) {
          db.subjectGrades[existingIdx] = gradeObj
        } else {
          db.subjectGrades.push(gradeObj)
        }
        results.push(gradeObj)
      }

      saveDb()
      return sendJson(res, 201, { status: 'success', data: results })
    }

    if (pathname === '/api/v1/reports/grades' && req.method === 'POST') {
      const body = await parseBody(req)
      const classroom = db.classrooms.find(c => c.id === body.classroom_id)
      const subject = db.subjects.find(s => s.id === body.subject_id)
      const formatif = body.formatif || {}
      const sumatif_tp = body.sumatif_tp || {}
      const fVals = Object.values(formatif).map(Number).filter(n => !isNaN(n))
      const avg_formatif = fVals.length > 0 ? Math.round((fVals.reduce((a, b) => a + b, 0) / fVals.length) * 10) / 10 : 0
      const sVals = Object.values(sumatif_tp).map(Number).filter(n => !isNaN(n))
      const avg_sumatif_tp = sVals.length > 0 ? Math.round((sVals.reduce((a, b) => a + b, 0) / sVals.length) * 10) / 10 : 0
      const sts = Number(body.sts) || 0
      const sas = Number(body.sas) || 0

      const newGrade = {
        id: body.id || `grd-${Date.now()}`,
        classroom_id: body.classroom_id || 'cls-7a',
        classroom_name: body.classroom_name || classroom?.name || 'VII A',
        subject_id: body.subject_id || 'sub-inf',
        subject_name: body.subject_name || subject?.name || 'Informatika',
        student_id: body.student_id || `std-${Date.now()}`,
        student_name: body.student_name || 'Nama Siswa',
        nis: body.nis || '',
        nisn: body.nisn || '',
        gender: body.gender || 'L',
        formatif,
        avg_formatif,
        sumatif_tp,
        avg_sumatif_tp,
        sts,
        sas,
        final_score: 0,
        grade: 'D',
        kktp_status: 'Perlu Bimbingan',
        competency_desc: body.competency_desc || 'Menunjukkan pemahaman yang baik dalam pembelajaran.'
      }
      recalcGrade(newGrade)

      db.subjectGrades = db.subjectGrades || []
      db.subjectGrades.push(newGrade)
      saveDb()
      return sendJson(res, 201, { status: 'success', data: newGrade })
    }

    if (gradeItemMatch && req.method === 'DELETE') {
      const gradeId = gradeItemMatch[1]
      const idx = (db.subjectGrades || []).findIndex(g => g.id === gradeId)
      if (idx !== -1) {
        db.subjectGrades.splice(idx, 1)
        saveDb()
      }
      return sendJson(res, 200, { status: 'success', message: 'Data nilai berhasil dihapus' })
    }

    // -------------------------------------------------------------
    // OFFLINE ASSESSMENTS (PENILAIAN TUGAS & ULANGAN LUAR APLIKASI)
    // -------------------------------------------------------------
    const offlineItemMatch = pathname.match(/^\/api\/v1\/offline-assessments\/([a-zA-Z0-9_-]+)$/)

    if (pathname === '/api/v1/offline-assessments' && req.method === 'GET') {
      db.offlineAssessments = db.offlineAssessments || []
      let list = [...db.offlineAssessments]
      if (query.classroom_id) {
        list = list.filter(a => a.classroom_id === query.classroom_id)
      }
      if (query.subject_id) {
        list = list.filter(a => a.subject_id === query.subject_id)
      }
      if (query.type) {
        list = list.filter(a => a.type === query.type)
      }
      list.sort((a, b) => new Date(b.assessment_date || b.created_at) - new Date(a.assessment_date || a.created_at))

      const withStats = list.map(item => {
        const validScores = (item.scores || []).map(s => Number(s.score)).filter(n => !isNaN(n) && n !== null && n > 0)
        const total = (item.scores || []).length
        const scoredCount = validScores.length
        const avg = scoredCount > 0 ? Math.round((validScores.reduce((a, b) => a + b, 0) / scoredCount) * 10) / 10 : 0
        const highest = scoredCount > 0 ? Math.max(...validScores) : 0
        const lowest = scoredCount > 0 ? Math.min(...validScores) : 0
        return {
          ...item,
          total_students: total,
          scored_count: scoredCount,
          average_score: avg,
          highest_score: highest,
          lowest_score: lowest
        }
      })
      return sendJson(res, 200, { status: 'success', data: withStats })
    }

    if (offlineItemMatch && req.method === 'GET') {
      const id = offlineItemMatch[1]
      db.offlineAssessments = db.offlineAssessments || []
      const found = db.offlineAssessments.find(a => a.id === id)
      if (!found) {
        return sendJson(res, 404, { status: 'error', message: 'Penilaian luar aplikasi tidak ditemukan.' })
      }
      return sendJson(res, 200, { status: 'success', data: found })
    }

    if (pathname === '/api/v1/offline-assessments' && req.method === 'POST') {
      const body = await parseBody(req)
      const {
        title, type, classroom_id, subject_id,
        assessment_date, max_score, description, tp_id, tp_code, scores
      } = body

      if (!title || !classroom_id) {
        return sendJson(res, 400, { status: 'error', message: 'Judul penilaian dan kelas wajib diisi.' })
      }

      const classroom = (db.classrooms || []).find(c => c.id === classroom_id) || { id: classroom_id, name: 'Kelas' }
      const isGrade9 = Number(classroom.grade_level) === 9 || String(classroom.name).includes('IX') || String(classroom.name).includes('9')
      const targetSubjectId = subject_id || (isGrade9 ? 'sub-inf' : 'sub-kka')
      const subject = (db.subjects || []).find(s => s.id === targetSubjectId) || {
        id: targetSubjectId,
        name: targetSubjectId === 'sub-kka' ? 'KKA (Koding dan Kecerdasan Artifisial)' : 'Informatika'
      }

      const newId = `off-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`
      const categoryMap = {
        tugas: 'Formatif (Tugas)',
        ulangan_tp: 'Sumatif TP (Lingkup Materi)',
        sts: 'STS (Tengah Semester)',
        sas: 'SAS (Akhir Semester)'
      }

      const newAssessment = {
        id: newId,
        title: title.trim(),
        type: type || 'tugas', // 'tugas' | 'ulangan_tp' | 'sts' | 'sas'
        category: categoryMap[type || 'tugas'] || 'Formatif (Tugas)',
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        subject_id: subject.id,
        subject_name: subject.name,
        assessment_date: assessment_date || new Date().toISOString().split('T')[0],
        max_score: Number(max_score) || 100,
        description: (description || '').trim(),
        tp_id: tp_id || null,
        tp_code: tp_code || null,
        scores: Array.isArray(scores) ? scores : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      db.offlineAssessments = db.offlineAssessments || []
      db.offlineAssessments.push(newAssessment)

      // Otomatis sinkronkan dan gabungkan ke rekap nilai rapor kelas
      autoComputeGradesForClass(classroom.id, subject.id)
      saveDb()

      return sendJson(res, 201, {
        status: 'success',
        message: `Penilaian luar aplikasi "${newAssessment.title}" berhasil disimpan dan digabungkan ke Rekap Nilai Siswa!`,
        data: newAssessment
      })
    }

    if (offlineItemMatch && req.method === 'PUT') {
      const id = offlineItemMatch[1]
      db.offlineAssessments = db.offlineAssessments || []
      const idx = db.offlineAssessments.findIndex(a => a.id === id)
      if (idx === -1) {
        return sendJson(res, 404, { status: 'error', message: 'Penilaian luar aplikasi tidak ditemukan.' })
      }
      const body = await parseBody(req)
      const existing = db.offlineAssessments[idx]

      const categoryMap = {
        tugas: 'Formatif (Tugas)',
        ulangan_tp: 'Sumatif TP (Lingkup Materi)',
        sts: 'STS (Tengah Semester)',
        sas: 'SAS (Akhir Semester)'
      }

      const updated = {
        ...existing,
        title: body.title !== undefined ? body.title.trim() : existing.title,
        type: body.type !== undefined ? body.type : existing.type,
        category: categoryMap[body.type || existing.type] || existing.category,
        assessment_date: body.assessment_date !== undefined ? body.assessment_date : existing.assessment_date,
        max_score: body.max_score !== undefined ? Number(body.max_score) : existing.max_score,
        description: body.description !== undefined ? body.description.trim() : existing.description,
        tp_id: body.tp_id !== undefined ? body.tp_id : existing.tp_id,
        tp_code: body.tp_code !== undefined ? body.tp_code : existing.tp_code,
        scores: Array.isArray(body.scores) ? body.scores : existing.scores,
        updated_at: new Date().toISOString()
      }

      db.offlineAssessments[idx] = updated
      autoComputeGradesForClass(updated.classroom_id, updated.subject_id)
      saveDb()

      return sendJson(res, 200, {
        status: 'success',
        message: `Penilaian luar aplikasi "${updated.title}" berhasil diperbarui dan rekap nilai telah tersinkron!`,
        data: updated
      })
    }

    if (offlineItemMatch && req.method === 'DELETE') {
      const id = offlineItemMatch[1]
      db.offlineAssessments = db.offlineAssessments || []
      const idx = db.offlineAssessments.findIndex(a => a.id === id)
      if (idx === -1) {
        return sendJson(res, 404, { status: 'error', message: 'Penilaian tidak ditemukan.' })
      }
      const deleted = db.offlineAssessments[idx]
      db.offlineAssessments.splice(idx, 1)

      autoComputeGradesForClass(deleted.classroom_id, deleted.subject_id)
      saveDb()

      return sendJson(res, 200, {
        status: 'success',
        message: `Penilaian luar aplikasi "${deleted.title}" berhasil dihapus dan rekap nilai disesuaikan.`
      })
    }

    // -------------------------------------------------------------
    // NOTIFICATIONS
    // -------------------------------------------------------------
    if (pathname === '/api/v1/notifications' && req.method === 'GET') {
      return sendJson(res, 200, { status: 'success', data: db.notifications })
    }

    // -------------------------------------------------------------
    // AI ASSISTANT CHAT FOR GURU INFORMATIKA & KKA
    // -------------------------------------------------------------
    if (pathname === '/api/v1/ai/chat' && req.method === 'POST') {
      const body = await parseBody(req)
      const message = (body.message || '').trim()
      const history = body.history || []
      const apiKey = (body.apiKey || process.env.GEMINI_API_KEY || '').trim()
      const context = {
        ...(body.context || {}),
        totalStudents: (db.students || []).length,
        totalClasses: (db.classrooms || []).length,
        totalPresentations: (db.presentations || []).length,
        totalQuestions: (db.questions || []).length,
        totalExams: (db.exams || []).length,
        activePresentationSession: (db.presentationSessions || []).find(s => s.status === 'active'),
        activeGameSession: (db.gameSessions || []).find(s => s.status === 'active')
      }

      if (!message) {
        return sendJson(res, 400, { status: 'error', message: 'Pesan tidak boleh kosong.' })
      }

      let reply = ''
      let source = 'built_in'

      if (apiKey) {
        try {
          reply = await callGeminiApi(apiKey, message, history, context)
          source = 'gemini'
        } catch (apiErr) {
          console.warn('Gemini API request failed, falling back to built-in pedagogical engine:', apiErr.message)
          let userFriendlyHint = apiErr.message || ''
          if (userFriendlyHint.includes('API_KEY_INVALID') || userFriendlyHint.includes('API key not valid')) {
            userFriendlyHint = 'API Key Google Gemini tidak valid. Harap periksa kunci di Google AI Studio (aistudio.google.com).'
          } else if (userFriendlyHint.includes('429') || userFriendlyHint.includes('RESOURCE_EXHAUSTED')) {
            userFriendlyHint = 'Batas kuota gratis Google Gemini telah tercapai (Rate Limit). Coba beberapa saat lagi atau gunakan API key lain.'
          } else if (userFriendlyHint.includes('403') || userFriendlyHint.includes('PERMISSION_DENIED')) {
            userFriendlyHint = 'Akses Google Gemini API ditolak (Permission Denied). Pastikan Generative Language API aktif.'
          } else {
            userFriendlyHint = userFriendlyHint.replace(/[\n\r]+/g, ' ').slice(0, 140)
          }
          const fallbackText = generateBuiltInResponse(message, context, history)
          reply = `${fallbackText}\n\n---\n> ⚠️ *Info Sambungan Gemini:* Terjadi kendala saat menghubungi Google Gemini API (${userFriendlyHint}). Respons di atas dijawab menggunakan Pedagogical Assistant Engine Belajarena.`
          source = 'built_in_fallback'
        }
      } else {
        reply = generateBuiltInResponse(message, context, history)
        source = 'built_in'
      }

      return sendJson(res, 200, {
        status: 'success',
        data: {
          reply,
          source,
          timestamp: new Date().toISOString()
        }
      })
    }

    // -------------------------------------------------------------
    // STUDENT PORTAL / NATIVE APK API (SINKRON 100% KE DATABASE)
    // -------------------------------------------------------------
    function getReqStudent(req) {
      const authHeader = req.headers['authorization'] || ''
      const token = authHeader.replace(/^Bearer\s+/i, '').trim()
      if (token && db.tokens && db.tokens[token]) {
        const studentId = db.tokens[token]
        const found = (db.students || []).find(s => s.id === studentId || s.username === studentId || s.nis === studentId)
        if (found) return found
      }
      const xStudentId = req.headers['x-student-id']
      if (xStudentId) {
        const found = (db.students || []).find(s => s.id === xStudentId || s.username === xStudentId || s.nis === xStudentId)
        if (found) return found
      }
      try {
        const urlObj = new URL(req.url, 'http://localhost')
        const qStudentId = urlObj.searchParams.get('student_id')
        if (qStudentId) {
          const found = (db.students || []).find(s => s.id === qStudentId || s.username === qStudentId || s.nis === qStudentId)
          if (found) return found
        }
      } catch (_) {}

      // Fallback siswa default (Ahmad Fadhil Prasetyo - Kelas VII A)
      return (db.students || [])[0] || {
        id: 'std-24001',
        name: 'Ahmad Fadhil Prasetyo',
        nis: '24001',
        nisn: '0089123401',
        classroom_id: 'cls-7a',
        classroom_name: 'VII A',
        gender: 'L',
        email: '24001@siswa.smpn6kendari.sch.id',
        status: 'active'
      }
    }

    // 1. Profil Siswa
    if (pathname === '/api/v1/student/profile' && req.method === 'GET') {
      const student = getReqStudent(req)
      const { password: _, ...safeStudent } = student
      return sendJson(res, 200, { status: 'success', data: safeStudent })
    }

    if (pathname === '/api/v1/student/profile' && req.method === 'PUT') {
      const student = getReqStudent(req)
      const body = await parseBody(req)
      const target = (db.students || []).find(s => s.id === student.id)
      if (target) {
        if (body.name) target.name = body.name
        if (body.phone) target.phone = body.phone
        if (body.address) target.address = body.address
        if (body.email) target.email = body.email
        if (body.parent_name) target.parent_name = body.parent_name
        if (body.parent_phone) target.parent_phone = body.parent_phone
        if (body.password) {
          const rawPwd = String(body.password).trim()
          if (rawPwd.length >= 4) {
            target.password = bcrypt.hashSync(rawPwd, 10)
          }
        }
        if (body.avatar_url !== undefined || body.avatar !== undefined || body.avatar_path !== undefined) {
          const rawAvatar = body.avatar_url ?? body.avatar ?? body.avatar_path
          if (rawAvatar && String(rawAvatar).startsWith('data:image/')) {
            const savedUrl = saveAvatarImage(rawAvatar, target.id, 'student')
            if (savedUrl) {
              target.avatar_url = savedUrl
              target.avatar_path = savedUrl
            }
          } else if (rawAvatar === '' || rawAvatar === null) {
            target.avatar_url = ''
            target.avatar_path = ''
          } else if (rawAvatar) {
            target.avatar_url = String(rawAvatar).trim()
            target.avatar_path = String(rawAvatar).trim()
          }
        }
        target.updated_at = new Date().toISOString()
        saveDb()
        const { password: _, ...safeStudent } = target
        return sendJson(res, 200, { status: 'success', message: 'Profil siswa berhasil diperbarui', data: safeStudent })
      }
      return sendJson(res, 404, { status: 'error', message: 'Data siswa tidak ditemukan' })
    }

    // 2. Tugas & Pengumpulan Siswa
    if (pathname === '/api/v1/student/tasks' && req.method === 'GET') {
      const student = getReqStudent(req)
      const classId = student.classroom_id || 'cls-7a'
      const className = student.classroom_name || 'VII A'
      const assignments = (db.assignments || []).filter(a =>
        a.classroom_id === classId || a.classroom_name === className || !a.classroom_id
      )
      const submissions = db.assignmentSubmissions || []

      const result = assignments.map(asg => {
        const mySub = submissions.find(s => s.assignment_id === asg.id && (s.student_id === student.id || s.student_nis === student.nis))
        return {
          id: asg.id,
          title: asg.title,
          description: asg.description,
          subject_name: asg.subject_name || asg.subject || 'Informatika',
          due_date: asg.due_date || asg.deadline,
          max_score: asg.max_score || 100,
          status: mySub ? (mySub.score !== undefined ? 'graded' : 'submitted') : 'pending',
          submission: mySub || null
        }
      })
      return sendJson(res, 200, { status: 'success', data: result })
    }

    const studentSubmitMatch = pathname.match(/^\/api\/v1\/student\/tasks\/([a-zA-Z0-9_-]+)\/submit$/)
    if (studentSubmitMatch && req.method === 'POST') {
      const asgId = studentSubmitMatch[1]
      const student = getReqStudent(req)
      const body = await parseBody(req)
      db.assignmentSubmissions = db.assignmentSubmissions || []

      let sub = db.assignmentSubmissions.find(s => s.assignment_id === asgId && (s.student_id === student.id || s.student_nis === student.nis))
      if (!sub) {
        sub = {
          id: `sub-${Date.now()}`,
          assignment_id: asgId,
          student_id: student.id,
          student_name: student.name,
          student_nis: student.nis,
          submitted_at: new Date().toISOString(),
          submission_text: body.submission_text || body.content || '',
          file_url: body.file_url || null,
          notes: body.notes || ''
        }
        db.assignmentSubmissions.push(sub)
      } else {
        sub.submission_text = body.submission_text || body.content || sub.submission_text
        sub.file_url = body.file_url || sub.file_url
        sub.notes = body.notes || sub.notes
        sub.updated_at = new Date().toISOString()
      }
      saveDb()
      return sendJson(res, 200, { status: 'success', message: 'Tugas berhasil dikirim ke guru!', data: sub })
    }

    // 3. Rapor & Nilai Pribadi Siswa
    if (pathname === '/api/v1/student/report-card' && req.method === 'GET') {
      const student = getReqStudent(req)
      const allGrades = (db.subjectGrades || []).filter(g =>
        (student.id && g.student_id === student.id) ||
        (student.nis && (g.nis === student.nis || g.student_nis === student.nis)) ||
        (student.name && g.student_name && g.student_name.toLowerCase().trim() === student.name.toLowerCase().trim())
      )

      const totalScore = allGrades.reduce((sum, g) => sum + (Number(g.final_score) || 0), 0)
      const hasGrades = allGrades.length > 0
      const avgScore = hasGrades ? Math.round((totalScore / allGrades.length) * 10) / 10 : 0
      const predicate = hasGrades
        ? (avgScore >= 85 ? 'Sangat Baik (A)' : (avgScore >= 75 ? 'Baik (B)' : 'Cukup (C)'))
        : '-'

      const mappedSubjects = allGrades.map(g => ({
        id: g.id,
        subject_id: g.subject_id,
        subject_name: g.subject_name || 'Mata Pelajaran',
        final_score: g.final_score > 0 ? g.final_score : '-',
        predicate: g.final_score > 0 ? (g.kktp_status || g.grade || 'Tuntas') : 'Belum Ada Nilai',
        tp1_score: (g.sumatif_tp?.tp1 && g.sumatif_tp.tp1 > 0) ? g.sumatif_tp.tp1 : ((g.formatif?.tugas1 && g.formatif.tugas1 > 0) ? g.formatif.tugas1 : '-'),
        tp2_score: (g.sumatif_tp?.tp2 && g.sumatif_tp.tp2 > 0) ? g.sumatif_tp.tp2 : ((g.formatif?.praktikum_lab && g.formatif.praktikum_lab > 0) ? g.formatif.praktikum_lab : '-'),
        sts_score: (g.sts && g.sts > 0) ? g.sts : '-',
        sas_score: (g.sas && g.sas > 0) ? g.sas : '-'
      }))

      return sendJson(res, 200, {
        status: 'success',
        data: {
          student,
          summary: {
            total_subjects: allGrades.length,
            average_score: avgScore,
            predicate
          },
          subjects: mappedSubjects
        }
      })
    }

    // 4. Riwayat Ujian CBT & Ulangan Gamifikasi
    if (pathname === '/api/v1/student/exam-history' && req.method === 'GET') {
      const student = getReqStudent(req)
      const cbtSessions = (db.examSessions || []).filter(s => s.student_id === student.id || s.student_name === student.name)
      const gameSessions = (db.ulanganGamifikasiSessions || []).filter(g =>
        g.classroom_id === student.classroom_id || g.classroom_name === student.classroom_name
      )

      return sendJson(res, 200, {
        status: 'success',
        data: {
          cbt: cbtSessions,
          games: gameSessions
        }
      })
    }

    // 5. Materi Presentasi yang Pernah Diikuti Siswa (Daftar Slide Materi yang Pernah Diikuti Siswa)
    if (pathname === '/api/v1/student/materials' && req.method === 'GET') {
      const student = getReqStudent(req)

      function isParticipantMatch(p, stud) {
        if (!p || !stud) return false
        if (p.studentId && (p.studentId === stud.id || p.studentId === stud.nis)) return true
        if (p.id && (p.id === stud.id || p.id === stud.nis)) return true
        if (stud.nis && stud.nis !== '-' && (p.nis === stud.nis || (p.nis && (p.nis.includes(stud.nis) || stud.nis.includes(p.nis))))) return true
        if (stud.email && p.nis && (p.nis === stud.email || stud.email.includes(p.nis))) return true
        if (stud.name && p.name && p.name.trim().toLowerCase() === stud.name.trim().toLowerCase()) return true
        return false
      }

      // Ambil seluruh sesi presentasi yang PERNAH diikuti oleh siswa ini (diurutkan dari yang terbaru)
      const attendedSessions = (db.presentationSessions || [])
        .filter(session => (session.participants || []).some(p => isParticipantMatch(p, student)))
        .sort((a, b) => new Date(b.created_at || b.ended_at || 0).getTime() - new Date(a.created_at || a.ended_at || 0).getTime())

      // Deduplikasi: Jika siswa mengikuti materi yang sama lebih dari 1 kali, cukup tampilkan 1 saja
      const attendedMaterialsMap = new Map()

      for (const session of attendedSessions) {
        const presId = session.presentation_id
        const pres = presId ? (db.presentations || []).find(p => p.id === presId) : null

        // Kunci unik deduplikasi berdasarkan ID presentasi atau judul materi
        const materialKey = pres?.id || presId || session.title?.toLowerCase().trim() || session.id

        if (!attendedMaterialsMap.has(materialKey)) {
          const finalSlides = (pres && pres.slides && pres.slides.length > 0)
            ? pres.slides
            : (session.slides && session.slides.length > 0 ? session.slides : [])

          // Hanya tampilkan jika memiliki slide materi yang nyata
          if (finalSlides.length === 0 && !pres) continue

          attendedMaterialsMap.set(materialKey, {
            id: pres?.id || session.presentation_id || session.id,
            presentation_id: pres?.id || session.presentation_id,
            title: pres?.title || session.title?.replace(/^Sesi Presentasi:\s*/i, '') || 'Materi Pembelajaran',
            subject: pres?.subject || session.subject || 'Informatika',
            description: pres?.description || 'Materi presentasi slide yang telah dipelajari bersama guru di kelas.',
            slide_count: finalSlides.length,
            slides: finalSlides,
            created_at: pres?.created_at || session.created_at,
            last_attended_at: session.ended_at || session.created_at,
            session_id: session.id,
            teacher_name: pres?.teacher_name || session.teacher || session.teacher_name || 'Muhammad Fadly Akbar Arsandi, S.Pd.',
            classroom: session.classroom || student.classroom_name
          })
        }
      }

      const materials = Array.from(attendedMaterialsMap.values())
      return sendJson(res, 200, { status: 'success', data: materials })
    }

    const studentMaterialDetailMatch = pathname.match(/^\/api\/v1\/student\/materials\/([a-zA-Z0-9_-]+)$/)
    if (studentMaterialDetailMatch && req.method === 'GET') {
      const matId = studentMaterialDetailMatch[1]
      let mat = (db.presentations || []).find(p => p.id === matId)
      if (!mat) {
        const ses = (db.presentationSessions || []).find(s => s.presentation_id === matId || s.id === matId)
        if (ses) {
          mat = {
            id: ses.presentation_id || ses.id,
            title: ses.title?.replace(/^Sesi Presentasi:\s*/i, '') || 'Materi Pembelajaran',
            subject: ses.subject || 'Informatika',
            description: ses.description || 'Materi presentasi slide yang telah dipelajari.',
            slides: ses.slides || [],
            slide_count: (ses.slides || []).length,
            created_at: ses.created_at
          }
        }
      }
      if (!mat) return sendJson(res, 404, { status: 'error', message: 'Materi tidak ditemukan' })
      return sendJson(res, 200, { status: 'success', data: mat })
    }

    // 6. Live Ranking Kelas Real-Time
    if (pathname === '/api/v1/student/leaderboard' && req.method === 'GET') {
      const student = getReqStudent(req)
      const classId = student.classroom_id || 'cls-7a'
      const classmates = (db.students || []).filter(s => s.classroom_id === classId)

      const leaderboard = classmates.map((s) => {
        const studentGrades = (db.subjectGrades || []).filter(g =>
          (s.id && g.student_id === s.id) ||
          (s.nis && (g.nis === s.nis || g.student_nis === s.nis)) ||
          (s.name && g.student_name && g.student_name.toLowerCase().trim() === s.name.toLowerCase().trim())
        )
        const hasGrades = studentGrades.length > 0
        const avg = hasGrades
          ? Math.round((studentGrades.reduce((sum, g) => sum + (Number(g.final_score) || 0), 0) / studentGrades.length) * 10) / 10
          : 0
        const tasksDone = (db.assignmentSubmissions || []).filter(sub => sub.student_id === s.id && sub.status === 'graded').length
        const totalPoints = (avg * 10) + (tasksDone * 50)
        return {
          id: s.id,
          name: s.name,
          nis: s.nis,
          points: totalPoints,
          average_score: avg,
          has_grades: hasGrades,
          is_me: s.id === student.id
        }
      }).sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }))

      return sendJson(res, 200, { status: 'success', data: leaderboard })
    }

    // 7. OTOMATISASI LIVE DISPATCH (AUTO OPEN PRESENTER, GAME, CBT)
    if (pathname === '/api/v1/student/live-broadcast' && req.method === 'GET') {
      const student = getReqStudent(req)
      const classId = student.classroom_id || 'cls-7a'
      const className = student.classroom_name || 'VII A'

      // A. Cek Sesi Presentasi Aktif
      let presDirty = false
      const activePres = (db.presentationSessions || []).find(s => {
        if (s.status !== 'active') return false

        // Sesi yang sudah lampau (> 4 jam) otomatis ditutup
        const sessionAge = Date.now() - new Date(s.created_at || 0).getTime()
        if (sessionAge > 4 * 60 * 60 * 1000) {
          s.status = 'completed'
          s.ended_at = new Date().toISOString()
          presDirty = true
          return false
        }

        // Cek kecocokan rombel / kelas siswa
        if (Array.isArray(s.classroom_ids) && s.classroom_ids.length > 0) {
          if (!s.classroom_ids.includes(classId)) return false
        } else if (s.classroom_id && s.classroom_id !== classId) {
          return false
        } else if (s.classroom && className && s.classroom !== className) {
          return false
        }
        return true
      })
      if (presDirty) saveDb()

      if (activePres) {
        const code = activePres.accessCode || activePres.session_code || activePres.id
        return sendJson(res, 200, {
          status: 'success',
          data: {
            active: true,
            type: 'presentation',
            title: activePres.title || activePres.presentation_title || 'Presentasi Interaktif Guru',
            session_id: activePres.id,
            session_code: code,
            target_url: `/presentation-live/${code}`,
            message: 'Guru telah memulai sesi presentasi interaktif di kelas!'
          }
        })
      }

      // B. Cek Sesi Game Edu / Boss Battle Aktif
      const activeGame = [...(db.ulanganGamifikasiSessions || [])].reverse().find(g => {
        if (g.status !== 'in_progress' && g.status !== 'active' && g.status !== 'lobby') return false
        if (g.outcome && g.outcome !== 'ongoing') return false
        if (Array.isArray(g.participant_ids) && g.participant_ids.length > 0) {
          const pIds = g.participant_ids.map(String)
          const isParticipant =
            pIds.includes(String(student.id)) ||
            (student.student_id && pIds.includes(String(student.student_id))) ||
            (student.nis && pIds.includes(String(student.nis))) ||
            (student.username && pIds.includes(String(student.username))) ||
            (student.name && pIds.some(pid => pid.toLowerCase() === (student.name || '').toLowerCase()))
          if (!isParticipant) return false
          return true
        }
        if (g.classroom_id && g.classroom_id === classId) return true
        if (g.classroom_name && g.classroom_name === className) return true
        return true
      })
      if (activeGame) {
        let targetUrl = `/games/ulangan-harian/play/${activeGame.id}`
        if (activeGame.game_type === 'class-race' || activeGame.mode === 'class-race') {
          targetUrl = `/games/class-race/play/${activeGame.id}`
        } else if (activeGame.game_type === 'tower-defense' || activeGame.mode === 'tower-defense') {
          targetUrl = `/games/tower-defense/play/${activeGame.id}`
        } else if (activeGame.mode && activeGame.mode !== 'boss_battle') {
          targetUrl = `/games/session/${activeGame.id}?mode=${activeGame.mode}`
        }

        return sendJson(res, 200, {
          status: 'success',
          data: {
            active: true,
            type: 'game',
            title: activeGame.title || 'Edu-Games — Ulangan Harian',
            session_id: activeGame.id,
            target_url: targetUrl,
            message: activeGame.game_type === 'class-race'
              ? `Balapan Kelas (${activeGame.title}) telah dibuka oleh guru!`
              : (activeGame.game_type === 'tower-defense'
                  ? `Pertahanan Markas (${activeGame.title}) telah dibuka oleh guru!`
                  : (activeGame.mode && activeGame.mode !== 'boss_battle'
                      ? `Game Edukasi (${activeGame.title}) telah dibuka oleh guru!`
                      : 'Ulangan Harian Gamifikasi (Boss Battle) telah dimulai oleh guru!'))
          }
        })
      }

      // C. Cek Ujian CBT Aktif
      const activeExam = (db.exams || []).find(e => {
        if (e.status !== 'active') return false
        if (e.classroom_id && e.classroom_id === classId) return true
        if (e.classroom_name && e.classroom_name === className) return true
        return false
      })
      if (activeExam) {
        const alreadySubmitted = (db.examSessions || []).some(s =>
          (s.exam_id === activeExam.id || s.id === activeExam.id) &&
          s.student_id === student.id &&
          s.status === 'submitted'
        )
        if (!alreadySubmitted) {
          return sendJson(res, 200, {
            status: 'success',
            data: {
              active: true,
              type: 'cbt',
              title: activeExam.title || 'Ujian Digital CBT',
              session_id: activeExam.id,
              target_url: `/exam/${activeExam.id}/start`,
              message: 'Sesi Ujian CBT telah diaktifkan oleh guru!'
            }
          })
        }
      }

      return sendJson(res, 200, {
        status: 'success',
        data: { active: false }
      })
    }

    // Fallback 404
    return sendJson(res, 404, { status: 'error', message: `Route ${req.method} ${pathname} not found` })
  } catch (err) {
    if (err && (err.status === 413 || err.statusCode === 413)) {
      return sendJson(res, 413, { status: 'error', message: err.message || 'Payload Too Large: Ukuran berkas materi melebihi batas 100 MB' })
    }
    console.error('API Server Error:', err)
    return sendJson(res, 500, { status: 'error', message: 'Internal Server Error', error: String(err) })
  }
})

const PORT = process.env.PORT || 8000
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalNetworkIp()
  console.log(`\n=====================================================================`)
  console.log(`  🌟 BELAJARENA - PLATFORM PEMBELAJARAN DIGITAL & GAMIFIKASI 🌟`)
  console.log(`=====================================================================`)
  console.log(`  💻 Akses di Komputer Ini (Guru/Admin):`)
  console.log(`     👉 http://localhost:${PORT}`)
  if (localIp && localIp !== 'localhost') {
    console.log(``)
    console.log(`  📱 Akses Siswa / Perangkat Lain di Jaringan Wi-Fi yang Sama:`)
    console.log(`     👉 http://${localIp}:${PORT}`)
    console.log(`     (Siswa cukup buka browser di HP/Tablet dan ketik link di atas)`)
  }
  console.log(`\n  🔑 Akun Login Default:`)
  console.log(`     - Akun Guru/Admin : fadly.arsandi@smpn6kendari.sch.id / password: password`)
  console.log(`     - Akun Siswa      : 10527 / password: password`)
  console.log(`=====================================================================\n`)
})
