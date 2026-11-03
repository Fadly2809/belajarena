export const QUIZ_TYPES = [
  { id: 'ulangan_harian', label: 'Ulangan Harian' },
  { id: 'kuis_formatif', label: 'Kuis Formatif' },
  { id: 'ulangan_bab', label: 'Ulangan Bab atau Materi' },
  { id: 'remedial', label: 'Remedial' },
  { id: 'latihan_evaluasi', label: 'Latihan Evaluasi' },
] as const

export type QuizTypeId = (typeof QUIZ_TYPES)[number]['id']

export const BOSS_CATALOG = [
  {
    id: 'robot-glitch',
    name: 'Robot Glitch',
    description: 'Robot yang merusak alur berpikir komputasional dan logika kelas.',
    topic: 'Berpikir Komputasional',
    difficulty: 'sedang',
    spawnMessage: 'Robot Glitch mengacak logika kelas. Tuntaskan KKM untuk meresetnya!',
    defeatMessage: 'Sistem Robot Glitch padam. Kelas menang!',
    winMessage: 'Robot Glitch menang. Perbaiki ketuntasan siswa.',
    color: '#0ea5e9',
    accent: '#67e8f9',
  },
  {
    id: 'rakus-maximus',
    name: 'Rakus Maximus',
    description: 'Monster rakus yang menelan poin ulangan jika kelas belum tuntas.',
    topic: 'Evaluasi Pembelajaran Umum',
    difficulty: 'sedang',
    spawnMessage: 'Rakus Maximus muncul! Kalahkan dengan ketuntasan kelas.',
    defeatMessage: 'Rakus Maximus tumbang. Semua siswa tuntas!',
    winMessage: 'Rakus Maximus tertawa. Masih ada siswa di bawah KKM.',
    color: '#7c3aed',
    accent: '#c084fc',
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
    accent: '#6ee7b7',
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
    accent: '#fcd34d',
  },
] as const

export type BossCharacterId = (typeof BOSS_CATALOG)[number]['id']

export type BattleOutcome = 'ongoing' | 'class_victory' | 'boss_victory'
export type SessionStatus = 'draft' | 'preview' | 'waiting' | 'active' | 'paused' | 'completed'
export type BossPose = 'idle' | 'hit' | 'defeat_last_hit' | 'defeated' | 'laugh'

export interface BossCharacterSnapshot {
  id: string
  name: string
  description: string
  topic: string
  difficulty: string
  spawnMessage: string
  defeatMessage: string
  winMessage: string
  color: string
  accent: string
  customImageUrl?: string | null
}

export interface OfficialParticipant {
  id: string
  studentId: string
  name: string
  avatar: string
  gender?: 'L' | 'P'
  connected: boolean
}

export interface ParticipantProgress {
  participantId: string
  studentId: string
  name: string
  avatar: string
  gender?: 'L' | 'P'
  academicScore: number
  reachedKkm: boolean
  reachedKkmAt: number | null
  correctAnswers: number
  wrongAnswers: number
  answeredCount: number
  currentQuestionIndex: number
  lastAnswerCorrect: boolean | null
}

export interface BattleQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  points: number
}

export interface GameSettings {
  classroomId: string
  classroomName: string
  officialParticipantIds: string[]
  kkm: number
  questionCount: number
  durationMinutes: number
  questionSource: string
  randomizeQuestions: boolean
  initialBossHp: number
  showStudentAvatars: boolean
  soundEnabled: boolean
  animationEnabled: boolean
  reducedMotion: boolean
  showStudentNamesOnProjector: boolean
  mvpEnabled: boolean
  remedialAvailable: boolean
}

export interface QuizSessionConfig {
  quizType: QuizTypeId
  title: string
  topic: string
  bossName: string
  boss: BossCharacterSnapshot
  settings: GameSettings
}

export interface MvpEntry {
  rank: number
  participantId: string
  name: string
  avatar: string
  gender?: 'L' | 'P'
  finalScore: number
  accuracy: number
  contribution: number
  mvpScore: number
  explain: string
}

export interface BattlePublicState {
  sessionId: string
  status: SessionStatus
  outcome: BattleOutcome
  quizType: QuizTypeId
  title: string
  topic: string
  boss: BossCharacterSnapshot
  bossPose: BossPose
  kkm: number
  initialBossHp: number
  bossHpExact: number
  bossHpDisplay: number
  bossHpPercentDisplay: number
  ketuntasanExact: number
  ketuntasanDisplay: number
  officialCount: number
  passedCount: number
  notPassedCount: number
  currentQuestionIndex: number
  questionCount: number
  remainingSeconds: number
  academicLocked: boolean
  learningMode: boolean
  startedAt: number | null
  endedAt: number | null
  configLocked: boolean
}

export interface VisualAttackEvent {
  eventId: string
  participantId: string
  name: string
  avatar: string
  correct: boolean
  reachedKkmNow: boolean
  hpChanged: boolean
  damage?: number
  visualOnly: boolean
  seq: number
}

export interface AnswerResult {
  accepted: boolean
  duplicate: boolean
  academicUpdated: boolean
  visualAttack: VisualAttackEvent | null
  state: BattlePublicState
  personal: ParticipantProgress | null
}
