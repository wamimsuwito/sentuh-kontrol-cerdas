
# Nice Ningrum - Sentuh Kontrol Cerdas (ESP32 Bluetooth Version)
## Panduan Lengkap Build dan Setup ESP32 dengan Android APK

### 📋 Daftar Isi
1. [Persiapan Hardware ESP32](#persiapan-hardware-esp32)
2. [Upload Code ke ESP32](#upload-code-ke-esp32)
3. [Setup Development Environment](#setup-development-environment)
4. [Build APK untuk Android](#build-apk-untuk-android)
5. [Setup untuk Production](#setup-untuk-production)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Persiapan Hardware ESP32

### Komponen yang Dibutuhkan:
- ESP32 Development Board (ESP32-WROOM-32 atau ESP32-DevKitC)
- 16x Relay Module (5V)
- Kabel micro USB
- Kabel jumper
- Breadboard (opsional)
- Limit Switch (opsional)
- Power Supply 5V untuk relay

### Koneksi Hardware:
```
ESP32 Pin Assignment:
├── Relay 1-16    → GPIO 2, 4, 5, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 12, 14, 15
├── LED Indikator → GPIO 2 (built-in)
├── Limit Switch  → GPIO 13 (dengan pull-up internal)
└── Bluetooth LE  → Built-in (tidak perlu pin tambahan)
```

### Skema Koneksi Detail:
```
Relay Module → ESP32
VCC          → 5V (dari power supply eksternal)
GND          → GND
IN1          → GPIO 2  (Relay 1)
IN2          → GPIO 4  (Relay 2)
IN3          → GPIO 5  (Relay 3)
IN4          → GPIO 18 (Relay 4)
IN5          → GPIO 19 (Relay 5)
IN6          → GPIO 21 (Relay 6)
IN7          → GPIO 22 (Relay 7)
IN8          → GPIO 23 (Relay 8)
IN9          → GPIO 25 (Relay 9)
IN10         → GPIO 26 (Relay 10)
IN11         → GPIO 27 (Relay 11)
IN12         → GPIO 32 (Relay 12)
IN13         → GPIO 33 (Relay 13)
IN14         → GPIO 12 (Relay 14)
IN15         → GPIO 14 (Relay 15)
IN16         → GPIO 15 (Relay 16)

Limit Switch → ESP32
Terminal 1   → GPIO 13
Terminal 2   → GND
```

**PENTING:** Relay memerlukan power supply 5V terpisah karena ESP32 hanya menyediakan 3.3V pada GPIO.

---

## 📤 Upload Code ke ESP32

### 1. Install Arduino IDE
- Download dari: https://www.arduino.cc/en/software
- Install driver CP2102 atau CH340 untuk ESP32

### 2. Setup Arduino IDE untuk ESP32
```
File → Preferences → Additional Boards Manager URLs:
https://dl.espressif.com/dl/package_esp32_index.json

Tools → Board → Boards Manager → Search "ESP32" → Install
Tools → Board → ESP32 Arduino → ESP32 Dev Module
Tools → Port → (Pilih port COM yang sesuai)
```

### 3. Upload Code ESP32
- Buka file `esp32_relay_controller.ino`
- Klik tombol Upload (→)
- Tunggu hingga "Done uploading" muncul

### 4. Test Bluetooth ESP32
- Buka Serial Monitor (Ctrl+Shift+M)
- Set baud rate ke 115200
- ESP32 akan menampilkan "ESP32_Relay_Controller siap!"
- Cek di smartphone: Bluetooth settings → ESP32_Relay_Controller harus terlihat

---

## 💻 Setup Development Environment

### 1. Install Node.js
- Download dari: https://nodejs.org/
- Pilih versi LTS (Long Term Support)

### 2. Install Dependencies
```bash
# Clone atau extract project
cd sentuh-kontrol-cerdas

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Test di Browser (Development)
- Buka Chrome atau Edge
- Akses: http://localhost:5173
- **CATATAN:** Bluetooth LE hanya berfungsi di native Android/iOS app, tidak di browser

---

## 📱 Build APK untuk Android

### 1. Install Android Development Tools
```bash
# Install Android Studio dari: https://developer.android.com/studio
# Install Java JDK 11 atau lebih tinggi
# Setup Android SDK dan build tools
```

### 2. Add Android Platform
```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Add Android platform
npx cap add android

# Update platform
npx cap update android
```

### 3. Build Web Assets
```bash
# Build project untuk production
npm run build

# Sync dengan native platform
npx cap sync android
```

### 4. Build APK
```bash
# Open Android Studio
npx cap open android

# Di Android Studio:
# 1. Tunggu Gradle sync selesai
# 2. Build → Generate Signed Bundle/APK
# 3. Pilih APK
# 4. Create keystore baru atau gunakan yang existing
# 5. Build APK
```

### 5. Alternative: Command Line Build
```bash
# Build debug APK
cd android
./gradlew assembleDebug

# Build release APK (perlu keystore)
./gradlew assembleRelease
```

---

## 🏗️ Setup untuk Production

### 1. Konfigurasi untuk Production Build
```bash
# Edit capacitor.config.ts
# Pastikan server configuration di-comment out untuk production build

# Build production
npm run build
npx cap sync android
```

### 2. Generate Signed APK
```bash
# Buat keystore (hanya sekali)
keytool -genkey -v -keystore release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# Edit android/app/build.gradle untuk signing config
# Build signed APK
cd android
./gradlew assembleRelease
```

### 3. Install ke Android Device
```bash
# Install via ADB
adb install app/build/outputs/apk/release/app-release.apk

# Atau copy APK ke smartphone dan install manual
```

---

## 🔧 Troubleshooting

### ESP32 Issues
```
Problem: ESP32 tidak terdeteksi di Arduino IDE
Solution: 
- Install driver CP2102/CH340
- Press and hold BOOT button saat upload
- Check Device Manager (Windows)
- Coba port USB lain

Problem: Bluetooth tidak terlihat
Solution:
- Reset ESP32 (press EN button)
- Check serial monitor untuk pesan error
- Pastikan code sudah terupload dengan benar
- Clear Bluetooth cache di Android
```

### Android Build Issues
```
Problem: Gradle build failed
Solution:
- Update Android Studio dan SDK
- Check Java version (gunakan JDK 11)
- Clear gradle cache: ./gradlew clean
- Check capacitor.config.ts configuration

Problem: Bluetooth permission denied
Solution:
- Check android/app/src/main/AndroidManifest.xml
- Pastikan permission BLUETOOTH dan BLUETOOTH_ADMIN ada
- Request permission di runtime untuk Android 12+
```

### App Connection Issues
```
Problem: App tidak bisa connect ke ESP32
Solution:
- Pastikan ESP32 menyala dan Bluetooth aktif
- Clear Bluetooth cache dan restart
- Check di Settings > Apps > [App Name] > Permissions > Bluetooth
- Restart aplikasi
- Pastikan ESP32 tidak terpair dengan device lain
```

### Relay Issues
```
Problem: Relay tidak aktif
Solution:
- Check koneksi hardware
- Test manual via Serial Monitor ESP32
- Check voltase power supply (5V untuk relay)
- Verify pin assignment di code ESP32
- Check kontinuitas kabel
```

---

## 📋 Permissions Required (Android)

Tambahkan di `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Android 12+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
```

---

## 🔄 Update Instructions

Untuk update aplikasi:
1. Update code ESP32 jika perlu
2. Update web application
3. Build ulang: `npm run build && npx cap sync android`
4. Generate APK baru
5. Test semua fungsi sebelum distribute

---

## 🚀 Quick Start Guide

### For ESP32:
1. Upload `esp32_relay_controller.ino` to ESP32
2. Connect 16 relays to GPIO pins as specified
3. Power on ESP32 - should show "ESP32_Relay_Controller" in Bluetooth scan

### For Android App:
1. `npm install && npm run build`
2. `npx cap add android && npx cap sync android`
3. `npx cap open android` 
4. Build APK in Android Studio
5. Install APK to Android device
6. Enable Bluetooth and connect to ESP32

---

**Catatan Penting:**
- ESP32 memerlukan power supply 5V terpisah untuk relay
- Aplikasi hanya berfungsi di native Android/iOS, tidak di browser
- Bluetooth LE memiliki jangkauan terbatas (~10-50 meter)
- Untuk production, gunakan signed APK dan pair ESP32 secara secure

## 🔗 Useful Links
- [ESP32 Bluetooth Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/index.html)
- [Capacitor Bluetooth LE Plugin](https://github.com/capacitor-community/bluetooth-le)
- [Android Bluetooth Development](https://developer.android.com/guide/topics/connectivity/bluetooth)
