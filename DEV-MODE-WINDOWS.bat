@echo off
chcp 65001 >nul
title Belajarena - Mode Pengembang (Developer Dev Server)
color 0E

echo =====================================================================
echo    🛠️  BELAJARENA - MODE PENGEMBANG (DEV SERVER HOT-RELOAD)
echo =====================================================================
echo.
echo Mode ini menjalankan:
echo  - Backend API Server  : Port 8000
echo  - Frontend Vite Dev   : Port 5173 (dengan Hot-Reload otomatis)
echo.

:: Jalankan backend di window terpisah
start "Belajarena Backend API (Port 8000)" cmd /k "node apps\api\server.mjs"

:: Tunggu 2 detik
timeout /t 2 /nobreak >nul

:: Jalankan frontend Vite dev
cd apps\web
npm run dev
