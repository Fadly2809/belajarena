import { createWorker } from 'tesseract.js'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export interface ParsedQuestion {
  id?: string
  content: string
  stimulus?: string
  options: Array<{ id?: string; text: string; is_correct?: boolean }>
  correct_answer: string
  subject_name?: string
  grade?: string
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  explanation?: string
}

/**
 * Pre-processes an image on canvas to boost OCR accuracy (contrast & binarization)
 */
async function preprocessImage(imageSource: string | File | Blob): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource))

      // Scale up if image is low resolution
      const scale = Math.max(1, Math.min(2.5, 1600 / Math.max(img.width, img.height)))
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imgData.data

      // Grayscale & high contrast
      for (let i = 0; i < d.length; i += 4) {
        const v = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114)
        // Contrast curve
        const enhanced = v > 150 ? 255 : v < 90 ? 0 : v
        d[i] = enhanced
        d[i + 1] = enhanced
        d[i + 2] = enhanced
      }
      ctx.putImageData(imgData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource))
    }

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else {
      img.src = URL.createObjectURL(imageSource)
    }
  })
}

/**
 * Extracts raw text from an image using Tesseract.js OCR
 */
export async function extractTextFromImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(0.1, 'Mengoptimalkan kualitas gambar...')
    const processedUrl = await preprocessImage(imageSource)

    if (onProgress) onProgress(0.25, 'Memuat engine OCR Tesseract...')
    const worker = await createWorker(['ind', 'eng'])

    if (onProgress) onProgress(0.5, 'Mendeteksi dan mengenali teks dari gambar...')
    const result = await worker.recognize(processedUrl)
    await worker.terminate()

    if (onProgress) onProgress(1.0, 'Ekstraksi selesai!')
    return result.data.text || ''
  } catch (err: any) {
    console.error('OCR Error:', err)
    throw new Error('Gagal mendeteksi teks dari gambar: ' + (err.message || 'Format tidak didukung'))
  }
}

/**
 * Extracts raw text from Word document (.docx)
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value || ''
}

/**
 * Parses raw text (from OCR, Word doc, or clipboard) into structured questions
 */
export function parseQuestionsFromRawText(text: string): ParsedQuestion[] {
  if (!text || !text.trim()) return []

  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()

  // Split into question blocks: look for "1.", "2.", "Soal 1", "No 1", etc.
  const questionSplitRegex = /(?:^|\n+)(?:(?:Soal|No\.?)\s*)?(\d+)[\.\)]\s+/gi
  const matches = [...cleanText.matchAll(questionSplitRegex)]

  if (matches.length > 0) {
    const questions: ParsedQuestion[] = []

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const startIndex = match.index! + match[0].length
      const endIndex = i + 1 < matches.length ? matches[i + 1].index! : cleanText.length
      const block = cleanText.substring(startIndex, endIndex).trim()

      const parsed = parseSingleQuestionBlock(block)
      if (parsed) {
        questions.push(parsed)
      }
    }

    if (questions.length > 0) return questions
  }

  // Fallback: If no numbered list is found, treat entire text as single question
  const single = parseSingleQuestionBlock(cleanText)
  return single ? [single] : []
}

/**
 * Parses a single question block containing stem, options A-D, and answer key
 */
function parseSingleQuestionBlock(block: string): ParsedQuestion | null {
  if (!block || block.length < 3) return null

  // Option regex: matches A., B., C., D., or (A), (B), a., etc.
  const optionRegex = /(?:^|\n)\s*[\(\[]?([A-Ea-e])[\)\]\.\:]\s+/g
  const optionMatches = [...block.matchAll(optionRegex)]

  // Key Answer regex
  const keyRegex = /(?:Kunci(?:\s*Jawaban)?|Answer|Jawaban(?:\s*Benar)?)\s*[\:\=]\s*([A-Ea-e])/i
  const keyMatch = block.match(keyRegex)
  const correctAnswer = keyMatch ? keyMatch[1].toUpperCase() : 'A'

  // Explanation regex
  const expRegex = /(?:Pembahasan|Penjelasan|Explanation)\s*[\:\=]\s*([\s\S]+)$/i
  const expMatch = block.match(expRegex)
  const explanation = expMatch ? expMatch[1].trim() : ''

  if (optionMatches.length >= 2) {
    // We found multiple choice options!
    const stem = block.substring(0, optionMatches[0].index).trim()
    const options: Array<{ text: string; is_correct: boolean }> = []

    for (let i = 0; i < optionMatches.length; i++) {
      const optLetter = optionMatches[i][1].toUpperCase()
      const optStart = optionMatches[i].index! + optionMatches[i][0].length
      let optEnd = i + 1 < optionMatches.length ? optionMatches[i + 1].index! : block.length

      // If next section is key or explanation, stop option text before it
      const remainingText = block.substring(optStart, optEnd)
      const stopKey = remainingText.search(/(?:Kunci|Answer|Jawaban|Pembahasan)/i)
      if (stopKey !== -1 && i === optionMatches.length - 1) {
        optEnd = optStart + stopKey
      }

      const optText = block.substring(optStart, optEnd).trim().replace(/[;\.]$/, '')
      options.push({
        text: optText,
        is_correct: optLetter === correctAnswer
      })
    }

    return {
      content: stem || 'Pertanyaan butir soal',
      options: options.map(o => ({ text: o.text })),
      correct_answer: correctAnswer,
      difficulty: 'medium',
      explanation
    }
  }

  // If no clear A/B/C/D options found, treat as essay or prompt with standard options
  return {
    content: block.replace(keyRegex, '').replace(expRegex, '').trim(),
    options: [
      { text: 'Pilihan Jawaban A' },
      { text: 'Pilihan Jawaban B' },
      { text: 'Pilihan Jawaban C' },
      { text: 'Pilihan Jawaban D' }
    ],
    correct_answer: correctAnswer,
    difficulty: 'medium',
    explanation
  }
}

/**
 * Parses questions from CSV text
 */
export function parseQuestionsFromCsv(csvText: string): ParsedQuestion[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length <= 1) return []

  const questions: ParsedQuestion[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const delimiter = line.includes(';') && !line.includes(',') ? ';' : ','
    const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''))

    const content = cols[1] || cols[0]
    if (!content) continue

    const optA = cols[2] || ''
    const optB = cols[3] || ''
    const optC = cols[4] || ''
    const optD = cols[5] || ''
    const key = (cols[6] || 'A').toUpperCase().charAt(0)
    const subject = cols[7] || 'Informatika'
    const difficultyRaw = (cols[8] || 'sedang').toLowerCase()
    const difficulty: 'easy' | 'medium' | 'hard' =
      difficultyRaw.includes('mudah') || difficultyRaw.includes('lots')
        ? 'easy'
        : difficultyRaw.includes('sukar') || difficultyRaw.includes('sulit') || difficultyRaw.includes('hots')
        ? 'hard'
        : 'medium'
    const explanation = cols[9] || ''

    questions.push({
      content,
      options: [
        { text: optA || 'Opsi A' },
        { text: optB || 'Opsi B' },
        { text: optC || 'Opsi C' },
        { text: optD || 'Opsi D' }
      ],
      correct_answer: ['A', 'B', 'C', 'D'].includes(key) ? key : 'A',
      subject_name: subject,
      difficulty,
      explanation
    })
  }

  return questions
}

/**
 * Download standard Excel / CSV Question Template
 */
export function downloadQuestionTemplateCsv() {
  const headers = [
    'No',
    'Teks Soal / Pertanyaan',
    'Pilihan A',
    'Pilihan B',
    'Pilihan C',
    'Pilihan D',
    'Kunci Jawaban (A/B/C/D)',
    'Mata Pelajaran',
    'Tingkat Kesukaran (Mudah/Sedang/Sukar)',
    'Pembahasan / Catatan'
  ]

  const sampleRows = [
    [
      '1',
      'Berikut ini yang merupakan komponen utama dalam siklus pemrosesan data pada komputer adalah...',
      'Input - Output - Storage',
      'Input - Processing - Output - Storage',
      'Hardware - Software - Brainware',
      'CPU - RAM - Motherboard',
      'B',
      'Informatika',
      'Sedang',
      'Siklus pemrosesan data komputasi mencakup input, processing, output, dan penyimpanan (storage).'
    ],
    [
      '2',
      'Perangkat keras komputer yang berfungsi melakukan operasi aritmetika dan logika pada CPU dinamakan...',
      'Control Unit (CU)',
      'Register Memory',
      'Arithmetic Logic Unit (ALU)',
      'System Bus',
      'C',
      'Informatika',
      'Mudah',
      'ALU bertugas mengeksekusi kalkulasi perhitungan angka dan perbandingan logika biner.'
    ],
    [
      '3',
      'Pada sistem kecerdasan artifisial (AI), proses pengenalan pola wajah pada kamera smartphone menerapkan prinsip dasar...',
      'Computer Vision & Machine Learning',
      'Spreadsheet Calculation',
      'Database Relasional SQL',
      'Hypertext Transfer Protocol',
      'A',
      'KKA',
      'Sukar',
      'Pengenalan pola citra wajah adalah penerapan Computer Vision yang dilatih melalui model Machine Learning.'
    ]
  ]

  const csvRows = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...sampleRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ]

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Template_Import_Soal.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download standard Word Document (.doc format) Question Template
 */
export function downloadQuestionTemplateWord() {
  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Template Format Soal Word - Belajarena LMS</title>
<style>
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 40px; }
  h2 { text-align: center; font-size: 14pt; margin-bottom: 4px; text-transform: uppercase; }
  p.subtitle { text-align: center; font-size: 11pt; color: #555; margin-top: 0; margin-bottom: 24px; }
  .guideline { background-color: #f1f5f9; border-left: 4px solid #0284c7; padding: 12px; margin-bottom: 24px; font-size: 11pt; }
  .question-item { margin-bottom: 20px; }
  .option { margin-left: 20px; margin-top: 2px; }
  .key { font-weight: bold; color: #166534; margin-top: 4px; margin-left: 20px; }
  .exp { font-style: italic; color: #475569; margin-left: 20px; }
</style>
</head>
<body>
  <h2>Format Baku Penulisan Soal Word (.doc / .docx)</h2>
  <p class="subtitle">Bank Soal Digital &bull; Belajarena Multi-Sekolah &bull; Kurikulum Merdeka</p>

  <div class="guideline">
    <strong>Petunjuk Pengisian Format Word:</strong><br/>
    1. Tuliskan nomor soal diikuti titik (contoh: <code>1.</code>, <code>2.</code>).<br/>
    2. Tuliskan opsi pilihan jawaban A, B, C, D di baris berikutnya.<br/>
    3. Tuliskan <code>Kunci: A</code> (atau B/C/D) untuk kunci jawaban benar.<br/>
    4. (Opsional) Tuliskan <code>Pembahasan: ...</code> untuk penjelasan materi.<br/>
    5. Simpan file ini dan upload langsung ke sistem Bank Soal.
  </div>

  <div class="question-item">
    <p><strong>1. Berikut ini yang merupakan fungsi utama memori RAM pada sistem komputer adalah...</strong></p>
    <div class="option">A. Menyimpan data secara permanen saat komputer dimatikan</div>
    <div class="option">B. Menyimpan data dan instruksi sementara saat program sedang aktif dijalankan</div>
    <div class="option">C. Mengatur kecepatan putaran kipas pendingin processor</div>
    <div class="option">D. Menghubungkan komputer ke jaringan internet nirkabel</div>
    <div class="key">Kunci: B</div>
    <div class="exp">Pembahasan: RAM (Random Access Memory) bersifat volatile dan berfungsi menyimpan instruksi sementara yang dibutuhkan CPU secara cepat.</div>
  </div>

  <div class="question-item">
    <p><strong>2. Bilangan biner 1011 jika dikonversikan ke dalam bilangan desimal bernilai...</strong></p>
    <div class="option">A. 9</div>
    <div class="option">B. 10</div>
    <div class="option">C. 11</div>
    <div class="option">D. 13</div>
    <div class="key">Kunci: C</div>
    <div class="exp">Pembahasan: 1011(2) = (1 x 2^3) + (0 x 2^2) + (1 x 2^1) + (1 x 2^0) = 8 + 0 + 2 + 1 = 11.</div>
  </div>

  <div class="question-item">
    <p><strong>3. Salah satu pilar berpikir komputasional yang berfokus memecah masalah besar menjadi bagian-bagian yang lebih kecil dan mudah dikelola disebut...</strong></p>
    <div class="option">A. Dekomposisi</div>
    <div class="option">B. Pengenalan Pola (Pattern Recognition)</div>
    <div class="option">C. Abstraksi</div>
    <div class="option">D. Algoritma</div>
    <div class="key">Kunci: A</div>
    <div class="exp">Pembahasan: Dekomposisi adalah teknik memecah masalah kompleks menjadi sub-masalah yang lebih sederhana.</div>
  </div>
</body>
</html>`

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Template_Format_Soal_Word.doc'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Parses questions from an Excel (.xlsx or .xls) file
 */
export async function parseQuestionsFromXlsx(file: File): Promise<ParsedQuestion[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  return parseQuestionsFromCsv(csv)
}

/**
 * Downloads standard Excel (.xlsx) Question Template
 */
export function downloadQuestionTemplateXlsx() {
  const rows = [
    {
      'No': 1,
      'Teks Soal / Pertanyaan': 'Berikut ini yang merupakan komponen utama dalam siklus pemrosesan data pada komputer adalah...',
      'Pilihan A': 'Input - Output - Storage',
      'Pilihan B': 'Input - Processing - Output - Storage',
      'Pilihan C': 'Hardware - Software - Brainware',
      'Pilihan D': 'CPU - RAM - Motherboard',
      'Kunci Jawaban (A/B/C/D)': 'B',
      'Mata Pelajaran': 'Informatika',
      'Tingkat Kesukaran (Mudah/Sedang/Sukar)': 'Sedang',
      'Pembahasan / Catatan': 'Siklus pemrosesan data komputasi mencakup input, processing, output, dan penyimpanan (storage).'
    },
    {
      'No': 2,
      'Teks Soal / Pertanyaan': 'Perangkat keras komputer yang berfungsi melakukan operasi aritmetika dan logika pada CPU dinamakan...',
      'Pilihan A': 'Control Unit (CU)',
      'Pilihan B': 'Register Memory',
      'Pilihan C': 'Arithmetic Logic Unit (ALU)',
      'Pilihan D': 'System Bus',
      'Kunci Jawaban (A/B/C/D)': 'C',
      'Mata Pelajaran': 'Informatika',
      'Tingkat Kesukaran (Mudah/Sedang/Sukar)': 'Mudah',
      'Pembahasan / Catatan': 'ALU bertugas mengeksekusi kalkulasi perhitungan angka dan perbandingan logika biner.'
    },
    {
      'No': 3,
      'Teks Soal / Pertanyaan': 'Pada sistem kecerdasan artifisial (AI), proses pengenalan pola wajah pada kamera smartphone menerapkan prinsip dasar...',
      'Pilihan A': 'Computer Vision & Machine Learning',
      'Pilihan B': 'Spreadsheet Calculation',
      'Pilihan C': 'Database Relasional SQL',
      'Pilihan D': 'Hypertext Transfer Protocol',
      'Kunci Jawaban (A/B/C/D)': 'A',
      'Mata Pelajaran': 'KKA',
      'Tingkat Kesukaran (Mudah/Sedang/Sukar)': 'Sukar',
      'Pembahasan / Catatan': 'Pengenalan pola citra wajah adalah penerapan Computer Vision yang dilatih melalui model Machine Learning.'
    }
  ]
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Soal')
  XLSX.writeFile(workbook, 'Template_Import_Soal.xlsx')
}
