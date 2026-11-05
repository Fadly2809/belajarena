#!/bin/bash

# =====================================================================
# Script Pembuat Paket ZIP Belajarena Siap Jual
# Menghasilkan file ZIP bersih, ringan (~36MB), dan siap kirim ke pembeli
# =====================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

echo "====================================================================="
echo "  📦 MEMBUAT PAKET ZIP BELAJARENA SIAP JUAL"
echo "====================================================================="
echo ""

# 1. Pastikan build web terbaru sudah terkompilasi
echo "🔹 [1/2] Memastikan bundle web terbaru (Vite build)..."
npm --prefix apps/web run build

if [ $? -ne 0 ]; then
    echo "❌ [ERROR] Kompilasi web gagal. Periksa kembali kode sumber."
    exit 1
fi

# 2. Kompres ke ZIP dengan mengabaikan node_modules dan backup usang
echo ""
echo "🔹 [2/2] Mengompresi seluruh file ke 'belajarena-siap-jual.zip'..."
rm -f belajarena-siap-jual.zip

zip -r belajarena-siap-jual.zip \
  1-KLIK-JALANKAN-WINDOWS.bat \
  INSTALL-WINDOWS.bat \
  DEV-MODE-WINDOWS.bat \
  1-KLIK-JALANKAN-MAC.sh \
  install-mac-linux.sh \
  start-dev.sh \
  README.md \
  PANDUAN_LENGKAP_PEMBELI.md \
  package.json \
  SMPN6Kendari-Siswa.apk \
  apps/api \
  apps/web \
  -x "apps/web/node_modules/*" \
  -x "apps/api/node_modules/*" \
  -x "apps/api/database/database.backup_bloat.json" \
  -x "apps/api/backups/*" \
  -x "*.DS_Store" \
  -x "*__MACOSX*" \
  -x "*.git*"

echo ""
echo "====================================================================="
echo "  ✅ PAKET SIAP JUAL BERHASIL DIBUAT!"
echo "  📁 File: belajarena-siap-jual.zip"
ls -lh belajarena-siap-jual.zip | awk '{print "  📦 Ukuran:", $5}'
echo "====================================================================="
echo "Anda tinggal mengunggah file 'belajarena-siap-jual.zip' ke Google Drive"
echo "atau mengirimkannya langsung kepada calon pembeli Anda!"
echo "====================================================================="
