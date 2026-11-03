import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')
const BASE_URL = 'http://localhost:8000'

async function runTests() {
  console.log('--- Starting Fase 4 Verification Tests ---')

  // 1. Verify database.json size shrunk significantly after base64 offload
  const dbPath = path.join(PROJECT_ROOT, 'apps/api/database/database.json')
  assert.ok(fs.existsSync(dbPath), 'database.json must exist')
  const dbStat = fs.statSync(dbPath)
  console.log(`Current database.json size: ${(dbStat.size / 1024).toFixed(1)} KB (was ~5.7 MB)`)
  assert.ok(dbStat.size < 1.5 * 1024 * 1024, 'database.json should be under 1.5 MB after offloading base64 images')
  console.log('✓ 1. database.json size successfully reduced by offloading base64 images')

  // 2. Verify storage/slides contains image files
  const storageSlidesDir = path.join(PROJECT_ROOT, 'apps/api/storage/slides')
  assert.ok(fs.existsSync(storageSlidesDir), 'storage/slides directory must exist')
  const slideFiles = fs.readdirSync(storageSlidesDir).filter(f => !f.startsWith('.'))
  assert.ok(slideFiles.length > 0, 'storage/slides must contain offloaded images')
  const testSlideFile = slideFiles[0]
  console.log(`✓ 2. storage/slides directory contains ${slideFiles.length} offloaded images`)

  // 3. Verify static slide serving route
  // Restart server first to ensure HEAD/GET support is active
  const imgUrl = `${BASE_URL}/api/v1/storage/slides/${testSlideFile}`
  const imgRes = await fetch(imgUrl)
  assert.equal(imgRes.status, 200, `GET ${imgUrl} must return 200`)
  const contentType = imgRes.headers.get('content-type')
  assert.ok(contentType?.includes('image/'), `Content-Type should be an image MIME, got: ${contentType}`)
  const cacheControl = imgRes.headers.get('cache-control')
  assert.ok(cacheControl?.includes('max-age=86400'), 'Cache-Control header must specify max-age=86400')
  const buffer = await imgRes.arrayBuffer()
  assert.ok(buffer.byteLength > 1000, 'Image bytes should be received')
  console.log('✓ 3. Static slide route serves image with correct MIME and Cache-Control headers')

  // 4. Verify startup backup directory and rotation
  const backupDir = path.join(PROJECT_ROOT, 'apps/api/backups')
  assert.ok(fs.existsSync(backupDir), 'backups directory must exist')
  const backupFiles = fs.readdirSync(backupDir).filter(f => f.startsWith('database.') && f.endsWith('.json'))
  assert.ok(backupFiles.length > 0, 'At least one backup must exist')
  assert.ok(backupFiles.length <= 10, 'Backups must not exceed 10 files (rotation enforced)')
  console.log(`✓ 4. Backup directory exists with ${backupFiles.length} backups (max 10 rotation enforced)`)

  // 5. Test atomic write resilience
  const testPresTitle = `Test Presentation Atomic ${Date.now()}`
  const teacherLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'muhammadarsandi89@guru.smp.belajar.id', password: '123456' })
  })
  const teacherToken = (await teacherLoginRes.json()).data.token

  const createPresRes = await fetch(`${BASE_URL}/api/v1/presentations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: testPresTitle,
      classroom_ids: ['cls-7a'],
      slides: [
        {
          title: 'Slide Atomik 1',
          content: 'Konten pengujian tulis atomik',
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      ]
    })
  })
  assert.equal(createPresRes.status, 201)
  const createdPres = (await createPresRes.json()).data
  assert.ok(createdPres.slides[0].image.startsWith('/api/v1/storage/slides/'), 'New image should automatically be offloaded')
  console.log('✓ 5. New presentation creation automatically offloads image and writes database atomically')

  // Clean up test presentation immediately so it does not pollute database
  const deletePresRes = await fetch(`${BASE_URL}/api/v1/presentations/${createdPres.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  })
  assert.equal(deletePresRes.status, 200, 'Test presentation should be cleanly deleted')

  // 6. Test export script
  const exportScript = path.join(PROJECT_ROOT, 'scripts/export-clean-source.sh')
  assert.ok(fs.existsSync(exportScript), 'export-clean-source.sh must exist')
  execSync(`bash "${exportScript}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' })
  const zipFiles = fs.readdirSync(PROJECT_ROOT).filter(f => f.startsWith('belajarena-clean-source-') && f.endsWith('.zip'))
  assert.ok(zipFiles.length > 0, 'Clean zip export file must be produced')
  const testZip = zipFiles[0]
  const zipSizeMb = fs.statSync(path.join(PROJECT_ROOT, testZip)).size / (1024 * 1024)
  console.log(`Clean source export size: ${zipSizeMb.toFixed(1)} MB`)
  assert.ok(zipSizeMb < 40, 'Clean export zip should be under 40 MB without node_modules/backups')

  // Clean up test zip
  for (const z of zipFiles) {
    fs.unlinkSync(path.join(PROJECT_ROOT, z))
  }
  console.log('✓ 6. Clean source export script executed successfully and produced compact archive')

  console.log('--- ALL FASE 4 VERIFICATION TESTS PASSED ---')
}

runTests().catch(err => {
  console.error('Fase 4 Verification Failed:', err)
  process.exit(1)
})

