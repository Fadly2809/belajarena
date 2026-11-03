import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:8000'

async function runTowerDefenseTests() {
  console.log('--- Starting Tower Defense Kelas (Pertahanan Markas) Automated Tests ---')

  // 1. Login Teacher & Student
  const teacherLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const teacherLoginData = await teacherLoginRes.json()
  assert.equal(teacherLoginRes.status, 200, 'Teacher login should succeed')
  const teacherToken = teacherLoginData.data.token

  const studentLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '10527', password: '10527' })
  })
  const studentLoginData = await studentLoginRes.json()
  assert.equal(studentLoginRes.status, 200, 'Student login should succeed')
  const studentToken = studentLoginData.data.token
  const studentUser = studentLoginData.data.user
  console.log('✓ 1. Authentication for teacher and student verified')

  // 2. Non-teacher rejected from creating session
  const failCreate = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ title: 'Illegal TD', game_type: 'tower-defense' })
  })
  assert.equal(failCreate.status, 401, 'Student rejected from creating tower defense session')
  console.log('✓ 2. Non-teacher session creation rejected with 401')

  // 3. Teacher creates Tower Defense session
  const testSessionId = `test-td-${Date.now()}`
  const mockQuestions = [
    {
      id: 'q-td-1',
      question: 'Apakah fungsi dari CPU pada komputer?',
      options: ['Menyimpan data permanen', 'Pusat pemroses data dan instruksi', 'Menampilkan gambar ke layar', 'Menyuplai daya listrik'],
      correctIndex: 1
    },
    {
      id: 'q-td-2',
      question: 'Manakah yang termasuk perangkat output?',
      options: ['Keyboard', 'Mouse', 'Monitor', 'Microphone'],
      correctIndex: 2
    }
  ]

  const createRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      id: testSessionId,
      game_type: 'tower-defense',
      title: 'Pertahanan Markas Kelas 7A',
      topic: 'Komponen Komputer',
      initial_coins: 60,
      mode_tipe: 'ulangan',
      questions: mockQuestions,
      participants: [
        { id: studentUser.id, name: studentUser.name, score: 0, correct: 0, wrong: 0, answered: 0 }
      ]
    })
  })
  const createData = await createRes.json()
  assert.equal(createRes.status, 201, 'Tower Defense session creation succeeded')
  assert.equal(createData.data.game_type, 'tower-defense', 'Game type must be tower-defense')
  assert.equal(createData.data.base_hp, 20, 'Initial base HP must be 20')
  assert.equal(createData.data.coins, 60, 'Initial class coins must be 60')
  assert.equal(createData.data.wave_total, 5, 'Total waves must be 5')
  console.log('✓ 3. Session created with Base HP 20, 60 Class Coins, and 5 Waves')

  // 4. Manajemen Menara (Build, Upgrade, Sell)
  // Build Archer di Slot 1 (biaya 30)
  const buildRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/towers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ action: 'build', slot_id: 1, type: 'archer' })
  })
  const buildData = await buildRes.json()
  assert.equal(buildRes.status, 200, 'Building tower should succeed')
  assert.equal(buildData.data.coins, 30, 'Coins should decrease to 30 after building Archer (cost 30)')
  assert.equal(buildData.data.towers.length, 1, 'Should have 1 active tower')

  // Upgrade Archer ke Level 2 (biaya 15)
  const upgradeRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/towers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ action: 'upgrade', slot_id: 1 })
  })
  const upgradeData = await upgradeRes.json()
  assert.equal(upgradeRes.status, 200, 'Upgrading tower should succeed')
  assert.equal(upgradeData.data.coins, 15, 'Coins should decrease to 15 after upgrade (cost 15)')
  assert.equal(upgradeData.data.towers[0].level, 2, 'Tower level should be 2')

  // Jual Menara (Refund 70% dari 45 koin = 31 koin)
  const sellRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/towers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ action: 'sell', slot_id: 1 })
  })
  const sellData = await sellRes.json()
  assert.equal(sellRes.status, 200, 'Selling tower should succeed')
  assert.equal(sellData.data.towers.length, 0, 'Slot should now be empty')
  assert.equal(sellData.data.coins, 46, 'Coins should be refunded to 46')
  console.log('✓ 4. Teacher managed towers: Build (30c) -> Upgrade Lvl 2 (15c) -> Sell (70% refund)')

  // 5. W2 Sanitasi Kunci Jawaban di State Siswa
  const studentStateRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/state`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const studentStateData = await studentStateRes.json()
  assert.equal(studentStateRes.status, 200, 'Student state fetch succeeded')
  const sQ = studentStateData.data.current_question
  assert.ok(sQ, 'Student should receive question')
  assert.equal(sQ.correctIndex, undefined, 'Student question MUST NOT have correctIndex')
  assert.equal(sQ.correct_index, undefined, 'Student question MUST NOT have correct_index')
  assert.equal(sQ.kunci_jawaban, undefined, 'Student question MUST NOT have kunci_jawaban')
  assert.equal(studentStateData.data.base_hp, 20, 'Student can see live Base HP')
  console.log('✓ 5. W2: Answer keys completely stripped from student state payload')

  // 6. Guru Memulai Gelombang 1 (Wave 1)
  const waveStartRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/wave/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const waveStartData = await waveStartRes.json()
  assert.equal(waveStartRes.status, 200, 'Wave start succeeded')
  assert.equal(waveStartData.data.wave_current, 1, 'Current wave must be 1')
  assert.equal(waveStartData.data.wave_status, 'running', 'Wave status must be running')
  assert.ok(waveStartData.data.enemies.length > 0, 'Enemies must be spawned')
  console.log(`✓ 6. Wave 1 started: ${waveStartData.data.enemies.length} enemies spawned on map`)

  // 7. W1: Siswa Mengirim Jawaban Benar (+10 Koin Kelas, Buff Kecepatan)
  const coinsBefore = waveStartData.data.coins
  const answerRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q-td-1',
      option_index: 1, // Kunci benar adalah 1
      client_event_id: 'td-ans-001'
    })
  })
  const answerData = await answerRes.json()
  assert.equal(answerRes.status, 200, 'Answer submission succeeded')
  assert.equal(answerData.is_correct, true, 'Server evaluated answer as correct')
  assert.equal(answerData.coins_earned, 10, 'Should award 10 coins')
  assert.equal(answerData.data.coins, coinsBefore + 10, 'Class coins should increase by 10')
  assert.equal(answerData.data.is_buff_active, true, 'Tower speed buff should be active')
  assert.equal(answerData.data.my_coins_contributed, 10, 'Student personal contribution recorded')
  console.log('✓ 7. W1: Correct answer awarded +10 Class Coins and activated Tower Speed Buff')

  // 8. W5: Idempotensi Jawaban Ganda
  const dupeRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q-td-1',
      option_index: 1,
      client_event_id: 'td-ans-001'
    })
  })
  const dupeData = await dupeRes.json()
  assert.equal(dupeRes.status, 200, 'Duplicate submission returns 200')
  assert.equal(dupeData.duplicate, true, 'Duplicate submission flagged duplicate')
  assert.equal(dupeData.data.coins, coinsBefore + 10, 'Class coins must NOT be awarded twice')
  console.log('✓ 8. W5: Idempotency verified: duplicate answer did not award coins twice')

  // 9. Class Combo Strike (10x Benar Beruntun)
  for (let i = 2; i <= 10; i++) {
    await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        participant_id: studentUser.id,
        question_id: 'q-td-1',
        option_index: 1,
        client_event_id: `td-ans-streak-${i}`
      })
    })
  }

  const streakCheckRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/state`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const streakCheckData = await streakCheckRes.json()
  assert.ok(streakCheckData.data.last_combo_strike_at > 0, 'Class Combo Strike should have been triggered')
  console.log('✓ 9. Class Combo Strike verified: 10-streak unleashed full-screen attack')

  // 10. Guru Menyelesaikan Game
  const finishRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/finish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const finishData = await finishRes.json()
  assert.equal(finishRes.status, 200, 'Finish game succeeded')
  assert.equal(finishData.data.status, 'completed', 'Status must be completed')
  assert.equal(finishData.data.outcome, 'class_victory', 'Base defended successfully (class_victory)')
  console.log('✓ 10. Finish game verified: outcome is class_victory')

  // 11. Cleanup test session
  const delRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(delRes.status, 200, 'Delete session should succeed')
  console.log('✓ 11. Test session cleanly removed')

  console.log('--- ALL TOWER DEFENSE TESTS PASSED SUCCESSFULLY ---')
}

runTowerDefenseTests().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})

