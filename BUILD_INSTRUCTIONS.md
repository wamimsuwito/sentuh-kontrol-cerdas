
# Nice Ningrum - Sentuh Kontrol Cerdas
## Panduan Build dan Setup Lengkap

### 📋 Daftar Isi
1. [Persiapan Hardware](#persiapan-hardware)
2. [Upload Code ke Arduino](#upload-code-ke-arduino)
3. [Setup Development Environment](#setup-development-environment)
4. [Build untuk Production](#build-untuk-production)
5. [Setup untuk Offline Use](#setup-untuk-offline-use)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Persiapan Hardware

### Komponen yang Dibutuhkan:
- Arduino Mega 2560
- 16x Relay Module (5V)
- Kabel USB A to B
- Kabel jumper
- Breadboard (opsional)
- Limit Switch (opsional)

### Koneksi Hardware:
```
Arduino Mega 2560 Pin Assignment:
├── Relay 1-16    → Pin Digital 22-37
├── LED Indikator → Pin 13 (built-in)
├── Limit Switch  → Pin 2 (dengan pull-up internal)
└── USB           → Port Serial untuk komunikasi
```

### Skema Koneksi Detail:
```
Relay Module → Arduino Mega
VCC          → 5V
GND          → GND
IN1          → Pin 22 (Relay 1)
IN2          → Pin 23 (Relay 2)
...
IN16         → Pin 37 (Relay 16)

Limit Switch → Arduino Mega
Terminal 1   → Pin 2
Terminal 2   → GND
```

---

## 📤 Upload Code ke Arduino

### 1. Install Arduino IDE
- Download dari: https://www.arduino.cc/en/software
- Install driver USB untuk Arduino Mega 2560

### 2. Setup Arduino IDE
```
Tools → Board → Arduino AVR Boards → Arduino Mega or Mega 2560
Tools → Processor → ATmega2560 (Mega 2560)
Tools → Port → (Pilih port COM yang sesuai)
```

### 3. Upload Code
- Buka file `arduino_mega_2560_code.ino`
- Klik tombol Upload (→)
- Tunggu hingga "Done uploading" muncul

### 4. Test Koneksi
- Buka Serial Monitor (Ctrl+Shift+M)
- Set baud rate ke 9600
- Kirim command: `STATUS`
- Arduino harus merespon dengan status relay

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

### 3. Test di Browser
- Buka Chrome atau Edge (diperlukan untuk Web Serial API)
- Akses: http://localhost:5173
- Hubungkan Arduino via USB
- Test koneksi Arduino

---

## 🏗️ Build untuk Production

### 1. Build Static Files
```bash
# Build project
npm run build

# File hasil build ada di folder 'dist'
```

### 2. Setup Local Web Server
```bash
# Install http-server global
npm install -g http-server

# Serve built files
cd dist
http-server -p 8080

# Akses via: http://localhost:8080
```

### 3. Alternative: Python Server
```bash
# Masuk ke folder dist
cd dist

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

---

## 🔌 Setup untuk Offline Use

### Method 1: Standalone Executable (Recommended)

#### Install Electron Packager
```bash
npm install electron -g
npm install electron-packager -g
```

#### Create Electron App
Buat file `electron-main.js`:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false  // Needed for Web Serial API
    }
  });

  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Package Application
```bash
# Build the web app first
npm run build

# Package for Windows
electron-packager . nice-ningrum --platform=win32 --arch=x64 --out=releases/

# Package for Linux
electron-packager . nice-ningrum --platform=linux --arch=x64 --out=releases/

# Package for macOS
electron-packager . nice-ningrum --platform=darwin --arch=x64 --out=releases/
```

### Method 2: Portable Web Server

#### Create Portable Package
```bash
# Create portable folder
mkdir nice-ningrum-portable
cd nice-ningrum-portable

# Copy built files
cp -r ../dist/* .

# Download portable web server (contoh: Mongoose)
# https://github.com/cesanta/mongoose/releases
```

#### Windows Batch File
Buat `start.bat`:
```batch
@echo off
echo Starting Nice Ningrum Server...
echo.
echo Server akan berjalan di: http://localhost:8080
echo Tekan Ctrl+C untuk stop server
echo.
start http://localhost:8080
python -m http.server 8080
pause
```

#### Linux Shell Script
Buat `start.sh`:
```bash
#!/bin/bash
echo "Starting Nice Ningrum Server..."
echo "Server akan berjalan di: http://localhost:8080"
echo "Tekan Ctrl+C untuk stop server"
echo
xdg-open http://localhost:8080 &
python3 -m http.server 8080
```

---

## 🔧 Troubleshooting

### Arduino Connection Issues
```
Problem: Arduino tidak terdeteksi
Solution: 
- Install driver CH340/CH341 atau FTDI
- Check Device Manager (Windows)
- Coba port USB lain
- Restart Arduino IDE
```

### Web Serial API Issues
```
Problem: "Web Serial API tidak didukung"
Solution:
- Gunakan Chrome/Edge terbaru
- Enable flags: chrome://flags/#enable-experimental-web-platform-features
- Tidak bisa di Firefox/Safari
```

### Build Errors
```
Problem: npm install gagal
Solution:
- Clear npm cache: npm cache clean --force
- Delete node_modules dan package-lock.json
- npm install ulang
- Check Node.js version (minimal v16)
```

### Relay Tidak Berfungsi
```
Problem: Relay tidak aktif
Solution:
- Check koneksi hardware
- Test manual via Serial Monitor
- Check voltase relay (5V/12V)
- Verify pin assignment di code Arduino
```

---

## 📱 Deploy ke Mobile (Opsional)

### Build APK untuk Android
```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Build dan sync
npm run build
npx cap sync android

# Open Android Studio
npx cap open android

# Build APK di Android Studio
```

---

## 📞 Support & Contact

Jika ada pertanyaan atau masalah:
1. Check Serial Monitor untuk debug Arduino
2. Check Browser Console (F12) untuk debug web app
3. Pastikan driver Arduino terinstall
4. Test dengan perangkat USB lain

## 🔄 Update Instructions

Untuk update aplikasi:
1. Backup file konfigurasi
2. Download versi terbaru
3. Re-build sesuai panduan
4. Test semua fungsi sebelum production

---

**Catatan Penting:**
- Aplikasi memerlukan browser Chrome/Edge untuk Web Serial API
- Arduino harus tetap terhubung via USB saat aplikasi berjalan
- Untuk production, disarankan menggunakan UPS untuk stabilitas power
