
# 🚀 Quick Build Guide - NiceNingrum APK

## Fast Track untuk Build APK (30 menit)

### ⚡ Prerequisites Check
- [ ] Node.js 18+ installed
- [ ] Android Studio installed  
- [ ] Java JDK 11+ installed
- [ ] ESP32 dengan code sudah uploaded

### 📋 Step-by-Step Build Process

#### 1. Setup Project (5 menit)
```bash
cd sentuh-kontrol-cerdas
npm install
npx cap add android
npx cap sync android
```

#### 2. Configure Android (10 menit)
```bash
# Open Android Studio
npx cap open android

# Wait for Gradle sync
# Install any missing SDK components
# Accept all licenses
```

#### 3. Build APK (10 menit)
```bash
# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Build debug APK
cd android
./gradlew assembleDebug
```

#### 4. Install & Test (5 menit)
```bash
# Install to connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# Or copy APK to phone and install manually
```

### 🔧 Common Build Fixes

#### Build Failed?
```bash
# Clean everything
./gradlew clean
cd ..
rm -rf node_modules
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

#### Permissions Error?
- Check `android/app/src/main/AndroidManifest.xml` exists
- Verify all Bluetooth permissions included
- Enable Location Services on Android device

#### ESP32 Not Found?
- Check ESP32 powered on
- Enable Bluetooth on Android
- Grant Location permission to app
- Try restart both ESP32 and Android

### 📱 Production Build (Optional)
```bash
# Generate keystore (once only)
keytool -genkey -v -keystore release-key.keystore -alias niceningrum -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
./gradlew assembleRelease
```

### 🎯 Success Checklist
- [ ] APK builds without errors
- [ ] APK installs on Android device  
- [ ] App launches successfully
- [ ] Bluetooth connects to ESP32
- [ ] Relay commands work
- [ ] All 4 categories accessible

### 🆘 Emergency Contacts
- **Build Issues**: Check README.md troubleshooting section
- **Hardware Issues**: Verify ESP32 code and wiring
- **Android Issues**: Check Android logs with `adb logcat`

**Total Build Time**: ~30 menit (first time), ~5 menit (subsequent builds)
