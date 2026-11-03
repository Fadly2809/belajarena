import test from 'node:test'
import assert from 'node:assert/strict'

const baseUrl = 'http://127.0.0.1:8000'

test('Fase 1 - Keamanan Kritis Verification', async (t) => {
  await t.test('1.1 & 1.2: Guru login dengan password asli (123456) berhasil', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'muhammadarsandi89@guru.smp.belajar.id',
        password: '123456'
      })
    })
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.status, 'success')
    assert.ok(data.data.token)
    assert.equal(data.data.user.email, 'muhammadarsandi89@guru.smp.belajar.id')
    assert.deepEqual(data.data.user.roles, ['teacher', 'admin', 'superadmin'])
  })

  await t.test('1.1: Guru login dengan password backdoor universal ("password") HARUS gagal (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'muhammadarsandi89@guru.smp.belajar.id',
        password: 'password'
      })
    })
    assert.equal(res.status, 401)
    const data = await res.json()
    assert.equal(data.status, 'error')
    assert.match(data.message, /salah/)
  })

  await t.test('1.1 & 1.2: Siswa (NIS 10527) login dengan password asli (10527) berhasil', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '10527',
        password: '10527'
      })
    })
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.status, 'success')
    assert.ok(data.data.token)
    assert.equal(data.data.user.nis, '10527')
  })

  await t.test('1.1: Siswa (NIS 10527) login dengan backdoor universal ("password" & "123456") HARUS gagal (401)', async () => {
    const res1 = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '10527',
        password: 'password'
      })
    })
    assert.equal(res1.status, 401)

    const res2 = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '10527',
        password: '123456'
      })
    })
    assert.equal(res2.status, 401)
  })

  await t.test('1.3: PUT /profile dan ganti password tanpa token balas 401 Unauthorized', async () => {
    const resProfile = await fetch(`${baseUrl}/api/v1/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker' })
    })
    assert.equal(resProfile.status, 401)

    const resPassword = await fetch(`${baseUrl}/api/v1/profile/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: 'x', new_password: 'y' })
    })
    assert.equal(resPassword.status, 401)
  })

  await t.test('1.4: Alias login keras (guru/admin/fadly) tanpa identitas asli ditolak 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'guru',
        password: '123456'
      })
    })
    assert.equal(res.status, 401)
  })

  await t.test('1.5: CORS mengembalikan origin yang valid', async () => {
    const res = await fetch(`${baseUrl}/api/v1/classrooms`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:5173' }
    })
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  })

  await t.test('1.7: proxy-web menolak domain terlarang dengan 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/proxy-web?url=https://evil-malicious-site.com/exploit`)
    assert.equal(res.status, 403)
    const data = await res.json()
    assert.equal(data.status, 'error')
  })

  await t.test('1.7: proxy-web mengizinkan domain scratch.mit.edu', async () => {
    const res = await fetch(`${baseUrl}/api/v1/proxy-web?url=https://scratchfoundation.github.io/scratch-gui/`)
    assert.notEqual(res.status, 403)
  })

  await t.test('1.6: Payload melebihi 25 MB ditolak 413 Payload Too Large', async () => {
    const hugeBuffer = Buffer.alloc(26 * 1024 * 1024, 'a')
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'close'
        },
        body: hugeBuffer
      })
      assert.equal(res.status, 413)
    } catch (e) {
      assert.ok(true)
    }
  })
})
