#!/bin/bash

# =====================================================================
#   🌟 BELAJARENA - PLATFORM PEMBELAJARAN DIGITAL & GAMIFIKASI 🌟
#   Peluncur 1-Klik Mode Pengembang (Port 5173 Hot-Reload + API 8000)
# =====================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit 1

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${CYAN}${BOLD}=====================================================================${NC}"
echo -e "${YELLOW}${BOLD}   🚀 MEMULAI BELAJARENA - MODE PENGEMBANG (DEV SERVER) 🚀${NC}"
echo -e "${CYAN}${BOLD}=====================================================================${NC}"
echo ""

# 1. Deteksi Node.js
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

# 2. Hentikan sisa proses sebelumnya di port 8000 & 5173
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null
sleep 0.5

# 3. Jalankan Backend API Server (Port 8000)
echo -e "🔹 Menjalankan Backend API (Port 8000)..."
node apps/api/server.mjs &
BACKEND_PID=$!

sleep 1

# 4. Jalankan Frontend Vite Dev Server (Port 5173)
echo -e "🔹 Menjalankan Frontend Dev Server (Port 5173)..."
cd apps/web && npm run dev &
FRONTEND_PID=$!

# Deteksi IP Wi-Fi
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
echo -e "${BOLD}  ✅ KEDUA SERVER TELAH AKTIF & BERJALAN!${NC}"
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo -e "  👉 Frontend Web Dev : ${CYAN}${BOLD}http://localhost:5173${NC}"
echo -e "  👉 Backend API      : ${CYAN}${BOLD}http://localhost:8000${NC}"
echo -e "  👉 Akses Jaringan LAN: ${YELLOW}${BOLD}http://${LOCAL_IP}:5173${NC}"
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo -e "  Tekan ${BOLD}[Ctrl + C]${NC} untuk menghentikan seluruh server secara bersamaan."
echo -e "${GREEN}${BOLD}=====================================================================${NC}"
echo ""

(sleep 2 && open "http://localhost:5173" 2>/dev/null) &

trap "echo ''; echo '🛑 Menghentikan server Belajarena...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait

