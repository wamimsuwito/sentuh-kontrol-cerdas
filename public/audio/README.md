
# Audio Files Directory

Tempat ini untuk menyimpan file MP3 yang akan diputar pada kondisi tertentu.

## File yang dibutuhkan:

1. **customer-detected.mp3**
   - Diputar saat sensor mendeteksi kedatangan pelanggan
   - Lokasi: `public/audio/customer-detected.mp3`

2. **limit-switch-active.mp3**
   - Diputar saat limit switch diaktifkan (pembayaran diterima)
   - Lokasi: `public/audio/limit-switch-active.mp3`

3. **processing-active.mp3**
   - Diputar saat layar proses sedang berjalan (relay aktif)
   - Lokasi: `public/audio/processing-active.mp3`

## Cara menggunakan:

1. Letakkan file MP3 Anda dengan nama yang sesuai di folder ini
2. Pastikan nama file sesuai dengan yang disebutkan di atas
3. File akan otomatis diputar sesuai kondisi yang terjadi di aplikasi

## Format yang didukung:
- MP3 (disarankan)
- Volume default: 80%
- Audio akan di-preload untuk performa yang lebih baik

## Fallback Audio:
Jika file MP3 tidak tersedia, sistem akan menggunakan suara beep sebagai pengganti:
- **customer-detected**: Dua beep pendek
- **limit-switch-active**: Beep berkelanjutan
- **processing-active**: Tiga beep naik

## Troubleshooting:
- Pastikan file berada di folder yang benar
- Pastikan nama file sesuai (case-sensitive)
- Cek console untuk pesan error
- Jika masih bermasalah, fallback sound akan digunakan
