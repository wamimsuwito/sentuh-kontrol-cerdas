
# NiceNingrum - Sentuh Kontrol Cerdas 
## Panduan Lengkap Build APK Android dengan ESP32 Bluetooth LE

### 📱 Sistem Kontrol Vending Machine Modern
Aplikasi Android untuk mengontrol relay ESP32 melalui Bluetooth LE dengan antarmuka yang futuristik dan responsif.

---

## 📋 Daftar Isi
1. [Persiapan Hardware ESP32](#-persiapan-hardware-esp32)
2. [Setup Development Environment](#-setup-development-environment)  
3. [Build APK Android](#-build-apk-android)
4. [Troubleshooting](#-troubleshooting)
5. [Production Deployment](#-production-deployment)

---

## 🔧 Persiapan Hardware ESP32

### Komponen yang Dibutuhkan:
- **ESP32 Development Board** (ESP32-WROOM-32 atau ESP32-DevKitC)
- **16x Relay Module 5V** (dengan optocoupler)
- **Kabel Micro USB** untuk programming
- **Kabel Jumper & Breadboard**
- **Power Supply 5V/3A** untuk relay
- **Limit Switch** (opsional)

### Skema Koneksi Hardware:
```
ESP32 GPIO Assignment untuk 16 Relay:
GPIO 2  → Relay 1  (Kopi Hitam)     |  GPIO 26 → Relay 10 (Biskuit)
GPIO 4  → Relay 2  (Kopi Susu)      |  GPIO 27 → Relay 11 (Permen) 
GPIO 5  → Relay 3  (Cappuccino)     |  GPIO 32 → Relay 12 (Coklat)
GPIO 18 → Relay 4  (Latte)          |  GPIO 33 → Relay 13 (Marlboro)
GPIO 19 → Relay 5  (Es Teh)         |  GPIO 12 → Relay 14 (Gudang Garam)
GPIO 21 → Relay 6  (Es Jeruk)       |  GPIO 14 → Relay 15 (Sampoerna)
GPIO 22 → Relay 7  (Es Kelapa)      |  GPIO 15 → Relay 16 (Djarum)
GPIO 23 → Relay 8  (Jus Buah)       |  GPIO 13 → Limit Switch
GPIO 25 → Relay 9  (Keripik)        |  Built-in LED untuk indikator

Power Supply:
- ESP32: 3.3V dari USB atau 5V ke VIN
- Relay Module: 5V/3A eksternal (WAJIB)
- Ground: Semua ground dihubungkan bersama
```

### Upload Code ke ESP32:

1. **Install Arduino IDE**: Download dari https://www.arduino.cc/en/software
2. **Setup ESP32 Board**:
   ```
   File → Preferences → Additional Board Manager URLs:
   https://dl.espressif.com/dl/package_esp32_index.json
   
   Tools → Board Manager → Search "ESP32" → Install
   Tools → Board → ESP32 Dev Module
   Tools → Port → (Pilih port COM yang sesuai)
   ```
3. **Upload Code**: Buka `esp32_relay_controller.ino` dan upload
4. **Test Koneksi**: Serial Monitor (115200 baud) harus menampilkan "ESP32_Relay_Controller siap!"

---

## 💻 Setup Development Environment

### Prerequisites:
- **Node.js** v18+ (Download: https://nodejs.org/)
- **Java JDK 11+** (Required untuk Android build)
- **Android Studio** dengan Android SDK (https://developer.android.com/studio)
- **Git** untuk version control

### Install Dependencies:
```bash
# Clone atau extract project
cd sentuh-kontrol-cerdas

# Install semua dependencies
npm install

# Test development server (Bluetooth tidak akan berfungsi di browser)
npm run dev
```

### Setup Android Development:
```bash
# Install Capacitor CLI global
npm install -g @capacitor/cli

# Add Android platform 
npx cap add android

# Sync project dengan platform Android
npx cap sync android
```

---

## 📱 Build APK Android

### 1. Konfigurasi Android Studio:
```bash
# Buka Android Studio untuk project
npx cap open android

# Tunggu Gradle sync selesai (bisa 5-10 menit pertama kali)
# Install missing SDK components jika diminta
```

### 2. Build Development APK:
```bash
# Build web assets terlebih dahulu
npm run build

# Sync ke Android
npx cap sync android

# Build debug APK via command line
cd android
./gradlew assembleDebug

# APK tersimpan di: android/app/build/outputs/apk/debug/
```

### 3. Build Release APK (Production):
```bash
# Generate keystore (hanya sekali)
keytool -genkey -v -keystore release-key.keystore -alias niceningrum_key -keyalg RSA -keysize 2048 -validity 10000

# Edit android/app/build.gradle untuk signing config
# Build release APK
./gradlew assembleRelease

# APK tersimpan di: android/app/build/outputs/apk/release/
```

### 4. Install APK ke Device:
```bash
# Via ADB (USB debugging aktif)
adb install app-debug.apk

# Atau copy APK ke smartphone dan install manual
# Enable "Install from Unknown Sources" di Android settings
```

---

## 🔧 Troubleshooting

### ❌ ESP32 Connection Issues
```
Problem: ESP32 tidak terdeteksi di Arduino IDE
Solution: 
✅ Install driver CP2102/CH340 dari official website
✅ Hold tombol BOOT saat upload
✅ Coba port USB lain dan kabel yang berbeda
✅ Check Device Manager (Windows) untuk driver issues

Problem: Bluetooth ESP32 tidak terlihat di Android
Solution:
✅ Reset ESP32 (tekan tombol EN)
✅ Check Serial Monitor untuk pesan error
✅ Pastikan power supply relay cukup (5V/3A)
✅ Clear Bluetooth cache Android: Settings > Apps > Bluetooth > Storage > Clear Cache
```

### ❌ Android Build Issues
```
Problem: Gradle build failed
Solution:
✅ Update Android Studio ke versi terbaru
✅ Check Java version: java -version (harus JDK 11+)
✅ Clean project: ./gradlew clean
✅ Delete node_modules dan npm install ulang
✅ Check internet connection untuk download dependencies

Problem: "SDK not found" error
Solution:
✅ Set ANDROID_HOME environment variable
✅ Install Android SDK 33+ via Android Studio
✅ Accept all Android licenses: sdkmanager --licenses
```

### ❌ Bluetooth Permission Issues
```
Problem: "Bluetooth permission denied" 
Solution:
✅ Check AndroidManifest.xml sudah include semua permissions
✅ Request runtime permission untuk Android 12+
✅ Enable Location Services (required untuk BLE scan)
✅ Allow app permissions: Settings > Apps > [App Name] > Permissions

Problem: Cannot scan BLE devices
Solution:
✅ Enable Bluetooth di Android settings
✅ Grant Location permission ke aplikasi
✅ Check ESP32 menyala dan advertising
✅ Try restart aplikasi dan Android
```

### ❌ App Runtime Issues
```
Problem: App crash saat startup
Solution:
✅ Check logcat untuk error details: adb logcat
✅ Clear app data: Settings > Apps > [App Name] > Storage > Clear Data
✅ Uninstall dan install ulang APK
✅ Check dependencies version di package.json

Problem: Cannot connect to ESP32 dari APK
Solution:
✅ Pastikan ESP32 powered on dan relay power supply ok
✅ Clear Bluetooth cache dan restart Android
✅ Check distance ESP32-Android (max 10 meter)
✅ Try unpair dan pair ulang ESP32 manual
✅ Check ESP32 tidak terhubung ke device lain
```

### ❌ Relay Hardware Issues
```
Problem: Relay tidak aktif walau command terkirim
Solution:
✅ Check koneksi GPIO ESP32 ke relay module
✅ Verify power supply relay 5V (ESP32 GPIO hanya 3.3V)
✅ Test relay manual via Serial Monitor ESP32
✅ Check kontinuitas kabel dengan multimeter
✅ Pastikan relay module compatible dengan 3.3V logic level
```

---

## 🚀 Production Deployment

### Build Production APK:
```bash
# 1. Set production config
# Edit capacitor.config.ts - comment out server config
# Set webContentsDebuggingEnabled: false

# 2. Build optimized
npm run build
npx cap sync android

# 3. Generate signed APK
cd android
./gradlew assembleRelease

# 4. Test APK di real device sebelum distribute
```

### APK Distribution:
- **Internal Testing**: Share APK file langsung
- **Google Play Store**: Upload AAB file
- **Enterprise**: Sign dengan enterprise certificate

### Security Checklist:
- ✅ Remove development server URL dari capacitor.config.ts
- ✅ Disable WebView debugging untuk production
- ✅ Validate Bluetooth permissions minimal yang diperlukan
- ✅ Test di berbagai Android version (min SDK 24)
- ✅ Backup keystore file dengan aman

---

## 📊 Spesifikasi Teknis

### Requirements:
- **Android**: 7.0+ (API level 24+)
- **Bluetooth**: BLE 4.0+ support
- **ESP32**: ESP32-WROOM-32 atau compatible
- **Memory**: Min 2GB RAM Android device
- **Storage**: ~50MB untuk aplikasi

### Network & Connectivity:
- **Bluetooth LE**: Primary communication
- **Range**: 10-50 meter (tergantung environment)
- **Latency**: <500ms untuk relay command
- **Concurrent**: Support 1 Android device per ESP32

---

## 🔄 Update Instructions

### Update Aplikasi:
1. Update code ESP32 jika diperlukan
2. Update React codebase  
3. Build: `npm run build && npx cap sync android`
4. Generate APK baru dengan version code yang lebih tinggi
5. Test semua fungsi sebelum distribute

### Backup Important Files:
- `release-key.keystore` - WAJIB backup untuk update
- `esp32_relay_controller.ino` - Backup ESP32 code
- `capacitor.config.ts` - App configuration

---

## 📞 Support & Resources

### Documentation Links:
- [ESP32 Bluetooth Guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/index.html)
- [Capacitor Bluetooth LE](https://github.com/capacitor-community/bluetooth-le)
- [Android Bluetooth Development](https://developer.android.com/guide/topics/connectivity/bluetooth)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)

### Common Commands Quick Reference:
```bash
# Development
npm run dev                    # Start dev server
npm run build                 # Build for production
npx cap sync android          # Sync to Android
npx cap open android          # Open Android Studio

# Build APK
cd android
./gradlew assembleDebug       # Debug APK
./gradlew assembleRelease     # Production APK

# Debugging
adb logcat                    # View Android logs
adb devices                   # List connected devices
adb install app-debug.apk     # Install APK via ADB
```

**Catatan Penting**: 
- Selalu test di real Android device, emulator tidak support Bluetooth
- ESP32 memerlukan power supply terpisah untuk relay (5V/3A)
- Backup keystore file untuk update aplikasi di masa depan
- Test jangkauan Bluetooth di environment production

---
*Build dengan ❤️ untuk sistem vending machine modern*
