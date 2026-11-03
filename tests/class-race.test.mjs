import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:8000'

async function runClassRaceTests() {
  console.log('--- Starting Class Race (Balapan Kelas) Automated Tests ---')

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
    body: JSON.stringify({ title: 'Illegal Race', game_type: 'class-race' })
  })
  assert.equal(failCreate.status, 401, 'Student rejected from creating race session')
  console.log('✓ 2. Non-teacher session creation rejected with 401')

  // 3. Teacher creates Class Race session with 20 participants
  const testSessionId = `test-race-${Date.now()}`
  const mockParticipants = []
  for (let i = 1; i <= 20; i++) {
    const id = i === 1 ? studentUser.id : `stu-dummy-${i}`
    mockParticipants.push({
      id,
      name: i === 1 ? studentUser.name : `Siswa ${i}`,
      score: 0,
      correct: 0,
      wrong: 0,
      answered: 0
    })
  }

  const mockQuestions = [
    {
      id: 'q-race-1',
      question: 'Berapakah 8 x 7?',
      options: ['54', '56', '58', '64'],
      correctIndex: 1
    },
    {
      id: 'q-race-2',
      question: 'Ibukota Indonesia sekarang adalah?',
      options: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
      correctIndex: 0
    },
    {
      id: 'q-race-3',
      question: 'Satuan kecepatan data komputer adalah?',
      options: ['Meter', 'Gram', 'bps (bit per second)', 'Watt'],
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
      game_type: 'class-race',
      title: 'Balapan Kelas Uji Coba',
      topic: 'Kuis Logika Cepat',
      race_length: 500,
      per_question_seconds: 15,
      participants: mockParticipants,
      questions: mockQuestions,
      team_count: 4,
      pin: '778899'
    })
  })
  const createData = await createRes.json()
  assert.equal(createRes.status, 201, 'Session creation should succeed')
  assert.equal(createData.data.game_type, 'class-race', 'Game type should be class-race')
  assert.equal(createData.data.teams.length, 4, 'Should have 4 teams')

  // Verifikasi tim seimbang (selisih anggota maks 1)
  const memberCounts = createData.data.teams.map(t => t.member_ids.length)
  const minCount = Math.min(...memberCounts)
  const maxCount = Math.max(...memberCounts)
  assert.ok(maxCount - minCount <= 1, 'Teams must be balanced with max 1 member difference')
  assert.equal(memberCounts.reduce((a, b) => a + b, 0), 20, 'Total members across teams must be 20')
  console.log('✓ 3. Session created with 4 balanced teams (max difference <= 1)')

  // 4. Guru menggeser anggota tim & mengubah detail tim
  const team1 = createData.data.teams[0]
  const team2 = createData.data.teams[1]
  const memberToMove = team1.member_ids[0]

  const patchRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/teams`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      action: 'move_member',
      member_id: memberToMove,
      to_team_id: team2.id
    })
  })
  const patchData = await patchRes.json()
  assert.equal(patchRes.status, 200, 'Moving member should succeed')
  const updatedTeam1 = patchData.data.teams.find(t => t.id === team1.id)
  const updatedTeam2 = patchData.data.teams.find(t => t.id === team2.id)
  assert.ok(!updatedTeam1.member_ids.includes(memberToMove), 'Member should be removed from team 1')
  assert.ok(updatedTeam2.member_ids.includes(memberToMove), 'Member should be added to team 2')
  console.log('✓ 4. Teacher successfully moved team member before start')

  // 5. W2: Kunci jawaban TIDAK BOLEH sampai ke HP siswa
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
  assert.ok(studentStateData.data.my_team, 'Student should see their assigned team')
  console.log('✓ 5. W2: Answer keys stripped completely from student state payload')

  // 6. Guru memulai balapan
  const startRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const startData = await startRes.json()
  assert.equal(startRes.status, 200, 'Start race should succeed')
  assert.equal(startData.data.status, 'in_progress', 'Status must be in_progress')
  assert.equal(startData.data.current_round, 1, 'Current round must be 1')
  assert.ok(startData.data.server_round_ends_at > Date.now(), 'Round end timestamp must be in future')
  console.log('✓ 6. Teacher started race: round 1 initiated with server timestamps')

  // 7. W1: Penilaian di SERVER — Siswa mengirim jawaban
  const answerRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q-race-1',
      option_index: 1, // Kunci benar adalah 1
      client_event_id: 'evt-race-001'
    })
  })
  const answerData = await answerRes.json()
  assert.equal(answerRes.status, 200, 'Answer submission should succeed')
  assert.equal(answerData.is_correct, true, 'Server must verify option 1 is correct')
  console.log('✓ 7. W1: Server independently evaluated answer correctness')

  // 8. W5: Idempotensi — Resubmit jawaban yang sama
  const dupeRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q-race-1',
      option_index: 1,
      client_event_id: 'evt-race-001'
    })
  })
  const dupeData = await dupeRes.json()
  assert.equal(dupeRes.status, 200, 'Duplicate submission should return 200')
  assert.equal(dupeData.duplicate, true, 'Duplicate submission should be flagged duplicate')
  console.log('✓ 8. W5: Idempotency verified: duplicate answer discarded')

  // 9. Guru memajukan ronde (evaluasi langkah tim)
  const nextRoundRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/round/next`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const nextRoundData = await nextRoundRes.json()
  assert.equal(nextRoundRes.status, 200, 'Advancing round should succeed')
  assert.equal(nextRoundData.data.current_round, 2, 'Should advance to round 2')

  // Tim tempat siswa berada harus memiliki distance > 0 karena siswa menjawab benar
  const myUpdatedTeam = nextRoundData.data.teams.find(t => t.member_ids.includes(studentUser.id))
  assert.ok(myUpdatedTeam.distance > 0, 'Team with correct answers should have advanced in distance')
  console.log(`✓ 9. Motion formula executed: Team advanced +${myUpdatedTeam.last_round_step}m (total: ${myUpdatedTeam.distance}m)`)

  // 10. Guru menyelesaikan balapan & memeriksa podium
  const finishRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/finish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const finishData = await finishRes.json()
  assert.equal(finishRes.status, 200, 'Finishing race should succeed')
  assert.equal(finishData.data.status, 'completed', 'Session status should be completed')
  assert.equal(finishData.data.outcome, 'race_finished', 'Outcome should be race_finished')
  assert.ok(finishData.data.podium.length >= 1, 'Podium should be populated')
  console.log('✓ 10. Finish race verified: podium ranked and outcome finalized')

  // 11. Cleanup test session
  const delRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(delRes.status, 200, 'Delete session should succeed')
  console.log('✓ 11. Test session cleanly removed')

  console.log('--- ALL CLASS RACE TESTS PASSED SUCCESSFULLY ---')
}

runClassRaceTests().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})

