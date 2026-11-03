import {
  BOSS_CATALOG,
  QUIZ_TYPES,
  type AnswerResult,
  type BattleOutcome,
  type BattlePublicState,
  type BattleQuestion,
  type BossCharacterSnapshot,
  type BossPose,
  type GameSettings,
  type MvpEntry,
  type OfficialParticipant,
  type ParticipantProgress,
  type QuizSessionConfig,
  type QuizTypeId,
  type SessionStatus,
  type VisualAttackEvent,
} from './types'

export { BOSS_CATALOG, QUIZ_TYPES }

export function getQuizTypeLabel(id: QuizTypeId | string): string {
  return QUIZ_TYPES.find((t) => t.id === id)?.label ?? id
}

export function snapshotBossFromCatalog(id: string, overrides: Partial<BossCharacterSnapshot> = {}): BossCharacterSnapshot {
  const found = BOSS_CATALOG.find((b) => b.id === id)
  const base = found ?? BOSS_CATALOG[0]
  return {
    id: overrides.id ?? base.id,
    name: overrides.name ?? base.name,
    description: overrides.description ?? base.description,
    topic: overrides.topic ?? base.topic,
    difficulty: overrides.difficulty ?? base.difficulty,
    spawnMessage: overrides.spawnMessage ?? base.spawnMessage,
    defeatMessage: overrides.defeatMessage ?? base.defeatMessage,
    winMessage: overrides.winMessage ?? base.winMessage,
    color: overrides.color ?? base.color,
    accent: overrides.accent ?? base.accent,
    customImageUrl: overrides.customImageUrl ?? null,
  }
}

export function defaultGameSettings(partial: Partial<GameSettings> = {}): GameSettings {
  return {
    classroomId: 'cls-7a',
    classroomName: 'VII A',
    officialParticipantIds: [],
    kkm: 75,
    questionCount: 10,
    durationMinutes: 10,
    questionSource: 'bank_soal',
    randomizeQuestions: true,
    initialBossHp: 10000,
    showStudentAvatars: true,
    soundEnabled: true,
    animationEnabled: true,
    reducedMotion: false,
    showStudentNamesOnProjector: true,
    mvpEnabled: true,
    remedialAvailable: true,
    ...partial,
  }
}

/**
 * Persentase ketuntasan = (jumlah siswa mencapai KKM / jumlah peserta resmi) × 100
 * Penyebut dikunci pada jumlah peserta resmi, tidak berubah saat siswa terputus.
 */
export function computeKetuntasanPercent(passedCount: number, officialCount: number): number {
  if (officialCount <= 0) return 0
  const passed = Math.min(Math.max(0, passedCount), officialCount)
  return (passed / officialCount) * 100
}

/**
 * HP boss = HP awal × (1 − persentase ketuntasan / 100)
 * Presisi internal dipertahankan. HP tidak boleh negatif.
 */
export function computeBossHp(initialHp: number, ketuntasanPercent: number): number {
  const hp = initialHp * (1 - ketuntasanPercent / 100)
  return hp < 0 ? 0 : hp
}

/**
 * Real-time Boss HP:
 * Setiap kali siswa menjawab benar (hit), HP Boss langsung berkurang secara proporsional.
 * Target kumulatif jawaban benar seluruh kelas untuk mengalahkan Boss (mencapai KKM):
 * targetHits = Math.max(1, Math.round(officialCount * totalQuestions * (kkm / 100)))
 * damagePerHit = initialHp / targetHits
 * totalDamage = Math.min(initialHp, totalCorrectHits * damagePerHit)
 * hp = Math.max(0, initialHp - totalDamage)
 */
export function computeRealtimeBossHp(args: {
  initialHp: number
  totalCorrectHits: number
  officialCount: number
  totalQuestions: number
  kkm: number
  passedCount?: number
}): number {
  const { initialHp, totalCorrectHits, officialCount, totalQuestions, kkm, passedCount = 0 } = args
  if (officialCount > 0 && passedCount >= officialCount) return 0
  const offCount = Math.max(1, officialCount)
  const qCount = Math.max(1, totalQuestions)
  const kkmVal = Math.max(1, kkm)
  const targetHits = Math.max(1, Math.round(offCount * qCount * (kkmVal / 100)))
  const damagePerHit = initialHp / targetHits
  const totalDamage = totalCorrectHits * damagePerHit
  const remaining = initialHp - totalDamage

  // Jika masih ada siswa yang belum mencapai KKM, HP tidak boleh 0 (minimal 1 HP)
  if (officialCount > 0 && passedCount < officialCount) {
    return Math.max(1, Math.round(remaining))
  }
  return remaining <= 0 ? 0 : Math.round(remaining)
}

export function displayRound(value: number): number {
  return Math.round(value)
}

export function hasClassVictory(passedCount: number, officialCount: number): boolean {
  return officialCount > 0 && passedCount >= officialCount
}

export function resolveOutcome(args: {
  passedCount: number
  officialCount: number
  timeExpired: boolean
}): BattleOutcome {
  if (hasClassVictory(args.passedCount, args.officialCount)) return 'class_victory'
  if (args.timeExpired) return 'boss_victory'
  return 'ongoing'
}

function academicScoreFromAnswers(correct: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0
  return (correct / totalQuestions) * 100
}

export function computeMvp(participants: ParticipantProgress[], totalQuestions: number, limit = 3): MvpEntry[] {
  const ranked = participants
    .map((p) => {
      const accuracy = p.answeredCount > 0 ? p.correctAnswers / p.answeredCount : 0
      const coverage = totalQuestions > 0 ? p.correctAnswers / totalQuestions : 0
      const kkmBonus = p.reachedKkm ? 10 : 0
      const speedBonus = p.reachedKkmAt ? Math.max(0, 8 - p.reachedKkmAt / 60000) : 0
      const mvpScore = accuracy * 40 + p.academicScore * 0.4 + coverage * 20 + kkmBonus + speedBonus
      return {
        rank: 0,
        participantId: p.participantId,
        name: p.name,
        avatar: p.avatar,
        gender: p.gender,
        finalScore: p.academicScore,
        accuracy,
        contribution: coverage,
        mvpScore,
        explain: `Akurasi ${(accuracy * 100).toFixed(0)}%, skor akhir ${displayRound(p.academicScore)}, cakupan soal ${(coverage * 100).toFixed(0)}%${p.reachedKkm ? ', mencapai KKM' : ''}.`,
      }
    })
    .sort((a, b) => b.mvpScore - a.mvpScore)
    .slice(0, Math.min(limit, participants.length))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return ranked
}

export interface InternalSession {
  sessionId: string
  config: QuizSessionConfig
  status: SessionStatus
  outcome: BattleOutcome
  officialRoster: OfficialParticipant[]
  progress: Map<string, ParticipantProgress>
  questions: BattleQuestion[]
  seenAnswerKeys: Set<string>
  seenAnimationKeys: Set<string>
  seq: number
  startedAt: number | null
  endedAt: number | null
  remainingSeconds: number
  academicLocked: boolean
  learningMode: boolean
  configLocked: boolean
  lastPose: BossPose
  lastVisualEvents: VisualAttackEvent[]
}

export function createOfficialRoster(students: Array<{ id: string; name: string; avatar?: string; gender?: 'L' | 'P' }>): OfficialParticipant[] {
  return students.map((s) => ({
    id: s.id,
    studentId: s.id,
    name: s.name,
    avatar: s.avatar ?? '🧑',
    gender: s.gender,
    connected: true,
  }))
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return { ...obj }
  }
}

export function createSession(args: {
  sessionId: string
  config: QuizSessionConfig
  roster: OfficialParticipant[]
  questions: BattleQuestion[]
  status?: SessionStatus
}): InternalSession {
  const roster = args.roster.map((r) => ({ ...r }))
  const progress = new Map<string, ParticipantProgress>()
  for (const r of roster) {
    progress.set(r.id, {
      participantId: r.id,
      studentId: r.studentId,
      name: r.name,
      avatar: r.avatar,
      gender: r.gender,
      academicScore: 0,
      reachedKkm: false,
      reachedKkmAt: null,
      correctAnswers: 0,
      wrongAnswers: 0,
      answeredCount: 0,
      currentQuestionIndex: 0,
      lastAnswerCorrect: null,
    })
  }

  return {
    sessionId: args.sessionId,
    config: deepClone(args.config),
    status: args.status ?? 'draft',
    outcome: 'ongoing',
    officialRoster: roster,
    progress,
    questions: args.questions.map((q) => ({ ...q })),
    seenAnswerKeys: new Set(),
    seenAnimationKeys: new Set(),
    seq: 0,
    startedAt: null,
    endedAt: null,
    remainingSeconds: args.config.settings.durationMinutes * 60,
    academicLocked: false,
    learningMode: false,
    configLocked: false,
    lastPose: 'idle',
    lastVisualEvents: [],
  }
}

function passedCountOf(session: InternalSession): number {
  let n = 0
  for (const p of session.progress.values()) {
    if (p.reachedKkm) n += 1
  }
  return n
}

export function publicStateOf(session: InternalSession): BattlePublicState {
  const officialCount = session.officialRoster.length
  const passedCount = passedCountOf(session)
  const ketuntasanExact = computeKetuntasanPercent(passedCount, officialCount)

  let totalCorrectHits = 0
  for (const p of session.progress.values()) {
    totalCorrectHits += p.correctAnswers || 0
  }

  const initialHp = session.config.settings.initialBossHp || 10000
  const totalQuestions = session.questions.length || 10
  const kkm = session.config.settings.kkm || 75

  let bossHpExact = computeRealtimeBossHp({
    initialHp,
    totalCorrectHits,
    officialCount,
    totalQuestions,
    kkm,
    passedCount,
  })

  let outcome = session.outcome
  if ((bossHpExact <= 0 || (officialCount > 0 && passedCount >= officialCount)) && outcome === 'ongoing') {
    outcome = 'class_victory'
    session.outcome = 'class_victory'
    session.lastPose = 'defeat_last_hit'
  }
  if (outcome === 'class_victory') {
    bossHpExact = 0
  }

  let pose: BossPose = session.lastPose
  if (outcome === 'class_victory') {
    pose = session.lastPose === 'defeat_last_hit' ? 'defeat_last_hit' : 'defeated'
  } else if (outcome === 'boss_victory') {
    pose = 'laugh'
  } else if (pose === 'defeated' || pose === 'defeat_last_hit' || pose === 'laugh') {
    pose = 'idle'
  }

  return {
    sessionId: session.sessionId,
    status: session.status,
    outcome,
    quizType: session.config.quizType,
    title: session.config.title,
    topic: session.config.topic,
    boss: session.config.boss,
    bossPose: pose,
    kkm: session.config.settings.kkm,
    initialBossHp: session.config.settings.initialBossHp,
    bossHpExact,
    bossHpDisplay: displayRound(bossHpExact),
    bossHpPercentDisplay: Math.max(0, Math.min(100, displayRound((bossHpExact / Math.max(session.config.settings.initialBossHp, 1)) * 100))),
    ketuntasanExact,
    ketuntasanDisplay: displayRound(ketuntasanExact),
    officialCount,
    passedCount,
    notPassedCount: Math.max(0, officialCount - passedCount),
    currentQuestionIndex: Math.min(
      [...session.progress.values()].reduce((m, p) => Math.max(m, p.answeredCount), 0),
      session.questions.length,
    ),
    questionCount: session.questions.length,
    remainingSeconds: session.remainingSeconds,
    academicLocked: session.academicLocked,
    learningMode: session.learningMode,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    configLocked: session.configLocked,
  }
}

export function lockConfigIfStarted(session: InternalSession): string[] {
  if (!session.configLocked) return []
  return ['classroom', 'officialRoster', 'kkm', 'questionSource', 'quizType']
}

export function startBattle(session: InternalSession, now = Date.now()): BattlePublicState {
  if (session.status === 'preview') {
    throw new Error('Pratinjau tidak dapat memulai sesi penilaian.')
  }
  session.status = 'active'
  session.configLocked = true
  session.startedAt = now
  session.outcome = 'ongoing'
  session.academicLocked = false
  session.learningMode = false
  session.lastPose = 'idle'
  session.remainingSeconds = session.config.settings.durationMinutes * 60
  return publicStateOf(session)
}

export function markDisconnected(session: InternalSession, participantId: string): void {
  const row = session.officialRoster.find((r) => r.id === participantId)
  if (row) row.connected = false
}

export function markConnected(session: InternalSession, participantId: string): void {
  const row = session.officialRoster.find((r) => r.id === participantId)
  if (row) row.connected = true
}

function answerKey(sessionId: string, participantId: string, questionId: string, clientEventId?: string): string {
  return `${sessionId}:${participantId}:${questionId}:${clientEventId ?? 'default'}`
}

export function submitAnswer(
  session: InternalSession,
  args: {
    participantId: string
    questionId: string
    optionIndex: number
    clientEventId?: string
    now?: number
    serverIsCorrect?: boolean
  },
): AnswerResult {
  const now = args.now ?? Date.now()
  const key = answerKey(session.sessionId, args.participantId, args.questionId, args.clientEventId)
  const stateBefore = publicStateOf(session)

  if (session.seenAnswerKeys.has(key)) {
    return {
      accepted: false,
      duplicate: true,
      academicUpdated: false,
      visualAttack: null,
      state: stateBefore,
      personal: session.progress.get(args.participantId) ?? null,
    }
  }

  let participant = session.progress.get(args.participantId)
  if (!participant) {
    participant = [...session.progress.values()].find(
      (p) => p.studentId === args.participantId || p.participantId === args.participantId || p.name.toLowerCase() === args.participantId.toLowerCase()
    )
    if (!participant) {
      const fallbackName = args.participantId.startsWith('st-')
        ? args.participantId.replace('st-', '').toUpperCase()
        : args.participantId
      participant = {
        participantId: args.participantId,
        studentId: args.participantId,
        name: fallbackName,
        avatar: '🧑',
        academicScore: 0,
        reachedKkm: false,
        reachedKkmAt: null,
        correctAnswers: 0,
        wrongAnswers: 0,
        answeredCount: 0,
        currentQuestionIndex: 0,
        lastAnswerCorrect: null,
      }
      session.progress.set(args.participantId, participant)
      session.officialRoster.push({
        id: args.participantId,
        studentId: args.participantId,
        name: fallbackName,
        avatar: '🧑',
        connected: true,
      })
    }
  }

  const question = session.questions.find((q) => q.id === args.questionId)
  if (!question) {
    return {
      accepted: false,
      duplicate: false,
      academicUpdated: false,
      visualAttack: null,
      state: stateBefore,
      personal: participant,
    }
  }

  session.seenAnswerKeys.add(key)
  const isCorrect = typeof args.serverIsCorrect === 'boolean'
    ? args.serverIsCorrect
    : (question.correctIndex !== undefined ? args.optionIndex === question.correctIndex : false)
  const hasFinishedAllQuestions = participant.answeredCount >= session.questions.length
  // Nilai akademik hanya visual jika mode belajar aktif atau siswa ini sudah menyelesaikan seluruh butir soal
  const visualOnly = session.learningMode || hasFinishedAllQuestions

  let academicUpdated = false
  let reachedKkmNow = false
  const hpBefore = stateBefore.bossHpExact

  if (!visualOnly) {
    participant.answeredCount += 1
    participant.lastAnswerCorrect = isCorrect
    if (isCorrect) participant.correctAnswers += 1
    else participant.wrongAnswers += 1
    participant.academicScore = academicScoreFromAnswers(participant.correctAnswers, session.questions.length)
    const wasPassed = participant.reachedKkm
    if (!wasPassed && participant.academicScore >= session.config.settings.kkm) {
      participant.reachedKkm = true
      participant.reachedKkmAt = now
      reachedKkmNow = true
    }
    academicUpdated = true

    const stateCurrent = publicStateOf(session)
    const nextOutcome = resolveOutcome({
      passedCount: passedCountOf(session),
      officialCount: session.officialRoster.length,
      timeExpired: false,
    })
    if (nextOutcome === 'class_victory' || stateCurrent.bossHpExact <= 0) {
      session.outcome = 'class_victory'
      session.lastPose = 'defeat_last_hit'
      // Hanya kunci sesi jika seluruh peserta telah menyelesaikan seluruh butir soal
      const allFinished = [...session.progress.values()].every(
        (p) => p.answeredCount >= session.questions.length
      )
      if (allFinished) {
        session.status = 'completed'
        session.academicLocked = true
        session.endedAt = now
      }
    }
  }

  let visualAttack: VisualAttackEvent | null = null
  if (isCorrect) {
    const animKey = `anim:${key}`
    if (!session.seenAnimationKeys.has(animKey)) {
      session.seenAnimationKeys.add(animKey)
      session.seq += 1
      const after = publicStateOf(session)
      const offCount = Math.max(1, session.officialRoster.length)
      const qCount = Math.max(1, session.questions.length)
      const kkmVal = Math.max(1, session.config.settings.kkm)
      const targetHits = Math.max(1, Math.round(offCount * qCount * (kkmVal / 100)))
      const hitDamage = Math.round(session.config.settings.initialBossHp / targetHits)

      visualAttack = {
        eventId: animKey,
        participantId: participant.participantId,
        name: participant.name,
        avatar: participant.avatar,
        correct: true,
        reachedKkmNow,
        damage: hitDamage,
        hpChanged: after.bossHpExact !== hpBefore,
        visualOnly,
        seq: session.seq,
      }
      session.lastVisualEvents.push(visualAttack)
      if (session.lastVisualEvents.length > 12) session.lastVisualEvents.shift()
      if (session.outcome === 'ongoing') session.lastPose = 'hit'
    }
  }

  if (session.lastPose === 'defeat_last_hit' && visualOnly) {
    session.lastPose = 'defeated'
  }

  return {
    accepted: true,
    duplicate: false,
    academicUpdated,
    visualAttack,
    state: publicStateOf(session),
    personal: { ...participant },
  }
}

export function expireTimer(session: InternalSession, now = Date.now()): BattlePublicState {
  if (session.outcome === 'class_victory') {
    session.remainingSeconds = 0
    return publicStateOf(session)
  }
  session.remainingSeconds = 0
  session.endedAt = now
  session.status = 'completed'
  session.academicLocked = true
  session.outcome = resolveOutcome({
    passedCount: passedCountOf(session),
    officialCount: session.officialRoster.length,
    timeExpired: true,
  })
  session.lastPose = session.outcome === 'class_victory' ? 'defeated' : 'laugh'
  return publicStateOf(session)
}

export function enableLearningMode(session: InternalSession): BattlePublicState {
  if (session.outcome === 'ongoing') {
    throw new Error('Mode belajar hanya tersedia setelah hasil battle ditetapkan.')
  }
  session.learningMode = true
  session.academicLocked = true
  return publicStateOf(session)
}

export function tickTimer(session: InternalSession, seconds = 1, now = Date.now()): BattlePublicState {
  if (session.status !== 'active' || session.outcome !== 'ongoing') return publicStateOf(session)
  session.remainingSeconds = Math.max(0, session.remainingSeconds - seconds)
  if (session.remainingSeconds === 0) return expireTimer(session, now)
  return publicStateOf(session)
}

export function assertMutableConfig(session: InternalSession): void {
  if (session.configLocked) {
    throw new Error('Konfigurasi terkunci. Hentikan sesi atau buat sesi baru untuk mengubah kelas, peserta, KKM, atau sumber soal.')
  }
}

export function cloneAsPreview(session: InternalSession, previewId: string): InternalSession {
  const clone = createSession({
    sessionId: previewId,
    config: deepClone(session.config),
    roster: session.officialRoster.map((r) => ({ ...r })),
    questions: session.questions.map((q) => ({ ...q })),
    status: 'preview',
  })
  clone.configLocked = false
  clone.academicLocked = true
  return clone
}

export function sampleQuestions(topic: string, count: number): BattleQuestion[] {
  const bank: BattleQuestion[] = [
    {
      id: 'q1',
      text: 'Langkah pertama berpikir komputasional saat memecahkan masalah besar adalah memecahnya menjadi bagian kecil. Teknik ini disebut?',
      options: ['Dekomposisi', 'Pengenalan pola', 'Abstraksi', 'Algoritma'],
      correctIndex: 0,
      points: 10,
    },
    {
      id: 'q2',
      text: 'Menemukan kesamaan atau keteraturan pada beberapa masalah dalam computational thinking disebut?',
      options: ['Pattern Recognition (Pengenalan Pola)', 'Debugging', 'Kompilasi', 'Dekomposisi'],
      correctIndex: 0,
      points: 10,
    },
    {
      id: 'q3',
      text: 'Menyembunyikan detail yang tidak relevan dan memusatkan perhatian pada informasi penting disebut?',
      options: ['Iterasi', 'Abstraksi', 'Eksekusi', 'Indexing'],
      correctIndex: 1,
      points: 10,
    },
    {
      id: 'q4',
      text: 'Urutan instruksi terstruktur dan logis yang dibuat untuk menyelesaikan suatu permasalahan disebut?',
      options: ['Variabel', 'Sintaks', 'Algoritma', 'Sistem Operasi'],
      correctIndex: 2,
      points: 10,
    },
    {
      id: 'q5',
      text: 'Struktur kontrol perulangan dalam pemrograman digunakan untuk?',
      options: ['Menghapus data memori', 'Menjalankan blok kode berulang kali', 'Menyimpan nilai ke variabel', 'Mematikan sistem komputer'],
      correctIndex: 1,
      points: 10,
    },
    {
      id: 'q6',
      text: 'Komponen perangkat keras komputer yang berfungsi sebagai otak utama pengolah instruksi adalah?',
      options: ['Power Supply', 'Central Processing Unit (CPU)', 'Hard Disk Drive', 'Keyboard'],
      correctIndex: 1,
      points: 10,
    },
    {
      id: 'q7',
      text: 'Bilangan biner yang digunakan komputer hanya terdiri atas dua digit angka, yaitu?',
      options: ['1 dan 2', '0 dan 1', '0 dan 9', 'A dan B'],
      correctIndex: 1,
      points: 10,
    },
    {
      id: 'q8',
      text: 'Proses menemukan dan memperbaiki kesalahan (bug) pada program komputer disebut?',
      options: ['Debugging', 'Browsing', 'Phishing', 'Formatting'],
      correctIndex: 0,
      points: 10,
    },
    {
      id: 'q9',
      text: 'Perangkat berikut yang termasuk ke dalam kelompok perangkat masukan (input device) adalah?',
      options: ['Monitor', 'Printer', 'Keyboard & Mouse', 'Speaker'],
      correctIndex: 2,
      points: 10,
    },
    {
      id: 'q10',
      text: 'Jaringan komputer global yang menghubungkan miliaran perangkat di seluruh dunia disebut?',
      options: ['Intranet', 'Internet', 'Bluetooth', 'Local Area Network (LAN)'],
      correctIndex: 1,
      points: 10,
    },
  ]
  const picked = bank.slice(0, Math.max(1, Math.min(count, bank.length)))
  return picked.map((q, i) => ({ ...q, id: `${q.id}-${topic.replace(/\s+/g, '-').toLowerCase()}-${i}` }))
}

export const DEMO_STUDENTS = [
  { id: 'st-rina', name: 'Rina', avatar: '🦊' },
  { id: 'st-bagas', name: 'Bagas', avatar: '🐯' },
  { id: 'st-siti', name: 'Siti', avatar: '🐱' },
  { id: 'st-dimas', name: 'Dimas', avatar: '🐺' },
  { id: 'st-ani', name: 'Ani', avatar: '🐰' },
  { id: 'st-budi', name: 'Budi', avatar: '🐼' },
  { id: 'st-nina', name: 'Nina', avatar: '🦄' },
  { id: 'st-raka', name: 'Raka', avatar: '🦁' },
  { id: 'st-putri', name: 'Putri', avatar: '🌸' },
  { id: 'st-dewi', name: 'Dewi', avatar: '🌺' },
  { id: 'st-fajar', name: 'Fajar', avatar: '☀️' },
  { id: 'st-gilang', name: 'Gilang', avatar: '⚡' },
]
