import { computed, reactive, ref } from 'vue'
import { realtimeBossBattle } from '@/services/realtimeBossBattle'
import {
  cloneAsPreview,
  computeMvp,
  createOfficialRoster,
  createSession,
  deepClone,
  enableLearningMode,
  expireTimer,
  markDisconnected,
  publicStateOf,
  sampleQuestions,
  snapshotBossFromCatalog,
  startBattle,
  submitAnswer,
  tickTimer,
  type InternalSession,
} from './engine'
import type {
  BattlePublicState,
  BattleQuestion,
  GameSettings,
  MvpEntry,
  ParticipantProgress,
  QuizSessionConfig,
  QuizTypeId,
  VisualAttackEvent,
} from './types'
import api from '@/services/api'
import { defaultGameSettings } from './engine'

const STORAGE_KEY = 'agd_uhg_active_session'

const savedSessions = new Map<string, InternalSession>()
const historicalSnapshots = new Map<string, { config: QuizSessionConfig; state: BattlePublicState; mvp: MvpEntry[] }>()

const active = ref<InternalSession | null>(null)
const preview = ref<InternalSession | null>(null)
const publicState = ref<BattlePublicState | null>(null)
const visualQueue = ref<VisualAttackEvent[]>([])
const mvp = ref<MvpEntry[]>([])
const lastError = ref('')
const progressVersion = ref(0)

function serializeSession(session: InternalSession) {
  return {
    sessionId: session.sessionId,
    config: session.config,
    status: session.status,
    outcome: session.outcome,
    officialRoster: session.officialRoster,
    progress: [...session.progress.values()],
    questions: session.questions,
    seenAnswerKeys: [...session.seenAnswerKeys],
    seenAnimationKeys: [...session.seenAnimationKeys],
    seq: session.seq,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    remainingSeconds: session.remainingSeconds,
    academicLocked: session.academicLocked,
    learningMode: session.learningMode,
    configLocked: session.configLocked,
    lastPose: session.lastPose,
    lastVisualEvents: session.lastVisualEvents,
  }
}

function deserializeSession(raw: ReturnType<typeof serializeSession>): InternalSession {
  return {
    ...raw,
    progress: new Map(raw.progress.map((p) => [p.participantId, p])),
    seenAnswerKeys: new Set(raw.seenAnswerKeys),
    seenAnimationKeys: new Set(raw.seenAnimationKeys),
  }
}

function persist(session: InternalSession) {
  savedSessions.set(session.sessionId, session)
  // Tidak menyimpan sesi di localStorage perangkat - semua data online di server
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('agd_active_battle_dispatch')
    } catch {}
  }
}

function hydrate(): InternalSession | null {
  // Bersihkan data usang dari localStorage agar tidak mengganggu sesi online
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('agd_active_battle_dispatch')
    } catch {}
  }
  return null
}

export const draft = reactive({
  quizType: 'ulangan_harian' as QuizTypeId,
  subjectId: 'sub-inf',
  subjectName: 'Informatika',
  tpId: '',
  tpCode: '',
  title: 'Ulangan Harian Gamifikasi — Informatika',
  topic: 'Berpikir Komputasional & Pemrograman',
  bossId: 'robot-glitch',
  bossName: 'Robot Glitch',
  bossDescription: '',
  spawnMessage: '',
  defeatMessage: '',
  winMessage: '',
  customImageUrl: '' as string | null,
  settings: defaultGameSettings({
    officialParticipantIds: [],
  }),
})

export const bankQuestions = ref<BattleQuestion[]>([])

export function convertBankToBattleQuestions(questions: any[]): BattleQuestion[] {
  if (!Array.isArray(questions)) return []
  return questions
    .filter((q) => q && (q.type === 'multiple_choice' || (Array.isArray(q.options) && q.options.length >= 2)))
    .map((q, idx) => {
      const rawOptions = Array.isArray(q.options) ? q.options : []
      const options = rawOptions.map((opt: any) =>
        typeof opt === 'string' ? opt : (opt.content || opt.text || '')
      )
      let correctIndex = 0
      if (Array.isArray(q.options)) {
        const foundIdx = q.options.findIndex((opt: any) => opt.is_correct === true)
        if (foundIdx !== -1) {
          correctIndex = foundIdx
        } else if (q.correct_answer) {
          const charIdx = ['A', 'B', 'C', 'D', 'E'].indexOf(String(q.correct_answer).toUpperCase())
          if (charIdx !== -1) correctIndex = charIdx
        }
      } else if (q.correct_answer) {
        const charIdx = ['A', 'B', 'C', 'D', 'E'].indexOf(String(q.correct_answer).toUpperCase())
        if (charIdx !== -1) correctIndex = charIdx
      }

      return {
        id: q.id || `q-bank-${idx}`,
        text: q.content || q.text || q.questionText || `Pertanyaan Soal ${idx + 1}`,
        options: options.length >= 2 ? options : ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctIndex: correctIndex >= 0 && correctIndex < options.length ? correctIndex : 0,
        points: Number(q.points) || 10,
      }
    })
}

export function setBankQuestions(questions: BattleQuestion[] | any[]) {
  if (!Array.isArray(questions) || questions.length === 0) {
    bankQuestions.value = []
    return
  }
  // If first item already has .options as string[], it's already BattleQuestion
  if (questions[0] && Array.isArray(questions[0].options) && typeof questions[0].options[0] === 'string') {
    bankQuestions.value = deepClone(questions) as BattleQuestion[]
  } else {
    bankQuestions.value = convertBankToBattleQuestions(questions)
  }
}

export async function syncBankQuestions(): Promise<BattleQuestion[]> {
  try {
    const res = await api.get('/questions')
    if (res.data?.data && Array.isArray(res.data.data)) {
      setBankQuestions(res.data.data)
      if (active.value && (!active.value.questions || active.value.questions.length === 0)) {
        active.value.questions = deepClone(bankQuestions.value)
        persist(active.value)
      }
      return bankQuestions.value
    } else {
      setBankQuestions([])
    }
  } catch (err) {
    console.warn('Gagal memuat bank soal:', err)
  }
  return bankQuestions.value
}

function applyBossDefaults(id: string) {
  const snap = snapshotBossFromCatalog(id)
  draft.bossId = snap.id
  draft.bossName = snap.name
  draft.bossDescription = snap.description
  draft.topic = snap.topic
  draft.spawnMessage = snap.spawnMessage
  draft.defeatMessage = snap.defeatMessage
  draft.winMessage = snap.winMessage
}

applyBossDefaults(draft.bossId)

function buildConfig(): QuizSessionConfig {
  const boss = snapshotBossFromCatalog(draft.bossId, {
    name: draft.bossName,
    description: draft.bossDescription,
    topic: draft.topic,
    spawnMessage: draft.spawnMessage,
    defeatMessage: draft.defeatMessage,
    winMessage: draft.winMessage,
    customImageUrl: draft.customImageUrl,
  })
  return {
    quizType: draft.quizType,
    title: draft.title,
    topic: draft.topic,
    bossName: draft.bossName,
    boss: deepClone(boss),
    settings: deepClone(draft.settings),
  }
}

export const studentDirectory = ref<Array<{ id: string; name: string; avatar?: string; gender?: 'L' | 'P' }>>([])

export function registerStudentPool(students: Array<{ id: string; name: string; avatar?: string; gender?: 'L' | 'P' }>) {
  if (Array.isArray(students)) {
    studentDirectory.value = [...students]
  }
}

function rosterFromSettings(settings: GameSettings) {
  const pool = studentDirectory.value
  const chosen = pool.filter((s) => settings.officialParticipantIds.includes(s.id))
  const list = chosen.length ? chosen : pool
  return createOfficialRoster(list)
}

function persistHistory(session: InternalSession) {
  historicalSnapshots.set(session.sessionId, {
    config: deepClone(session.config),
    state: publicStateOf(session),
    mvp: computeMvp([...session.progress.values()], session.questions.length),
  })
}

function sync(session: InternalSession, extra?: { visual?: VisualAttackEvent | null; mvpReady?: boolean }) {
  persist(session)
  publicState.value = publicStateOf(session)
  if (session.outcome !== 'ongoing') {
    mvp.value = computeMvp([...session.progress.values()], session.questions.length)
    persistHistory(session)
  }
  realtimeBossBattle.broadcast('session.state', publicState.value)
  if (extra?.visual) {
    visualQueue.value = [...visualQueue.value.slice(-7), extra.visual]
    realtimeBossBattle.broadcast('boss.hit.visual', extra.visual)
  }
  realtimeBossBattle.broadcast('boss.hp.updated', {
    sessionId: session.sessionId,
    bossHpExact: publicState.value.bossHpExact,
    bossHpDisplay: publicState.value.bossHpDisplay,
    bossHpPercentDisplay: publicState.value.bossHpPercentDisplay,
    ketuntasanExact: publicState.value.ketuntasanExact,
    passedCount: publicState.value.passedCount,
    officialCount: publicState.value.officialCount,
    notPassedCount: publicState.value.notPassedCount,
  })
  if (publicState.value.outcome === 'class_victory') {
    realtimeBossBattle.broadcast('boss.defeated', publicState.value)
  }
  if (publicState.value.outcome === 'boss_victory') {
    realtimeBossBattle.broadcast('boss.victory', publicState.value)
  }
  if (extra?.mvpReady) realtimeBossBattle.broadcast('mvp.ready', mvp.value)
}

export function saveSettings(customQuestions?: BattleQuestion[]): InternalSession {
  lastError.value = ''
  const id = active.value?.sessionId && !active.value.configLocked
    ? active.value.sessionId
    : `uhg-${Date.now().toString(36)}`

  let qList: BattleQuestion[] = []
  if (customQuestions && customQuestions.length > 0) {
    qList = deepClone(customQuestions)
  } else if (bankQuestions.value && bankQuestions.value.length > 0) {
    qList = deepClone(bankQuestions.value)
  }

  const session = createSession({
    sessionId: id,
    config: buildConfig(),
    roster: rosterFromSettings(draft.settings),
    questions: qList,
    status: 'waiting',
  })
  savedSessions.set(session.sessionId, session)
  active.value = session
  publicState.value = publicStateOf(session)
  return session
}

export function openPreview(kind: 'boss' | 'arena' | 'animation'): InternalSession {
  const base = saveSettings()
  const previewSession = cloneAsPreview(base, `preview-${kind}-${Date.now().toString(36)}`)
  previewSession.academicLocked = true
  preview.value = previewSession
  realtimeBossBattle.broadcast('preview.only', {
    kind,
    previewId: previewSession.sessionId,
    sourceSessionId: base.sessionId,
  })
  return previewSession
}

export function beginBattle(customQuestions?: BattleQuestion[]): InternalSession {
  const session = saveSettings(customQuestions)
  if (!session.questions || session.questions.length === 0) {
    throw new Error('Bank Soal masih kosong! Silakan isi soal di Bank Soal atau muat soal standar terlebih dahulu.')
  }
  startBattle(session)
  active.value = session
  savedSessions.set(session.sessionId, session)
  visualQueue.value = []
  mvp.value = []
  sync(session)

  // Broadcast battle.started with exact checked participants
  const participantIds = Array.from(session.progress.keys())
  const studentIds = Array.from(session.progress.values()).map((p) => p.studentId)
  const participantNames = Array.from(session.progress.values()).map((p) => p.name)

  const battlePayload = {
    sessionId: session.sessionId,
    title: session.config.title,
    quizType: session.config.quizType,
    bossName: session.config.bossName,
    participantIds,
    studentIds,
    participantNames,
    officialCount: participantIds.length,
    timestamp: Date.now(),
  }

  realtimeBossBattle.broadcast('battle.started', battlePayload)

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('agd_active_battle_dispatch')
    } catch {}
  }

  // Sinkronkan sesi aktif ke backend API agar HP siswa di perangkat lain terdeteksi
  const targetClassroomId = session.config.settings?.classroomId || draft.settings.classroomId || 'cls-7a'
  const targetClassroomName = session.config.settings?.classroomName || draft.settings.classroomName || 'VII A'
  const isGrade7 = targetClassroomName.includes('VII') || targetClassroomId.includes('7')
  const targetSubjectId = draft.subjectId || (isGrade7 ? 'sub-kka' : 'sub-inf')
  const targetSubjectName = draft.subjectName || (isGrade7 ? 'Koding & Kecerdasan Artifisial (KKA)' : 'Informatika')

  api.post('/ulangan-gamifikasi/sessions/active', {
    session_id: session.sessionId,
    title: session.config.title,
    topic: session.config.topic,
    subject: targetSubjectName,
    subject_id: targetSubjectId,
    tp_id: draft.tpId || null,
    tp_code: draft.tpCode || '',
    classroom_id: targetClassroomId,
    classroom_name: targetClassroomName,
    participant_ids: participantIds,
    student_ids: studentIds,
    participant_names: participantNames,
    boss_name: session.config.bossName,
    quiz_type: session.config.quizType,
    boss: session.config.boss,
    questions: session.questions,
    kkm: session.config.settings?.kkm || 75,
    initial_boss_hp: session.config.settings?.initialBossHp || 10000,
  }).catch((err) => {
    console.warn('Network active session sync warning:', err)
  })

  return session
}

export function getActiveBattleDispatch(): any | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('agd_active_battle_dispatch')
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data && data.timestamp && Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
      return data
    }
  } catch {}
  return null
}

export function clearActiveBattleDispatch() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('agd_active_battle_dispatch')
    } catch {}
  }
}


export function answerAsStudent(
  participantId: string,
  questionId: string,
  optionIndex: number,
  clientEventId?: string,
  serverIsCorrect?: boolean,
) {
  const session = active.value
  if (!session) return null
  const result = submitAnswer(session, { participantId, questionId, optionIndex, clientEventId, serverIsCorrect })
  if (result.personal) {
    realtimeBossBattle.broadcast('student.score.updated', {
      participantId,
      score: result.personal.academicScore,
      reachedKkm: result.personal.reachedKkm,
    })
  }
  sync(session, { visual: result.visualAttack, mvpReady: session.outcome !== 'ongoing' })
  return result
}

export function finishByTimeout() {
  const session = active.value
  if (!session) return null
  const state = expireTimer(session)
  sync(session, { mvpReady: true })
  return state
}

export function stopActiveSession(reason = 'Guru menghentikan sesi permainan') {
  const session = active.value
  if (!session) return null
  session.status = 'completed'
  session.academicLocked = true
  session.endedAt = Date.now()
  if (session.progress) {
    const passed = [...session.progress.values()].filter((p) => p.reachedKkm).length
    const total = Math.max(session.officialRoster?.length || session.progress.size, 1)
    if (passed >= total) {
      session.outcome = 'class_victory'
      session.lastPose = 'defeated'
    } else {
      session.outcome = 'boss_victory'
      session.lastPose = 'laugh'
    }
  }
  sync(session, { mvpReady: true })
  clearActiveBattleDispatch()
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  realtimeBossBattle.broadcast('session.stopped', {
    sessionId: session.sessionId,
    reason,
    outcome: session.outcome,
  })

  // Sinkronkan penghentian ke backend API (memberitahu HP siswa)
  api.post(`/ulangan-gamifikasi/sessions/${session.sessionId}/stop`, { reason }).catch(() => {})
  api.post('/ulangan-gamifikasi/sessions/active/stop', { reason }).catch(() => {})

  return publicState.value
}

export function clearActiveSession() {
  if (active.value) {
    savedSessions.delete(active.value.sessionId)
  }
  active.value = null
  publicState.value = null
  clearActiveBattleDispatch()
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  realtimeBossBattle.broadcast('session.cleared', {})
}

export function turnOnLearningMode() {
  const session = active.value
  if (!session) return null
  const state = enableLearningMode(session)
  sync(session)
  return state
}

export function tick(seconds = 1) {
  const session = active.value
  if (!session) return null
  if (session.remainingSeconds !== undefined && session.remainingSeconds > 0 && session.outcome === 'ongoing') {
    session.remainingSeconds = Math.max(0, session.remainingSeconds - seconds)
    if (publicState.value) {
      publicState.value.remainingSeconds = session.remainingSeconds
    }
    if (session.remainingSeconds === 0) {
      finishByTimeout()
    }
  }
  realtimeBossBattle.broadcast('session.timer.tick', { remainingSeconds: session.remainingSeconds })
  return publicState.value
}

export function syncOnlineSessionState(data: any) {
  if (!data) return
  const session = active.value
  if (session && Array.isArray(data.participants)) {
    for (const p of data.participants) {
      let prog = session.progress.get(p.id)
      if (!prog) {
        prog = {
          participantId: p.id,
          studentId: p.student_id || p.id,
          name: p.name || 'Siswa',
          avatar: p.avatar || '🧑',
          gender: p.gender || studentDirectory.value.find(s => s.id === p.student_id || s.id === p.id)?.gender,
          academicScore: 0,
          reachedKkm: false,
          reachedKkmAt: null,
          correctAnswers: 0,
          wrongAnswers: 0,
          answeredCount: 0,
          currentQuestionIndex: 0,
          lastAnswerCorrect: null,
        }
        session.progress.set(p.id, prog)
        if (!session.officialRoster.some((r) => r.id === p.id)) {
          session.officialRoster.push({
            id: p.id,
            studentId: p.student_id || p.id,
            name: p.name || 'Siswa',
            avatar: p.avatar || '🧑',
            connected: true,
          })
        }
      }
      if (p.academic_score !== undefined) prog.academicScore = p.academic_score
      if (p.correct !== undefined) prog.correctAnswers = p.correct
      if (p.wrong !== undefined) prog.wrongAnswers = p.wrong
      if (p.answered !== undefined) prog.answeredCount = p.answered
      if (p.reached_kkm !== undefined) prog.reachedKkm = Boolean(p.reached_kkm)
      if (p.reached_kkm_at !== undefined) prog.reachedKkmAt = p.reached_kkm_at
      if (p.is_absent !== undefined) (prog as any).isAbsent = Boolean(p.is_absent)
    }
    if (data.outcome) session.outcome = data.outcome
    if (data.status) session.status = data.status
    if (data.boss_pose && data.outcome !== 'ongoing') session.lastPose = data.boss_pose
    progressVersion.value++
  }

  if (publicState.value) {
    if (data.boss_hp_exact !== undefined && data.boss_hp_exact !== null && !isNaN(Number(data.boss_hp_exact))) {
      publicState.value.bossHpExact = Number(data.boss_hp_exact)
    }
    if (data.boss_hp_display !== undefined && data.boss_hp_display !== null && !isNaN(Number(data.boss_hp_display))) {
      publicState.value.bossHpDisplay = Math.round(Number(data.boss_hp_display))
    }
    if (data.boss_hp_percent_display !== undefined && data.boss_hp_percent_display !== null && !isNaN(Number(data.boss_hp_percent_display))) {
      publicState.value.bossHpPercentDisplay = Math.max(0, Math.min(100, Math.round(Number(data.boss_hp_percent_display))))
    }
    if (data.ketuntasan_exact !== undefined && data.ketuntasan_exact !== null && !isNaN(Number(data.ketuntasan_exact))) {
      publicState.value.ketuntasanExact = Number(data.ketuntasan_exact)
    }
    if (data.ketuntasan_display !== undefined && data.ketuntasan_display !== null && !isNaN(Number(data.ketuntasan_display))) {
      publicState.value.ketuntasanDisplay = Math.round(Number(data.ketuntasan_display))
    }
    if (data.passed_count !== undefined && data.passed_count !== null) publicState.value.passedCount = data.passed_count
    if (data.official_count !== undefined && data.official_count !== null) publicState.value.officialCount = data.official_count
    publicState.value.notPassedCount = Math.max(0, (publicState.value.officialCount || 0) - (publicState.value.passedCount || 0))
    if (data.outcome !== undefined) publicState.value.outcome = data.outcome
    if (data.status !== undefined) publicState.value.status = data.status
    if (data.boss_pose !== undefined && data.outcome !== 'ongoing') publicState.value.bossPose = data.boss_pose

    // Jika battle sudah selesai, hitung dan siapkan MVP podium
    if (data.outcome && data.outcome !== 'ongoing') {
      const pList = session ? [...session.progress.values()] : []
      if (pList.length > 0) {
        mvp.value = computeMvp(pList, session?.questions?.length || 10)
      } else if (Array.isArray(data.participants) && data.participants.length > 0) {
        const dummyProg: ParticipantProgress[] = data.participants.map((dp: any) => ({
          participantId: dp.id,
          studentId: dp.student_id || dp.id,
          name: dp.name || 'Siswa',
          avatar: dp.avatar || '🧑',
          academicScore: dp.academic_score || 0,
          reachedKkm: Boolean(dp.reached_kkm),
          reachedKkmAt: dp.reached_kkm_at || null,
          correctAnswers: dp.correct || 0,
          wrongAnswers: dp.wrong || 0,
          answeredCount: dp.answered || 0,
          currentQuestionIndex: dp.answered || 0,
          lastAnswerCorrect: null,
        }))
        mvp.value = computeMvp(dummyProg, 10)
      }
    }
  }
}

export function dropStudentConnection(participantId: string) {
  const session = active.value
  if (!session) return
  markDisconnected(session, participantId)
  sync(session)
}

export function historicalConfig(sessionId: string) {
  return historicalSnapshots.get(sessionId)
}

export function progressList() {
  progressVersion.value
  if (!active.value) return []
  return [...active.value.progress.values()]
}

export function questionsOfActive() {
  return active.value?.questions ?? []
}

export function getActiveSession() {
  return active.value
}

export function getPreviewSession() {
  return preview.value
}

export async function loadSessionFromBackend(targetSessionId?: string) {
  try {
    const sId = targetSessionId || 'active'
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sId}`)
    const data = res.data?.data
    if (!data || !data.id) return null

    // Jika sesi yang aktif di memori saat ini masih sama dan sedang berlangsung (ongoing), pakai itu
    if (
      active.value &&
      active.value.sessionId === data.id &&
      active.value.status === 'active' &&
      active.value.outcome === 'ongoing'
    ) {
      return active.value
    }

    // Bangun InternalSession baru dari data backend
    const questions: BattleQuestion[] =
      Array.isArray(data.questions) && data.questions.length > 0
        ? data.questions
        : bankQuestions.value.length > 0
        ? deepClone(bankQuestions.value)
        : []

    const participantMap = new Map<string, any>()

    if (Array.isArray(data.participant_ids) && data.participant_ids.length > 0) {
      data.participant_ids.forEach((id: string, idx: number) => {
        const studentObj = studentDirectory.value.find((s) => s.id === id)
        participantMap.set(id, {
          id,
          studentId: data.student_ids?.[idx] || id,
          name: data.participant_names?.[idx] || studentObj?.name || 'Siswa',
          avatar: studentObj?.avatar || '🧑',
          gender: studentObj?.gender,
          connected: true,
        })
      })
    }

    if (Array.isArray(data.participants) && data.participants.length > 0) {
      for (const p of data.participants) {
        const existing = participantMap.get(p.id)
        const studentObj = studentDirectory.value.find((s) => s.id === p.id || s.id === p.student_id)
        if (existing) {
          Object.assign(existing, p)
          if (!existing.gender) existing.gender = p.gender || studentObj?.gender
        } else {
          participantMap.set(p.id, {
            id: p.id,
            studentId: p.student_id || p.studentId || p.id,
            name: p.name || studentObj?.name || 'Siswa',
            avatar: p.avatar || '🧑',
            gender: p.gender || studentObj?.gender,
            connected: true,
            ...p,
          })
        }
      }
    }

    const roster = Array.from(participantMap.values())

    const session = createSession({
      sessionId: data.id,
      config: {
        quizType: data.quiz_type || 'ulangan_harian',
        title: data.title || 'Boss Battle — Ulangan Harian',
        topic: data.topic || 'Informatika',
        bossName: data.boss?.name || 'Boss',
        boss: data.boss || { id: 'robot-glitch', name: 'Robot Glitch' },
        settings: defaultGameSettings({
          kkm: data.kkm || 75,
          initialBossHp: data.initial_boss_hp || 10000,
          officialParticipantIds: data.participant_ids || roster.map((r: any) => r.id),
        }),
      },
      roster: roster.length > 0 ? roster : rosterFromSettings(draft.settings),
      questions: questions.length > 0 ? questions : deepClone(bankQuestions.value),
      status: data.status || 'active',
    })

    // Sinkronkan progress siswa dari data server online
    if (Array.isArray(data.participants)) {
      for (const p of data.participants) {
        const prog = session.progress.get(p.id)
        if (prog) {
          if (p.academic_score !== undefined) prog.academicScore = p.academic_score
          if (p.correct !== undefined) prog.correctAnswers = p.correct
          if (p.wrong !== undefined) prog.wrongAnswers = p.wrong
          if (p.answered !== undefined) prog.answeredCount = p.answered
          if (p.reached_kkm !== undefined) prog.reachedKkm = Boolean(p.reached_kkm)
          if (p.reached_kkm_at !== undefined) prog.reachedKkmAt = p.reached_kkm_at
        }
      }
    }

    if (data.status === 'active' || data.status === 'in_progress') {
      session.status = 'active'
      session.outcome = data.outcome || 'ongoing'
      session.configLocked = true
    }

    active.value = session
    savedSessions.set(session.sessionId, session)
    persist(session)
    sync(session)
    return session
  } catch (err) {
    console.warn('Gagal memuat sesi dari server:', err)
    return null
  }
}

export function restoreSession() {
  const session = active.value
  if (!session) return null
  publicState.value = publicStateOf(session)
  if (session.outcome !== 'ongoing') {
    mvp.value = computeMvp([...session.progress.values()], session.questions.length)
  }
  return session
}

export const teacherDashboard = computed(() => {
  const state = publicState.value
  if (!state) return null
  return {
    ...state,
    quizTypeLabel: state.quizType,
    students: progressList(),
    mvp: mvp.value,
  }
})

export function useBossBattleSession() {
  return {
    draft,
    publicState,
    visualQueue,
    mvp,
    lastError,
    teacherDashboard,
    saveSettings,
    openPreview,
    beginBattle,
    answerAsStudent,
    finishByTimeout,
    stopActiveSession,
    clearActiveSession,
    turnOnLearningMode,
    tick,
    dropStudentConnection,
    historicalConfig,
    progressList,
    questionsOfActive,
    getActiveSession,
    getPreviewSession,
    restoreSession,
    loadSessionFromBackend,
    syncOnlineSessionState,
    applyBossDefaults,
    registerStudentPool,
    bankQuestions,
    setBankQuestions,
    syncBankQuestions,
    getActiveBattleDispatch,
    clearActiveBattleDispatch,
  }
}

// Inisialisasi sinkronisasi realtime lintas tab dan jendela
if (typeof window !== 'undefined') {
  realtimeBossBattle.subscribe('session.state', (incomingState: any) => {
    if (!incomingState) return
    publicState.value = incomingState
    const rehydrated = hydrate()
    if (rehydrated) {
      active.value = rehydrated
    }
  })

  realtimeBossBattle.subscribe('boss.hit.visual', (visual: any) => {
    if (visual) {
      visualQueue.value = [...visualQueue.value.slice(-7), visual]
    }
  })

  realtimeBossBattle.subscribe('session.timer.tick', (payload: any) => {
    if (payload?.remainingSeconds !== undefined && publicState.value) {
      publicState.value.remainingSeconds = payload.remainingSeconds
      if (active.value) {
        active.value.remainingSeconds = payload.remainingSeconds
      }
    }
  })

  realtimeBossBattle.subscribe('student.answer.submitted', (payload: any) => {
    if (!payload || !active.value) return
    // Jika event dikirim dari StudentBattlePage di tab lokal yang sama, hindari dobel proses
    if (payload.senderTab === 'student_battle_page') return
    answerAsStudent(
      payload.participantId,
      payload.questionId,
      payload.optionIndex,
      payload.clientEventId
    )
  })

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      restoreSession()
    }
  })
}

// Hydrate on module evaluation only if an active session exists
if (!active.value) {
  restoreSession()
}
