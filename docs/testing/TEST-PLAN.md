# Rencana Pengujian Perangkat Lunak (Test Plan) — Akademi Guru Digital

**Proyek:** Platform Terpadu Akademi Guru Digital untuk Guru SMP Indonesia  
**Versi:** 1.0.0  
**Tanggal:** 24 Oktober 2026  

---

## 1. Tujuan Pengujian

Test Plan ini disusun untuk menjamin seluruh fungsionalitas aplikasi web **Akademi Guru Digital** berjalan dengan presisi tinggi, aman, tahan terhadap kesalahan (*fault-tolerant*), dan memenuhi seluruh regulasi Kurikulum Merdeka serta kebutuhan operasional guru SMP.

---

## 2. Ruang Lingkup Pengujian

### 2.1. Komponen yang Diuji
1. **Autentikasi & Autorisasi Role-Based Access Control (RBAC)**:
   - Login, logout, validasi sesi token Sanctum, proteksi rute berdasarkan peran (*Superadmin, Admin, Kepala Sekolah, Guru, Wali Kelas, Siswa*).
2. **Administrasi Sekolah & Manajemen Rombel**:
   - Kuota kelas, pembagian wali kelas, pendaftaran siswa (NIS/NISN), kalender akademik.
3. **Presensi & Jurnal Mengajar Guru**:
   - Presensi harian, perhitungan persentase kehadiran, sistem peringatan dini (EWS), dokumentasi agenda tatap muka.
4. **Kurikulum Merdeka (Fase D SMP)**:
   - Pemetaan Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), dan Kriteria Ketercapaian (KKTP).
   - Penyusunan Modul Ajar lengkap dengan 6 dimensi Profil Pelajar Pancasila.
5. **Bank Soal & Asesmen CBT**:
   - Taksonomi butir soal HOTS/MOTS, pengacakan Fisher-Yates, token ujian, deteksi anti-curang tab switch.
6. **Buku Nilai & Cetak Rapor**:
   - Pembobotan Nilai Akhir (NA), auto-generator deskripsi capaian rapor naratif, layout cetak dokumen resmi.
7. **Gamifikasi & Icebreakers**:
   - Roda putar interaktif (*Spin The Wheel*), multiplayer kuis scoring, timer kelas.

---

## 3. Matriks Pengujian & Skenario Uji

| ID Uji | Fitur | Skenario Uji | Kriteria Keberhasilan |
|---|---|---|---|
| **TC-AUTH-01** | Login Pendidik | Login dengan kredensial valid (`guru_info` / `guru123`) | Mengembalikan status 200, token tersimpan, redirect ke dashboard |
| **TC-AUTH-02** | Proteksi Rute | Mengakses `/cbt` tanpa token autentikasi | Dicegat oleh router guard dan dialihkan ke `/login` |
| **TC-GRADE-01** | Nilai Akhir (NA) | Input Formatif [88, 85, 90], Sumatif [86, 92], SAS 88 | Nilai Akhir tepat 88 dengan pembobotan 40-40-20 |
| **TC-GRADE-02** | Deskripsi Rapor | Nilai $\ge 90$ pada seluruh TP | Menghasilkan deskripsi keunggulan istimewa mandiri |
| **TC-GRADE-03** | Deskripsi Rapor | Variasi nilai TP tinggi (95) dan rendah (65) | Menghasilkan kalimat apresiasi TP 95 dan rekomendasi remedial TP 65 |
| **TC-ATT-01** | Persentase Presensi | Siswa hadir 83 hari dari 84 hari efektif KBM | Menghasilkan tingkat kehadiran 98.8% (Predikat Sangat Rajin) |
| **TC-ATT-02** | Early Warning (EWS) | Siswa hadir $< 85\%$ | Menampilkan badge peringatan "Perhatian Khusus / Rawan Drop Out" |
| **TC-CBT-01** | Pengacakan Soal | Pengacakan Fisher-Yates dengan seed siswa | Urutan nomor soal antar siswa berbeda tanpa butir duplikat |
| **TC-CBT-02** | Deteksi Anti-Curang | Siswa meminimalkan browser sebanyak 3 kali | Sesi otomatis terkunci (*locked*) dan log pelanggaran tercatat |
| **TC-GAME-01** | Skor Kuis Cepat | Jawaban benar dengan sisa waktu 10 dari 15 detik | Menghitung poin: $500 + 500 \times (10/15) = 833$ poin |
| **TC-GAME-02** | Roda Putar | Putar roda dengan rotasi $2160^\circ + 45^\circ$ | Menunjuk nama siswa pada juring sudut $45^\circ$ secara akurat |

---

## 4. Eksekusi Pengujian & Lingkungan Uji

- **Frontend Type Checking & Build**: `vue-tsc -b && vite build`
- **Unit Testing Engine**: Test runner `node:test` dan assertion suite `node:assert/strict`
- **End-to-End Visual Verification**: Browser inspection & responsiveness layout check
