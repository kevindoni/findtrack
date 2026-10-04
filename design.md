# FINTRACK — Design System & UI Reference

> **Status:** ACUAN UI FINAL (dikunci). Sumber: 3 mockup di folder proyek.
> Dokumen ini menjadi acuan implementasi frontend (React + Tailwind CSS). Struktur data & aturan bisnis mengacu ke `fintrack.md` (Bagian 34–35).

**File mockup sumber (`ref1.png`, `ref2.png`, `ref3.png`):**
Ketiga gambar mencakup: Landing + Auth (Login/Daftar), Dashboard desktop & mobile (stat card, line chart, donut chart, widget To-Do & Transaksi Terbaru), Transaksi (tabel + filter + form Tambah), Budget Bulanan (progress per kategori), Financial To-Do (tabs Aktif/Selesai/Tertunda), Financial Goal & Laporan (out-of-scope MVP, lihat Bagian 5), mobile responsive (bottom nav + FAB), dan branding FINTRACK.

---

## 1. Design Tokens

### 1.1 Warna

| Token | Nilai | Pemakaian |
| :--- | :--- | :--- |
| `primary` | `#16A34A` (green-600) | Tombol utama (Masuk, Simpan, Tambah), link aktif, angka positif |
| `primary-hover` | `#15803D` (green-700) | Hover tombol |
| `sidebar` | `#0F3D2E` (deep pine) | Background sidebar desktop |
| `sidebar-hover` | `#164A38` | Hover item menu sidebar |
| `sidebar-active` | `#16A34A` | Item menu halaman aktif |
| `mint` | `#E7F4EC` | Background section hero/landing, panel highlight |
| `surface` | `#FFFFFF` | Kartu, tabel, form |
| `page-bg` | `#F7FAF8` | Background area konten |
| `text-primary` | `#111827` (gray-900) | Judul, angka utama |
| `text-secondary` | `#6B7280` (gray-500) | Label, keterangan, tanggal |
| `danger` | `#EF4444` (red-500) | Pengeluaran, progress over budget, delta turun |
| `warning` | `#F59E0B` (amber-500) | Progress budget ≥ 80% (BR-BUD-06), badge "X hari lagi" |
| `border` | `#E5E7EB` (gray-200) | Border kartu, divider, input |

**Palet kategori** (donut chart, progress bar, ikon kategori — diiterasi berurutan):

```
#F97316 (orange)  #3B82F6 (blue)    #8B5CF6 (purple)  #EC4899 (pink)
#14B8A6 (teal)    #EAB308 (yellow)  #22C55E (green)   #9CA3AF (gray)
```

Tailwind: warna `sidebar`, `sidebar-hover`, dan `mint` didaftarkan sebagai custom color di `tailwind.config` / `@theme`; sisanya pakai skala bawaan Tailwind.

### 1.2 Tipografi

| Elemen | Font | Weight |
| :--- | :--- | :--- |
| Font utama | **Inter** (Google Fonts, fallback system-ui) | — |
| Judul halaman (Halo, Rian) | Inter | 700, 24–28px |
| Judul kartu | Inter | 600, 14–16px |
| Angka nominal | Inter (`tabular-nums`) | 700, 18–24px |
| Body / label | Inter | 400–500, 12–14px |

### 1.3 Bentuk & Bayangan

| Elemen | Nilai |
| :--- | :--- |
| Radius kartu | `rounded-2xl` (16px) |
| Radius tombol & input | `rounded-lg` (10px) |
| Radius badge/pill | `rounded-full` |
| Bayangan kartu | `0 4px 16px rgba(15,61,46,0.06)` (soft, hampir tak terlihat) + border `gray-200` |
| Spacing kartu | padding `p-5`/`p-6`, gap grid `gap-4`/`gap-6` |

### 1.4 Ikon

Ikon garis (outline) konsisten dengan mockup: **Lucide Icons** (`lucide-react`). Setiap kategori punya ikon + warna dari palet (contoh: Makanan 🍜 oranye, Transportasi biru, Pendidikan ungu, Tagihan pink, Hiburan teal, Belanja kuning).

---

## 2. Layout

### 2.1 Desktop (≥ md)

```
┌────────────┬──────────────────────────────────────────────┐
│  SIDEBAR   │  Topbar: [🔍 Cari transaksi/kategori...]  🔔 │
│  (dark)    │──────────────────────────────────────────────│
│  FINTRACK  │  Konten (max-w-7xl)                          │
│  ▸ Dashboard│  ┌─ Kartu ─┐ ┌─ Kartu ─┐ ┌─ Kartu ─┐       │
│  ▸ Transaksi│  └─────────┘ └─────────┘ └─────────┘       │
│  ▸ Budget   │                                              │
│  ▸ Financial│                                              │
│    To-Do    │                                              │
│  ▸ Pengaturan│                                             │
│  (profil bawah)                                            │
└────────────┴──────────────────────────────────────────────┘
```

* Sidebar tetap (fixed) 240–256px, background `sidebar`, teks putih; item aktif = pill `primary`.
* Sidebar MVP (sesuai scope terkunci): **Dashboard, Transaksi, Budget, Financial To-Do, Pengaturan**. Item **Goal** dan **Laporan** di mockup = out-of-scope MVP (lihat Bagian 5) — disembunyikan di Tahap 1, muncul di Tahap 2.
* Di sidebar juga ada panel motivasi ("Kelola hari ini...") + profil user di bawah — boleh diimplement sebagai elemen statis.

### 2.2 Mobile (< md)

* Sidebar diganti **bottom navigation 5 item**: Dashboard, Transaksi, Budget, To-Do, Lainnya (sesuai mockup; "Lainnya" membuka sheet berisi Pengaturan/Logout).
* Kartu statistik jadi carousel/stack vertikal; chart donut & line tetap, ukuran menyusut.
* FAB "+" untuk Tambah Transaksi cepat (mockup: tombol hijau bulat).

---

## 3. Inventory Layar → Modul PRD

| Layar di mockup | Route (sitemap Bag. 6 PRD) | Modul / API | Status |
| :--- | :--- | :--- | :--- |
| Landing ("Kelola Keuanganmu, Raih Masa Depanmu") | `/` | publik | MVP |
| Login (email+password, ingat saya) | `/auth/login` | `POST /api/v1/auth/login` | MVP |
| Register (tab "Daftar") | `/auth/register` | `POST /api/v1/auth/register` | MVP (tanpa Google) |
| Dashboard (4 stat card + chart + to-do + transaksi terbaru) | `/app/dashboard` | `GET /api/v1/dashboard/summary` | MVP |
| Transaksi (tabel, filter bulan/tipe/kategori, tambah) | `/app/transactions` | `GET/POST/PUT/DELETE /api/v1/transactions` | MVP |
| Tambah Transaksi (toggle Pemasukan/Pengeluaran, Nominal, Kategori, Tanggal, Catatan) | modal/drawer di `/app/transactions` | `POST /api/v1/transactions` | MVP |
| Budget Bulanan (Total/Terpakai/Sisa + progress per kategori) | `/app/budgets` | `GET/POST/PUT/DELETE /api/v1/budgets` | MVP |
| Financial To-Do (tabs Aktif/Selesai/Tertunda, checkbox) | `/app/todos` | `GET/POST/PATCH/DELETE /api/v1/todos` | MVP |
| Pengaturan (profil, kategori manajemen) | `/app/settings` | `GET/PUT /api/v1/categories`, profil | MVP |
| **Financial Goal** (Beli Laptop, Dana Darurat...) | `/app/goals` | — tidak ada endpoint/tabel | ⚠️ Out-of-scope (Bag. 5) |
| **Laporan & Analisis** (grafik bar, insight bulanan) | `/app/reports` | — | Tahap 2 (Minggu 7) |
| Onboarding carousel (3 slide) | `/` (publik) | — | Opsional, polish |

**Pemetaan komponen dashboard ↔ data:**

| Elemen mockup | Sumber data |
| :--- | :--- |
| Kartu "Saldo Total" | `balance` (BR-TRX-05) |
| Kartu "Pemasukan" / "Pengeluaran" | `total_income` / `total_expense` bulan berjalan |
| Kartu "Sisa Budget" | `SUM(amount_limit) − SUM(terpakai)` budget bulan berjalan; label "62% terpakai" |
| Line chart "Ringkasan Keuangan" | agregat pemasukan vs pengeluaran per hari/bulan (6 bulan terakhir) |
| Donut "Pengeluaran per Kategori" | `SUM(amount) GROUP BY category` bulan berjalan (`type=EXPENSE`) |
| Widget "Financial To-Do" | `GET /api/v1/todos?status=active` (3 item terdekat) |
| Widget "Transaksi Terbaru" | `GET /api/v1/transactions?limit=5` |
| Progress bar budget (warna oranye/merah) | `usage_percentage` + BR-BUD-06/07: `<80%` warna kategori, `80–99%` `warning`, `≥100%` `danger` |

---

## 4. Komponen Inti (React)

| Komponen | Variants | Catatan implementasi |
| :--- | :--- | :--- |
| `StatCard` | income / expense / balance / budget-left | Ikon bulat berwarna + label + nominal besar + delta kecil (▲ hijau / ▼ merah) |
| `ChartCard` | line / donut / bar | Wrapper Chart.js; line = 2 seri (Pemasukan `primary`, Pengeluaran `danger`); donut = palet kategori + label total di tengah |
| `TransactionRow` | list & table | Ikon kategori, kategori+deskripsi, tanggal, nominal `+Rp` (hijau) / `−Rp` (merah), badge tipe |
| `BudgetProgressRow` | — | Ikon + nama kategori, "terpakai / limit", progress bar berwarna, % |
| `TodoItem` | — | Checkbox, ikon kategori, judul, `Rp amount · Jatuh tempo tgl`, badge sisa hari; checked → strikethrough + badge "Selesai" |
| `FilterTabs` | Semua/Pemasukan/Pengeluaran · Aktif/Selesai/Tertunda | Pill aktif `primary` |
| `Badge` | Aktif (hijau), Selesai (abu), Tertunda (amber), "X hari lagi" | `rounded-full`, `text-xs` |
| `TypeToggle` | Pemasukan/Pengeluaran | Segmented control (lihat mockup Tambah Transaksi) |
| `MonthPicker` | "September 2025 ▾" | Dropdown bulan untuk Transaksi/Budget/Dashboard |
| `EmptyState` | — | Ilustrasi mint + CTA |
| `ConfirmDialog` | hapus transaksi/kategori/budget | Untuk BR-DATA-03: hapus kategori terpakai → tampil pesan ditolak |

**Logika warna status To-Do (turunan, tanpa kolom baru):** `Aktif` = belum selesai; `Selesai` = `is_completed=true`; badge `Tertunda/terlambat` = `due_date < today` dan belum selesai (dihitung di frontend).

---

## 5. Elemen Mockup di Luar Scope Terkunci (Perlu Keputusan)

Item berikut **ada di mockup tetapi tidak ada** di baseline final (`fintrack.md` — 5 tabel, 6 modul):

| # | Elemen mockup | Status di PRD | Rekomendasi |
| :--- | :--- | :--- | :--- |
| 1 | **Financial Goal** (sidebar, halaman, widget dashboard, "Target Keuangan") | Tidak ada — bukan bagian dari 5 tabel/modul terkunci | **Jangan dibangun di MVP.** Sembunyikan item menu & widget-nya di Tahap 1. Jika tim ingin Goal, itu perubahan scope (tabel + API + BR baru) → butuh keputusan PM sebelum Minggu 1. |
| 2 | **Laporan & Analisis** (grafik bar per kategori, insight) | Tahap 2 — Advanced Analytics (Minggu 7) | Ikuti desain mockup saat implementasi Tahap 2. |
| 3 | **"Login dengan Google"** (OAuth) | Tidak ada — auth = email/password + JWT | Skip di MVP; tambahkan di backlog. |
| 4 | Kategori **"Top Up E-Wallet"** & transaksi Gojek/Indomaret | E-wallet/bank out-of-scope | Gunakan kategori default ("Lainnya"/"Belanja"); hanya contoh isi data. |
| 5 | Kartu **"Goal"** di dashboard mobile | Sama dengan #1 | Sembunyikan di MVP. |

> Prinsip: desain visual, warna, dan komponen dari mockup **diikuti penuh**; yang dipangkas hanya fitur/entitas di luar scope. Keputusan #1 (Goal: masuk MVP / Tahap 2 / dibuang) harus diputuskan sebelum pengerjaan dimulai (5 Okt 2026) dan dicatat di Bagian 32 `fintrack.md` bila diubah.
