import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:8000'

async function runTests() {
  console.log('--- Starting Fase 3 Verification Tests ---')

  // 1. Auth logins
  const teacherLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const teacherLoginData = await teacherLoginRes.json()
  assert.equal(teacherLoginRes.status, 200)
  const teacherToken = teacherLoginData.data.token

  const studentLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '10527', password: '10527' })
  })
  const studentLoginData = await studentLoginRes.json()
  assert.equal(studentLoginRes.status, 200)
  const studentToken = studentLoginData.data.token
  const studentUser = studentLoginData.data.user
  console.log('✓ 1. Authentication for teacher and student ready')

  // 2. Student cannot create presentation session
  const studentCreateRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ title: 'Illegal Presentation Session' })
  })
  assert.equal(studentCreateRes.status, 401, 'Student should be rejected with 401 from creating session')
  console.log('✓ 2. Student cannot create presentation session (401)')

  // 3. Teacher creates presentation session with guest mode enabled
  const teacherCreateRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: 'Presentasi Jaringan Komputer Kelas IX A',
      classroom: 'IX A',
      allow_guests: true,
      accessCode: 'PRS-999',
      totalSlides: 5
    })
  })
  assert.equal(teacherCreateRes.status, 201)
  const sessionData = await teacherCreateRes.json()
  const sessionId = sessionData.data.id
  assert.ok(sessionId)
  console.log('✓ 3. Teacher created presentation session successfully')

  // 4. Student attempts to send control events: SLIDE_CHANGED and VOTE_OPENED
  const fakeSlideChangeRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      type: 'SLIDE_CHANGED',
      payload: { activeSlide: 4 }
    })
  })
  assert.equal(fakeSlideChangeRes.status, 403, 'Student trying to change slides must receive 403 Forbidden')

  const fakeVoteOpenRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      type: 'VOTE_OPENED',
      payload: { id: 'vote-hack', question: 'Hacked?' }
    })
  })
  assert.equal(fakeVoteOpenRes.status, 403, 'Student trying to open vote must receive 403 Forbidden')
  console.log('✓ 4. Student rejected with 403 from sending control events (SLIDE_CHANGED, VOTE_OPENED)')

  // 5. Student attempts to post screen-frame
  const fakeScreenFrameRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/screen-frame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ frame: 'data:image/webp;base64,fakeframe' })
  })
  assert.equal(fakeScreenFrameRes.status, 401, 'Student trying to post screen frame must receive 401')
  console.log('✓ 5. Student rejected from posting screen frames (401)')

  // 6. Teacher can send control events
  const teacherSlideChangeRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      type: 'SLIDE_CHANGED',
      payload: { activeSlide: 2, isLocked: false }
    })
  })
  assert.equal(teacherSlideChangeRes.status, 200, 'Teacher control event should succeed')
  console.log('✓ 6. Teacher can send control events (200)')

  // 7. Student joins presentation
  const studentJoinRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      sessionId,
      studentId: studentUser.id,
      studentName: 'Ahmad Siswa A',
      nis: '10527'
    })
  })
  assert.equal(studentJoinRes.status, 200)
  const joinData = await studentJoinRes.json()
  const studentPid = joinData.data.participant.id
  console.log('✓ 7. First student joined presentation session')

  // 8. Prevent duplicate active participant with exact same name
  const duplicateNameRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      studentId: 'different-student-id-99',
      studentName: 'Ahmad Siswa A', // EXACT SAME NAME
      nis: '88888'
    })
  })
  assert.equal(duplicateNameRes.status, 409, 'Duplicate active name must be rejected with 409 Conflict')
  const dupData = await duplicateNameRes.json()
  assert.equal(dupData.code, 'NAME_CONFLICT')
  assert.equal(dupData.can_reconnect, true)
  console.log('✓ 8. Duplicate participant name prevented with 409 Conflict')

  // 9. Reconnecting with same student identity succeeds
  const reconnectRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      sessionId,
      studentId: studentUser.id,
      studentName: 'Ahmad Siswa A',
      nis: '10527',
      reconnect: true,
      reconnect_participant_id: studentPid
    })
  })
  assert.equal(reconnectRes.status, 200, 'Reconnecting with same identity must succeed')
  console.log('✓ 9. Reconnecting with same student identity allowed')

  // 10. Screen mirroring frame test & bandwidth saving (skip duplicate frame payload)
  const sampleFrame1 = 'data:image/webp;base64,sampleFrameBase64Image1111111111'
  const sendFrameRes1 = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/screen-frame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ frame: sampleFrame1 })
  })
  assert.equal(sendFrameRes1.status, 200)
  const frame1Data = await sendFrameRes1.json()
  const frameSeq1 = frame1Data.frame_seq
  assert.ok(frameSeq1 > 0, 'Frame sequence should be > 0')

  // Student polls for the first time without frame_seq
  const pollRes1 = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/poll`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const pollData1 = await pollRes1.json()
  assert.equal(pollData1.data.screenFrame, sampleFrame1, 'Initial poll should receive screenFrame')
  assert.equal(pollData1.data.frame_unchanged, false)
  assert.equal(pollData1.data.frame_seq, frameSeq1)

  // Student polls second time with last_frame_seq = frameSeq1
  // Since teacher's screen is static, server MUST NOT resend the heavy base64 string
  const pollRes2 = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/poll?last_frame_seq=${frameSeq1}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const pollData2 = await pollRes2.json()
  assert.equal(pollData2.data.frame_unchanged, true, 'Server must flag frame_unchanged = true')
  assert.strictEqual(pollData2.data.screenFrame, null, 'Server MUST NOT resend identical heavy frame data')
  console.log('✓ 10. Screen frame bandwidth saving verified: identical frame omitted in poll')

  // 11. Teacher sends updated frame
  const sampleFrame2 = 'data:image/webp;base64,sampleFrameBase64Image2222222222'
  const sendFrameRes2 = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/screen-frame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ frame: sampleFrame2 })
  })
  const frame2Data = await sendFrameRes2.json()
  const frameSeq2 = frame2Data.frame_seq
  assert.ok(frameSeq2 > frameSeq1, 'Sequence should increment when frame content changes')

  // Student polls again with old frameSeq1 -> server returns new frame!
  const pollRes3 = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/poll?last_frame_seq=${frameSeq1}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const pollData3 = await pollRes3.json()
  assert.equal(pollData3.data.frame_unchanged, false)
  assert.equal(pollData3.data.screenFrame, sampleFrame2, 'Server sends new frame when changed')
  console.log('✓ 11. New screen frame received immediately upon change')

  // 12. Classroom boundary & Guest mode enforcement:
  // Create a restricted session for 'IX B' with allow_guests: false
  const restrictedSessionRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: 'Sesi Tertutup Kelas IX B',
      classroom: 'IX B',
      allow_guests: false,
      accessCode: 'RESTRICT-9B'
    })
  })
  const restrictedSession = (await restrictedSessionRes.json()).data

  // Unauthenticated guest tries to join -> 403 GUESTS_NOT_ALLOWED
  const guestJoinFail = await fetch(`${BASE_URL}/api/v1/presentation-sessions/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: restrictedSession.id,
      studentName: 'Tamu Asing'
    })
  })
  assert.equal(guestJoinFail.status, 403)
  const guestErr = await guestJoinFail.json()
  assert.equal(guestErr.code, 'GUESTS_NOT_ALLOWED')
  console.log('✓ 12. Guest joining session with allow_guests: false rejected with 403 GUESTS_NOT_ALLOWED')

  // End presentation session
  const endRes = await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(endRes.status, 200)

  // Clean up test presentation sessions so they do not pollute database
  await fetch(`${BASE_URL}/api/v1/presentation-sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  await fetch(`${BASE_URL}/api/v1/presentation-sessions/${restrictedSession.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })

  console.log('--- ALL FASE 3 VERIFICATION TESTS PASSED ---')
}

runTests().catch(err => {
  console.error('Fase 3 Verification Failed:', err)
  process.exit(1)
})

