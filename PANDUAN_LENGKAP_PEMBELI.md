# 📘 BUKU PANDUAN PENGGUNAAN BELAJARENA (UNTUK PEMBELI & GURU)

Panduan praktis langkah demi langkah untuk mengoperasikan platform **Belajarena** secara mandiri di ruang kelas menggunakan mode **Localhost & Wi-Fi LAN**.

---

## DAFTAR ISI
1. [Prinsip Kerja Belajarena di Ruang Kelas](#1-prinsip-kerja-belajarena-di-ruang-kelas)
2. [Persiapan Alat Sebelum Mengajar](#2-persiapan-alat-sebelum-mengajar)
3. [Menjalankan Aplikasi (1-Klik Siap)](#3-menjalankan-aplikasi-1-klik-siap)
4. [Menghubungkan Perangkat Siswa (Tanpa Kuota Internet)](#4-menghubungkan-perangkat-siswa-tanpa-kuota-internet)
5. [Panduan Menggunakan Studio Presentasi Interaktif](#5-panduan-menggunakan-studio-presentasi-interaktif)
6. [Panduan Menggelar Ulangan Gamifikasi 3D (Edu-Games)](#6-panduan-menggelar-ulangan-gamifikasi-3d-edu-games)
7. [Panduan Ujian Digital CBT & Rekap Nilai Otomatis](#7-panduan-ujian-digital-cbt--rekap-nilai-otomatis)
8. [Panduan Asisten AI Belajarena](#8-panduan-asisten-ai-belajarena)
9. [Tips Mengatasi Masalah Teknis di Kelas (Troubleshooting)](#9-tips-mengatasi-masalah-teknis-di-kelas-troubleshooting)

---

## 1. Prinsip Kerja Belajarena di Ruang Kelas

Belajarena bekerja dengan konsep **Local Classroom Cloud Server**:
- **Laptop Guru** bertindak sebagai **Pusat Server & Pengendali Kelas**.
- **Wi-Fi Kelas / Hotspot HP** bertindak sebagai **Jalan Tol Komunikasi Data**.
- **HP Siswa** bertindak sebagai **Layar Interaktif Siswa** (untuk melihat slide guru, menjawab kuis realtime, dan bermain game 3D bersama).

> **💡 PENTING:** 
> Karena semua data berjalan di jaringan lokal (LAN) antara laptop dan HP siswa, **TIDAK DIBUTUHKAN KUOTA INTERNET** untuk menjalankan presentasi, kuis, dan game 3D. Kecepatan responnya instan (0 detik jeda), bebas lagging, dan tidak akan terputus walau sinyal provider sedang buruk.

---

## 2. Persiapan Alat Sebelum Mengajar

Sebelum kelas dimulai, siapkan 3 hal sederhana berikut:
1. **1 unit Laptop Guru** yang sudah terpasang Node.js LTS ([Unduh di https://nodejs.org](https://nodejs.org)).
2. **1 unit Router Wi-Fi** di kelas (atau cukup nyalakan **Tethering Hotspot** dari HP Guru/Laptop).
3. **Proyektor / Smart TV Kelas** (opsional tapi sangat disarankan untuk menampilkan layar pertempuran Boss Battle atau slide presentasi).

---

## 3. Menjalankan Aplikasi (1-Klik Siap)

1. Buka folder `Belajarena` di laptop Anda.
2. **Pengguna Windows:** Klik ganda (double click) file:
   ```
   1-KLIK-JALANKAN-WINDOWS.bat
   ```
   *(Untuk macOS/Linux: jalankan `./1-KLIK-JALANKAN-MAC.sh`)*.
3. Jendela hitam (Terminal) akan muncul dan menjalankan server.
4. Dalam 2–3 detik, browser laptop Anda akan otomatis membuka halaman login Belajarena:
   - **Alamat Local:** `http://localhost:8000`
   - **Email Login:** `fadly.arsandi@smpn6kendari.sch.id` (atau ketik `fadly` / `admin`)
   - **Password:** `password` (atau `123456`)

---

## 4. Menghubungkan Perangkat Siswa (Tanpa Kuota Internet)

1. Minta seluruh siswa untuk mengaktifkan Wi-Fi di HP masing-masing dan tersambung ke **nama Wi-Fi/Hotspot yang sama dengan laptop guru**.
2. Lihat alamat IP yang tertera di jendela hitam terminal laptop guru, misalnya:
   ```
   📱 Akses Siswa: http://192.168.100.245:8000
   ```
3. Minta siswa membuka aplikasi browser di HP mereka (**Google Chrome**, **Safari**, atau **Samsung Internet**).
4. Siswa mengetik alamat IP tersebut di kolom URL browser.
5. Siswa login menggunakan NIS masing-masing (Contoh akun uji coba: NIS `10527`, kata sandi: `password`).
6. Siswa langsung masuk ke **Portal Siswa Belajarena**.

---

## 5. Panduan Menggunakan Studio Presentasi Interaktif

1. Di menu sidebar kiri, klik **Studio Presentasi**.
2. Klik tombol **+ Buat / Unggah Materi**.
3. Beri judul materi dan unggah dokumen slide Anda (Mendukung file **PDF** atau file presentasi Anda).
4. Centang kelas sasaran (misal: *Kelas VII A*), lalu klik **Simpan & Konversi**.
5. Klik **Mulai Sesi Live** pada materi tersebut:
   - Layar guru akan menampilkan remote pengendali slide (Next/Prev, Laser pointer, Live Voting).
   - Layar seluruh HP siswa yang sedang membuka portal akan **otomatis menampilkan slide presentasi Anda secara serentak**.
6. **Membuat Kuis / Voting Spontan di Tengah Slide:**
   - Di panel guru, klik **Buat Kuis Spontan** (pilih format: Pilihan Ganda A/B/C/D atau Voting Opini).
   - Pertanyaan akan langsung muncul di HP seluruh siswa.
   - Hasil jawaban siswa langsung terakumulasi dalam bentuk diagram batang realtime di layar proyektor guru!

---

## 6. Panduan Menggelar Ulangan Gamifikasi 3D (Edu-Games)

Inilah fitur paling disukai siswa yang membuat ulangan harian tidak lagi menegangkan!

### 👹 Mode 1: Boss Battle 3D (Kerja Sama Seluruh Kelas)
1. Buka menu **Games Pembelajaran** -> Pilih **Ulangan Harian Gamifikasi (Boss Battle)**.
2. Pilih Bank Soal yang ingin diujikan (misal: 10 butir soal).
3. Pilih Monster Boss 3D (Golem Batu, Naga Api, atau Monster Siber).
4. Klik **Buka Arena & Mulai Sesi**.
5. Sambungkan laptop guru ke Proyektor kelas untuk menampilkan Arena 3D!
6. Di HP seluruh siswa, otomatis muncul notifikasi *"Pertempuran Boss Dimulai!"*.
7. **Aturan Permainan:**
   - Siswa menjawab soal ulangan satu per satu di HP masing-masing.
   - Setiap siswa menjawab BENAR, karakter chibi siswa melancarkan serangan sihir/pedang yang mengurangi HP Boss!
   - Jika siswa menjawab SALAH, Boss melancarkan serangan balasan yang mengurangi perisai kelas.
   - Kelas menang jika HP Boss berhasil dihabiskan sebelum waktu habis!
   - Nilai individu masing-masing siswa otomatis terekam ke buku nilai.

### 🏎️ Mode 2: Balapan Kelas (Class Race)
- Siswa dibagi otomatis ke dalam 4 kelompok (Tim Merah, Biru, Hijau, Kuning).
- Setiap jawaban benar dari anggota kelompok memajukan mobil balap tim menuju garis finish.

### 🏰 Mode 3: Pertahanan Markas (Tower Defense)
- Siswa mempertahankan kastil dari gelombang monster dengan mendirikan menara pertahanan melalui perolehan koin dari jawaban soal yang benar.

---

## 7. Panduan Ujian Digital CBT & Rekap Nilai Otomatis

1. Buka menu **CBT - Ujian Digital** -> Klik **+ Buat Ujian**.
2. Masukkan nama ujian (misal: *Sumatif Tengah Semester Informatika*), tentukan durasi waktu (misal: 60 menit), dan pilih bank soal.
3. Aktifkan fitur proteksi anti-curang:
   - Acak Urutan Soal: **Aktif**
   - Acak Pilihan Ganda: **Aktif**
   - Deteksi Pindah Tab (Kunci Layar): **Aktif**
4. Klik **Aktifkan Ujian**. Siswa di portal siswa akan melihat tombol ujian menyala.
5. Saat siswa selesai mengerjakan, klik menu **Hasil & Rekap Nilai**:
   - Seluruh nilai siswa otomatis terhitung beserta analisis butir soal.
   - Klik tombol **Export ke Excel (.xlsx)** untuk langsung mengunduh format rapor sekolah.

---

## 8. Panduan Asisten AI Belajarena

Belajarena dilengkapi asisten kecerdasan artifisial yang dapat diakses melalui tombol mengambang di pojok kanan bawah:
- **Mode Bawaan (Offline):** Mampu menjawab seluruh pertanyaan seputar fitur, cara membuat soal, dan kurikulum tanpa perlu koneksi internet.
- **Mode Google Gemini (Online):** Jika laptop guru tersambung ke internet dan API Key Google telah diisi pada file `.env`, AI dapat:
  - Membuatkan 10 butir soal HOTS otomatis sesuai topik materi pelajaran Anda.
  - Membuatkan rangkuman dan rubrik penilaian Kurikulum Merdeka.
  - Menjelaskan konsep pelajaran yang sulit kepada siswa dengan gaya bahasa ramah anak.

---

## 9. Tips Mengatasi Masalah Teknis di Kelas (Troubleshooting)

### Kendala 1: HP Siswa tidak bisa membuka link IP (Loading terus / "This site can't be reached")
1. **Paling Sering Terjadi:** Laptop Guru dan HP Siswa tersambung ke Wi-Fi yang berbeda. Pastikan keduanya tersambung ke Wi-Fi yang persis sama.
2. **Pengaturan Firewall Windows:**
   - Buka *Windows Defender Firewall* di laptop guru.
   - Klik *Allow an app through firewall*.
   - Cari **Node.js JavaScript Runtime**, pastikan centang **Private** dan **Public** keduanya tercentang.
3. **Pengaturan Router (AP Isolation):**
   - Pastikan router Wi-Fi kelas tidak mengaktifkan fitur *"AP Isolation / Client Isolation"*. Jika aktif, matikan fitur tersebut di dashboard router agar sesama perangkat Wi-Fi diizinkan saling terhubung.

### Kendala 2: Layar HP Siswa terkunci atau tidak sinkron
- Minta siswa melakukan *Refresh* (tarik ke bawah layar browser HP mereka). Sistem sinkronisasi otomatis akan langsung mendeteksi ulang sesi aktif dalam 1 detik.

### Kendala 3: Ingin mengganti nama sekolah, logo, dan nama guru
- Klik ikon foto profil di pojok kanan atas -> **Profil Guru**.
- Klik menu **Pengaturan Sekolah** di sidebar kiri untuk mengganti Nama Sekolah, NPSN, Kepala Sekolah, dan mengunggah logo sekolah baru.

---

*Selamat mengajar dengan Belajarena! Ciptakan suasana kelas digital yang hidup, interaktif, dan penuh semangat!*

