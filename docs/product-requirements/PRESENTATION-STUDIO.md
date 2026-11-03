# Spesifikasi Kebutuhan Produk (PRD) — Studio Presentasi Interaktif
## Akademi Guru Digital — Antigravity IDE

**Versi Dokumen:** 1.0.0  
**Tanggal:** 24 Oktober 2026  
**Status:** Disetujui untuk Implementasi  
**Modul:** Studio Presentasi Interaktif (`presentation-studio`)  

---

## 1. Latar Belakang & Tujuan

Guru SMP di Indonesia sering menghadapi tantangan keterlibatan siswa saat presentasi klasikal menggunakan proyektor konvensional (siswa di bangku belakang sulit melihat detail teks/grafik, hilangnya fokus, minimnya interaksi dua arah, serta ketidakmampuan guru memantau apakah materi benar-benar tersampaikan ke seluruh siswa).

**Studio Presentasi Interaktif** mentransformasi slide materi menjadi sarana pembelajaran partisipatif *real-time*:
1. **Slide Mirroring Presisi**: Slide yang diganti oleh guru seketika berubah di layar perangkat HP/tablet/laptop siswa tanpa perlu refresh halaman.
2. **Monitoring Terukur & Non-Invasif**: Guru mengetahui status koneksi perangkat siswa melalui mekanisme *heartbeat* dan konfirmasi penerimaan slide (*slide acknowledgement*), tanpa melanggar privasi (tanpa kamera/mikrofon/screenshot).
3. **Live Voting & Polling Spontan**: Mengukur pemahaman konsep secara instan selama pembelajaran berlangsung melalui kuis kilat, polling opini, atau refleksi pemahaman slide.
4. **Laporan & Integrasi Kurikulum**: Hasil keterlibatan dan asesmen formatif terhubung langsung ke Tujuan Pembelajaran (TP) Kurikulum Merdeka dan buku nilai.

---

## 2. Arsitektur Real-time & Protokol Sinkronisasi

### 2.1. Alur Sinkronisasi Slide Real-time

```
[Guru / Presenter Studio]
       │
       │ 1. POST /sessions/{id}/navigate (slideIndex: 3, seq: 12)
       ▼
 [Backend Server (Source of Truth)]
       │
       │ 2. Simpan session state (active_slide: 3, state_version++)
       │ 3. Broadcast Event: SLIDE_CHANGED (sessionId, slideIndex, version, seq)
       ├───────────────────────────────┐
       ▼                               ▼
[Siswa A (HP Android)]        [Siswa B (Laptop)]
       │                               │
       │ 4. Terima event & render slide│
       │ 5. POST /acknowledge-slide    │
       ▼                               ▼
 [Backend Server: Update Participant Slide Ack & Connection Status]
```

### 2.2. Spesifikasi Event Real-time

| Nama Event | Payload Utama | Deskripsi |
|---|---|---|
| `SESSION_STARTED` | `sessionId, title, totalSlides, accessCode` | Sesi presentasi dimulai oleh guru |
| `SESSION_PAUSED` | `sessionId, isLocked` | Guru mengunci interaksi layar siswa |
| `SESSION_ENDED` | `sessionId, endedAt, summaryReportUrl` | Sesi diakhiri, siswa dialihkan ke layar rangkuman |
| `SLIDE_CHANGED` | `sessionId, slideIndex, version, seq, timestamp` | Perpindahan nomor slide aktif |
| `PARTICIPANT_JOINED` | `sessionId, studentId, studentName, joinedAt` | Siswa sah berhasil masuk ruang presentasi |
| `PARTICIPANT_HEARTBEAT` | `sessionId, studentId, lastActiveAt, connectionState` | Sinyal denyut perangkat siswa tiap 15 detik |
| `SLIDE_ACK` | `sessionId, studentId, slideIndex, ackTimestamp` | Konfirmasi perangkat siswa sukses menampilkan slide |
| `VOTE_OPENED` | `sessionId, voteId, question, type, options, isAnonymous, timeLimit` | Voting interaktif dibuka untuk dijawab siswa |
| `VOTE_RESPONSE_RECEIVED`| `sessionId, voteId, totalResponses` (agregat, tanpa identitas jika anonim) | Pembaruan jumlah respon secara live |
| `VOTE_CLOSED` | `sessionId, voteId, resultsDistribution` | Voting ditutup, diagram hasil dirilis |

---

## 3. Matriks Peran & Hak Akses (RBAC)

| Kemampuan / Fitur | Guru Pengampu | Wali Kelas / Kepsek | Siswa Terdaftar | Siswa Luar Rombel |
|---|:---:|:---:|:---:|:---:|
| Unggah & Kelola File Presentasi | ✅ Penuh | 👁️ Pratinjau | ❌ Ditolak | ❌ Ditolak |
| Memulai & Mengendalikan Sesi | ✅ Penuh | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak |
| Navigasi Slide Utama | ✅ Penuh | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak |
| Mengikuti Sesi & Menjawab Voting | ❌ | ❌ | ✅ Diizinkan | ❌ Dicegat (403) |
| Melihat Monitoring Koneksi Live | ✅ Penuh | 👁️ Monitoring | ❌ Ditolak | ❌ Ditolak |
| Mengunduh Laporan Sesi & CSV | ✅ Penuh | 👁️ Rekap Sekolah | ❌ Ditolak | ❌ Ditolak |

---

## 4. Spesifikasi Pemrosesan & Konversi Berkas

1. **Format Input**: `.pdf` dan `.pptx`
2. **Validasi File**:
   - Maksimum ukuran file: 50 MB
   - MIME Types: `application/pdf`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
   - Sanitasi nama file dan pencegahan eksekusi script berbahaya (*no active executable*).
3. **Pipeline Abstraksi Konversi**:
   - `PresentationProcessorInterface`:
     - `extractMetadata(filePath): { slideCount, aspectRatio, title }`
     - `renderSlides(filePath, outputDir): SlideImage[]`
   - Menghasilkan slide terstandarisasi dengan resolusi tinggi (1920x1080 / 16:9) serta format web responsif.
   - Status pemrosesan persisten: `pending` -> `processing` -> `ready` (atau `failed` dengan pesan log informatif).

---

## 5. Fitur Interaktif: Live Voting & Pertanyaan Pemahaman

### 5.1. 6 Mode Voting & Polling
1. **Pilihan Ganda Tunggal (*Single Choice*)**: A, B, C, D (1 jawaban benar atau polling opini).
2. **Pilihan Ganda Jamak (*Multiple Select*)**: Memilih lebih dari satu opsi yang relevan.
3. **Ya / Tidak (*Yes / No*)**: Keputusan cepat pemahaman instruksi.
4. **Benar / Salah (*True / False*)**: Uji konsep pemahaman fakta materi.
5. **Skala Likert / Bintang (*Rating 1-5*)**: Tingkat kepercayaan diri atau kejelasan penjelasan.
6. **Jawaban Singkat (*Short Text*)**: Refleksi 1-2 kata kunci atau ide pokok slide.

### 5.2. Aturan Integritas Jawaban
- Hanya sesi dengan status `active` dan vote `open` yang dapat menerima respons.
- Satu responden dibatasi 1 submisi jawaban aktif (kecuali opsi *"Izinkan ubah jawaban"* diaktifkan guru).
- Pada mode anonim, relasi identitas siswa dipisahkan secara kriptografis dari diagram visualisasi hasil.
- Submisi yang masuk setelah batas waktu atau status `closed` otomatis ditolak oleh server.

---

## 6. Laporan & Metrik Pasca Sesi

Laporan komprehensif memuat:
- Informasi Sesi (Guru, Mapel, Rombel, Tanggal, Durasi Menit).
- Rasio Kehadiran Sesi: Partisipan Bergabung / Total Siswa Rombel.
- Ringkasan Konektivitas: Rata-rata stabilitas koneksi & persentase konfirmasi penerimaan slide.
- Rekapitulasi Voting: Distribusi jawaban, persentase tiap opsi, dan diagram visual.
- Opsi Integrasi Formatif: Ekspor nilai pemahaman terhubung ke Tujuan Pembelajaran (TP) dan Ledger Rapor.
- Tombol Cetak / Ekspor PDF dan CSV data terstruktur.
