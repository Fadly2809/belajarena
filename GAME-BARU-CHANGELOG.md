# GAME-BARU-CHANGELOG.md — Belajarena v2 (Class Race & Tower Defense)

Dokumen ini mencatat seluruh perubahan, penambahan file, endpoint baru, penghapusan fitur usang, serta kepatuhan aturan integritas pada rilis Belajarena v2: **Penambahan Class Race ("Balapan Kelas"), Tower Defense Kelas ("Pertahanan Markas"), dan Pembersihan Game Usang**.

---

## 1. Ringkasan Eksekutif

Belajarena kini dilengkapi dengan dua mode permainan kuis kooperatif & kompetitif baru berbasis bank soal:
1. **Class Race ("Balapan Kelas")** [Fase A]: Kuis balapan tim interaktif (4–5 tim seimbang) berdurasi 5–8 menit yang diproyeksikan ke layar kelas. Siswa menjawab di smartphone masing-masing untuk memajukan mobil balap timnya berdasarkan kecepatan dan ketepatan.
2. **Tower Defense Kelas ("Pertahanan Markas")** [Fase B]: Permainan kooperatif satu kelas berdurasi 10–15 menit untuk mempertahankan markas dari 5 gelombang musuh (Minion, Runner, Tank, Boss). Guru bertindak sebagai *Commander* menara taktis, sementara seluruh siswa bertindak sebagai penyedia *Class Coins* dan *Attack Speed Buff* melalui jawaban kuis yang tepat.
3. **Pembersihan Game Usang** [Fase C]: Modul *Word Scramble* dan *Flashcards* dihentikan dengan status HTTP `410 Gone`. Riwayat sesi masa lalu di `database.json` tetap terbaca aman dengan label arsip. Katalog permainan aktif kini terstandarisasi menjadi 5 game unggulan.

---

## 2. Kepatuhan Aturan Wajib (W1 s/d W7)

| Aturan | Implementasi & Kepatuhan |
|---|---|
| **W1. Penilaian HANYA di Server** | Endpoint `POST /api/v1/ulangan-gamifikasi/sessions/:id/answer` sepenuhnya mengabaikan field `is_correct` dari client. Evaluasi benar/salah dilakukan mandiri di `server.mjs` dengan mencocokkan `option_index` terhadap kunci soal yang tersimpan di server. |
| **W2. Kunci Jawaban Tidak Bocor ke Siswa** | Fungsi `sanitizeQuestionForStudent()` di `server.mjs` menghapus field `correctIndex`, `correct_index`, `answer_index`, `key`, `kunci`, dan `kunci_jawaban` sebelum dikirim ke siswa pada polling maupun state endpoint. |
| **W3. Autentikasi & Otorisasi Ketat** | Semua endpoint manajemen sesi (`teams`, `towers`, `wave/start`, `round/next`, `start`, `finish`) mewajibkan token guru. Siswa hanya dapat menjawab dengan token & `participant_id` miliknya sendiri. Sesi yang tidak ada menghasilkan `404 Not Found` (tanpa sesi/peserta bayangan). |
| **W4. Batas Waktu Server** | Durasi ronde balapan dan durasi gelombang musuh dihitung dari `server_round_ends_at` dan `server_wave_ends_at`. Jawaban siswa yang masuk setelah waktu server terlewati ditolak dengan jelas. |
| **W5. Idempotensi Jawaban** | Client mengirim `client_event_id` unik. Server memeriksa riwayat event dan mengabaikan pengiriman berulang akibat koneksi Wi-Fi yang tersendat tanpa mengubah skor/koin dua kali. |
| **W6. Penulisan Database Atomik** | Pembaruan data sesi pada `database.json` tetap menggunakan mekanisme penulisan berkas sementara (`database.json.tmp`), `fs.fsyncSync`, dan `fs.renameSync` untuk mencegah korupsi data. |
| **W7. Test Otomatis & Kompatibilitas Mundur** | Seluruh 60 test lama tetap lulus 100%, ditambah 3 test suite baru (`class-race.test.mjs`, `tower-defense.test.mjs`, `fase-c-verification.test.mjs`). Total 63/63 skenario pengujian runner berstatus LULUS. |

---

## 3. Berkas yang Dibuat (New Files)

### Frontend (`apps/web/`)
1. [`apps/web/src/modules/games/classRace/ClassRaceArenaPage.vue`](file:///Users/apple/Project/apps/web/src/modules/games/classRace/ClassRaceArenaPage.vue)
   - Tampilan proyektor resolusi tinggi untuk layar depan kelas.
   - Visual lintasan 4–5 mobil balap berwarna (Merah, Biru, Hijau, Kuning, Ungu) dengan transisi mulus CSS, garis meter, dan bendera finis.
   - Efek visual Turbo Flame saat tim mencapai streak $\ge 3$ ronde dengan akurasi $\ge 80\%$.
   - Kartu soal besar, pengukur waktu mundur server, papan peringkat langsung, dan panggung perayaan podium juara (1st, 2nd, 3rd) dengan confetti.
2. [`apps/web/src/modules/games/classRace/StudentRacePage.vue`](file:///Users/apple/Project/apps/web/src/modules/games/classRace/StudentRacePage.vue)
   - Antarmuka ramah sentuh untuk smartphone siswa.
   - Indikator tim siswa (nama dan warna), posisi klasemen tim saat ini, dan status turbo tim.
   - Pilihan ganda 4 opsi touch-friendly, deteksi batas waktu server, feedback instan benar/salah, dan layar tunggu ronde berikutnya.
3. [`apps/web/src/modules/games/towerDefense/TowerDefenseArenaPage.vue`](file:///Users/apple/Project/apps/web/src/modules/games/towerDefense/TowerDefenseArenaPage.vue)
   - Arena proyektor dengan peta jalur musuh berbentuk lengkungan S (*S-curve*) dan kastil markas kelas di ujung jalur.
   - 8 slot taktis pembangunan menara dengan modal pop-up interaktif untuk guru: Bangun (Archer, Cannon, Magic, Catapult), Upgrade Level 2–3, dan Jual menara (refund 70%).
   - Tampilan musuh bergerak (Minion, Runner, Tank, Boss) lengkap dengan bar HP musuh.
   - Efek layar kilat "Serangan Gabungan Kelas" saat siswa mencapai 10 jawaban benar berturut-turut.
   - Indikator Class Coins, Base HP, Wave Tracker, dan tombol Mulai Gelombang.
4. [`apps/web/src/modules/games/towerDefense/StudentTowerDefensePage.vue`](file:///Users/apple/Project/apps/web/src/modules/games/towerDefense/StudentTowerDefensePage.vue)
   - Antarmuka HP siswa dengan status kastil markas (Base HP) dan saldo koin kelas (*Class Coins*).
   - Penghitung kontribusi koin pribadi siswa.
   - Notifikasi peringatan darurat berkedip merah saat Base HP $\le 30\%$.
   - Kartu soal interaktif dengan umpan balik instan dari server saat jawaban dinilai.

### Backend Tests (`tests/`)
1. [`tests/class-race.test.mjs`](file:///Users/apple/Project/tests/class-race.test.mjs)
   - Pengujian otomatis alur Class Race: autentikasi, pembagian tim seimbang, perpindahan anggota oleh guru, pembersihan kunci jawaban dari klien siswa (W2), formula pergerakan kecepatan/akurasi, turbo boost, idempotensi event, dan garis finis.
2. [`tests/tower-defense.test.mjs`](file:///Users/apple/Project/tests/tower-defense.test.mjs)
   - Pengujian otomatis alur Tower Defense: autentikasi, penempatan menara, upgrade & refund menara, pergerakan gelombang musuh, perolehan koin & attack speed buff dari jawaban benar, idempotensi jawaban, serangan gabungan kelas 10-streak, dan kemenangan kelas.
3. [`tests/fase-c-verification.test.mjs`](file:///Users/apple/Project/tests/fase-c-verification.test.mjs)
   - Pengujian penghentian game usang: endpoint khusus membalas HTTP 410 Gone, penolakan pembuatan sesi baru dengan mode usang, serta verifikasi bahwa riwayat sesi lama di `database.json` tetap terbaca.

---

## 4. Berkas yang Diubah (Modified Files)

1. [`apps/api/server.mjs`](file:///Users/apple/Project/apps/api/server.mjs)
   - **Model Data Sesi:** Penambahan properti `game_type` (`final-boss`, `class-race`, `tower-defense`), spesifikasi tim, state menara, gelombang musuh, dan koin kelas pada `presentUhgSession()`.
   - **Class Race Engine:** Implementasi `createBalancedTeams()`, `evaluateAndAdvanceRaceRound()`, formula pergerakan:
     $$\text{step} = \left(\frac{\text{correctAnswers}}{\text{activeMembers}}\right) \times 40\text{m} \times \text{speedFactor}$$
     serta mekanisme Turbo Streak.
   - **Tower Defense Engine:** Definisi titik koordinat jalur `TD_WAYPOINTS` (11 waypoint), 8 slot menara `TD_DEFAULT_SLOTS`, konfigurasi tipe menara & musuh, dan loop simulasi `simulateTowerDefenseTick()`.
   - **State Sanitization (W2):** `getRaceStateForClient()` dan `getTowerDefenseStateForClient()` menyaring seluruh metadata kunci jawaban untuk siswa.
   - **Pemberitahuan Waktu Nyata:** Handler `GET /api/v1/student/live-broadcast` menyertakan URL redirect dinamis ke `/games/class-race/play/:id` atau `/games/tower-defense/play/:id`.
   - **Endpoint 410 Gone:** Handler rute untuk URL game usang `/api/v1/games/word-scramble*` dan `/api/v1/games/flashcards*`.
2. [`apps/web/src/app/router/index.ts`](file:///Users/apple/Project/apps/web/src/app/router/index.ts)
   - Menambahkan rute `/games/class-race/arena/:id` dan `/games/class-race/play/:id`.
   - Menambahkan rute `/games/tower-defense/arena/:id` dan `/games/tower-defense/play/:id`.
   - Memasukkan rute siswa baru ke dalam whitelist `isStudentAllowed` pada navigation guard.
3. [`apps/web/src/modules/games/GamesPage.vue`](file:///Users/apple/Project/apps/web/src/modules/games/GamesPage.vue)
   - Memperbarui katalog game aktif guru menjadi 5 game resmi (Final Boss Battle, Class Race, Tower Defense, Fast Quiz, Memory Match).
   - Menambahkan dukungan navigasi langsung ke arena Class Race dan Tower Defense saat sesi dibuat.
   - Menjaga keterbacaan riwayat sesi lama dengan label "(Arsip)" untuk Word Scramble & Flashcards.
4. [`docs/IMPLEMENTATION-STATUS.md`](file:///Users/apple/Project/docs/IMPLEMENTATION-STATUS.md)
   - Memperbarui metrik pengujian menjadi 63/63 lulus pada 11 berkas test suite.
   - Mendokumentasikan arsitektur dan status Fase A, B, dan C.

---

## 5. Rincian Endpoint Baru & Perubahan API

### Grup Endpoint Gamifikasi (`/api/v1/ulangan-gamifikasi`)

| Method | Endpoint | Hak Akses | Keterangan |
|---|---|---|---|
| `PATCH` / `PUT` | `/sessions/:id/teams` | Guru | Mengatur anggota tim (pindah tim), mengganti nama, atau warna tim sebelum sesi balapan dimulai. |
| `GET` | `/sessions/:id/state` | Guru / Siswa | Mengambil state sinkronisasi game realtime. Payload disanitasi otomatis: guru menerima kunci jawaban, siswa menerima soal tanpa kunci (W2). |
| `POST` | `/sessions/:id/round/next` | Guru | Mengakhiri ronde balapan saat ini dan memajukan tim ke ronde berikutnya. |
| `POST` | `/sessions/:id/towers` | Guru | Membangun menara baru (`action: "build"`), upgrade menara (`action: "upgrade"`), atau menjual menara (`action: "sell"`). |
| `POST` | `/sessions/:id/wave/start` | Guru | Memulai gelombang serangan musuh berikutnya pada Tower Defense. |

### Endpoint Game Usang (Arsip)

| Method | Endpoint | Status | Keterangan |
|---|---|---|---|
| `ALL` | `/api/v1/games/word-scramble*` | `410 Gone` | Game telah digantikan oleh Class Race & Tower Defense. |
| `ALL` | `/api/v1/games/flashcards*` | `410 Gone` | Game telah digantikan oleh Class Race & Tower Defense. |

---

## 6. Hasil Verifikasi & Uji Kualitas

1. **Pengujian Unit & Integrasi Backend:**
   - Perintah: `export PATH="/Users/apple/.nvm/versions/node/v20.20.2/bin:$PATH" && npx tsx --test tests/*.test.mjs`
   - Hasil: **63/63 PASS (100%), 0 Fail, 0 Skipped** (Durasi: ~13.8s).
2. **Kompilasi & Build Frontend:**
   - Perintah: `cd apps/web && npm run build`
   - Hasil: **Build Succeeded** tanpa error tipe TypeScript (`vue-tsc` lolos bersih, bundle Vite terkompresi).
3. **Integritas Data Produksi:**
   - Berkas cadangan pra-rilis tersimpan aman di `apps/api/database/database.backup-sebelum-game-baru.json`.
   - 217 data siswa produksi tetap utuh dan kompatibel 100%.

---

## 7. Peningkatan Visual 3D (Three.js Low-Poly Diorama Engine)

Pada pembaruan ini, tampilan arena proyektor untuk **Class Race** dan **Tower Defense Kelas** ditingkatkan menjadi grafis 3D low-poly yang dinamis dan berkelas, tanpa membebani laptop guru maupun HP siswa.

### 7.1 Dependensi Baru
- `three` (`^0.187.0`) — Pustaka grafis 3D WebGL.
- `@types/three` (`^0.187.0`) — Definisi tipe TypeScript untuk Three.js.

### 7.2 Fondasi & Prinsip Desain 3D
1. **Target 60 FPS di Laptop Guru Standar:**
   - Resolusi dibatasi `pixelRatio` maksimum 1.5 (`Math.min(window.devicePixelRatio, 1.5)`).
   - Maksimal 2 sumber cahaya dalam satu scene (1 Directional Light bersudut dengan bayangan lembut + 1 Hemisphere Light langit/tanah).
   - Penggunaan material hemat daya (`MeshLambertMaterial` dan `MeshBasicMaterial`).
   - Sistem degradasi otomatis: jika FPS berada di bawah 45 selama 3 detik berturut-turut, bayangan otomatis dinonaktifkan dan resolusi diturunkan ke 1.0.
2. **Geometri Prosedural Penuh:**
   - Semua aset 3D (mobil balap, pepohonan, tribun, jalan, menara pertahanan, robot musuh, benteng server) dibuat dari kombinasi geometri dasar (Box, Cylinder, Sphere, Cone, Ring, Torus) tanpa mengunduh berkas model 3D (GLTF/FBX) atau tekstur besar.
3. **Pooling Objek & Partikel Hemat:**
   - Proyektil laser, roket, dan pecahan kubus musuh menggunakan `ObjectPool` dan `FrugalParticleSystem` yang dibatasi maksimal 500 partikel serentak untuk mencegah alokasi memori berulang (bebas kebocoran memori).
4. **HP Siswa Tetap 100% Ringan:**
   - Halaman siswa (`StudentRacePage.vue` dan `StudentTowerDefensePage.vue`) **tidak memakai WebGL/3D berat**. Siswa menjawab soal kuis di smartphone dengan antarmuka CSS responsif dan cepat tanpa lag.
5. **Aksesibilitas & Fallback Wajib:**
   - Seluruh indikator kritis (peringkat, nomor ronde, hitung mundur, HP markas, saldo koin, soal) tetap disajikan sebagai teks HTML yang terbaca jelas di atas/di samping canvas 3D.
   - Fitur deteksi otomatis WebGL (`WebGLDetector.ts`). Jika WebGL tidak didukung atau dinonaktifkan di browser, arena otomatis beralih ke Mode 2D.
   - Tersedia tombol **"Mode Ringan (2D)"** di pojok atas arena proyektor bagi guru yang ingin menggunakan tampilan 2D sederhana untuk menghemat baterai laptop.

### 7.3 Berkas 3D yang Dibuat
- [`apps/web/src/game3d/core/WebGLDetector.ts`](file:///Users/apple/Project/apps/web/src/game3d/core/WebGLDetector.ts) — Deteksi dukungan WebGL pada perangkat klien.
- [`apps/web/src/game3d/core/ThreeEngine.ts`](file:///Users/apple/Project/apps/web/src/game3d/core/ThreeEngine.ts) — Inisialisasi Three.js, manajemen scene/kamera/renderer, loop render, pemantau FPS, dan degradasi adaptif.
- [`apps/web/src/game3d/core/ObjectPool.ts`](file:///Users/apple/Project/apps/web/src/game3d/core/ObjectPool.ts) — Object pooling untuk proyektil dan partikel hemat poligon.
- [`apps/web/src/game3d/core/TextSprite.ts`](file:///Users/apple/Project/apps/web/src/game3d/core/TextSprite.ts) — Dynamic canvas sprite 2D billboard untuk label mobil balap, bar HP musuh, dan markas.
- [`apps/web/src/game3d/core/DioramaEnvironment.ts`](file:///Users/apple/Project/apps/web/src/game3d/core/DioramaEnvironment.ts) — Panggung pulau melayang, awan kubus low-poly, dan kabut langit bernuansa Belajarena.
- [`apps/web/src/game3d/classRace/ClassRace3DScene.ts`](file:///Users/apple/Project/apps/web/src/game3d/classRace/ClassRace3DScene.ts) — Scene sirkuit balapan 3D, mobil balap prosedural, follow-cam, turbo streak, lampu start 3D, pita finis, dan panggung podium 3 tingkat dengan confetti.
- [`apps/web/src/game3d/components/ClassRace3DArena.vue`](file:///Users/apple/Project/apps/web/src/game3d/components/ClassRace3DArena.vue) — Komponen Vue arena balapan 3D dengan overlay HUD dan tombol toggle 2D.
- [`apps/web/src/game3d/towerDefense/TowerDefense3DScene.ts`](file:///Users/apple/Project/apps/web/src/game3d/towerDefense/TowerDefense3DScene.ts) — Scene diorama pertahanan markas 3D, 8 slot menara taktis dengan interaksi raycasting, model menara bertingkat (Archer, Cannon, Magic, Catapult) dengan kepala berputar, musuh robot & Boss bermahkota, serta preset kamera.
- [`apps/web/src/game3d/components/TowerDefense3DArena.vue`](file:///Users/apple/Project/apps/web/src/game3d/components/TowerDefense3DArena.vue) — Komponen Vue arena Tower Defense 3D dengan preview hantu menara dan kendali kamera.

---

## 8. Peningkatan Visual 3D Final Boss Battle (Arena Proyektor Guru)

Tampilan arena proyektor untuk **Final Boss Battle (Ulangan Harian Gamifikasi)** kini telah ditingkatkan dengan grafis 3D prosedural Three.js low-poly bertema sci-fi/fantasy cyberpunk yang memukau, terintegrasi penuh dengan event real-time server dan Web Audio sintetis.

### 8.1 Karakter Boss 3D Prosedural Penuh
Keempat karakter boss resmi Belajarena dibuat sepenuhnya dari geometri dasar (Box, Cylinder, Sphere, Cone, Ring, Torus, Icosahedron) tanpa file tekstur/model eksternal:
1. **Robot Glitch (`robot-glitch`)**: Mecha android kubikal bertema sirkuit terdistorsi, visor cyan bercahaya, antena ganda berkedip sinyal, reaktor dada berdenyut, lengan bersendi dengan cakar servo, dan kubus-kubus data glitch melayang acak.
2. **Rakus Maximus (`rakus-maximus`)**: Golem batu ungu/violet kokoh berotot, tanduk emas melengkung, rahang bawah besar yang bergerak mengunyah (`chomp animation`), inti kristal sihir di dada, serta tinju batu raksasa melayang.
3. **Virus Lambda (`virus-lambda`)**: Entitas bio-digital berbentuk ikosahedron melayang dengan mata tunggal berkedip, simbol lambda bercahaya, 8 duri orbit berputar, dan 4 tentakel biomekanik fleksibel.
4. **Bugzilla (`bugzilla`)**: Serangga monster compiler bernuansa amber/emas, sayap carapace bergerigi yang mengepak cepat, mata majemuk merah tajam, mandibula bergerak, dan lengan capit raptorial.

### 8.2 Fitur Visual & Audio Baru
- **Skala Ukuran Dinamis Sesuai Kesulitan**:
  - Mudah: 1.0x skala normal.
  - Sedang: 1.15x skala lebih masif.
  - Sulit: 1.30x skala raksasa mengintimidasi.
- **Fase Emosional Berbasis HP Server (10.000 HP)**:
  - **Fase Normal (HP > 50%)**: Boss tenang dengan animasi napas/idling standar.
  - **Fase Marah (HP ≤ 50%)**: Mata menyala merah membara, animasi bernapas/bergerak lebih cepat 1.7x, dan letupan percikan energi.
  - **Fase Krisis (HP ≤ 20%)**: Emisi mata berdenyut darurat merah pekat, boss bergetar tak stabil, dan partikel bara api/asap membubung dari platform.
- **Visualisasi Serangan Laser Siswa (Pedagogis)**:
  - Jawaban benar siswa memicu tembakan sinar laser bertenaga dari posisi horizontal acak siswa di proyektor menuju dada boss, menghasilkan percikan impak, angka damage melayang, dan getaran layar.
  - **Combo Barrage**: Jika $\ge 5$ jawaban benar masuk dalam 3 detik, arena memicu efek rentetan laser masif dan guncangan kamera intensif.
  - **Aturan Pedagogis Positif**: Jawaban salah **TIDAK** menembakkan laser ke boss (mencegah rasa malu publik siswa di depan kelas).
- **Animasi Kemenangan & Kekalahan Kelas**:
  - **Kemenangan Kelas (Boss Kalah)**: Boss bergetar hebat lalu hancur terpecah menjadi 36 kubus low-poly melayang jatuh, disusul semburan air mancur confetti emas meriah dan banner HTML Kemenangan Kelas.
  - **Kekalahan Kelas (Waktu Habis / KKM Belum Tercapai)**: Boss berdiri tegak tertawa sombong dengan aura merah berkobar.
- **Synthesized Web Audio SFX (`BossAudioSynth.ts`)**:
  - Suara tembakan laser, impak pukulan berat, ledakan rentetan combo, dan akord perayaan kemenangan disintesis murni menggunakan Web Audio API (OscillatorNode & GainNode) tanpa berkas suara MP3/WAV eksternal.
  - Dilengkapi tombol Mute/Unmute audio yang tersimpan di `localStorage`.
- **Preset Kamera Fleksibel**:
  - Pilihan sudut pandang proyektor: `overview` (kamera panggung penuh), `bossFocus` (close-up dramatis boss), dan `stageAngle` (sudut miring aksi).
- **Fallback 2D Otomatis & Tombol Mode Ringan (2D)**:
  - Jika perangkat guru tidak mendukung WebGL, arena otomatis beralih ke tampilan `BossSprite` 2D.
  - Tombol **"Mode Ringan (2D)"** dan **"⚔️ 3D"** tersedia di header arena untuk beralih instan tanpa mengulang sesi aktif.

### 8.4 Koreksi & Penyempurnaan Efek 3D serta Navigasi
1. **Presisi Titik Asal Laser Siswa**:
   - Diperbaiki deteksi kontainer arena aktif (`boss3DArenaRef`, `arenaStageRef`, dan `.boss-3d-arena-container`).
   - Koordinat horizontal persentase dihitung akurat dari posisi bounding rect avatar/kartu siswa penembak di DOM.
   - Di Three.js, dilakukan unprojection kamera 3D (`camera.unproject`) dari koordinat layar proyektor horizontal sehingga pangkal laser muncul presisi di atas karakter siswa penembak.
2. **Navigasi Pasca Stop / Tutup Sesi Game**:
   - Alur penghentian dan penutupan sesi battle kini dialihkan langsung ke ringkasan Edu-Games (`/games`) yang memuat riwayat dan rekap nilai ulangan, bukan lagi ke dashboard umum.
3. **Efek Tembakan Menara Tower Defense 3D**:
   - **Archer Tower**: Menembakkan berkas laser 3D silinder merah bercahaya (*additive glowing cylinder beam*) dengan kilatan moncong dan impak partikel.
   - **Cannon Tower**: Meluncurkan peluru meriam berapi (*fiery cannonball*) berbentuk bola 3D menyala yang terbang melengkung cepat dan meledak menjadi semburan partikel api/asap.
   - **Magic Tower**: Menembakkan bola plasma energi sihir es cyan (*glowing frost orb*) dengan jejak partikel kristal dan ledakan frost nova.
   - **Catapult Tower**: Melemparkan bongkahan batu raksasa (*tumbling boulder*) dalam lintasan busur parabola dramatis berdaya hancur tinggi.
   - Dilengkapi sistem pooling objek hemat memori tanpa kebocoran alokasi.
4. **Efek Glow Luminous pada Laser Siswa**:
   - Laser siswa ditingkatkan menjadi berkas multi-layer:
     - Inti putih terang (*Core Mesh*) kecepatan tinggi.
     - Pendaran dalam (*Inner Glow Mesh*) dengan `THREE.AdditiveBlending`.
     - Aura lebar (*Outer Halo Mesh*) menyinari panggung arena.
     - Bola pendaran moncong (*Muzzle Flash*) dan kilatan benturan (*Impact Flare*).




