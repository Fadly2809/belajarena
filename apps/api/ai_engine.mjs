/**
 * AI Pedagogical Assistant Engine - Belajarena
 * Khusus untuk Guru Informatika & KKA (Koding dan Kecerdasan Artifisial)
 * SMP Negeri 6 Kendari — Muhammad Fadly Akbar Arsandi, S.Pd.
 */

// Helper to query external Gemini API if an API key is provided
async function callGeminiApi(apiKey, message, history = []) {
  const systemPrompt = `Anda adalah "AI Assistant Belajarena", asisten pedagogik cerdas profesional khusus untuk Bapak Muhammad Fadly Akbar Arsandi, S.Pd., Guru Mata Pelajaran Informatika dan KKA (Koding dan Kecerdasan Artifisial) di SMP Negeri 6 Kendari, NIP 199509282020121003.
Pendidikan: Kurikulum Merdeka Indonesia (Fase D SMP Kelas VII, VIII, IX).
Tugas Anda:
1. Membantu menyusun Modul Ajar, Alur Tujuan Pembelajaran (ATP), dan KKTP.
2. Membuat butir soal HOTS (Higher Order Thinking Skills) dan MOTS lengkap dengan stimulus, pilihan ganda, kunci jawaban, dan pembahasan mendalam.
3. Menjelaskan dan menuliskan kode pemrograman (Python, Scratch, Visual Block, HTML/CSS) yang ramah anak SMP.
4. Memberikan ide proyek praktikum Koding & Kecerdasan Artifisial (AI, Machine Learning, Computer Vision, Prompt Engineering, Etika AI).
5. Format jawaban Anda selalu rapi dalam GitHub-flavored Markdown dengan struktur jelas, tebal, tabel, poin-poin, dan blok kode bersintaks.`

  const contents = []
  for (const h of history) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  const replyText = candidate?.content?.parts?.[0]?.text
  if (!replyText) throw new Error('Jawaban kosong dari Gemini API')
  return replyText
}

// Built-in Expert Pedagogical AI Generator for SMP Negeri 6 Kendari
function generateBuiltInResponse(message) {
  const text = message.toLowerCase()

  // 1. INTENT: SOAL HOTS / BUTIR SOAL / ASESMEN
  if (text.includes('soal') || text.includes('asesmen') || text.includes('kuis') || text.includes('ujian') || text.includes('hots')) {
    if (text.includes('kka') || text.includes('kecerdasan') || text.includes('ai') || text.includes('artifisial') || text.includes('prompt')) {
      return `### 📋 Paket Butir Soal HOTS — KKA (Koding & Kecerdasan Artifisial)
**Mata Pelajaran**: KKA (Koding dan Kecerdasan Artifisial)  
**Satuan Pendidikan**: SMP Negeri 6 Kendari  
**Fase / Kelas**: Fase D / Kelas VII - VIII  
**Penyusun**: Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003)  
**Tingkat Kognitif**: C4 (Menganalisis) & C5 (Mengevaluasi)

---

#### Butir Soal 1: Analisis Model Pengenalan Gambar (Computer Vision)
> **Stimulus:**
> Sekelompok siswa kelas VII A di Lab Komputer SMP Negeri 6 Kendari sedang melatih model kecerdasan artifisial menggunakan *Teachable Machine* untuk membedakan sampah plastik dan daun kering. Dari 100 data uji, model berhasil mengenali 92 gambar dengan benar, namun salah mengidentifikasi botol plastik bening yang diletakkan di atas rumput sebagai daun.

**Pertanyaan:**  
Mengapa model kecerdasan artifisial tersebut mengalami kesalahan klasifikasi pada botol plastik bening di atas rumput?
- **A.** Daya komputasi komputer di lab kurang memadai untuk memproses gambar berwarna.
- **B.** Model AI mempelajari fitur latar belakang (rumput hijau) akibat data latih botol plastik tidak memiliki variasi latar belakang yang beragam.
- **C.** Sensor kamera digital secara otomatis mengubah pixel plastik menjadi klorofil daun.
- **D.** Algoritma kecerdasan artifisial hanya dapat mendeteksi benda padat yang tidak tembus cahaya.

✅ **Kunci Jawaban:** **B**  
💡 **Pembahasan:**  
Kesalahan tersebut merupakan fenomena klasik *background bias* (bias latar belakang) pada *Computer Vision*. Model AI mengaitkan fitur warna hijau di latar belakang dengan label "daun" karena sampel latih sebelumnya kurang variatif. Solusinya adalah menambah variasi data latih dengan latar belakang berbeda.

---

#### Butir Soal 2: Evaluasi Prompt Engineering (Etika & Ketepatan Prompt)
> **Stimulus:**
> Seorang siswa ingin membuat ringkasan materi "Sejarah Perkembangan Komputer" menggunakan asisten AI generatif. Ia mengetikkan prompt: *"Ceritakan komputer zaman dulu."* Hasil yang keluar terlalu panjang dan bercampur dengan dongeng fiksi.

**Pertanyaan:**  
Berdasarkan prinsip *Prompt Engineering* yang efektif, perbaikan prompt mana yang paling tepat dan terarah untuk kebutuhan belajar siswa?
- **A.** *"Tolong ceritakan sejarah komputer sebanyak-banyaknya sekarang juga."*
- **B.** *"Buat ringkasan sejarah komputer dari generasi ke-1 hingga generasi ke-5 dalam bentuk tabel poin-poin penting, fokus pada komponen utama dan tahun penemuannya, dengan bahasa yang mudah dipahami siswa SMP."*
- **C.** *"Jangan berikan dongeng, berikan saja informasi komputer."*
- **D.** *"Apakah kamu tahu komputer zaman dulu? Jawab dengan ya atau tidak."*

✅ **Kunci Jawaban:** **B**  
💡 **Pembahasan:**  
Prompt yang berkualitas menerapkan prinsip **C-T-O-F** (*Context, Task, Output constraint, Format*). Pilihan B secara spesifik membatasi ruang lingkup (Generasi 1-5), menentukan format luaran (tabel poin-poin), dan menyetel target pembaca (bahasa siswa SMP).

---

#### Butir Soal 3: Logika Pengambilan Keputusan AI (Rule-Based vs Machine Learning)
**Pertanyaan:**  
Manakah di bawah ini yang merupakan contoh penerapan *Machine Learning* yang sesungguhnya di lingkungan sekolah, bukan sekadar program percabangan logika (*Rule-based IF-ELSE*) biasa?
- **A.** Sistem bel sekolah otomatis yang berbunyi tepat pukul 07.15 WIB setiap hari Senin hingga Jumat.
- **B.** Program kalkulator nilai rapor yang menghitung rata-rata akhir dengan rumus matematika tetap.
- **C.** Kamera absensi gerbang yang mampu mengenali wajah siswa SMP Negeri 6 Kendari meskipun siswa berganti gaya rambut atau memakai kacamata baru setelah dilatih dengan kumpulan foto wajah.
- **D.** Lampu koridor sekolah yang menyala saat sensor cahaya LDR mendeteksi kondisi gelap di malam hari.

✅ **Kunci Jawaban:** **C**  
💡 **Pembahasan:**  
Machine Learning memiliki kemampuan belajar dari pola data (*pattern recognition*) dan menggeneralisasi input baru (wajah berkacamata/gaya rambut baru) tanpa harus diprogram aturan statis satu per satu. Opsi A, B, dan D adalah sistem otomatis berbasis aturan (*rule-based system*) biasa.

---
*Tip untuk Pak Fadly: Butir soal ini dapat langsung disalin ke menu **Bank Soal** atau **Paket Ujian CBT** pada sistem Belajarena.*`
    }

    // Soal Informatika umum (Algoritma, Pemrograman, Flowchart)
    return `### 📋 Paket Butir Soal HOTS — Informatika Fase D
**Mata Pelajaran**: Informatika  
**Satuan Pendidikan**: SMP Negeri 6 Kendari  
**Elemen**: Algoritma dan Pemrograman (AP)  
**Guru Pengampu**: Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003)

---

#### Butir Soal 1: Logika Percabangan Bersarang (Nested IF)
> **Stimulus Cuplikan Kode Python:**
\`\`\`python
nilai_koding = 85
kehadiran = 90

if nilai_koding >= 80:
    if kehadiran >= 85:
        hasil = "Lulus Istimewa - Berhak Sertifikat AI"
    else:
        hasil = "Lulus Reguler"
else:
    hasil = "Perlu Penguatan Logika"

print(hasil)
\`\`\`

**Pertanyaan:**  
Berdasarkan jalannya eksekusi program di atas, apa luaran yang akan dicetak di layar monitor?
- **A.** Lulus Reguler
- **B.** Perlu Penguatan Logika
- **C.** Lulus Istimewa - Berhak Sertifikat AI
- **D.** Program menghasilkan pesan error sintaks

✅ **Kunci Jawaban:** **C**  
💡 **Pembahasan:**  
Kondisi pertama \`nilai_koding >= 80\` bernilai **True** (karena 85 >= 80). Program kemudian mengevaluasi kondisi bersarang di dalamnya \`kehadiran >= 85\`, yang juga bernilai **True** (90 >= 85). Maka blok kode \`hasil = "Lulus Istimewa - Berhak Sertifikat AI"\` yang dieksekusi.

---

#### Butir Soal 2: Struktur Data Tumpukan (Stack)
> **Stimulus:**
> Seorang siswa di Lab Komputer SMP Negeri 6 Kendari mengetikkan tiga kata secara berurutan: *"Koding"*, lalu *"AI"*, lalu *"Kendari"*. Tiba-tiba siswa menekan tombol pintas **Undo (Ctrl+Z)** sebanyak 1 kali.

**Pertanyaan:**  
Berdasarkan prinsip kerja struktur data **Stack (LIFO - Last In First Out)**, kata manakah yang akan dibatalkan/dihapus terlebih dahulu oleh editor teks?
- **A.** Koding
- **B.** AI
- **C.** Kendari
- **D.** Seluruh kata akan terhapus bersamaan

✅ **Kunci Jawaban:** **C**  
💡 **Pembahasan:**  
Fitur *Undo* pada aplikasi komputer dirancang menggunakan struktur data *Stack*. Prinsip *LIFO (Last In, First Out)* memastikan bahwa elemen yang terakhir kali dimasukkan (*Kendari*) adalah elemen pertama yang dikeluarkan/dibatalkan.`
  }

  // 2. INTENT: MODUL AJAR / RPP / KURIKULUM MERDEKA
  if (text.includes('modul ajar') || text.includes('rpp') || text.includes('kurikulum merdeka') || text.includes('atp') || text.includes('kktp')) {
    return `### 📘 Draf Modul Ajar Kurikulum Merdeka (Fase D SMP)
**Satuan Pendidikan**: SMP Negeri 6 Kendari  
**Mata Pelajaran**: KKA (Koding dan Kecerdasan Artifisial) & Informatika  
**Penyusun**: **Muhammad Fadly Akbar Arsandi, S.Pd.**  
**NIP**: 199509282020121003  
**Alokasi Waktu**: 2 JP (2 x 40 Menit) · 1 Pertemuan  
**Target Peserta Didik**: Siswa Kelas VII SMP (Reguler / 32 Siswa)

---

#### 1. INFORMASI UMUM
* **Elemen Capaian Pembelajaran**: Algoritma dan Pemrograman (AP) & Kecerdasan Artifisial Dasar.
* **Profil Pelajar Pancasila**:
  1. *Bernalar Kritis*: Menganalisis algoritma dan logika input-proses-output.
  2. *Kreatif*: Merancang instruksi koding visual untuk pemecahan masalah nyata.
  3. *Gotong Royong*: Berkolaborasi dalam tim praktikum di Lab Komputer.
* **Sarana & Prasarana**: Lab Komputer SMP Negeri 6 Kendari, Smart TV / Proyektor, Platform Belajarena LMS.

---

#### 2. KOMPONEN INTI
* **Tujuan Pembelajaran (TP)**:
  1. Peserta didik mampu menjelaskan konsep dasar algoritma dan alur logika berpikir komputasional.
  2. Peserta didik mampu merancang program visual block sederhana yang merespons masukan sensor atau tombol.
  3. Peserta didik mampu mengidentifikasi peran kecerdasan artifisial sederhana dalam kehidupan sehari-hari secara etis.
* **Pertanyaan Pemantik**:
  - *"Bagaimana robot atau game di HP bisa tahu kapan harus melompat atau menghindar saat kita menekan tombol?"*
  - *"Apakah komputer bisa berpikir sendiri seperti otak manusia?"*

---

#### 3. LANGKAH-LANGKAH PEMBELAJARAN (MODEL: PROJECT-BASED LEARNING)
| Tahapan | Aktivitas Pembelajaran Guru & Siswa | Waktu |
|---|---|---|
| **Pendahuluan** | 1. Guru (Pak Fadly) membuka kelas dengan salam, doa, dan presensi via Belajarena.<br>2. Apersepsi dengan menampilkan simulasi visual koding di layar Smart TV Lab.<br>3. Menyampaikan tujuan praktikum dan pembagian kelompok kerja (4 siswa/kelompok). | 10 Menit |
| **Kegiatan Inti** | 1. **Eksplorasi Konsep**: Guru mendemonstrasikan blok logika dasar (Gerak, Deteksi, Variabel Poin).<br>2. **Tantangan Proyek (Hands-on)**: Siswa membuat game interaktif "Kucing Menangkap Apel" menggunakan Scratch / MakeCode.<br>3. **Integrasi AI**: Menambahkan fitur pengenalan suara sederhana untuk menggerakkan sprite.<br>4. **Presentasi Cermin**: Siswa menampilkan karyanya ke layar utama melalui Studio Presentasi Belajarena. | 60 Menit |
| **Penutup** | 1. Refleksi bersama: *"Satu logika paling menantang yang berhasil kamu pecahkan hari ini?"*<br>2. Guru memberikan apresiasi karya terbaik dan arahan materi pertemuan berikutnya.<br>3. Doa bersama dan penutupan kelas. | 10 Menit |

---

#### 4. ASESMEN & KRITERIA KETUNTASAN (KKTP)
* **Asesmen Formatif (Saat Pembelajaran)**: Observasi keaktifan logika berpikir saat siswa menyusun blok program di lab.
* **Rubrik Kinerja Proyek Koding**:
  - *Sangat Baik (Skor 86-100)*: Program berjalan lancar tanpa bug, menerapkan perulangan dan percabangan dengan variasi kreatif.
  - *Baik (Skor 75-85)*: Program berjalan sesuai instruksi dasar dengan logika yang tepat.
  - *Perlu Pendampingan (<75)*: Membutuhkan panduan guru dalam menyelesaikan urutan blok utama.

---
*Draf ini dapat langsung disimpan atau disesuaikan melalui menu **Modul Ajar** di portal Belajarena.*`
  }

  // 3. INTENT: KODING / PYTHON / SCRATCH / BLOCK CODE
  if (text.includes('koding') || text.includes('coding') || text.includes('python') || text.includes('scratch') || text.includes('program') || text.includes('kode') || text.includes('script')) {
    return `### 💻 Modul Praktikum Koding Siswa SMP Negeri 6 Kendari
**Topik**: Pemrograman Logika Dasar dengan Python  
**Guru Pengampu**: Muhammad Fadly Akbar Arsandi, S.Pd.  
**Level**: Pemula (SMP Kelas VII - VIII)

Berikut adalah contoh program interaktif berbasis Python yang sangat cocok untuk menguji nalar komputasional siswa di Lab Komputer:

\`\`\`python
# ==============================================================
# Program: Asisten Pintar Pendeteksi Nilai Siswa SMPN 6 Kendari
# Materi : Variabel, Input/Output, Percabangan Logika (IF-ELIF-ELSE)
# ==============================================================

print("=" * 50)
print("   SELAMAT DATANG DI LAB KOMPUTER SMP NEGERI 6 KENDARI   ")
print("          PROGRAM ANALISIS KETUNTASAN KKA & INFORMATIKA  ")
print("=" * 50)

nama_siswa = input("Masukkan nama lengkap siswa: ")
kelas = input("Masukkan kelas (Contoh: VII A): ")
nilai_koding = float(input("Masukkan nilai proyek koding (0 - 100): "))

print("\n--- HASIL EVALUASI PRESTASI BELAJAR ---")
print(f"Nama Siswa   : {nama_siswa}")
print(f"Rombel       : {kelas}")
print(f"Nilai Koding : {nilai_koding}")

# Logika Penentuan Interval KKTP Kurikulum Merdeka
if nilai_koding >= 90:
    predikat = "A"
    status = "Istimewa - Sangat Mahir dalam Logika Pemrograman"
    saran = "Direkomendasikan mengikuti Tim Olimpiade Informatika / O2SN."
elif nilai_koding >= 80:
    predikat = "B"
    status = "Baik - Tuntas Memenuhi Capaian Kompetensi Fase D"
    saran = "Pertahankan dan lanjutkan ke materi Kecerdasan Artifisial."
elif nilai_koding >= 75:
    predikat = "C"
    status = "Cukup - Memenuhi Batas Minimal Ketuntasan (KKM/KKTP)"
    saran = "Perbanyak latihan studi kasus logika percabangan."
else:
    predikat = "D"
    status = "Perlu Bimbingan Remedial"
    saran = "Jadwalkan pendampingan khusus bersama Pak Fadly di Lab."

print(f"Predikat     : {predikat}")
print(f"Status       : {status}")
print(f"Rekomendasi  : {saran}")
print("=" * 50)
\`\`\`

#### 🎯 Panduan Guru untuk Pengajaran di Lab:
1. **Langkah 1**: Ajak siswa mengetikkan kode di atas pada IDE Python (IDLE / Thonny / VS Code).
2. **Langkah 2**: Minta siswa menguji dengan nilai: \`95\`, \`82\`, \`75\`, dan \`65\` untuk membuktikan jalannya percabangan.
3. **Tantangan Pengayaan**: Minta siswa menambahkan perhitungan nilai kehadiran untuk menentukan status akhir kelulusan.`
  }

  // 4. INTENT: KECERDASAN ARTIFISIAL / AI / KKA
  if (text.includes('ai') || text.includes('kecerdasan artifisial') || text.includes('machine learning') || text.includes('prompt') || text.includes('vision') || text.includes('robot')) {
    return `### 🤖 Panduan Pembelajaran KKA: Memperkenalkan AI untuk Siswa SMP
**Mata Pelajaran**: KKA (Koding dan Kecerdasan Artifisial)  
**Satuan Pendidikan**: SMP Negeri 6 Kendari  
**Guru Pengampu**: Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003)

---

#### 🌟 Konsep Dasar yang Sesuai untuk Fase D (Usia 12-15 Tahun):
Untuk siswa tingkat SMP, materi Kecerdasan Artifisial diarahkan pada **pemahaman konsep fungsional, literasi data, dan etika**, bukan matematika kalkulus yang rumit:

1. **Bagaimana Komputer Belajar? (Data + Model = Prediksi)**:
   - Bandingkan dengan cara manusia belajar: Anak kecil mengenali kucing karena melihat ratusan contoh kucing, bukan karena membaca aturan anatomi.
   - AI belajar mengenali pola dari kumpulan data latih (*training data*).

2. **3 Pilar AI yang Menarik untuk Praktikum Lab**:
   - **Computer Vision (Penglihatan Komputer)**: Memproses gambar dari webcam lab untuk mendeteksi gestur tangan (batu, gunting, kertas).
   - **Natural Language Processing (Pemrosesan Bahasa)**: Bagaimana chatbot memahami instruksi bahasa manusia.
   - **Machine Learning Sederhana**: Klasifikasi suara atau gerakan tubuh menggunakan Google Teachable Machine.

3. **Prinsip Etika AI yang Wajib Ditanamkan ke Siswa SMP**:
   - *Kejujuran Akademik*: Tidak menyalin utuh tugas dari AI generatif tanpa dipelajari dan diparafrase.
   - *Privasi Data*: Tidak mengunggah foto pribadi atau password ke aplikasi AI publik.
   - *Verifikasi Fakta (Anti-Halusinasi)*: AI bisa salah (*halusinasi*), sehingga manusia tetap menjadi penentu kebenaran akhir.

---

#### 🛠️ Ide Proyek Kelas Praktikum 1 Minggu:
* **Judul Proyek**: *"Smart Recycle: AI Pemilah Sampah Sekolah SMPN 6 Kendari"*
* **Alat**: Webcam Lab Komputer + Platform Teachable Machine / Scratch AI Extension.
* **Aktivitas Siswa**:
  1. Siswa mengumpulkan 20 foto botol plastik dan 20 foto daun kering di sekitar sekolah.
  2. Melatih model AI langsung di peramban (browser).
  3. Menguji model dengan benda baru dan menganalisis akurasinya.`
  }

  // 5. INTENT: KONSULTASI UMUM / DEFAULT
  return `### 💡 Rekomendasi & Asistensi Guru — Belajarena
**Halo Pak Muhammad Fadly Akbar Arsandi, S.Pd.!**  
Guru Informatika & KKA · **SMP Negeri 6 Kendari** (NIP: 199509282020121003)

Mengenai pertanyaan Bapak: **"${message}"**, berikut ringkasan panduan pedagogik dan teknis yang dapat diterapkan di kelas:

1. **Konteks Kurikulum Merdeka (Fase D SMP)**:
   - Pembelajaran Informatika dan KKA menekankan pendekatan *Berpikir Komputasional (Computational Thinking)* dengan 4 pilar utama: **Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma**.
   - Setiap konsep teknis sebaiknya dikaitkan dengan konteks kehidupan sehari-hari siswa di Kota Kendari atau pemanfaatan teknologi di sekolah.

2. **Dukungan Fasilitas di Portal Belajarena**:
   - **Studio Presentasi Interaktif**: Anda dapat menyajikan materi langsung ke layar ponsel atau komputer siswa dengan fitur live polling dan heartbeat pemantauan.
   - **Bank Soal & CBT**: Soal-soal formatif dapat langsung diujikan secara daring dengan token akses dan sistem anti-curang tab switch.
   - **Manajemen Presensi & Rapor**: Seluruh nilai proyek dan presensi mengajar tersimpan secara terpusat di ledger nilai.

---

#### 📌 Aksi Cepat yang Bisa Saya Bantu Selanjutnya:
- Ketik **"Buatkan soal HOTS Python"** untuk menghasilkan 5 paket soal ujian.
- Ketik **"Draf modul ajar KKA kelas VII"** untuk menyusun perangkat ajar resmi.
- Ketik **"Ide proyek Scratch"** untuk aktivitas praktikum di Lab Komputer.

Ada aspek khusus yang ingin kita perdalam bersama hari ini, Pak Fadly?`
}

export { callGeminiApi, generateBuiltInResponse }
