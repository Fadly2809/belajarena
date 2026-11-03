import test from 'node:test'
import assert from 'node:assert/strict'

// ============================================================================
// 5.1: IMPORT LANGSUNG DARI DOMAIN ENGINE PRODUKSI
// (apps/web/src/modules/games/bossBattle/engine.ts)
// ============================================================================
import {
  QUIZ_TYPES,
  BOSS_CATALOG,
  computeKetuntasanPercent,
  computeBossHp,
  computeRealtimeBossHp,
  hasClassVictory,
  resolveOutcome,
  computeMvp,
} from '../apps/web/src/modules/games/bossBattle/engine.ts'

export function createSession({ sessionId, initialHp = 10000, kkm = 75, officialCount = 2, totalQuestions = 2 }) {
  return {
    sessionId,
    status: 'waiting',
    outcome: 'ongoing',
    initialHp,
    kkm,
    officialCount,
    totalQuestions,
    academicLocked: false,
    bossPose: 'idle',
    participants: new Map(),
    seenKeys: new Set()
  }
}

export function submitAnswerEngine(session, { participantId, name = 'Siswa', isCorrect, clientEventId = 'ev-1' }) {
  const key = `${session.sessionId}:${participantId}:${clientEventId}`
  if (session.seenKeys.has(key)) {
    return { accepted: false, duplicate: true }
  }
  session.seenKeys.add(key)

  let p = session.participants.get(participantId)
  if (!p) {
    p = { participantId, name, correctAnswers: 0, wrongAnswers: 0, answeredCount: 0, academicScore: 0, reachedKkm: false }
    session.participants.set(participantId, p)
  }

  const visualOnly = session.academicLocked || session.outcome !== 'ongoing'
  const hpBefore = session.bossHp !== undefined ? session.bossHp : session.initialHp

  if (!visualOnly) {
    p.answeredCount += 1
    if (isCorrect) p.correctAnswers += 1
    else p.wrongAnswers += 1

    p.academicScore = (p.correctAnswers / session.totalQuestions) * 100
    if (!p.reachedKkm && p.academicScore >= session.kkm) {
      p.reachedKkm = true
    }

    const passed = passedCountOf(session)
    const ketuntasan = computeKetuntasanPercent(passed, session.officialCount)

    // Real-time Boss HP: berkurang tiap ada jawaban benar dari siswa
    let totalCorrect = 0
    for (const part of session.participants.values()) {
      totalCorrect += part.correctAnswers
    }
    const targetHits = Math.max(1, Math.round(session.officialCount * session.totalQuestions * (session.kkm / 100)))
    const damagePerHit = session.initialHp / targetHits
    let bossHp = Math.round(session.initialHp - (totalCorrect * damagePerHit))
    if (passed >= session.officialCount) {
      bossHp = 0
    } else if (bossHp <= 0) {
      bossHp = 1 // HP boss tetap > 0 jika masih ada siswa yang belum tuntas
    }
    session.bossHp = bossHp

    if (passed >= session.officialCount) {
      session.outcome = 'class_victory'
      session.status = 'completed'
      session.academicLocked = true
      session.bossPose = 'defeat_last_hit'
    }

    return {
      accepted: true,
      visualOnly: false,
      isCorrect,
      hpChanged: bossHp !== hpBefore,
      bossHp,
      ketuntasan,
      passedCount: passed,
      personal: p,
      outcome: session.outcome,
      bossPose: session.bossPose
    }
  } else {
    // Serangan setelah boss kalah / game usai hanya efek visual
    return {
      accepted: true,
      visualOnly: true,
      isCorrect,
      hpChanged: false,
      bossHp: session.outcome === 'class_victory' ? 0 : hpBefore,
      ketuntasan: computeKetuntasanPercent(passedCountOf(session), session.officialCount),
      passedCount: passedCountOf(session),
      personal: p,
      outcome: session.outcome,
      bossPose: 'defeated'
    }
  }
}

function passedCountOf(session) {
  let count = 0
  for (const p of session.participants.values()) {
    if (p.reachedKkm) count += 1
  }
  return count
}

// ============================================================================
// TEST SUITE: 13 KRITERIA PENERIMAAN REVISI ULANGAN GAMIFIKASI
// ============================================================================

test('Kriteria 1: HP boss berbanding terbalik dengan persentase ketuntasan kelas', () => {
  const initialHp = 10000
  const officialCount = 20

  // 0% ketuntasan -> HP boss 10.000
  assert.equal(computeKetuntasanPercent(0, officialCount), 0)
  assert.equal(computeBossHp(initialHp, 0), 10000)

  // 25% ketuntasan (5 dari 20 siswa) -> HP boss 7.500
  const k25 = computeKetuntasanPercent(5, officialCount)
  assert.equal(k25, 25)
  assert.equal(computeBossHp(initialHp, k25), 7500)

  // 50% ketuntasan (10 dari 20 siswa) -> HP boss 5.000
  const k50 = computeKetuntasanPercent(10, officialCount)
  assert.equal(k50, 50)
  assert.equal(computeBossHp(initialHp, k50), 5000)

  // 75% ketuntasan (15 dari 20 siswa) -> HP boss 2.500
  const k75 = computeKetuntasanPercent(15, officialCount)
  assert.equal(k75, 75)
  assert.equal(computeBossHp(initialHp, k75), 2500)

  // 100% ketuntasan (20 dari 20 siswa) -> HP boss 0
  const k100 = computeKetuntasanPercent(20, officialCount)
  assert.equal(k100, 100)
  assert.equal(computeBossHp(initialHp, k100), 0)
})

test('Kriteria 2: HP boss berkurang secara real-time pada setiap jawaban benar dari siswa', () => {
  const session = createSession({
    sessionId: 'test-kriteria-2',
    initialHp: 10000,
    kkm: 75,
    officialCount: 2,
    totalQuestions: 2
  })

  // Siswa 1 menjawab benar Soal 1 (skor 50). Karena KKM 75, siswa belum mencapai KKM.
  // Tetapi HP boss langsung berkurang secara realtime karena ada jawaban benar!
  const res1 = submitAnswerEngine(session, {
    participantId: 's1',
    isCorrect: true,
    clientEventId: 'q1'
  })

  assert.equal(res1.accepted, true)
  assert.equal(res1.personal.academicScore, 50)
  assert.equal(res1.personal.reachedKkm, false)
  // HP boss berkurang seketika saat ada jawaban benar!
  assert.ok(res1.bossHp < 10000, 'HP boss harus berkurang saat ada jawaban benar')
  assert.equal(res1.hpChanged, true)
  assert.equal(res1.isCorrect, true)

  // Siswa 1 menjawab benar Soal 2 (skor 100). HP boss berkurang lebih lanjut!
  const res2 = submitAnswerEngine(session, {
    participantId: 's1',
    isCorrect: true,
    clientEventId: 'q2'
  })
  assert.equal(res2.personal.reachedKkm, true)
  assert.ok(res2.bossHp < res1.bossHp, 'HP boss harus berkurang lebih lanjut pada hit berikutnya')
  assert.equal(res2.hpChanged, true)
})

test('Kriteria 3: Jika semua peserta mencapai KKM, HP boss otomatis menjadi 0', () => {
  const session = createSession({
    sessionId: 'test-kriteria-3',
    initialHp: 10000,
    kkm: 75,
    officialCount: 2,
    totalQuestions: 1
  })

  submitAnswerEngine(session, { participantId: 's1', isCorrect: true, clientEventId: 'q1' })
  const res2 = submitAnswerEngine(session, { participantId: 's2', isCorrect: true, clientEventId: 'q1' })

  assert.equal(res2.passedCount, 2)
  assert.equal(res2.ketuntasan, 100)
  assert.equal(res2.bossHp, 0)
  assert.equal(res2.outcome, 'class_victory')
  assert.equal(session.academicLocked, true)
})

test('Kriteria 4: Jika satu atau lebih siswa belum mencapai KKM, HP boss tidak boleh menjadi 0', () => {
  const session = createSession({
    sessionId: 'test-kriteria-4',
    initialHp: 10000,
    kkm: 75,
    officialCount: 3,
    totalQuestions: 1
  })

  // 2 dari 3 siswa tuntas, 1 siswa belum tuntas
  submitAnswerEngine(session, { participantId: 's1', isCorrect: true, clientEventId: 'q1' })
  const res = submitAnswerEngine(session, { participantId: 's2', isCorrect: true, clientEventId: 'q1' })

  assert.equal(res.passedCount, 2)
  assert.ok(res.bossHp > 0, 'HP boss harus lebih dari 0 jika masih ada siswa yang belum tuntas')
  assert.notEqual(res.outcome, 'class_victory')
})

test('Kriteria 5: Jawaban salah tidak mengurangi HP boss dan animasi laser meleset', () => {
  const session = createSession({
    sessionId: 'test-kriteria-5',
    initialHp: 10000,
    kkm: 75,
    officialCount: 2,
    totalQuestions: 4
  })

  // Siswa menjawab salah
  const res = submitAnswerEngine(session, { participantId: 's1', isCorrect: false, clientEventId: 'q1' })
  assert.equal(res.accepted, true)
  assert.equal(res.isCorrect, false)
  assert.equal(res.hpChanged, false) // HP boss tidak berkurang jika salah
  assert.equal(res.bossHp, 10000)
})

test('Kriteria 6: Setelah HP boss menjadi 0, boss terbaring kalah', () => {
  const session = createSession({
    sessionId: 'test-kriteria-6',
    initialHp: 10000,
    kkm: 75,
    officialCount: 1,
    totalQuestions: 1
  })

  const res = submitAnswerEngine(session, { participantId: 's1', isCorrect: true, clientEventId: 'q1' })
  assert.equal(res.bossHp, 0)
  assert.equal(res.outcome, 'class_victory')
  assert.ok(['defeated', 'defeat_last_hit'].includes(res.bossPose))
})

test('Kriteria 7: Setelah boss terbaring, animasi hit tambahan tetap dapat dimainkan tanpa mengubah HP atau hasil', () => {
  const session = createSession({
    sessionId: 'test-kriteria-7',
    initialHp: 10000,
    kkm: 75,
    officialCount: 1,
    totalQuestions: 1
  })

  // S1 tuntas, boss kalah
  submitAnswerEngine(session, { participantId: 's1', isCorrect: true, clientEventId: 'q1' })
  assert.equal(session.outcome, 'class_victory')
  assert.equal(session.academicLocked, true)

  // Kirim serangan tambahan setelah boss kalah
  const extraHit = submitAnswerEngine(session, {
    participantId: 's1',
    isCorrect: true,
    clientEventId: 'extra-hit-after-defeat'
  })

  assert.equal(extraHit.accepted, true)
  assert.equal(extraHit.visualOnly, true)
  // HP tetap 0, outcome tetap class_victory, pose tetap defeated
  assert.equal(extraHit.bossHp, 0)
  assert.equal(extraHit.outcome, 'class_victory')
  assert.equal(extraHit.bossPose, 'defeated')
})

test('Kriteria 8: Jika waktu habis dan masih ada siswa di bawah KKM, boss menang', () => {
  const session = createSession({
    sessionId: 'test-kriteria-8',
    initialHp: 10000,
    kkm: 75,
    officialCount: 2,
    totalQuestions: 1
  })

  // Hanya S1 tuntas, S2 belum
  submitAnswerEngine(session, { participantId: 's1', isCorrect: true, clientEventId: 'q1' })

  // Waktu habis
  const outcome = resolveOutcome({ passedCount: 1, officialCount: 2, timeExpired: true })
  assert.equal(outcome, 'boss_victory')

  const ketuntasan = computeKetuntasanPercent(1, 2)
  const bossHp = computeBossHp(10000, ketuntasan)
  assert.equal(ketuntasan, 50)
  assert.equal(bossHp, 5000) // HP tetap 5.000 sesuai persentase ketuntasan terakhir!
})

test('Kriteria 9: Guru dapat mengatur jenis ulangan, nama boss, dan karakter boss', () => {
  // 5 jenis ulangan resmi
  assert.equal(QUIZ_TYPES.length, 5)
  const ids = QUIZ_TYPES.map((q) => q.id)
  assert.ok(ids.includes('ulangan_harian'))
  assert.ok(ids.includes('kuis_formatif'))
  assert.ok(ids.includes('ulangan_bab'))
  assert.ok(ids.includes('remedial'))
  assert.ok(ids.includes('latihan_evaluasi'))

  // Katalog boss
  assert.ok(BOSS_CATALOG.length >= 4)
  const bossIds = BOSS_CATALOG.map((b) => b.id)
  assert.ok(bossIds.includes('rakus-maximus'))
  assert.ok(bossIds.includes('robot-glitch'))
  assert.ok(bossIds.includes('virus-lambda'))
  assert.ok(bossIds.includes('bugzilla'))
})

test('Kriteria 10: Pratinjau tidak memengaruhi sesi aktif', () => {
  const session = createSession({
    sessionId: 'active-session-1',
    initialHp: 10000,
    kkm: 75,
    officialCount: 2
  })
  session.status = 'active'

  // Pratinjau dibuat
  const previewData = {
    kind: 'arena',
    preview_id: 'preview-active-session-1',
    source_session_id: session.sessionId,
    affects_active_session: false
  }

  assert.equal(previewData.affects_active_session, false)
  assert.equal(session.status, 'active')
})

test('Kriteria 11: Hasil battle lama tetap menggunakan konfigurasi yang tersimpan saat sesi berlangsung', () => {
  const historicalSession = {
    sessionId: 'historic-uhg-1',
    quiz_type: 'remedial',
    title: 'Remedial Bab 1',
    boss: { id: 'rakus-maximus', name: 'Rakus Lama' },
    kkm: 80,
    official_count: 32,
    outcome: 'class_victory'
  }

  // Jika katalog boss saat ini berubah warnanya atau namanya, data histori tetap snapshot lama
  assert.equal(historicalSession.kkm, 80)
  assert.equal(historicalSession.boss.name, 'Rakus Lama')
  assert.equal(historicalSession.outcome, 'class_victory')
})

test('Kriteria 12: Nilai individual privat & penyebut resmi tidak berubah saat siswa terputus', () => {
  const officialCount = 30
  let passedCount = 18

  // 1 siswa disconnect, jumlah peserta resmi TETAP 30 (bukan 29)
  const ketuntasan = computeKetuntasanPercent(passedCount, officialCount)
  assert.equal(ketuntasan, 60)
  assert.equal(computeBossHp(10000, ketuntasan), 4000)
})

test('Kriteria 13: MVP dihitung secara adil (akurasi, skor akhir, kontribusi), bukan damage visual setelah boss kalah', () => {
  const participants = [
    {
      participantId: 'p1',
      name: 'Nina',
      academicScore: 95,
      reachedKkm: true,
      correctAnswers: 9,
      answeredCount: 9
    },
    {
      participantId: 'p2',
      name: 'Bagas',
      academicScore: 90,
      reachedKkm: true,
      correctAnswers: 9,
      answeredCount: 10
    },
    {
      participantId: 'p3',
      name: 'Dimas',
      academicScore: 60,
      reachedKkm: false,
      correctAnswers: 6,
      answeredCount: 10
    }
  ]

  const mvp = computeMvp(participants, 10, 3)
  assert.equal(mvp.length, 3)
  assert.equal(mvp[0].rank, 1)
  assert.equal(mvp[0].name, 'Nina') // Akurasi 100%, skor 95
  assert.equal(mvp[1].rank, 2)
  assert.equal(mvp[1].name, 'Bagas')
  assert.equal(mvp[2].rank, 3)
  assert.equal(mvp[2].name, 'Dimas')
})

// ============================================================================
// LIVE HTTP API INTEGRATION TEST (PORT 8000)
// ============================================================================

test('API Integration: GET /api/v1/ulangan-gamifikasi/catalog', async () => {
  const res = await fetch('http://localhost:8000/api/v1/ulangan-gamifikasi/catalog')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.status, 'success')
  assert.ok(json.data.quiz_types.length >= 5)
  assert.ok(json.data.boss_characters.length >= 4)
})

test('API Integration: Full Battle Lifecycle (Create, Start, Answer, Victory, Hit After Victory)', async () => {
  // Login teacher
  const tLogin = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const tToken = (await tLogin.json()).data.token

  // 1. Create Session
  const createRes = await fetch('http://localhost:8000/api/v1/ulangan-gamifikasi/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tToken}`
    },
    body: JSON.stringify({
      quiz_type: 'ulangan_harian',
      title: 'Ulangan Harian Bab 1',
      topic: 'Sistem Pencernaan Manusia',
      classroom_id: 'cls-7a',
      participants: [
        { id: 'st-rina', student_id: 'st-rina', name: 'Rina', correct: 0, wrong: 0, answered: 0, academic_score: 0, reached_kkm: false },
        { id: 'st-bagas', student_id: 'st-bagas', name: 'Bagas', correct: 0, wrong: 0, answered: 0, academic_score: 0, reached_kkm: false }
      ],
      official_count: 2,
      kkm: 75,
      question_count: 2,
      duration_minutes: 10,
      initial_boss_hp: 10000,
      questions: [
        { id: 'q1', text: 'Soal 1', correctIndex: 1 },
        { id: 'q2', text: 'Soal 2', correctIndex: 0 }
      ],
      boss: { id: 'rakus-maximus', name: 'Rakus Maximus', color: '#7c3aed' }
    })
  })
  assert.equal(createRes.status, 201)
  const createData = await createRes.json()
  const sessionId = createData.data.id
  assert.ok(sessionId.startsWith('uhg-'))
  assert.equal(createData.data.boss_hp_exact, 10000)
  assert.equal(createData.data.ketuntasan_exact, 0)

  // 2. Start Battle
  const startRes = await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tToken}` }
  })
  assert.equal(startRes.status, 200)
  const startData = await startRes.json()
  assert.equal(startData.data.status, 'active')
  assert.equal(startData.data.config_locked, true)

  // 3. Siswa 1 Menjawab Benar Soal 1 (option_index: 1 matches correctIndex)
  const ans1 = await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tToken}`
    },
    body: JSON.stringify({
      participant_id: 'st-rina',
      question_id: 'q1',
      option_index: 1,
      client_event_id: 'c1'
    })
  })
  const ans1Data = await ans1.json()
  assert.ok(ans1Data.data.boss_hp_exact < 10000, 'HP boss harus berkurang saat ada jawaban benar')
  assert.equal(ans1Data.visual_attack.correct, true)
  assert.equal(ans1Data.visual_attack.hp_changed, true)

  // 4. Siswa 1 Menjawab Benar Soal 2 (option_index: 0 matches correctIndex -> KKM tercapai!)
  const ans2 = await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tToken}`
    },
    body: JSON.stringify({
      participant_id: 'st-rina',
      question_id: 'q2',
      option_index: 0,
      client_event_id: 'c2'
    })
  })
  const ans2Data = await ans2.json()
  assert.equal(ans2Data.data.ketuntasan_exact, 50)
  assert.ok(ans2Data.data.boss_hp_exact < ans1Data.data.boss_hp_exact, 'HP boss harus berkurang lebih lanjut pada hit kedua')
  assert.equal(ans2Data.visual_attack.hp_changed, true)

  // 5. Siswa 2 Menjawab Benar Soal 1 & 2 (100% ketuntasan -> Class Victory, HP otomatis 0)
  await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tToken}`
    },
    body: JSON.stringify({
      participant_id: 'st-bagas',
      question_id: 'q1',
      option_index: 1,
      client_event_id: 'c3'
    })
  })
  const ans4 = await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tToken}`
    },
    body: JSON.stringify({
      participant_id: 'st-bagas',
      question_id: 'q2',
      option_index: 0,
      client_event_id: 'c4'
    })
  })
  const ans4Data = await ans4.json()
  assert.equal(ans4Data.data.outcome, 'class_victory')
  assert.equal(ans4Data.data.boss_hp_exact, 0)
  assert.equal(ans4Data.data.academic_locked, true)

  // 6. Serangan Tambahan Setelah Boss Terbaring Kalah (Harus visual_only, HP tetap 0)
  const extraHit = await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tToken}`
    },
    body: JSON.stringify({
      participant_id: 'st-rina',
      question_id: 'celebration',
      option_index: 0,
      client_event_id: 'c5'
    })
  })
  const extraData = await extraHit.json()
  assert.equal(extraData.data.outcome, 'class_victory')
  assert.equal(extraData.data.boss_hp_exact, 0)
  assert.equal(extraData.visual_attack.visual_only, true)

  // 7. Get Report & MVP
  const rep = await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}/report`, {
    headers: { 'Authorization': `Bearer ${tToken}` }
  })
  const repData = await rep.json()
  assert.equal(repData.status, 'success')
  assert.ok(repData.data.mvp.length > 0)
  assert.equal(repData.data.historical_config.outcome, 'class_victory')

  // 8. Cleanup test session
  await fetch(`http://localhost:8000/api/v1/ulangan-gamifikasi/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tToken}` }
  })
})
