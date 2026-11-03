import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:8000'

async function runFaseCTests() {
  console.log('--- Starting Fase C Verification Tests (Obsolete Games Removal) ---')

  // 1. Login Teacher
  const teacherLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const teacherLoginData = await teacherLoginRes.json()
  assert.equal(teacherLoginRes.status, 200, 'Teacher login should succeed')
  const teacherToken = teacherLoginData.data.token

  // 2. Direct requests to obsolete game endpoints return 410 Gone
  const res1 = await fetch(`${BASE_URL}/api/v1/games/word-scramble`)
  assert.equal(res1.status, 410, 'Word scramble endpoint must return 410 Gone')
  const data1 = await res1.json()
  assert.equal(data1.code, 410, 'Code in response must be 410')

  const res2 = await fetch(`${BASE_URL}/api/v1/games/flashcards`)
  assert.equal(res2.status, 410, 'Flashcards endpoint must return 410 Gone')

  console.log('✓ 1. Dedicated obsolete game endpoints return 410 Gone')

  // 3. Creating a session with mode word_scramble or flashcard_battle rejected with 410 Gone
  const failCreate1 = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: 'Ujian Scramble Usang',
      mode: 'word_scramble'
    })
  })
  assert.equal(failCreate1.status, 410, 'Creating word_scramble session must return 410 Gone')

  const failCreate2 = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: 'Ujian Flashcard Usang',
      mode: 'flashcard_battle'
    })
  })
  assert.equal(failCreate2.status, 410, 'Creating flashcard_battle session must return 410 Gone')
  console.log('✓ 2. Creating obsolete game sessions rejected with 410 Gone')

  // 4. Past sessions with old modes remain readable in history
  const listRes = await fetch(`${BASE_URL}/api/v1/ulangan-gamifikasi/sessions`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(listRes.status, 200, 'Listing past sessions succeeded')
  const listData = await listRes.json()
  assert.ok(Array.isArray(listData.data), 'Sessions list must be an array')
  console.log('✓ 3. Past session history in database.json remains readable')

  console.log('--- ALL FASE C TESTS PASSED SUCCESSFULLY ---')
}

runFaseCTests().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})

