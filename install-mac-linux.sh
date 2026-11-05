#!/bin/bash

# =====================================================================
#   📦 BELAJARENA - PEMASANG OTOMATIS (SETUP & BUILD)
# =====================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

echo "====================================================================="
echo "   📦 BELAJARENA - PEMASANG OTOMATIS (SETUP & BUILD)"
echo "====================================================================="
echo ""

if ! command -v node &> /dev/null; then
    for NVM_PATH in "$HOME/.nvm/versions/node"/*; do
        if [ -d "$NVM_PATH/bin" ]; then
            export PATH="$NVM_PATH/bin:$PATH"
            break
        fi
    done
fi

if ! command -v node &> /dev/null; then
    echo "❌ [ERROR] Node.js belum terpasang! Silakan pasang dari: https://nodejs.org"
    exit 1
fi

echo "[1/3] Memasang dependensi root & backend..."
npm install

echo ""
echo "[2/3] Memasang dependensi frontend web..."
npm --prefix apps/web install

echo ""
echo "[3/3] Mengompilasi aplikasi web (Vite production build)..."
npm --prefix apps/web run build

if [ $? -ne 0 ]; then
    echo "❌ [ERROR] Terjadi kesalahan saat kompilasi."
    exit 1
fi

echo ""
echo "====================================================================="
echo "  ✅ INSTALASI & KOMPILASI BERHASIL!"
echo "====================================================================="
echo "Jalankan aplikasi kapan saja dengan perintah:"
echo "👉 ./1-KLIK-JALANKAN-MAC.sh"
echo "====================================================================="
