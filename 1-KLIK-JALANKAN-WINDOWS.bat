@echo off
chcp 65001 >nul
title Belajarena - Platform Pembelajaran Digital & Gamifikasi
color 0B

echo =====================================================================
echo    🌟 MEMULAI BELAJARENA (SERVER LOCALHOST & JARINGAN LAN) 🌟
echo =====================================================================
echo.

:: 1. Cek apakah Node.js terpasang
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js belum terpasang di komputer Anda!
    echo.
    echo Silakan unduh dan pasang Node.js LTS terlebih dahulu dari:
    echo 👉 https://nodejs.org
    echo.
    echo Tekan sembarang tombol untuk membuka website unduhan Node.js...
    pause >nul
    start https://nodejs.org
    exit /b 1
)

:: 2. Cek apakah folder build apps/web/dist sudah siap
if not exist "apps\web\dist\index.html" (
    echo [INFO] Terdeteksi pemasangan pertama kali.
    echo Menyiapkan dependensi dan mengompilasi aplikasi web (proses ini butuh 1-2 menit)...
    echo.
    call npm run setup
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ERROR] Gagal melakukan setup awal. Pastikan koneksi internet aktif saat pertama kali instalasi dependensi.
        pause
        exit /b 1
    )
    echo.
    echo [SUKSES] Setup awal selesai!
    echo.
)

:: 3. Buka browser secara otomatis setelah 2 detik
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"

:: 4. Jalankan Server API & Web
echo Menjalankan Server Belajarena...
node apps\api\server.mjs

echo.
echo Server telah dimatikan.
pause
