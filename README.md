# KetikPro v2 — Master Mengetik 10 Jari (Standalone Edition)

Aplikasi web modern, interaktif, dan mandiri untuk belajar mengetik sepuluh jari (*touch typing*) bertahap dalam Bahasa Indonesia.

Dibangun dari nol (*from scratch*) tanpa dependensi vendor eksternal, bebas bloatware, dan berjalan 100% di environment lokal.

---

## 🚀 Fitur Unggulan

1. **Kurikulum Progresif 10 Level (43 Materi Pelajaran):**
   - Mulai dari pengenalan posisi duduk & tonjolan taktil F dan J.
   - Home row (`A S D F J K L ;`), Top row, Bottom row, simbol, angka, hingga kalimat bahasa Indonesia.
   - **Level Gating:** Level berikutnya terkunci secara otomatis hingga seluruh pelajaran di level aktif berhasil diselesaikan dan lulus.
2. **Interactive Virtual Keyboard & Hands Guide:**
   - Keyboard virtual tactile dengan feedback tombol real-time (*hit state* hijau/merah).
   - Animasi panduan posisi 10 jari dinamis dan indikasi tombol Shift.
   - Pemandu taktil Home Row (A S D F — J K L ;) dengan pemetaan visual.
3. **Sound Engine Sintetis (Mechanical Switch Audio):**
   - Menggunakan Web Audio API native tanpa file audio eksternal dan bebas latensi.
   - Pilihan profil suara: *Mechanical Blue Click*, *Warm Tactile Thock*, *Vintage Typewriter*, atau *Mute (Off)*.
   - Efek audio kesalahan lembut (*soft error chime*) dan jingle kelulusan saat menyelesaikan materi.
4. **Dashboard Statistik Real-time & Weak Keys Analysis:**
   - Metrik akurasi %, WPM (Kata Per Menit), CPM, jumlah salah, dan waktu.
   - Deteksi tombol lemah (*Weak Keys Heatmap*) yang menunjukkan tuts mana yang paling sering salah ketik.
   - Grafik batang interaktif riwayat WPM 10 sesi terakhir.
5. **Tes Kecepatan 60 Detik (*Speed Test*):**
   - Uji kecepatan murni dengan teks narasi bahasa Indonesia acak.
   - Klasifikasi tingkat keahlian (*Pro/Master*, *Cepat*, *Rata-rata*, *Membangun Akurasi*).
6. **Panduan Ergonomi & Kesehatan Mengetik:**
   - Tips postur duduk, teknik pergelangan tangan melayang, dan tabel tugas 10 jari.
7. **Cadangan Data Mandiri (JSON Export / Import):**
   - Ekspor dan impor seluruh riwayat latihan dalam satu file `.json`.
   - Dukungan tema Dark Mode & Light Mode dengan standar OKLCH yang elegan.

---

## 🛠️ Stack Teknologi

- **Frontend:** React 19.2 + TypeScript (Strict Mode)
- **Bundler & Tooling:** Vite 8 (Ultra Fast Dev & Build)
- **Styling:** Tailwind CSS v4 + Design Tokens Kustom (OKLCH Color Space)
- **Routing:** React Router v7 (Client-side Hash Routing tanpa risiko 404 saat refresh)
- **Audio:** Web Audio API Native Synthesizer
- **Visual Effects:** Canvas Confetti & Lucide React Icons
- **Testing:** Vitest

---

## 💻 Cara Menjalankan di Lokal

### 1. Masuk ke direktori project:
```bash
cd ketikpro-app
```

### 2. Install dependensi (jika belum):
```bash
npm install
```

### 3. Jalankan server pengembang (Development Server):
```bash
npm run dev
```
Buka browser pada alamat: **http://localhost:5173/**

### 4. Menjalankan Unit Tests:
```bash
npm test
```

### 5. Build Produksi:
```bash
npm run build
```

---

## 📁 Struktur Direktori

```
ketikpro-app/
├── index.html                           # Entry HTML & Google Fonts
├── package.json                         # Dependensi & script
├── vite.config.ts                       # Konfigurasi Vite & Tailwind CSS v4
├── src/
│   ├── main.tsx                         # Entry React
│   ├── App.tsx                          # Router & AppShell wrapper
│   ├── index.css                        # Design system tokens (OKLCH, tactile keys)
│   ├── core/
│   │   ├── constants/curriculum.ts      # Data kurikulum 10 level & teks latihan
│   │   ├── engine/soundEngine.ts        # Synthesizer Web Audio API
│   │   └── storage/progressStorage.ts   # Penyimpanan progres & JSON backup
│   ├── hooks/
│   │   ├── useTypingSession.ts          # Engine pengetikan & event keyboard
│   │   ├── useUserProgress.ts           # State progres, gating & bintang
│   │   ├── useSound.ts                  # State audio & switcher
│   │   └── useTheme.ts                  # State dark / light mode
│   ├── components/
│   │   ├── layout/AppShell.tsx          # Navigasi sidebar & header
│   │   ├── keyboard/
│   │   │   ├── VirtualKeyboard.tsx      # Keyboard interaktif
│   │   │   ├── KeyCap.tsx               # Komponen tombol individual
│   │   │   ├── HandsGuide.tsx           # Animasi 10 jari
│   │   │   └── HomeRowGuide.tsx         # Visual home row
│   │   └── typing/
│   │       ├── TypingDisplay.tsx        # Area teks ketik & caret
│   │       ├── MetricsBar.tsx           # Bar WPM, akurasi, waktu
│   │       └── ResultDialog.tsx         # Modal evaluasi hasil & bintang
│   ├── pages/
│   │   ├── DashboardPage.tsx            # Halaman utama progres
│   │   ├── CurriculumPage.tsx           # Daftar 10 level
│   │   ├── LessonPage.tsx               # Halaman latihan interaktif
│   │   ├── SpeedTestPage.tsx            # Halaman tes kecepatan 60 detik
│   │   ├── FingerGuidePage.tsx          # Halaman panduan ergonomi
│   │   └── SettingsPage.tsx             # Halaman pengaturan & cadangan data
│   └── test/
│       └── core.test.ts                 # 16 Unit test Vitest (100% lulus)
```
