import assert from 'node:assert/strict'

const BASE_URL = 'http://localhost:8000'

// 1x1 pixel transparent PNG in base64
const MOCK_BASE64_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

async function runAvatarUploadTests() {
  console.log('--- Starting Photo / Avatar Upload Automated Tests ---')

  // 1. Teacher Authentication
  const teacherLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const teacherData = await teacherLogin.json()
  assert.equal(teacherLogin.status, 200, 'Teacher login should succeed')
  const teacherToken = teacherData.data.token
  console.log('✓ 1. Teacher authenticated successfully')

  // 2. Student Authentication
  const studentLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '10527', password: '10527' })
  })
  const studentData = await studentLogin.json()
  assert.equal(studentLogin.status, 200, 'Student login should succeed')
  const studentToken = studentData.data.token
  console.log('✓ 2. Student authenticated successfully')

  // 3. Teacher Avatar Upload
  const teacherUpload = await fetch(`${BASE_URL}/api/v1/profile/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ avatar: MOCK_BASE64_PNG })
  })
  const teacherUploadRes = await teacherUpload.json()
  assert.equal(teacherUpload.status, 200, 'Teacher avatar upload should succeed with 200')
  assert.ok(teacherUploadRes.data.avatar_url, 'Should return avatar_url')
  assert.ok(teacherUploadRes.data.avatar_url.startsWith('/api/v1/storage/avatars/'), 'Avatar URL should point to storage')
  console.log('✓ 3. Teacher avatar uploaded successfully:', teacherUploadRes.data.avatar_url)

  // 4. Fetch Teacher Profile & Auth/Me
  const teacherMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const teacherMeData = await teacherMe.json()
  assert.equal(teacherMeData.data.avatar_url, teacherUploadRes.data.avatar_url, 'Auth/me should contain updated teacher avatar_url')

  const teacherProfile = await fetch(`${BASE_URL}/api/v1/profile`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  const teacherProfileData = await teacherProfile.json()
  assert.equal(teacherProfileData.data.avatar_url, teacherUploadRes.data.avatar_url, 'Profile endpoint should contain updated teacher avatar_url')
  console.log('✓ 4. Teacher profile and auth/me return updated avatar')

  // 5. Verify Static File Serving for Teacher Avatar
  const teacherAvatarFetch = await fetch(`${BASE_URL}${teacherUploadRes.data.avatar_url}`)
  assert.equal(teacherAvatarFetch.status, 200, 'Static avatar file should be served with 200')
  assert.equal(teacherAvatarFetch.headers.get('content-type'), 'image/png', 'Content-type must be image/png')
  console.log('✓ 5. Teacher avatar image served properly from static storage')

  // 6. Student Avatar Upload
  const studentUpload = await fetch(`${BASE_URL}/api/v1/profile/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ avatar: MOCK_BASE64_PNG })
  })
  const studentUploadRes = await studentUpload.json()
  assert.equal(studentUpload.status, 200, 'Student avatar upload should succeed with 200')
  assert.ok(studentUploadRes.data.avatar_url, 'Should return student avatar_url')
  assert.ok(studentUploadRes.data.avatar_url.startsWith('/api/v1/storage/avatars/'), 'Student avatar URL should point to storage')
  console.log('✓ 6. Student avatar uploaded successfully:', studentUploadRes.data.avatar_url)

  // 7. Fetch Student Profile & Auth/Me
  const studentMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const studentMeData = await studentMe.json()
  assert.equal(studentMeData.data.avatar_url, studentUploadRes.data.avatar_url, 'Auth/me should contain student avatar_url')

  const studentProfile = await fetch(`${BASE_URL}/api/v1/student/profile`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  })
  const studentProfileData = await studentProfile.json()
  assert.equal(studentProfileData.data.avatar_url, studentUploadRes.data.avatar_url, 'Student profile endpoint should contain updated avatar_url')
  console.log('✓ 7. Student profile and auth/me return updated avatar')

  // 8. Verify Static File Serving for Student Avatar
  const studentAvatarFetch = await fetch(`${BASE_URL}${studentUploadRes.data.avatar_url}`)
  assert.equal(studentAvatarFetch.status, 200, 'Student static avatar file should be served with 200')
  assert.equal(studentAvatarFetch.headers.get('content-type'), 'image/png', 'Content-type must be image/png')
  console.log('✓ 8. Student avatar image served properly from static storage')

  // 9. Teacher Remove Avatar
  const teacherRemove = await fetch(`${BASE_URL}/api/v1/profile/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({ avatar: 'remove' })
  })
  const teacherRemoveRes = await teacherRemove.json()
  assert.equal(teacherRemove.status, 200, 'Teacher remove avatar should succeed')
  assert.equal(teacherRemoveRes.data.avatar_url, '', 'Avatar URL should be cleared')
  console.log('✓ 9. Teacher avatar removed successfully')

  // 10. Student Remove Avatar
  const studentRemove = await fetch(`${BASE_URL}/api/v1/profile/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ avatar: 'remove' })
  })
  const studentRemoveRes = await studentRemove.json()
  assert.equal(studentRemove.status, 200, 'Student remove avatar should succeed')
  assert.equal(studentRemoveRes.data.avatar_url, '', 'Student avatar URL should be cleared')
  console.log('✓ 10. Student avatar removed successfully')

  console.log('--- ALL PHOTO / AVATAR UPLOAD TESTS PASSED SUCCESSFULLY ---')
}

runAvatarUploadTests().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})

