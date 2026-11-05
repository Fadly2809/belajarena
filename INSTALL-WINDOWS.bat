@echo off
chcp 65001 >nul
title Belajarena - Pemasang Otomatis (Setup Wizard)
color 0A

echo =====================================================================
echo    📦 BELAJARENA - PEMASANG OTOMATIS (SETUP & BUILD)
echo =====================================================================
echo.
echo Langkah ini akan:
echo 1. Memeriksa ketersediaan Node.js
echo 2. Memasang dependensi backend dan frontend
echo 3. Mengompilasi aplikasi web untuk performa localhost maksimal
echo.
echo Tekan sembarang tombol untuk memulai proses...
pause >nul

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js tidak ditemukan! Silakan unduh dan pasang dari https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [1/3] Memasang dependensi root & backend...
call npm install

echo.
echo [2/3] Memasang dependensi frontend web...
call npm --prefix apps\web install

echo.
echo [3/3] Mengompilasi bundle aplikasi web (Vite production build)...
call npm --prefix apps\web run build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [GAGAL] Terjadi kesalahan saat proses kompilasi web.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo   ✅ INSTALASI & KOMPILASI BERHASIL!
echo =====================================================================
echo.
echo Anda kini dapat langsung menjalankan aplikasi Belajarena kapan saja
echo dengan mengeklik ganda file:
echo 👉 1-KLIK-JALANKAN-WINDOWS.bat
echo.
pause

