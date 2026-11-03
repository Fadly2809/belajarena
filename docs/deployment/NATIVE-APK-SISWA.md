# Panduan Pembuatan & Penggunaan Native APK Siswa (SMP Negeri 6 Kendari)

Dokumen ini menjelaskan arsitektur, cara kerja, dan instruksi build **Aplikasi Native APK Siswa SMPN 6 Kendari** berbasis Capacitor & Vue 3.

---

## 1. Arsitektur & Sinkronisasi Database
Aplikasi Native Siswa terhubung langsung ke Backend API Akademi Guru Digital (`http://localhost:8000/api/v1` atau IP Server Sekolah):
1. **Profil Siswa**:
   - Terintegrasi dengan master data siswa di menu guru.
   - Siswa dapat memperbarui nomor WhatsApp, kontak orang tua/wali, alamat rumah, dan kata sandi. Perubahan ini langsung tercermin di halaman guru dan database sekolah.
2. **Tugas & Penilaian**:
   - Siswa melihat tugas yang diberikan guru untuk rombel kelasnya.
   - Siswa dapat mengumpulkan tugas (jawaban teks atau tautan dokumen Google Drive/Canva).
   - Guru menilai di Web Guru, dan nilai serta umpan balik langsung tampil di aplikasi siswa.
3. **Live Ranking (Peringkat Kelas)**:
   - Peringkat langsung kelas VII A dihitung otomatis dari akumulasi skor tugas, kuis, dan ujian.
4. **Rapor Nilai Siswa Pribadi**:
   - Rincian nilai Capaian Pembelajaran Kurikulum Merdeka (TP 1, TP 2, STS, SAS, dan Nilai Akhir) beserta predikat ketuntasan.
5. **Riwayat Ujian CBT & Boss Battle**:
   - Catatan pengerjaan CBT dan ulangan gamifikasi boss battle.
6. **Materi Presentasi Mandiri**:
   - Siswa dapat membuka dan membaca ulang slide-slide presentasi yang pernah dibawakan oleh guru di kelas.

---

## 2. Fitur Otomatis Live Broadcast (Auto-Open / Instant Trigger)
Aplikasi APK Siswa dilengkapi dengan **Live Heartbeat Dispatcher**:
* Aplikasi memeriksa status pembelajaran aktif dari guru setiap 3 detik.
* **Ketika Guru Memulai**:
  1. **Presentasi Interaktif**: APK siswa otomatis menampilkan notifikasi dan langsung membuka layar slide interaktif (`StudentPresentationView`) tanpa siswa perlu mencari tautan atau memasukkan kode.
  2. **Ulangan Harian Gamifikasi (Boss Battle)**: APK siswa otomatis membuka arena pertempuran (`StudentBattlePage`).
  3. **Ujian Digital CBT**: APK siswa langsung memuat lembar kerja ujian CBT (`StudentExamPage`) dengan waktu hitung mundur yang berjalan otomatis.
* **Tanpa Klik**: Siswa yang terdaftar pada rombel kelas langsung masuk ke sesi ujian atau pembelajaran secara sinkron.

---

## 3. Cara Membangun (Build) File APK Android

### Prasyarat
- Node.js versi 18+ atau 20+
- Java JDK 17
- Android Studio / Android SDK (opsional jika menggunakan command line Gradle)

### Langkah Cepat Menghasilkan File APK

1. **Sinkronisasi Kode Web ke Project Android**:
   ```bash
   cd apps/web
   npm run build:apk
   ```
   Perintah ini akan mengompilasi kode Vue frontend ke `dist/` dan menyalin seluruh aset ke direktori `android/app/src/main/assets/public`.

2. **Build Debug APK via Gradle**:
   ```bash
   cd apps/web/android
   ./gradlew assembleDebug
   ```
   File APK siap pakai akan terbentuk di:
   `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`

3. **Membuka Project di Android Studio (Opsional untuk Generate Signed Release APK)**:
   ```bash
   cd apps/web
   npm run open:android
   ```
   Di Android Studio:
   * Pilih menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   * File APK siap disalin dan diinstal di seluruh smartphone Android siswa.

---

## 4. Mode PWA (Progressive Web App) Tanpa Perlu Install APK
Aplikasi siswa juga mendukung standar **Progressive Web App (PWA)**:
* Siswa cukup membuka alamat portal siswa (contoh `http://ip-sekolah:5173/student`) melalui Google Chrome di Android atau Safari di iOS.
* Klik tombol **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
* Ikon aplikasi SMPN 6 Kendari akan muncul di layar beranda ponsel dan berfungsi layaknya aplikasi native Android/iOS.
