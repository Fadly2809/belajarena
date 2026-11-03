import test from 'node:test'
import assert from 'node:assert/strict'
import { generateBuiltInResponse } from '../apps/api/ai_engine.mjs'

test('AI Pedagogical Assistant: Generates HOTS assessment questions for KKA & Informatika', () => {
  const replyKka = generateBuiltInResponse('Buatkan 5 soal pilihan ganda HOTS KKA Kelas VII')
  assert.ok(replyKka.includes('Paket Butir Soal HOTS — KKA'), 'Harus menyertakan judul butir soal KKA')
  assert.ok(replyKka.includes('Muhammad Fadly Akbar Arsandi, S.Pd.'), 'Harus menyebutkan identitas Pak Fadly')
  assert.ok(replyKka.includes('SMP Negeri 6 Kendari'), 'Harus menyebutkan SMP Negeri 6 Kendari')
  assert.ok(replyKka.includes('Kunci Jawaban'), 'Harus menyertakan kunci jawaban dan pembahasan')

  const replyInf = generateBuiltInResponse('Buatkan kuis algoritma dan flowchart informatika')
  assert.ok(replyInf.includes('Algoritma dan Pemrograman') || replyInf.includes('Informatika'), 'Harus mencakup materi informatika')
})

test('AI Pedagogical Assistant: Generates Modul Ajar Kurikulum Merdeka Fase D', () => {
  const reply = generateBuiltInResponse('Tolong buatkan draf modul ajar Kurikulum Merdeka fase D')
  assert.ok(reply.includes('Draf Modul Ajar Kurikulum Merdeka'), 'Harus menyertakan format Modul Ajar')
  assert.ok(reply.includes('Muhammad Fadly Akbar Arsandi, S.Pd.'), 'Harus memuat nama guru pengampu')
  assert.ok(reply.includes('KKTP') || reply.includes('Kriteria Ketuntasan'), 'Harus memuat KKTP')
})

test('AI Pedagogical Assistant: Generates Python code for SMP students', () => {
  const reply = generateBuiltInResponse('Berikan contoh script koding python untuk anak SMP')
  assert.ok(reply.includes('```python'), 'Harus menyertakan blok kode Python')
  assert.ok(reply.includes('SMP NEGERI 6 KENDARI'), 'Harus menyertakan konteks SMPN 6 Kendari')
  assert.ok(reply.includes('Panduan Guru'), 'Harus menyertakan panduan pedagogik pengajaran')
})

test('AI Pedagogical Assistant: General pedagogical consultation responds professionally', () => {
  const reply = generateBuiltInResponse('Bagaimana cara meningkatkan keaktifan siswa saat praktikum?')
  assert.ok(reply.includes('Muhammad Fadly Akbar Arsandi, S.Pd.'), 'Harus menyapa Pak Fadly secara personal')
  assert.ok(reply.includes('SMP Negeri 6 Kendari'), 'Harus mengacu pada SMPN 6 Kendari')
})
