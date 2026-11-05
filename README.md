# 🌟 BELAJARENA — Platform Pembelajaran Digital, Gamifikasi 3D & CBT Sekolah

Selamat datang di **Belajarena**! Platform pembelajaran digital modern dan terlengkap yang dirancang khusus untuk menciptakan pengalaman belajar interaktif, seru, dan bebas hambatan di ruang kelas.

Aplikasi ini menggabungkan **Studio Presentasi Interaktif Real-Time**, **Edu-Games Gamifikasi 3D (Boss Battle, Balapan Kelas, Tower Defense)**, **Ujian Digital CBT Anti-Curang**, **Bank Soal & Rapor Kurikulum Merdeka**, serta **Asisten AI Terintegrasi**.

---

## ⚡ Mengapa Belajarena Dijalankan Secara Localhost / LAN di Sekolah?

Belajarena dirancang dengan arsitektur **Localhost-First & LAN-Optimized** dengan berbagai keunggulan strategis:

1. **Respons 100% Real-Time Tanpa Jeda (Ultra-Low Latency / 0 Delay):**
   Fitur multiplayer game 3D dan sinkronisasi slide presentasi interaktif memerlukan transmisi data sepersekian detik ke puluhan HP siswa sekaligus. Melalui jaringan lokal (LAN/Wi-Fi kelas), respons berjalan instan tanpa terpengaruh kuota lambat atau ping tinggi.
2. **Hemat Biaya — Bebas Biaya Server Cloud Bulanan:**
   Sekolah atau guru tidak perlu membayar biaya sewa VPS/Cloud bulanan yang mahal. Cukup gunakan 1 unit laptop guru sebagai server kelas.
3. **100% Berfungsi Tanpa Kuota Internet (Offline Ready):**
   Seluruh game 3D, kuis, absensi, bank soal, dan ujian CBT tetap berfungsi penuh meskipun jaringan Wi-Fi sekolah sedang tidak memiliki koneksi internet.
4. **Privasi & Keamanan Data Sekolah:**
   Seluruh database nilai siswa, bank soal ujian, dan data profil tersimpan aman secara lokal di laptop/komputer sekolah tanpa risiko kebocoran data di server publik.
5. **Koneksi Internet Fleksibel (Opsional):**
   Jika laptop guru terhubung ke internet, fitur pintar seperti Google Gemini AI dapat aktif secara otomatis.

---

## 💻 Spesifikasi Kebutuhan Sistem (System Requirements)

### 1. Komputer Utama (Laptop Guru / PC Server Sekolah)
- **Sistem Operasi:** Windows 10/11 (64-bit), macOS (Intel/Apple Silicon), atau Linux.
- **Prosesor:** Minimal Intel Core i3 / AMD Ryzen 3 (disarankan Core i5 / Ryzen 5 ke atas).
- **RAM:** Minimal 4 GB (Disarankan 8 GB ke atas agar performa 3D mulus).
- **Perangkat Lunak:** **Node.js LTS (Versi 18.x atau 20.x ke atas)**.
  - Unduh gratis di situs resmi: [https://nodejs.org](https://nodejs.org) (Pilih versi **LTS**).

### 2. Perangkat Siswa (Client)
- **Perangkat:** Smartphone Android, iPhone/iPad, Tablet, Chromebook, atau Laptop Siswa.
- **Aplikasi:** **Cukup Browser Bawaan** (Google Chrome, Safari, Microsoft Edge). Siswa **tidak wajib** menginstal aplikasi apapun!
- *(Opsional)* File `SMPN6Kendari-Siswa.apk` juga telah disertakan di folder utama jika siswa ingin memasang aplikasi Android khusus.

### 3. Jaringan Penghubung Ruang Kelas
- 1 unit Router Wi-Fi / Access Point di kelas, **ATAU** cukup menyalakan **Mobile Hotspot (Tethering)** dari HP atau Laptop Guru.
- *Catatan: Tidak memerlukan kuota internet untuk menghubungkan guru dan siswa!*

---

## 🚀 Panduan Memulai Cepat (Hanya 3 Langkah / 3 Menit)

### Langkah 1: Pasang Node.js
1. Unduh Node.js versi LTS dari [https://nodejs.org](https://nodejs.org).
2. Jalankan file instalasi, klik **Next** hingga selesai (pastikan opsi *"Add to PATH"* tercentang secara default).

### Langkah 2: Ekstrak File Belajarena
Ekstrak paket ZIP Belajarena ke folder di komputer Anda (misalnya di `D:\Belajarena` atau `C:\Belajarena`).

### Langkah 3: Jalankan Aplikasi

#### 🪟 Untuk Pengguna Windows:
- Cukup **klik 2x (double-click)** file:
  ```
  1-KLIK-JALANKAN-WINDOWS.bat
  ```
- *Pada pembukaan pertama kali, sistem akan secara otomatis menyiapkan dependensi dan mengompilasi web (memerlukan waktu 1–2 menit). Setelah itu, browser akan terbuka secara otomatis ke `http://localhost:8000`.*

#### 🍏 Untuk Pengguna macOS / Linux:
- Buka Terminal di dalam folder Belajarena, lalu jalankan perintah:
  ```bash
  ./1-KLIK-JALANKAN-MAC.sh
  ```
- *Browser akan otomatis terbuka menampilkan aplikasi Belajarena.*

---

## 📱 Cara Menghubungkan HP Siswa di Ruang Kelas

1. Pastikan **Laptop Guru** dan **HP seluruh Siswa** tersambung ke nama **Wi-Fi atau Hotspot yang sama**.
2. Saat file launcher dijalankan, terminal hitam akan otomatis mendeteksi dan menampilkan alamat IP lokal laptop Anda, contohnya:
   ```text
   =====================================================================
     🌟 BELAJARENA - PLATFORM PEMBELAJARAN DIGITAL & GAMIFIKASI 🌟
   =====================================================================
     💻 Akses di Komputer Ini (Guru/Admin):
        👉 http://localhost:8000

     📱 Akses Siswa / Perangkat Lain di Jaringan Wi-Fi yang Sama:
        👉 http://192.168.100.245:8000
        (Siswa cukup buka browser di HP dan ketik link di atas)
   =====================================================================
   ```
3. Guru cukup membagikan link IP tersebut ke siswa (misal: ditulis di papan tulis atau ditampilkan di proyektor).
4. Siswa membuka Google Chrome di HP dan mengetik alamat tersebut (misal: `http://192.168.100.245:8000`).
5. Layar **Portal Siswa Belajarena** akan langsung muncul di HP siswa seketika!

---

## 🔑 Akun Login Bawaan (Default Login Credentials)

Sistem telah dilengkapi dengan data demo siap pakai untuk uji coba langsung:

| Tipe Akun | Username / Email | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Pendidik (Guru / Admin)** | `fadly.arsandi@smpn6kendari.sch.id` <br>*(atau ketik `fadly` / `admin`)* | `password` <br>*(atau `123456`)* | Akses penuh: Dashboard, Studio Presentasi, Games, CBT, Rapor, & Pengaturan |
| **Siswa Contoh 1 (Kelas VII A)** | `10527` | `password` <br>*(atau `10527`)* | Abizar (Siswa Kelas VII A) |
| **Siswa Contoh 2** | `24001` | `password` | Akun Siswa Paralel |

> **💡 Tips Personalisasi Sekolah:**
> Anda dapat mengubah nama sekolah, logo, kop surat, data guru, mata pelajaran, dan kata sandi Anda kapan saja melalui menu **Pengaturan Sekolah** dan **Profil Pendidik** di dalam aplikasi.

---

## 🎮 Modul & Fitur Unggulan Belajarena

### 1. 📽️ Studio Presentasi Interaktif Real-Time
- Unggah materi dalam format slide **PDF** atau modul belajar.
- Guru mengontrol perpindahan slide dari laptop, slide di layar HP seluruh siswa akan berpindah secara otomatis dan sinkron (0 lag).
- Fitur **Live Voting & Kuis Spontan** di tengah-tengah penjelasan materi untuk menguji pemahaman siswa seketika.

### 2. ⚔️ Edu-Games Gamifikasi 3D (Ulangan Harian Seru)
- **Boss Battle 3D:** Siswa bekerja sama sebagai satu kelas melawan monster Boss 3D. Setiap jawaban benar akan melancarkan serangan sihir/pedang ke Boss, sedangkan jawaban salah akan mengurangi pertahanan kelas!
- **Balapan Kelas (Class Race):** Kompetisi antar regu/kelompok. Kelompok yang paling cepat dan tepat menjawab soal akan melajukan mobil balapnya ke garis finish.
- **Pertahanan Markas (Tower Defense):** Siswa mendirikan dan meningkatkan level menara panah/meriam dengan menjawab soal matematika/sains/komputer.

### 3. 📝 CBT Ujian Digital & Bank Soal Komprehensif
- Mendukung soal pilihan ganda, benar/salah, esai, dan soal bergambar/rumus.
- Timer ujian otomatis, proteksi deteksi pindah tab (anti-curang), dan pengacakan urutan soal serta pilihan jawaban.
- Nilai langsung keluar seketika dan dapat diekspor ke format Excel (`.xlsx`).

### 4. 🤖 Asisten AI Pedagogis (AI Chatbot)
- Mode offline internal yang menguasai seluruh panduan, navigasi, dan petunjuk teknis Belajarena.
- Terintegrasi dengan **Google Gemini API** (opsional) untuk pembuatan kisi-kisi soal otomatis, modul ajar, dan penjelasan materi interaktif.

### 5. 📊 Pusat Akademik & Kurikulum Merdeka
- Mapping Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP).
- Rekap absensi bulanan siswa dan jurnal mengajar guru digital.

---

## 🛠️ Panduan Mode Pengembang (Developer Dev Mode)

Jika Anda adalah seorang programmer yang ingin memodifikasi kode sumber atau menambah fitur baru dengan fitur **Vite Hot-Module Replacement (HMR)**:
- **Windows:** Jalankan file `DEV-MODE-WINDOWS.bat`.
- **macOS / Linux:** Jalankan script `./start-dev.sh`.
- Mode ini akan mengaktifkan Backend API di port `8000` dan Vite Dev Server di port `5173`.

---

## ❓ Solusi Masalah Umum (FAQ & Troubleshooting)

### Q1: HP Siswa tidak bisa membuka link IP (Muncul pesan *"Situs tidak dapat dijangkau"* / Loading lama)?
**Jawaban:**
1. Pastikan Laptop Guru dan HP Siswa benar-benar tersambung ke Wi-Fi / Hotspot yang sama.
2. **Periksa Windows Defender Firewall:**
   - Buka *Control Panel* -> *Windows Defender Firewall* -> *Allow an app or feature through Windows Defender Firewall*.
   - Cari program **Node.js**, lalu pastikan kedua centang (**Private** dan **Public**) dalam kondisi **aktif/tercentang**.
3. **Periksa Pengaturan Router Wi-Fi:**
   - Beberapa router kantor/sekolah memiliki fitur keamanan bernama *"AP Isolation"* atau *"Client Isolation"*. Pastikan fitur tersebut dinonaktifkan di pengaturan router agar perangkat di jaringan Wi-Fi bisa saling berkomunikasi.

### Q2: Perintah `node` atau `npm` tidak dikenali saat menjalankan file BAT di Windows?
**Jawaban:**
Artinya Node.js belum terpasang atau opsi *Environment PATH* belum aktif. Silakan pasang ulang Node.js dari [https://nodejs.org](https://nodejs.org), dan pastikan komputer di-*restart* sekali setelah instalasi selesai.

### Q3: Bagaimana cara mengganti Google Gemini API Key untuk AI Chatbot?
**Jawaban:**
Buka file `.env` di folder utama aplikasi, lalu masukkan API Key Anda:
```env
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
```
Simpan file, lalu restart server Belajarena.

---

## 📄 Lisensi & Hak Penggunaan
Paket ini disiapkan secara lengkap untuk pembeli resmi. Anda berhak menggunakannya di sekolah atau institusi pendidikan Anda, menyesuaikan data sekolah, mata pelajaran, serta logo sesuai kebutuhan.

*Dibuat dengan ❤️ untuk kemajuan pendidikan digital Indonesia.*
