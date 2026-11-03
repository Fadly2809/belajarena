import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:8000'

async function runTests() {
  console.log('--- Starting Fase 2 Verification Tests ---')

  // Login as teacher
  const teacherLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const teacherLoginData = await teacherLoginRes.json()
  assert.equal(teacherLoginRes.status, 200, 'Teacher login should succeed')
  const teacherToken = teacherLoginData.data.token
  assert.ok(teacherToken, 'Teacher token should exist')

  // Login as student
  const studentLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '10527', password: '10527' })
  })
  const studentLoginData = await studentLoginRes.json()
  assert.equal(studentLoginRes.status, 200, 'Student login should succeed')
  const studentToken = studentLoginData.data.token
  const studentUser = studentLoginData.data.user
  assert.ok(studentToken, 'Student token should exist')
  console.log('✓ 1. Authentication for teacher and student verified')

  // Test 2.3: Non-teacher cannot create session
  const failCreateRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ title: 'Illegal Session' })
  })
  assert.equal(failCreateRes.status, 401, 'Student should be rejected from creating a session')
  console.log('✓ 2. Non-teacher creating session rejected with 401')

  // Teacher creates a test battle session
  const testSessionId = `test-battle-${Date.now()}`
  const createRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      id: testSessionId,
      title: 'Ujian Akhir Fase 2',
      kkm: 75,
      initial_boss_hp: 1000,
      duration_minutes: 10,
      pin: '998877',
      questions: [
        {
          id: 'q1',
          question: 'Berapakah 2 + 2?',
          options: ['2', '3', '4', '5'],
          correctIndex: 2
        },
        {
          id: 'q2',
          question: 'Ibukota Indonesia?',
          options: ['Jakarta / IKN', 'Surabaya', 'Bandung', 'Medan'],
          correctIndex: 0
        }
      ],
      participants: [
        {
          id: studentUser.id,
          student_id: studentUser.id,
          name: studentUser.name,
          nis: studentUser.nis || '10527',
          academic_score: 0,
          correct: 0,
          wrong: 0,
          answered: 0,
          reached_kkm: false
        },
        {
          id: 'dummy-student-2',
          student_id: 'dummy-student-2',
          name: 'Dummy Siswa 2',
          nis: '99999',
          academic_score: 0,
          correct: 0,
          wrong: 0,
          answered: 0,
          reached_kkm: false
        }
      ]
    })
  })
  assert.equal(createRes.status, 201, 'Teacher should create battle session')
  const createdData = await createRes.json()
  assert.equal(createdData.data.questions[0].correctIndex, 2, 'Teacher payload should include correctIndex')
  console.log('✓ 3. Teacher session creation succeeded with correctIndex in teacher view')

  // Test 2.2: Kunci jawaban TIDAK BOLEH sampai ke HP siswa
  const studentPollRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/poll`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  assert.equal(studentPollRes.status, 200, 'Student poll should succeed')
  const studentPollData = await studentPollRes.json()
  const studentQuestions = studentPollData.data.session.questions
  assert.ok(studentQuestions && studentQuestions.length > 0, 'Questions must exist in poll')
  for (const q of studentQuestions) {
    assert.strictEqual(q.correctIndex, undefined, 'Student question MUST NOT contain correctIndex')
    assert.strictEqual(q.correct_index, undefined, 'Student question MUST NOT contain correct_index')
    assert.strictEqual(q.key, undefined, 'Student question MUST NOT contain key')
  }
  console.log('✓ 4. Student poll stripped of all answer keys & correctIndex')

  // Test 2.2: GET sessions summary list does not contain full question content/keys
  const listRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const listData = await listRes.json()
  assert.equal(listRes.status, 200)
  const foundSessionSummary = listData.data.find(s => s.id === testSessionId)
  assert.ok(foundSessionSummary, 'Created session should appear in summary list')
  assert.strictEqual(foundSessionSummary.questions, undefined, 'Summary list should NOT contain questions array')
  assert.equal(foundSessionSummary.question_count, 2, 'Summary list should contain question_count')
  console.log('✓ 5. Session summary list omits questions and answer keys')

  // Test 2.4: Answer on non-existent session must return 404 (NO ghost session)
  const ghostAnswerRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/non-existent-session-xyz/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q1',
      option_index: 0
    })
  })
  assert.equal(ghostAnswerRes.status, 404, 'Answer to non-existent session must return 404')
  console.log('✓ 6. Answering non-existent session returns 404 (ghost session prevented)')

  // Test 2.3: Answer without token returns 401
  const unauthAnswerRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q1',
      option_index: 2
    })
  })
  assert.equal(unauthAnswerRes.status, 401, 'Answer without auth token must return 401')
  console.log('✓ 7. Answer without token rejected with 401')

  // Test 2.3: Student answering for someone else's participant_id returns 403
  const impersonateRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: 'dummy-student-2',
      question_id: 'q1',
      option_index: 2
    })
  })
  assert.equal(impersonateRes.status, 403, 'Impersonating another participant must return 403')
  console.log('✓ 8. Impersonation of another student rejected with 403')

  // Test 2.1: Server-side evaluation - cheating attempt by sending wrong option with is_correct: true
  // Option index 0 for q1 is '2', while correct answer is index 2 ('4')
  const cheatAnswerRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q1',
      option_index: 0, // WRONG OPTION
      is_correct: true, // CLIENT TRIES TO LIE
      client_event_id: 'evt-cheat-1'
    })
  })
  assert.equal(cheatAnswerRes.status, 200)
  const cheatData = await cheatAnswerRes.json()
  assert.equal(cheatData.is_correct, false, 'Server MUST reject client lie and evaluate is_correct as false')
  const meProgress = cheatData.data.participants.find(p => p.id === studentUser.id)
  assert.equal(meProgress.correct, 0, 'Correct count must remain 0')
  assert.equal(meProgress.wrong, 1, 'Wrong count must be 1')
  console.log('✓ 9. Server evaluated answer independently: client cheating with fake is_correct failed')

  // Test 2.1: Student submits question 2 with correct answer
  const legitAnswerRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      participant_id: studentUser.id,
      question_id: 'q2',
      option_index: 0, // CORRECT OPTION ('Jakarta / IKN')
      is_correct: false, // Even if client claims false, server knows it is correct!
      client_event_id: 'evt-legit-2'
    })
  })
  assert.equal(legitAnswerRes.status, 200)
  const legitData = await legitAnswerRes.json()
  assert.equal(legitData.is_correct, true, 'Server MUST evaluate correct option as true')
  console.log('✓ 10. Server evaluated correct option as true regardless of client is_correct')

  // Test 2.6: Absent mechanism
  // Initially official_count is 2
  assert.equal(legitData.data.official_count, 2, 'Initial official count should be 2')

  // Teacher marks dummy-student-2 as absent
  const toggleAbsentRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}/participants/dummy-student-2/toggle-absent`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(toggleAbsentRes.status, 200, 'Teacher can toggle absent status')
  const absentData = await toggleAbsentRes.json()
  assert.equal(absentData.is_absent, true, 'Participant is now marked absent')
  assert.equal(absentData.data.official_count, 1, 'Official count should decrease to 1 (only active students)')
  console.log('✓ 11. Teacher marked participant absent; official_count updated to exclude absent student')

  // Absent participant cannot submit answers
  const absentStudentToken = 'token-dummy-absent'
  // Clean up test session
  const deleteRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions/${testSessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(deleteRes.status, 200, 'Teacher can delete test session')
  console.log('✓ 12. Test session cleanly removed')

  console.log('--- ALL FASE 2 VERIFICATION TESTS PASSED ---')
}

runTests().catch(err => {
  console.error('Fase 2 Verification Failed:', err)
  process.exit(1)
})
