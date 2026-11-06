#!/bin/bash

# ==============================================================================
# 🚀 BELAJARENA - 1 KLIK JALANKAN SERVER LOCALHOST:5173
# ==============================================================================
# Script ini secara otomatis:
# 1. Menyiapkan environment Node.js & npm.
# 2. Menjalankan Backend API Server (Port 8000).
# 3. Menjalankan Frontend Web Server Vite (Port 5173).
# 4. Membuka browser langsung ke http://localhost:5173
# ==============================================================================

# Berpindah ke folder lokasi script ini berada
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

# Pastikan Node.js terbaca di PATH macOS
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

if ! command -v node &> /dev/null; then
    for N_PATH in "$HOME/.nvm/versions/node"/*/bin /usr/local/bin /opt/homebrew/bin "$HOME/.gemini/antigravity/bin"; do
        if [ -d "$N_PATH" ] && [ -x "$N_PATH/node" ]; then
            export PATH="$N_PATH:$PATH"
            break
        fi
    done
fi

clear
echo "================================================================="
echo "  🌟 BELAJARENA - PELUNCUR SERVER OTOMATIS (PORT 5173) 🌟"
echo "================================================================="
echo "  📁 Folder Project : $DIR"
echo "  🟢 Node.js Versi  : $(node -v 2>/dev/null || echo 'Tidak terdeteksi')"
echo "================================================================="
echo ""

# Bersihkan port 8000 dan 5173 bila ada proses lama yang menggantung
echo "🧹 Memeriksa dan membebaskan port 8000 & 5173..."
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# 1. Jalankan Backend API Server (Port 8000)
echo "🚀 [1/2] Menjalankan Backend API Server (Port 8000)..."
node apps/api/server.mjs &
BACKEND_PID=$!

# Tunggu sejenak agar backend aktif
sleep 1.5

# 2. Jalankan Frontend Web Dev Server (Port 5173)
echo "🚀 [2/2] Menjalankan Frontend Web Server (Port 5173)..."
cd apps/web && npm run dev &
FRONTEND_PID=$!

# Tunggu 2 detik lalu buka browser secara otomatis
(
    sleep 2.5
    echo ""
    echo "🌐 Membuka browser ke http://localhost:5173 ..."
    if command -v open &> /dev/null; then
        open "http://localhost:5173"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:5173"
    fi
) &

echo ""
echo "================================================================="
echo "  ✅ KEDUA SERVER BERHASIL DIJALANKAN DENGAN SUKSES!"
echo ""
echo "  👉 Akses Web Belajarena : http://localhost:5173"
echo "  👉 Akses Backend API    : http://localhost:8000"
echo ""
echo "  💡 Tekan [Ctrl + C] pada jendela terminal ini untuk berhenti."
echo "================================================================="
echo ""

# Tangkap sinyal keluar (Ctrl + C) agar kedua proses berhenti bersamaan
trap "echo ''; echo '🛑 Menghentikan server Belajarena...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait

