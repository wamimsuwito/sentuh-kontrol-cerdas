
# Nice Ningrum - Sentuh Kontrol Cerdas (ESP32 Bluetooth)
## Panduan Build dan Setup Lengkap

### 📋 Daftar Isi
1. [Persiapan Hardware ESP32](#persiapan-hardware-esp32)
2. [Upload Code ke ESP32](#upload-code-ke-esp32)
3. [Setup Development Environment](#setup-development-environment)
4. [Build APK untuk Android](#build-apk-untuk-android)
5. [Deploy untuk Production](#deploy-untuk-production)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Persiapan Hardware ESP32

### Komponen yang Dibutuhkan:
- ESP32 Development Board (ESP32-WROOM-32)
- 16x Relay Module (5V)
- Kabel micro USB
- Kabel jumper
- Power supply 5V eksternal
- Limit Switch (opsional)

### Koneksi Hardware ESP32:
```
ESP32 GPIO Assignment:
├── Relay 1-16    → GPIO 2, 4, 5, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 12, 14, 15
├── LED Indikator → GPIO 2 (built-in)
├── Limit Switch  → GPIO 13 (dengan pull-up internal)
└── Bluetooth LE  → Built-in
```

**PENTING:** Relay memerlukan power supply 5V eksternal karena ESP32 GPIO hanya 3.3V.

---

## 📤 Upload Code ke ESP32

### 1. Install Arduino IDE
- Download: https://www.arduino.cc/en/software
- Install driver CP2102/CH340 untuk ESP32

### 2. Setup ESP32 di Arduino IDE
```
File → Preferences → Additional Boards Manager URLs:
https://dl.espressif.com/dl/package_esp32_index.json

Tools → Board → Boards Manager → Install "ESP32"
Tools → Board → ESP32 Dev Module
Tools → Port → (Pilih port COM ESP32)
```

### 3. Upload Code ESP32
- Buka file `esp32_relay_controller.ino`
- Upload ke ESP32
- Check Serial Monitor (115200 baud)
- ESP32 harus menampilkan "ESP32_Relay_Controller siap!"

---

## 💻 Setup Development Environment

### 1. Install Dependencies
```bash
cd sentuh-kontrol-cerdas
npm install
npm run dev  # Test di browser (Bluetooth tidak akan berfungsi di web)
```

### 2. Install Capacitor untuk Mobile
```bash
npm install -g @capacitor/cli
npx cap add android
```

---

## 📱 Build APK untuk Android

### 1. Install Android Development Tools
- Android Studio: https://developer.android.com/studio
- Java JDK 11+
- Android SDK dan build tools

### 2. Build dan Sync
```bash
# Build web assets
npm run build

# Sync dengan Android
npx cap sync android

# Open Android Studio
npx cap open android
```

### 3. Generate APK di Android Studio
1. Tunggu Gradle sync selesai
2. Build → Generate Signed Bundle/APK
3. Pilih APK → Create keystore baru
4. Build release APK
5. APK tersimpan di `android/app/build/outputs/apk/release/`

### 4. Install APK ke Android
```bash
# Via ADB
adb install app-release.apk

# Atau copy ke smartphone dan install manual
```

---

## 🏗️ Deploy untuk Production

### 1. Konfigurasi Production
```bash
# Pastikan capacitor.config.ts server di-comment untuk production
# Build optimized
npm run build
npx cap sync android
```

### 2. Generate Signed APK
```bash
# Buat keystore (sekali saja)
keytool -genkey -v -keystore release-key.keystore -alias app_key -keyalg RSA -keysize 2048 -validity 10000

# Build signed APK
cd android
./gradlew assembleRelease
```

---

## 🔧 Troubleshooting

### ESP32 Connection Issues
```
Problem: ESP32 tidak detect di Arduino IDE
Solution: 
- Install driver CP2102/CH340
- Hold BOOT button saat upload
- Coba port USB lain
- Check Device Manager

Problem: Bluetooth ESP32 tidak terlihat
Solution:
- Reset ESP32 (tekan tombol EN)
- Check Serial Monitor untuk error
- Clear Bluetooth cache Android
- Restart ESP32
```

### Android Build Issues
```
Problem: Gradle build failed
Solution:
- Update Android Studio dan SDK
- Check Java version (JDK 11+)
- Clean: ./gradlew clean
- Check capacitor.config.ts

Problem: Bluetooth permission denied
Solution:
- Check AndroidManifest.xml permissions
- Request runtime permission Android 12+
- Enable Bluetooth di Settings
```

### App Runtime Issues
```
Problem: Tidak bisa connect ke ESP32
Solution:
- Pastikan ESP32 menyala
- Enable Bluetooth Android
- Clear app cache dan restart
- Unpair dan pair ulang ESP32
- Check app permissions (Bluetooth, Location)
```

---

## 📋 Required Android Permissions

File: `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Android 12+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

---

## 🚀 Quick Start Summary

1. **ESP32 Setup:** Upload `esp32_relay_controller.ino`, connect relays
2. **Development:** `npm install && npm run build`
3. **Android Build:** `npx cap add android && npx cap sync android`
4. **APK:** Build di Android Studio atau `./gradlew assembleRelease`
5. **Deploy:** Install APK ke Android, pair dengan ESP32

---

**Catatan Production:**
- ESP32 perlu power supply stabil untuk relay
- APK harus signed untuk distribution
- Test koneksi Bluetooth di lingkungan production
- Backup keystore untuk update aplikasi

Untuk troubleshooting lanjutan, check console log ESP32 dan Android logcat.
