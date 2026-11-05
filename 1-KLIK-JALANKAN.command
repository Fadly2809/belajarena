#!/bin/bash

# =====================================================================
#   🌟 BELAJARENA - PLATFORM PEMBELAJARAN DIGITAL & GAMIFIKASI 🌟
#   Peluncur 1-Klik Server Localhost & Jaringan LAN (macOS Native)
# =====================================================================

# Pindah ke direktori project tempat file ini berada
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

# Warna Terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}${BOLD}=====================================================================${NC}"
echo -e "${YELLOW}${BOLD}   🌟 MEMULAI BELAJARENA - SERVER LOCALHOST (1-KLIK) 🌟${NC}"
echo -e "${CYAN}${BOLD}=====================================================================${NC}"
echo ""

# 1. Deteksi Node.js secara otomatis (Homebrew, NVM, atau PATH standar)
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
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
fi

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js belum terdeteksi di sistem Anda.${NC}"
    echo "Silakan unduh dan pasang Node.js LTS terlebih dahulu dari: https://nodejs.org"
    echo ""
    read -p "Tekan Enter untuk menutup..."
    exit 1
fi

echo -e "🔹 ${GREEN}Node.js Terdeteksi:${NC} $(node -v) di $(which node)"

# 2. Bersihkan sisa proses di port 8000 jika ada yang menggantung
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null
sleep 0.5

# 3. Cek apakah build frontend sudah siap
if [ ! -f "apps/web/dist/index.html" ]; then
    echo -e "🔹 ${YELLOW}Build web belum ditemukan. Menyiapkan sistem awal...${NC}"
    npm run setup
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}❌ Gagal melakukan kompilasi awal.${NC}"
        read -p "Tekan Enter untuk menutup..."
        exit 1
    fi
fi

# 4. Deteksi IP Jaringan Wi-Fi Lokal (untuk akses siswa via HP/Tablet)
LOCAL_IP="localhost"
for IFACE in en0 en1 wlan0 eth0; do
    IP=$(ipconfig getifaddr $IFACE 2>/dev/null)
    if [ -n "$IP" ]; then
        LOCAL_IP="$IP"
        break
    fi
done

echo ""
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${BOLD}  🚀 SERVER BELAJARENA AKTIF & SIAP DIGUNAKAN!${NC}"
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo -e "  💻 ${BOLD}Akses di Laptop/Komputer Ini (Guru/Proyektor):${NC}"
echo -e "     👉 ${CYAN}${BOLD}http://localhost:8000${NC}"
echo ""
echo -e "  📱 ${BOLD}Akses Siswa di Kelas (HP/Tablet via Wi-Fi yang Sama):${NC}"
echo -e "     👉 ${YELLOW}${BOLD}http://${LOCAL_IP}:8000${NC}"
echo ""
echo -e "  🔑 ${BOLD}Akun Login Default:${NC}"
echo -e "     • Guru/Admin : ${BOLD}fadly.arsandi@smpn6kendari.sch.id${NC} | password: ${BOLD}password${NC}"
echo -e "     • Siswa      : ${BOLD}10527${NC} (atau NIS lainnya)       | password: ${BOLD}password${NC}"
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo -e "  💡 Browser Anda akan terbuka otomatis dalam 2 detik."
echo -e "  Tekan ${BOLD}[Ctrl + C]${NC} di jendela ini jika ingin mematikan server."
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo ""

# 5. Buka browser otomatis ke http://localhost:8000
(sleep 2 && open "http://localhost:8000" 2>/dev/null) &

# 6. Jalankan Server Utama Belajarena
node apps/api/server.mjs

