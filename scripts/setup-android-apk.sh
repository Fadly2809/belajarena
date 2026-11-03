#!/usr/bin/env bash
set -e

TOOLCHAIN_DIR="/Users/apple/.toolchain"
JDK_DIR="$TOOLCHAIN_DIR/jdk-21"
SDK_DIR="$TOOLCHAIN_DIR/android-sdk"
PROJECT_DIR="/Users/apple/Project"
ANDROID_DIR="$PROJECT_DIR/apps/web/android"

mkdir -p "$TOOLCHAIN_DIR"

echo "=== 1. MENYIAPKAN JAVA OPENJDK 21 (MACOS X64) ==="
if [ ! -d "$JDK_DIR/Contents/Home" ]; then
  echo "Mengunduh Eclipse Temurin OpenJDK 21..."
  curl -L -o "$TOOLCHAIN_DIR/temurin21.tar.gz" "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.13%2B9/OpenJDK21U-jdk_x64_mac_hotspot_21.0.13_9.tar.gz"
  mkdir -p "$JDK_DIR"
  tar -xzf "$TOOLCHAIN_DIR/temurin21.tar.gz" -C "$JDK_DIR" --strip-components 1
  rm -f "$TOOLCHAIN_DIR/temurin21.tar.gz"
  echo "Java JDK 21 berhasil dipasang!"
else
  echo "Java JDK 21 sudah terpasang."
fi

export JAVA_HOME="$JDK_DIR/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
java -version

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
export PATH="$SDK_DIR/cmdline-tools/latest/bin:$SDK_DIR/platform-tools:$PATH"

echo "=== 2. LOCAL.PROPERTIES ==="
echo "sdk.dir=$SDK_DIR" > "$ANDROID_DIR/local.properties"

echo "=== 3. MEMBANGUN FILE APK SISWA VIA GRADLE ==="
cd "$ANDROID_DIR"
chmod +x ./gradlew
./gradlew assembleDebug

echo "=== 4. MEMERIKSA FILE APK HASIL COMPILE ==="
APK_FILE="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_FILE" ]; then
  echo "SUCCESS: File APK siswa berhasil dibuat:"
  ls -la "$APK_FILE"
  cp "$APK_FILE" "$PROJECT_DIR/SMPN6Kendari-Siswa.apk"
  echo "Salinan file APK disimpan di: $PROJECT_DIR/SMPN6Kendari-Siswa.apk"
else
  echo "Gagal: file APK tidak ditemukan di $APK_FILE"
  exit 1
fi
