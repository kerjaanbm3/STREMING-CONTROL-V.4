# 🚀 Cara Menjalankan Server — BM3 TV Streaming Control V.4

Panduan lengkap untuk menyalakan server **Broadcast Overlay Control System** secara lokal maupun dalam jaringan LAN.

---

## ⚙️ Prasyarat (Lakukan Sekali Saja)

Sebelum pertama kali menjalankan server, pastikan semua dependensi sudah terpasang.

### 1. Install Node.js
Pastikan **Node.js v18+** sudah terinstall di komputer.
- Download: https://nodejs.org/

Cek versi dengan perintah:
```bash
node -v
npm -v
```

### 2. Install Semua Package
Buka terminal di folder project, lalu jalankan:
```bash
npm install
```

### 3. Setup Database (Prisma)
Jalankan perintah berikut secara berurutan untuk membuat dan menyiapkan database SQLite:

```bash
# Generate Prisma Client
npm run prisma:generate

# Buat/Sinkronkan skema database
npm run prisma:push

# (Opsional) Isi data awal / seed
npm run prisma:seed
```

> ⚠️ **Catatan:** Langkah database ini hanya perlu dilakukan **sekali** saat pertama kali setup, atau jika ada perubahan pada `prisma/schema.prisma`.

---

## ▶️ Menjalankan Server

### Mode Development (Sehari-hari)

Gunakan perintah ini untuk penggunaan harian. Server akan otomatis reload jika ada perubahan kode.

```bash
npm run dev
```

### Mode Production (Siaran Resmi / Stabil)

Gunakan mode ini saat siaran live agar performa lebih optimal dan stabil.

```bash
# Langkah 1: Build project terlebih dahulu
npm run build

# Langkah 2: Jalankan server production
npm run start
```

---

## ✅ Konfirmasi Server Berjalan

Setelah server menyala, terminal akan menampilkan pesan seperti berikut:

```
> Broadcast Overlay System Ready!
> Local Web Panel:        http://localhost:3001/admin
> Scoreboard Overlay:     http://localhost:3001/overlay/scoreboard
> Pick & Ban Overlay:     http://localhost:3001/overlay/pick-ban
> BR Standings Overlay:   http://localhost:3001/overlay/standings
> Lower Third Overlay:    http://localhost:3001/overlay/lower-third
> vMix JSON Data Source:  http://localhost:3001/api/live-data
> LAN access enabled on all network interfaces (0.0.0.0:3001)
```

---

## 🌐 Daftar URL Halaman

| Halaman | URL | Keterangan |
|---|---|---|
| **Admin Panel** | `http://localhost:3001/admin` | Panel kontrol utama |
| **Scoreboard Overlay** | `http://localhost:3001/overlay/scoreboard` | Overlay skor pertandingan |
| **Pick & Ban Overlay** | `http://localhost:3001/overlay/pick-ban` | Overlay fase pick & ban |
| **BR Standings Overlay** | `http://localhost:3001/overlay/standings` | Overlay klasemen Battle Royale |
| **Lower Third Overlay** | `http://localhost:3001/overlay/lower-third` | Overlay teks bawah layar |
| **vMix Live Data** | `http://localhost:3001/api/live-data` | JSON data source untuk vMix |

### Akses dari PC Lain (LAN / Dual-PC Setup)

Ganti `localhost` dengan **IP Address** PC server di jaringan LAN yang sama.

Contoh:
```
http://192.168.1.XXX:3001/admin
http://192.168.1.XXX:3001/overlay/scoreboard
```

Cek IP Address PC server dengan perintah:
```bash
ipconfig
```
Cari bagian **IPv4 Address** pada adapter jaringan yang aktif.

---

## 🛑 Menghentikan Server

Di terminal tempat server berjalan, tekan:

```
Ctrl + C
```

Kemudian konfirmasi dengan menekan `Y` jika diminta.

---

## 🔧 Troubleshooting

### Port 3001 sudah digunakan
Jika muncul error `EADDRINUSE: address already in use :::3001`, berarti ada proses lain yang memakai port tersebut.

Cari dan hentikan proses di port 3001:
```bash
# Cari proses yang menggunakan port 3001
netstat -ano | findstr :3001

# Hentikan proses berdasarkan PID (ganti <PID> dengan angka yang ditemukan)
taskkill /PID <PID> /F
```

Atau ganti port default dengan membuat file `.env` di root folder:
```env
PORT=3002
```

### Database error / tabel tidak ditemukan
Jalankan ulang perintah prisma:
```bash
npm run prisma:push
```

### Module tidak ditemukan
Jalankan ulang instalasi package:
```bash
npm install
```

### Perubahan kode tidak tampil (mode production)
Di mode production, perubahan kode memerlukan build ulang:
```bash
npm run build
npm run start
```

---

## 📁 Struktur Penting

```
STREMING CONTROL V.4/
├── server.ts          ← Entry point server utama (Next.js + Socket.io)
├── package.json       ← Script npm & daftar dependensi
├── next.config.js     ← Konfigurasi Next.js
├── prisma/
│   ├── schema.prisma  ← Definisi skema database
│   ├── dev.db         ← File database SQLite
│   └── seed.ts        ← Script data awal
├── pages/             ← Halaman Next.js (admin, overlay, api)
├── components/        ← Komponen React
└── lib/               ← Library & service (data-sync, dll)
```

---

*Dokumentasi ini dibuat untuk **BM3 TV Streaming Control V.4** — Professional Hybrid Desktop & Web Broadcast Overlay Control System.*
