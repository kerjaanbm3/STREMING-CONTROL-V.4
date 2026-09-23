# DESIGN DOCUMENT: BROADCAST OVERLAY CONTROL SYSTEM (HYBRID DESKTOP & WEB)

## 1. PROJECT OVERVIEW & GOALS
System ini adalah **Broadcast Overlay Control System** kelas profesional berarsitektur *Hybrid Desktop & Web*. Sistem ini dirancang untuk memenuhi standar penyiaran (*live broadcasting*) acara olahraga fisik (Sepak Bola, Futsal, Basket) serta esports (MOBA seperti Mobile Legends/Wild Rift/Dota 2, dan Battle Royale seperti PUBG/Free Fire).

Aplikasi bertindak sebagai server web lokal sekaligus menyediakan antarmuka pengontrol desktop (*desktop control panel*). Tujuan utamanya adalah memberikan kontrol grafik *real-time* yang fleksibel, responsif, hemat *resource*, dan 100% dapat berjalan secara *offline* tanpa internet di lokasi acara.

---

## 2. SYSTEM ARCHITECTURE & TECH STACK

- **Desktop Framework:** Nextron (Next.js + Electron Integration)
- **Database & ORM:** Prisma ORM dengan SQLite (`file:./dev.db`)
- **Real-Time Engine:** Socket.io (WebSocket Server) + Node.js Event Emitter
- **Graphics & Animation Engine:** Framer Motion + Tailwind CSS
- **Offline Storage Engine:** Native Node.js `fs` (Menyimpan logo tim, sponsor, dan foto pemain ke `appData/uploads`)
- **Broadcast Integration:** `obs-websocket-js` API client

---

## 3. FEATURE SPECIFICATIONS BY EVENT MODULE

### A. Physical Sports Module (Soccer, Futsal, Basketball)
- **Advanced Match Timer:** Fitur *count-up/count-down*, *pause/resume*, *reset*, indikator babak (*Half 1, Half 2, Extra Time, Penalty*), dan penambahan waktu (*Injury Time*).
- **Event Action Pop-ups:** Trigger animasi langsung saat terjadi Gol, Kartu Kuning/Merah, Pelanggaran (*Foul Counter/Limit*), dan *Timeout*.
- **Lineup & Tactical Formation:** Tampilan *Starting XI*, formasi taktik (misal: 4-3-3, 4-2-3-1), serta daftar pemain cadangan.
- **Match Statistics Comparison:** Grafik perbandingan statistik pertandingan secara *real-time* (*Ball Possession %, Shots on Target, Corner Kicks, Fouls*).

### B. Esports MOBA Module (Mobile Legends, Wild Rift, Dota 2)
- **Real-time Draft Pick & Ban Overlay:** Tampilan visual 10 slot hero (5 Ban & 5 Pick per tim) lengkap dengan animasi status *locking*, indikator giliran *draft*, foto avatar hero, nama *player*, dan *role* (Gold/EXP Lane, Jungler, Mid, Roamer).
- **Best of (BO) Series Indicator:** Indikator poin kemenangan seri (BO1, BO3, BO5, BO7) dalam bentuk lampu/kristal visual yang menyala.
- **VS Screen Match-up:** Tampilan pengenalan visual 2 tim sebelum pertandingan dimulai.

### C. Esports Battle Royale Module (PUBG, Free Fire)
- **Live Match Standings & Leaderboard:** Tabel klasemen poin yang menghitung gabungan *Placement Points* dan *Kill/Elimination Points* dari banyak tim secara otomatis.
- **WWCD / Booyah Banner:** Animasi selebrasi kemenangan khusus saat pertandingan berakhir.

### D. General Broadcast & Sponsorship Module
- **Lower Thirds & Caster Info:** Tampilan identitas nama *host*, *caster*, *analyst*, atau narasumber yang sedang tampil di layar.
- **Ticker / Running Text Traffic:** Teks berjalan di bagian bawah layar untuk pengumuman, jadwal acara, atau media sosial.
- **Sponsor Logo Carousel:** Sistem rotasi logo sponsor otomatis (*auto-rotate*) dengan durasi interval dan urutan yang bisa diatur.
- **Tournament Bracket:** Grafik bagan fase eliminasi (*Quarter Final, Semi Final, Grand Final*).
- **Break Screen & Media Overlay:** Tampilan *Starting Soon*, *Be Right Back*, *Stream Cam Frame*, dan *Post-Match Summary*.

---

## 4. DATABASE SCHEMA (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Event {
  id               String           @id @default(uuid())
  name             String
  eventType        String           // "SPORT", "ESPORT_MOBA", "ESPORT_BR"
  startDate        DateTime
  endDate          DateTime?
  location         String?
  matches          Match[]
  sponsors         Sponsor[]
  overlayTemplate  OverlayTemplate? @relation(fields: [templateId], references: [id])
  templateId       String?
  createdAt        DateTime         @default(now())
}

model Match {
  id             String         @id @default(uuid())
  eventId        String
  event          Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  teamAId        String
  teamA          Team           @relation("TeamAMatches", fields: [teamAId], references: [id])
  teamBId        String
  teamB          Team           @relation("TeamBMatches", fields: [teamBId], references: [id])
  scoreA         Int            @default(0)
  scoreB         Int            @default(0)
  boSeries       Int            @default(1) // BO1, BO3, BO5, BO7
  scheduledTime  DateTime
  status         String         @default("UPCOMING") // UPCOMING, LIVE, FINISHED
  timerSeconds   Int            @default(0)
  isTimerRunning Boolean        @default(false)
  currentPeriod  String?        // "Half 1", "Game 2", "Extra Time"
  pickBans       PickBanState[]
  brStandings    BRStanding[]
  createdAt      DateTime       @default(now())
}

model Team {
  id          String       @id @default(uuid())
  name        String
  institution String?      // School/Club origin
  logoUrl     String?      // Local file path in appData/uploads
  brandColor  String?      // Hex code (#FF0000)
  players     Player[]
  matchesAsA  Match[]      @relation("TeamAMatches")
  matchesAsB  Match[]      @relation("TeamBMatches")
  brStandings BRStanding[]
}

model Player {
  id           String         @id @default(uuid())
  teamId       String
  team         Team           @relation(fields: [teamId], references: [id], onDelete: Cascade)
  name         String
  inGameName   String?        // IGN for Esports
  role         String?        // Midlaner, Striker, Coach, etc.
  positionType String         // "PLAYER", "CAPTAIN", "COACH"
  jerseyNumber Int?
  photoProfile String?        // Profile / Pose 1
  photoPose2   String?        // Action Pose 2
  photoPose3   String?        // Action Pose 3
  pickBans     PickBanState[]
}

model Hero {
  id        String         @id @default(uuid())
  name      String
  role      String         // Assassin, Tank, Mage, etc.
  avatarUrl String
  pickBans  PickBanState[]
}

model PickBanState {
  id        String   @id @default(uuid())
  matchId   String
  match     Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  teamType  String   // "TEAM_A" | "TEAM_B"
  action    String   // "PICK" | "BAN"
  slotOrder Int      // Slot order 1 - 10
  heroId    String?
  hero      Hero?    @relation(fields: [heroId], references: [id])
  playerId  String?
  player    Player?  @relation(fields: [playerId], references: [id])
  isLocked  Boolean  @default(false)
}

model BRStanding {
  id            String @id @default(uuid())
  matchId       String
  match         Match  @relation(fields: [matchId], references: [id], onDelete: Cascade)
  teamId        String
  team          Team   @relation(fields: [teamId], references: [id])
  placementRank Int    @default(0)
  killPoints    Int    @default(0)
  totalPoints   Int    @default(0)
}

model Sponsor {
  id           String @id @default(uuid())
  eventId      String
  event        Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  name         String
  logoUrl      String
  displayOrder Int    @default(0)
}

model OverlayTemplate {
  id             String  @id @default(uuid())
  name           String
  primaryColor   String  @default("#000000")
  secondaryColor String  @default("#FFFFFF")
  accentColor    String  @default("#FF0000")
  fontFamily     String  @default("Montserrat")
  customCss      String?
  events         Event[]
}

model HotkeyConfig {
  id          String @id @default(uuid())
  actionName  String @unique // e.g. "SCORE_A_PLUS", "TIMER_TOGGLE"
  keyCode     String // e.g. "Numpad7", "Space"
  description String
}
```

---

## 5. UI/UX DASHBOARD CONTROL & PRESET ENGINE

* **Header Bar:** Event & Match selector aktif, indikator mode aktif (Sport/MOBA/BR), serta indikator status koneksi (Socket.io & OBS WebSocket).
* **All-In-One Workspace:**
* **Sub-Control Toggles:** Side drawers/tabs untuk Scoreboard Controller, Draft Pick-Ban Grid, Lower-Thirds/Caster Trigger, Sponsor Carousel Manager, dan Match Statistics.
* **Live Preview Canvas:** Embedded iframe yang menampilkan mini-preview tampilan grafik `/overlay/scoreboard` secara *live*.
* **Preset Manager:** Fitur 1-Klik Preset untuk memuat pasangan tim, roster pemain, logo, dan gaya overlay sebelum hari pertandingan dimulai.
* **Offline Storage (`appData/uploads`):** Semua aset foto pemain (Pose 1, 2, 3) dan logo disimpan di direktori lokal komputer sehingga tidak memerlukan internet saat produksi.

---

## 6. REMAPPABLE HOTKEY ENGINE SPECIFICATION

Pemetaan keyboard bawaan (dapat diubah melalui menu Settings):

* **Skor Tim A (+1 / -1):** `Numpad 7` / `Shift + Numpad 7`
* **Skor Tim B (+1 / -1):** `Numpad 9` / `Shift + Numpad 9`
* **Timer Start / Pause:** `Spacebar` / `Numpad 5`
* **Trigger Animasi Selebrasi (Goal/WWCD):** `Numpad Enter` / `Key G`
* **Toggle Lower-Third (Caster Info):** `Key L`
* **Toggle Sponsor Carousel:** `Key S`
* **Safety Net (Undo Last Action):** `Ctrl + Z`

---

## 7. SIMULTANEOUS 4-CHANNEL DATA TRANSMISSION PIPELINE

Setiap perubahan nilai di Dashboard Admin akan secara otomatis dan *asynchronous* memicu 4 jalur transmisi data:

```text
                 [ Operator Action in Admin UI ]
                                │
                                ▼
                    [ DataSyncService Engine ]
                                │
  ┌──────────────────┬──────────┴───────────┬──────────────────┐
  │                  │                      │                  │
  ▼                  ▼                      ▼                  ▼
[Channel 1]      [Channel 2]            [Channel 3]        [Channel 4]
Socket.io        Local JSON API         Local .txt Files   OBS-WebSocket
  │                  │                      │                  │
  ▼                  ▼                      ▼                  ▼
Web Overlay      vMix Data Source       OBS Text Source    OBS Studio Input
(/overlay/*)     (/api/live-data)       (/live_output_txt) (Direct API Push)
```

1. **Socket.io Broadcast:** Mengirim *payload* ke halaman `/overlay/*` untuk merender animasi Framer Motion di Browser Source.
2. **Local JSON API Endpoint:** Menyediakan endpoint JSON di `http://localhost:3000/api/live-data` untuk dikonsumsi fitur Data Source vMix.
3. **Local Text Files Generator:** Menulis data secara instan ke file teks lokal (`.txt`) untuk dibaca oleh Text Source OBS Studio pada PC berspesifikasi rendah.
4. **OBS-WebSocket Direct Push:** Mengirim perintah *update* parameter teks secara langsung ke OBS Studio aktif.

---

## 8. DEPLOYMENT & FIELD OPERATION SCENARIOS

* **Skenario 1 PC (Single PC Setup):**
Dashboard Admin dibuka di Monitor 1. OBS Studio atau vMix berjalan di Monitor 2. Software streaming mengambil overlay via URL lokal `http://localhost:3000/overlay/scoreboard`.
* **Skenario 2 PC (Dual PC via Jaringan LAN):**
Operator mengontrol Dashboard Admin melalui Laptop A. PC Streaming (Komputer B) mengambil tampilan overlay melalui IP LAN Laptop A (misal: `http://192.168.1.50:3000/overlay/scoreboard`). Komunikasi data antar PC tetap berjalan cepat via jaringan lokal tanpa butuh internet.

---

## 9. PROJECT FILE STRUCTURE

```text
├── main/                       # Electron Process
│   ├── background.ts           # App Entry Point & Local Web Server Initializer
│   └── helpers/
│       ├── file-storage.ts     # Save uploads to appData/uploads
│       └── obs-client.ts       # OBS WebSocket Connector
├── renderer/                   # Next.js Frontend Process
│   ├── app/ (or pages/)
│   │   ├── admin/
│   │   │   ├── controller.tsx  # All-In-One Dashboard
│   │   │   └── settings.tsx    # Hotkey & Template Settings
│   │   ├── overlay/
│   │   │   ├── scoreboard.tsx  # Transparent Scoreboard
│   │   │   ├── pick-ban.tsx    # Draft Phase View
│   │   │   └── lower-third.tsx # Player/Caster Card
│   │   └── api/
│   │       └── live-data/      # JSON API Endpoint for vMix
│   ├── components/             # React UI & Framer Motion Graphics
│   ├── hooks/                  # Custom useHotkeys & useSocket Hooks
│   └── services/               # DataSyncService Sync Engine
├── prisma/
│   ├── schema.prisma
│   └── dev.db
└── design.md                   # Single Source of Truth Document
```
