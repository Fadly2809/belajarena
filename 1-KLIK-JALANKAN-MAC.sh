#!/bin/bash

# =====================================================================
#   🌟 BELAJARENA - PLATFORM PEMBELAJARAN DIGITAL & GAMIFIKASI 🌟
#   Peluncur Server Localhost & LAN untuk macOS dan Linux
# =====================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

echo "====================================================================="
echo "   🌟 MEMULAI BELAJARENA (SERVER LOCALHOST & JARINGAN LAN) 🌟"
echo "====================================================================="
echo ""

# 1. Pastikan Node.js terdeteksi (cek PATH dan NVM umum)
if ! command -v node &> /dev/null; then
    for NVM_PATH in "$HOME/.nvm/versions/node"/*; do
        if [ -d "$NVM_PATH/bin" ]; then
            export PATH="$NVM_PATH/bin:$PATH"
            break
        fi
    done
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
fi

if ! command -v node &> /dev/null; then
    echo "❌ [ERROR] Node.js belum terpasang di komputer Anda!"
    echo "Silakan unduh dan pasang Node.js LTS terlebih dahulu dari: https://nodejs.org"
    exit 1
fi

# 2. Cek apakah build web sudah siap
if [ ! -f "apps/web/dist/index.html" ]; then
    echo "🔹 Terdeteksi pemasangan pertama kali. Menyiapkan sistem (1-2 menit)..."
    npm run setup
    if [ $? -ne 0 ]; then
        echo "❌ [ERROR] Gagal melakukan setup awal."
        exit 1
    fi
    echo "✅ Setup awal selesai!"
    echo ""
fi

# 3. Buka browser otomatis setelah 2 detik
(sleep 2 && (open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null)) &

# 4. Jalankan Server API & Web
node apps/api/server.mjs
