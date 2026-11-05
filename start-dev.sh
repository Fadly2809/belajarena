#!/bin/bash

# ==============================================================================
# Belajarena - Script Peluncur Mode Pengembang (Dev Server Hot-Reload)
# Menjalankan Backend API (Port 8000) dan Frontend Vite (Port 5173) secara bersamaan
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

# Deteksi Node.js jika belum ada di PATH
if ! command -v node &> /dev/null; then
    for NVM_PATH in "$HOME/.nvm/versions/node"/*; do
        if [ -d "$NVM_PATH/bin" ]; then
            export PATH="$NVM_PATH/bin:$PATH"
            break
        fi
    done
fi

echo "========================================================"
echo "  🚀 MEMULAI BELAJARENA - MODE PENGEMBANG (DEV SERVER)"
echo "========================================================"

# Hentikan proses lama jika ada yang masih menggantung di port 8000 / 5173
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null

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
echo "  ✅ KEDUA SERVER DEV TELAH AKTIF!"
echo "  👉 Akses Frontend Web : http://localhost:5173"
echo "  👉 Akses Backend API  : http://localhost:8000"
echo "========================================================"
echo "  Tekan [Ctrl + C] untuk menghentikan kedua server."
echo "========================================================"

# Tangkap sinyal interupsi (Ctrl+C) untuk mematikan kedua server secara rapi
trap "echo ''; echo '🛑 Menghentikan server Belajarena...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
