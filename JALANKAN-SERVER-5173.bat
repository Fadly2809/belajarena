@echo off
title BELAJARENA - Peluncur Server (Port 5173)
color 0A

echo =================================================================
echo   🌟 BELAJARENA - PELUNCUR SERVER OTOMATIS (PORT 5173) 🌟
echo =================================================================
echo.

cd /d "%~dp0"

echo 🧹 Menyiapkan backend dan frontend...
if not exist "apps\web\node_modules" (
    echo 📦 Dependensi frontend belum terpasang. Menginstall otomatis (npm install)...
    cd apps\web && call npm install && cd ..\..
)
start "Belajarena Backend API (Port 8000)" cmd /k "node apps/api/server.mjs"
timeout /t 2 /nobreak >nul

start "Belajarena Frontend Web (Port 5173)" cmd /k "cd apps\web && npm run dev"
timeout /t 3 /nobreak >nul

echo 🌐 Membuka browser ke http://localhost:5173 ...
start http://localhost:5173

echo.
echo =================================================================
echo   ✅ KEDUA SERVER BERHASIL DIJALANKAN!
echo   👉 Akses Web: http://localhost:5173
echo   👉 Akses API: http://localhost:8000
echo =================================================================
echo.
pause

