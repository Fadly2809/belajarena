# Algoritma & Logika Bisnis — Akademi Guru Digital

Dokumen ini mendokumentasikan spesifikasi matematis, alur logika, dan algoritma inti yang digunakan pada platform **Akademi Guru Digital** untuk jenjang SMP di Indonesia.

---

## 1. Algoritma Penilaian Rapor Kurikulum Merdeka (Fase D)

### 1.1. Perhitungan Nilai Akhir (NA)
Sesuai Panduan Pembelajaran dan Asesmen (PPA) Kemendikbudristek, pengolahan nilai akhir rapor semester memadukan asesmen formatif, sumatif lingkup materi, dan sumatif akhir semester dengan pembobotan:

$$\text{NA} = (w_f \times \bar{F}) + (w_s \times \bar{S}) + (w_{\text{sas}} \times \text{SAS})$$

Di mana:
- $\bar{F} = \frac{1}{n} \sum_{i=1}^n \text{TP}_i$ : Rata-rata nilai formatif seluruh Tujuan Pembelajaran (TP)
- $\bar{S} = \frac{1}{m} \sum_{j=1}^m \text{ST}_j$ : Rata-rata nilai sumatif lingkup materi (ST)
- $\text{SAS}$ : Nilai Sumatif Akhir Semester
- Bobot default standar: $w_f = 0.40$ (40%), $w_s = 0.40$ (40%), $w_{\text{sas}} = 0.20$ (20%)

### 1.2. Interval Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
Interval nilai ketuntasan peserta didik dikelompokkan ke dalam 4 kategori standar:

| Rentang Nilai | Predikat | Kategori Intervensi | Tindak Lanjut |
|---|---|---|---|
| $0 \le x < 70$ | D | Perlu Bimbingan | Diberikan bimbingan remedial individual pada TP terkait |
| $70 \le x \le 80$ | C | Cukup | Diberikan penguatan konsep dasar mandiri |
| $81 \le x \le 90$ | B | Baik | Melanjutkan ke TP berikutnya |
| $91 \le x \le 100$ | A | Sangat Baik | Diberikan materi pengayaan (*enrichment*) |

### 1.3. Generator Deskripsi Capaian Kompetensi Otomatis
Deskripsi rapor naratif disusun otomatis secara cerdas (*rule-based*) dengan mengidentifikasi capaian tertinggi ($\text{TP}_{\max}$) dan capaian terendah ($\text{TP}_{\min}$):

1. **Kasus 1**: Jika seluruh $\text{TP} \ge 90$:
   > *"Menunjukkan penguasaan sangat istimewa dalam seluruh capaian elemen mata pelajaran secara mandiri dan kreatif."*
2. **Kasus 2**: Jika terdapat variasi capaian:
   > *"Menunjukkan penguasaan sangat baik dalam [Deskripsi $\text{TP}_{\max}$]; perlu peningkatan dan pendampingan dalam [Deskripsi $\text{TP}_{\min}$]."*
3. **Kasus 3**: Jika seluruh $\text{TP} < 70$:
   > *"Memerlukan pendampingan intensif dan bimbingan remedial dalam menguasai konsep-konsep dasar mata pelajaran."*

---

## 2. Algoritma Engine CBT (Computer-Based Test) & Anti-Curang

### 2.1. Pengacakan Butir Soal & Opsi Jawaban (Fisher-Yates Shuffle)
Untuk mencegah kecurangan antar-siswa yang duduk bersebelahan di laboratorium komputer, urutan butir soal dan opsi jawaban (A, B, C, D) diacak secara deterministik menggunakan *Fisher-Yates Shuffle*:

```typescript
function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let m = result.length, t, i;
  while (m) {
    seed = (seed * 9301 + 49297) % 233280;
    i = Math.floor((seed / 233280) * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}
```

### 2.2. Algoritma Deteksi Pelanggaran (Anti-Cheat Tab Switch Detection)
Sistem memantau event `visibilitychange` dan `blur` pada browser peserta ujian:
1. Setiap kali jendela kehilangan fokus atau tab diminimalkan:
   - Variabel `violationCount` bertambah 1.
   - Log pelanggaran dicatat bersama stempel waktu (*timestamp*).
2. **Ambang Batas Toleransi**:
   - Pelanggaran 1 & 2: Tampilkan *warning modal* bersuara.
   - Pelanggaran $\ge 3$: Sesi ujian otomatis terkunci (*locked*). Siswa tidak dapat melanjutkan sampai pengawas/guru melakukan *reset session* dari dashboard admin CBT.

### 2.3. Analisis Butir Soal (Item Analysis)
- **Tingkat Kesukaran ($P$)**:
  $$P = \frac{B}{N}$$
  - $P > 0.70$ : Soal Kategori Mudah (LOTS)
  - $0.30 \le P \le 0.70$ : Soal Kategori Sedang (MOTS)
  - $P < 0.30$ : Soal Kategori Sukar (HOTS)
- **Daya Pembeda ($D$)**:
  $$D = \frac{B_A - B_B}{n}$$
  Membandingkan 27% kelompok siswa atas ($B_A$) dengan 27% kelompok siswa bawah ($B_B$).

---

## 3. Algoritma Rekapitulasi Presensi & Sistem Peringatan Dini (EWS)

### 3.1. Persentase Kehadiran Kumulatif
$$\text{Tingkat Kehadiran} = \left(\frac{H}{H + S + I + A}\right) \times 100\%$$

Di mana:
- $H$: Jumlah hari hadir
- $S$: Sakit dengan surat dokter / orang tua
- $I$: Izin tercatat
- $A$: Alpa / Tanpa Keterangan

### 3.2. Early Warning System (EWS) Presensi
- **Zona Hijau ($\ge 90\%$)**: Kehadiran sangat baik.
- **Zona Kuning ($85\% \le x < 90\%$)**: Peringatan wali kelas untuk verifikasi kesehatan siswa.
- **Zona Merah ($< 85\%$)**: Otomatis menerbitkan surat panggilan orang tua dan rujukan ke Guru Bimbingan Konseling (BK) untuk pencegahan putus sekolah (*Drop Out prevention*).

---

## 4. Algoritma Edu-Games & Roda Putar Interaktif

### 4.1. Kalkulasi Poin Kuis Cepat (Multiplayer Scoring)
Poin dihitung berdasarkan ketepatan jawaban dan sisa waktu menjawab untuk memotivasi partisipasi aktif:

$$\text{Poin} = \begin{cases} 
\text{Round}\left(500 + 500 \times \frac{t_{\text{sisa}}}{t_{\text{maks}}}\right), & \text{jika jawaban benar} \\
0, & \text{jika jawaban salah}
\end{cases}$$

Dengan rentang poin 500 s/d 1.000 per butir soal.

### 4.2. Algoritma Normalisasi Sudut Roda Putar (Spin The Wheel)
Untuk menentukan nama siswa yang ditunjuk oleh jarum jam (puncak roda di posisi $-90^\circ$ atau $270^\circ$):

$$\theta_{\text{normal}} = (360 - (\theta_{\text{total}} \bmod 360)) \bmod 360$$
$$\text{Indeks Terpilih} = \left\lfloor \frac{\theta_{\text{normal}}}{360 / N} \right\rfloor \bmod N$$

Di mana $N$ adalah jumlah peserta didik pada daftar roda putar.

---

## 5. Algoritma & Integritas Final Boss Battle Ulangan Gamifikasi

### 5.1. Server-Side Answer Evaluation & Anti-Tampering
Untuk menjamin integritas nilai akademik dan mencegah modifikasi payload di sisi klien (DevTools / network proxy), evaluasi benar/salah sepenuhnya dilakukan di sisi server:
1. Klien siswa hanya mengirimkan payload minimal: `{ participant_id, question_id, option_index, client_event_id }`.
2. Kunci jawaban (`correctIndex` / `answer_index`) **dihapus** dari seluruh payload respon ke siswa (`GET /poll`, `GET /sessions/:id`).
3. Server membandingkan `option_index` terhadap kunci jawaban asli soal di memori server.
4. Nilai akademik dan pengurangan HP boss dihitung secara otoritatif di server. Parameter `is_correct` dari klien diabaikan sepenuhnya.

### 5.2. Relasi HP Boss, Ketuntasan Kelas, dan Peserta Aktif
Boss HP berbanding terbalik dengan persentase ketuntasan peserta aktif (KKM):

$$\text{Penyebut Resmi (Official Count)} = N_{\text{terdaftar}} - N_{\text{absen}}$$
$$\text{Persentase Ketuntasan} = \min\left(100\%, \frac{N_{\text{tuntas}}}{N_{\text{aktif}}} \times 100\%\right)$$
$$\text{Damage Per Hit} = \frac{\text{HP}_{\text{awal}}}{\text{Target Hit}}, \quad \text{di mana } \text{Target Hit} = \max\left(1, \text{Round}\left(N_{\text{aktif}} \times Q_{\text{total}} \times \frac{\text{KKM}}{100}\right)\right)$$

Aturan Kritis Keterikatan Boss HP:
- **Kondisi HP = 0**: Hanya dan hanya jika seluruh siswa aktif mencapai KKM ($N_{\text{tuntas}} \ge N_{\text{aktif}}$).
- **Proteksi 1 HP**: Jika masih ada setidaknya 1 siswa aktif belum mencapai KKM, Boss HP tidak boleh turun ke 0 (tertahan minimum di 1 HP).
- **Hits Pasca Kemenangan**: Serangan lanjutan setelah boss kalah berstatus `visual_only: true` tanpa mengubah skor atau HP boss.
- **Sinkronisasi Rapor Terpercaya**: Sinkronisasi nilai otomatis ke ledger rapor wajib menggunakan identitas pasti (`student_id` atau `nisn`/`nis`), mencegah salah sasaran pencocokan nama string.

---

## 6. Algoritma Real-Time & Bandwidth Optimization Studio Presentasi

### 6.1. Adaptive Polling & Sequence Delivery
Mengatasi keterbatasan jaringan LAN sekolah/Wi-Fi hotspot guru dengan konsumsi bandwidth minimal:
- **Dual-Sync Fast Polling (500 ms) & Instant SSE**: Klien siswa melakukan sinkronisasi polling 500 ms secara konsisten dipadukan dengan stream push SSE dan BroadcastChannel, menjaga perpindahan slide serta koordinat laser pointer tetap instan tanpa jeda delay (0-50 ms latency).
- **Incremental Event Sequence**: Perubahan status dikirimkan dengan nomor urut (`sequence`), sehingga siswa yang baru bergabung (*late join*) atau mengalami gangguan sinyal (*reconnect*) dapat mengejar state slide dan voting secara deterministik tanpa kehilangan data.

### 6.2. Frame Deduplication pada Live Screen Mirroring
Saat guru mendemonstrasikan aplikasi web atau coding:
1. Guru mengirim hash cuplikan frame layar.
2. Server mendeteksi kesamaan frame: jika frame identik dengan frame sebelumnya, respon polling ke siswa mengembalikan flag `frame_unchanged: true` dengan `screenFrame: null`.
3. HP siswa mempertahankan frame sebelumnya di layar tanpa mengunduh ulang payload base64/blob, menghemat hingga 80-90% lalu lintas data jaringan lokal.

### 6.3. Keep-Awake Screen Wake Lock API
Untuk mencegah HP siswa mati (*sleep*) saat menyimak presentasi atau demo interaktif, modul presentasi mengaktifkan W3C Screen Wake Lock API secara otomatis saat sesi live aktif dan melepasnya saat sesi berakhir atau tab diminimalkan.

