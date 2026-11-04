#!/bin/bash

# ==============================================================================
# Belajarena - Script Peluncur Server Localhost
# Menjalankan Backend API (Port 8000) dan Frontend Vite (Port 5173) secara bersamaan
# ==============================================================================

# Pastikan environment Node.js v20 tersedia
export PATH="/Users/apple/.nvm/versions/node/v20.20.2/bin:$PATH"

PROJECT_DIR="/Users/apple/Project"
cd "$PROJECT_DIR" || exit 1

echo "========================================================"
echo "  🚀 MEMULAI SERVER BELAJARENA LOCALHOST"
echo "========================================================"

# Hentikan proses lama jika ada yang masih menggantung di port 8000 / 5173
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 1. Jalankan Backend API Server di latar belakang
echo "🔹 Menjalankan Backend API Server (Port 8000)..."
node apps/api/server.mjs &
BACKEND_PID=$!

# Tunggu sejenak agar backend siap
sleep 1

# 2. Jalankan Frontend Web Dev Server
echo "🔹 Menjalankan Frontend Web Server (Port 5173)..."
cd apps/web && npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo "  ✅ KEDUA SERVER TELAH AKTIF!"
echo "  👉 Akses Frontend Web : http://localhost:5173"
echo "  👉 Akses Backend API  : http://localhost:8000"
echo "  👉 Akses dari HP/WiFi : http://192.168.1.190:5173"
echo "========================================================"
echo "  Tekan [Ctrl + C] untuk menghentikan kedua server."
echo "========================================================"

# Tangkap sinyal interupsi (Ctrl+C) untuk mematikan kedua server secara rapi
trap "echo ''; echo '🛑 Menghentikan server Belajarena...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
