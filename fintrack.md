# PRD FINTRACK: Perancangan Sistem Informasi Keuangan Pribadi dengan Konsep To-Do List Finansial Berbasis Web

> **Status dokumen:** BASELINE FINAL CAPSTONE (dikunci). Dokumen ini bersifat kanonik: PRD + ERD Final + Skema Database (MySQL/MariaDB) + Business Rules. Semua implementasi (API, frontend, test case, laporan Capstone) dan referensi BR-ID mengacu ke dokumen ini. Database dikunci **5 tabel**: `users`, `categories`, `transactions`, `budgets`, `financial_todos`. Tidak ada tabel AI, subscription, import/export, bank, e-wallet, atau Redis.

---

## 1. Ringkasan Eksekutif
FINTRACK gabungkan pencatatan keuangan harian dengan konsep *To-Do List*. Sasaran utama: mahasiswa dan *young professional*. Masalah utama: pengguna lupa catat pengeluaran, tidak tahu alokasi dana, gagal capai target tabungan. Solusi MVP: Web App responsif berbasis cloud untuk catat transaksi, atur budget bulanan, dan lacak target keuangan via *Financial To-Do*. Model: **sepenuhnya gratis** (proyek tugas kuliah, tanpa fitur berbayar). Pengembangan dibagi **2 tahap dalam 8 minggu**: Tahap 1 — MVP (Minggu 1–5) untuk validasi produk, dan Tahap 2 — Pengembangan Fitur (Minggu 6–8).

---

## 2. Tujuan & Sasaran Bisnis
Sasaran: Tingkatkan konsistensi pencatatan keuangan bulanan pengguna.

| Metric | Target Saat Ini | Target Tahap 1 — MVP (Minggu 5) | Target Tahap 2 (Minggu 8) |
| :--- | :--- | :--- | :--- |
| **Monthly Active Users (MAU)** | 0 | 50 (closed beta kampus) | 200 |
| **Daily Active Users (DAU)** | 0 | 20 | 60 |
| **Day-30 Retention Rate** | 0% | 25% | 40% |
| **Pencatatan Transaksi Rutin** | 0 | >= 15 transaksi/pengguna/bulan | >= 30 transaksi/pengguna/bulan |
| **Goal Completion Rate** | 0% | 20% pengguna selesaikan 1 goal | 35% pengguna selesaikan 1 goal |

---

## 3. User Personas

### Persona 1: Mahasiswa Hemat (Rian, 20 Tahun)
* **Demografi:** Mahasiswa S1, uang saku bulanan Rp 1.500.000, Jakarta.
* **Tujuan:** Atur uang makan dan kuliah, ingin menabung beli laptop bekas.
* **Pain Points:** Uang saku habis sebelum akhir bulan, lupa transaksi kecil (kopi, parkir).
* **Skenario Penggunaan:** Akses FINTRACK via HP tiap selesai beli makanan, cek sisa budget mingguan, cetang to-do "Bayar Kos".

### Persona 2: Freelancer Pemula (Siti, 23 Tahun)
* **Demografi:** Graphic Designer Lepas, pendapatan tidak pasti (Rp 3.000.000 - Rp 6.000.000/bulan), Bandung.
* **Tujuan:** Pisahkan dana operasional kerja dan pribadi, kontrol tagihan bulanan.
* **Pain Points:** Sulit atur pengeluaran karena tanggal pemasukan tidak tetap.
* **Skenario Penggunaan:** Buat Financial To-Do tagihan internet, atur budget ketat kategori hiburan via dashboard laptop.

---

## 4. User Stories & Acceptance Criteria

### US-01: Otentikasi Pengguna
Sebagai pengguna, saya ingin mendaftar dan login akun agar data keuangan tersimpan aman di cloud.
* **Given** pengguna berada di halaman register FINTRACK
* **When** pengguna memasukkan email valid, nama, dan password (minimal 8 karakter, ada angka dan huruf) lalu tekan "Daftar"
* **Then** sistem membuat akun baru, hash password dengan bcrypt, menerbitkan sesi login (JWT via cookie `HttpOnly`), membuat kategori default, dan mengarahkan ke Dashboard.

### US-02: Pencatatan Transaksi Harian
Sebagai pengguna, saya ingin mencatat pengeluaran/pemasukan dengan cepat agar arus kas tercatat akurat.
* **Given** pengguna berada di halaman Dashboard atau Transaksi
* **When** pengguna mengisi nominal, memilih tipe (Pemasukan/Pengeluaran), memilih kategori, mengisi tanggal, lalu tekan "Simpan Transaksi"
* **Then** sistem validasi nominal > 0, perbarui saldo total, perbarui progres budget kategori terkait, dan tampilkan transaksi pada daftar riwayat terbaru.

### US-03: Pengaturan Budget Bulanan per Kategori
Sebagai pengguna, saya ingin menetapkan batasan pengeluaran per kategori agar tidak boros.
* **Given** pengguna membuka modul Budget
* **When** pengguna menentukan batas maksimal nominal untuk kategori tertentu (misal: Makanan Rp 500.000) pada bulan berjalan
* **Then** sistem menyimpan batas budget dan menampilkan persentase penggunaan budget secara *real-time* saat ada transaksi baru.

### US-04: Financial To-Do Checklist
Sebagai pengguna, saya ingin membuat daftar tugas keuangan ber-nominal (bayar tagihan/menabung) agar kewajiban tidak terlewat.
* **Given** pengguna membuka modul Financial To-Do
* **When** pengguna menambahkan item task dengan judul, nominal, tenggat waktu, dan memilihopsi "Otomatis catat transaksi saat selesai"
* **Then** sistem menampilkan task pada list, dan ketika di-centang selesai, sistem otomatis membuat record transaksi pengeluaran sesuai nominal task.

### US-05: Monitoring Dashboard & Alert Budget
Sebagai pengguna, saya ingin melihat ringkasan keuangan dan peringatan jika batas pengeluaran hampir habis.
* **Given** total akumulasi pengeluaran kategori telah mencapai 80% dari batas budget yang ditetapkan
* **When** pengguna membuka halaman Dashboard
* **Then** sistem menampilkan grafik ringkasan bulanan dan indikator peringatan warna kuning/merah pada kategori budget yang melebihi ambang batas.

---

## 5. User Flow / Alur Utama

```
+-----------------------------------------------------------------------+
|                        FLOW PENCATATAN TRANSAKSI                      |
+-----------------------------------------------------------------------+

  [ Pengguna Akses Apps ] 
             |
             v
   { Sudah Authenticated? } --( Tidak )--> [ Halaman Login / Register ]
             |                                         |
          ( Ya )                                  ( Success )
             |                                         |
             v <---------------------------------------+
     [ Dashboard Utama ]
             |
             +---> Klik "Tambah Transaksi"
             |            |
             |            v
             |     [ Form Transaksi ] ---> Isi Nominal, Tipe, Kategori, Tanggal
             |            |
             |            v
             |     { Form Valid? } --( Tidak )--> [ Tampilkan Error Validasi ]
             |            |
             |         ( Ya )
             |            v
             |     [ Simpan ke Database ]
             |            |
             |            +---> Update Saldo Total
             |            +---> Recalculate Budget Kategori
             |            |
             |            v
             +<--- [ Tampilkan Pop-up Berhasil & Refresh View ]
```

```
+-----------------------------------------------------------------------+
|                     FLOW FINANCIAL TO-DO TO TRANSAKSI                 |
+-----------------------------------------------------------------------+

  [ Modul Financial To-Do ] ---> Pilih Task (contoh: "Bayar Wi-Fi Rp 200k")
             |
             v
  Klik Checkbox "Selesai"
             |
             v
  { Task terikat Transaksi Otomatis? }
             |
             +--( Ya )---> System Auto-Create Expense Transaction
             |                  |
             |                  v
             |            Update Saldo & Budget
             |                  |
             +--( Tidak )-----> |
                               v
                  [ Update Status Task = DONE ]
```

---

## 6. Information Architecture / Sitemap

```
FINTRACK Web Application
│
├── /auth
│   ├── /login
│   └── /register
│
├── /app (Protected Routes)
│   ├── /dashboard (Overview saldo, ringkasan budget, alert, task terdekat)
│   ├── /transactions (List riwayat, Filter, Search, Form Input Modal)
│   ├── /budgets (List budget per kategori, progress bar, set budget)
│   ├── /todos (List Financial Task, Filter Active/Completed, Form Add Task)
│   └── /settings (Profil pengguna, Kategori Manajemen)
```

---

## 7. Pembagian Tahap Pengembangan (2 Tahap)

Pengembangan produk FINTRACK dibagi menjadi **2 tahap** agar setiap tahap memiliki lingkup, target, dan kriteria kelulusan yang jelas:

| Aspek | TAHAP 1 — MVP | TAHAP 2 — Pengembangan Fitur |
| :--- | :--- | :--- |
| Periode | Minggu 1–5 | Minggu 6–8 |
| Fokus | Validasi core value: catat transaksi + budget + financial to-do | Fitur pelengkap: export, analytics, kustomisasi |
| Output utama | Web app responsif 4 modul inti + Beta launch | Export PDF/Excel, advanced analytics, aplikasi lebih matang |
| Target pengguna | 50 MAU (closed beta kampus), D7 Retention ≥ 35% | 200 MAU, retensi & engagement lebih tinggi |
| Rujukan detail | Bagian 8, 11, 17 (Minggu 1–5) | Bagian 14, 17 (Minggu 6–8) |

### 7.1 TAHAP 1 — Lingkup MVP (In-Scope)

MVP hanya mencakup 4 kapabilitas esensial:

| Fitur | Prioritas | Justifikasi |
| :--- | :--- | :--- |
| **Otentikasi Cloud** | P0 (Must Have) | Isolasi data pengguna dan akses multi-device web. |
| **Manajemen Transaksi & Kategori** | P0 (Must Have) | Fungsi dasar pencatatan arus kas harian. |
| **Budgeting Bulanan** | P0 (Must Have) | Kontrol pengeluaran agar tidak lebih besar dari pasak. |
| **Financial To-Do & Goal Checklist** | P1 (Should Have)| Diferensiasi utama produk ("To-Do List Keuangan"). |

**Kriteria exit Tahap 1 (gate Go/No-Go menuju Tahap 2):**
1. Seluruh fitur P0/P1 lolos UAT (15 pengguna persona) dan integration test.
2. Activation Rate ≥ 60% dan D7 Retention ≥ 35% (Bagian 19) tercapai selama Closed Beta.
3. Tidak ada error baru di log API selama beta dan halaman utama terbuka < 2 detik (Bagian 29).
4. Tidak ada temuan keamanan Critical/High yang masih terbuka (Bagian 16).

### 7.2 TAHAP 2 — Lingkup Pengembangan Fitur (In-Scope)

Dibangun di atas Tahap 1 yang sudah stabil; fokus pada fitur pelengkap dan peningkatan pengalaman pengguna:

| Fitur | Prioritas (dalam Tahap 2) | Sumber Keputusan / Rujukan |
| :--- | :--- | :--- |
| **Export Data PDF/Excel** | P1 (Should Have) | Gratis untuk semua pengguna (keputusan TBD-01). |
| Kustomisasi Threshold Alert Budget | P2 | Keputusan TBD-02. |
| What-If Financial Simulation & Advanced Analytics | P2 | Backlog produk. |
| i18n Bahasa Inggris (en-US) | P3 | Bagian 24. |
| Auto-sync API Bank & E-Wallet (GoPay, OVO, DANA, BCA) | P3 (risiko regulasi & API pihak ketiga) | Backlog produk. |
| AI Financial Assistant / Smart Recommendation | P3 | Backlog produk. |
| Social Financial Challenges & Leaderboard/Gamification | P3 | Backlog produk. |
| Multi-currency & Debt/Loan Tracker | P3 | Backlog produk. |
| Application Mobile Native (Android / iOS) | P3 (evaluasi setelah web stabil) | Backlog produk. |

### 7.3 Out-of-Scope (Di Luar 2 Tahap)

Seluruh fitur di luar tabel 7.1 dan 7.2 tidak direncanakan pada periode 8 minggu ini dan memerlukan penambahan dokumen PRD baru.

---

## 8. Persyaratan Fungsional

| RF-ID | Fitur | Deskripsi | Prioritas | Kriteria Penerimaan (Given/When/Then) |
| :--- | :--- | :--- | :--- | :--- |
| **RF-001** | User Registration | Sistem memproses pendaftaran user baru. | P0 | **Given** form register diisi email unik & pass valid **When** submit **Then** simpan user, buat kategori default, buat sesi login, redirect ke Dashboard. |
| **RF-002** | User Login | Authentikasi kredensial pengguna. | P0 | **Given** email & pass terdaftar **When** submit **Then** buat sesi login (cookie `HttpOnly`) dan redirect ke Dashboard. |
| **RF-003** | Create Transaction | Tambah data pengeluaran / pemasukan. | P0 | **Given** nominal > 0, kategori dipilih **When** simpan **Then** data tersimpan, saldo & budget ter-update. |
| **RF-004** | Transaction List & Filter | Menampilkan riwayat transaksi + filter. | P0 | **Given** list transaksi tersedia **When** filter bulan/kategori diubah **Then** list perbarui data secara instan. |
| **RF-005** | Set Category Budget | Menentukan batas budget bulanan. | P0 | **Given** user tentukan budget Makanan Rp 1jt **When** simpan **Then** target budget tersimpan untuk bulan aktif. |
| **RF-006** | Budget Threshold Alert | Tampilan peringatan pengeluaran. | P1 | **Given** akumulasi pengeluaran >= 80% budget **When** user lihat dashboard **Then** ubah warna progress bar ke Oranye/Merah. |
| **RF-007** | Create Financial Task | Tambah To-Do keuangan dengan/tanpa nominal.| P1 | **Given** nama task + nominal + target date **When** simpan **Then** task muncul di daftar active to-do. |
| **RF-008** | Complete Task Auto-Log | Selesaikan task & konversi ke transaksi. | P1 | **Given** task dengan nominal checked sebagai done **When** opsi auto-log aktif **Then** buat transaksi pengeluaran baru otomatis. |

---

## 9. Persyaratan Non-Fungsional

| RNF-ID | Kategori | Target Terukur |
| :--- | :--- | :--- |
| **RNF-001** | **Performance** | Halaman utama terbuka < 2 detik pada koneksi 4G dengan skala puluhan pengguna aktif. |
| **RNF-002** | **Concurrency** | Nyaman untuk 50–100 pengguna aktif bersamaan (skala tugas/kampus) di hosting shared/cloud biasa. |
| **RNF-003** | **Page Load Speed** | First Contentful Paint (FCP) < 1.2 detik, Largest Contentful Paint (LCP) < 2.5 detik pada jaringan 4G. |
| **RNF-004** | **Availability** | Aplikasi reachable selama masa uji & demo; mengikuti SLA hosting yang dipakai. |
| **RNF-005** | **Security** | Password hashing bcrypt (library `bcrypt` di Node.js). Semua traffic HTTPS. Sesi login via JWT dalam cookie `HttpOnly`. |
| **RNF-006** | **Compatibility** | Responsif penuh pada viewport width 320px (Mobile) hingga 1920px (Desktop Chrome, Safari, Firefox, Edge) via React + Tailwind CSS. |
| **RNF-007** | **Backup & Restore** | Export dump database harian (`pg_dump` / pgAdmin), disimpan di luar server (Google Drive). Retensi 4 minggu. |
| **RNF-008** | **Disaster Recovery** | **RPO ≤ 24 jam** (backup harian), **RTO ≤ 4 jam** (deploy ulang + restore via phpMyAdmin/mysql). Detail kebijakan: Bagian 33. |

---

## 10. Data Model / ERD & Data Migration

### 10.1 ERD Final & Kardinalitas

FINTRACK menggunakan **5 tabel utama**: `users`, `categories`, `transactions`, `budgets`, `financial_todos`.

```
                           ┌─────────────────┐
                           │      USERS      │
                           ├─────────────────┤
                           │ PK id           │
                           │ name            │
                           │ email           │
                           │ password_hash   │
                           │ created_at      │
                           │ updated_at      │
                           └────────┬────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 │ 1:N              │ 1:N              │ 1:N
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐
        │   CATEGORIES   │ │    BUDGETS     │ │  FINANCIAL_TODOS    │
        ├────────────────┤ ├────────────────┤ ├─────────────────────┤
        │ PK id          │ │ PK id          │ │ PK id               │
        │ FK user_id     │ │ FK user_id     │ │ FK user_id          │
        │ name           │ │ FK category_id │ │ title               │
        │ type           │ │ amount_limit   │ │ amount              │
        │ created_at     │ │ month_year     │ │ due_date            │
        │ updated_at     │ │ created_at     │ │ is_completed        │
        └───────┬────────┘ │ updated_at     │ │ auto_expense        │
                │          └───────┬────────┘ │ created_at          │
                │                  │          │ updated_at          │
                │                  │          └──────────┬──────────┘
                │                  │                     │
                │ 1:N              │                    │ 1:0..1
                ▼                  │                     ▼
        ┌──────────────────────────┴─────────────────────────────┐
        │                     TRANSACTIONS                       │
        ├────────────────────────────────────────────────────────┤
        │ PK id                                                   │
        │ FK user_id                                              │
        │ FK category_id                                          │
        │ FK source_todo_id → financial_todos.id (nullable)       │
        │ type                                                     │
        │ amount                                                   │
        │ date                                                     │
        │ notes                                                    │
        │ created_at                                               │
        │ updated_at                                               │
        └────────────────────────────────────────────────────────┘
```

**Relasi & Kardinalitas Final:**

| Relasi | Kardinalitas |
| :--- | :--- |
| User → Categories | 1 : N |
| User → Transactions | 1 : N |
| User → Budgets | 1 : N |
| User → Financial Todos | 1 : N |
| Category → Transactions | 1 : N |
| Category → Budgets | 1 : N |
| Financial Todo → Transaction | 1 : 0..1 |

**Kenapa ada `source_todo_id`?**

Kolom ini menopang Business Rule **Auto Expense** (Bagian 35.F). Contoh: user punya To-Do "Bayar listrik — Rp150.000". Saat To-Do diselesaikan, sistem membuat transaksi `EXPENSE — Rp150.000` dan menyimpan ID To-Do asalnya di `source_todo_id`. Dengan partial unique index `uq_transactions_source_todo`, database menjamin:

```
1 Financial To-Do → maksimal 1 Auto Expense
```

Sehingga jika request API terkirim dua kali karena jaringan bermasalah, sistem tidak membuat dua transaksi pengeluaran. Transaksi biasa memiliki `source_todo_id = NULL`.

### 10.2 Data Migration Plan (CSV / Excel Import Manual ke System — Tahap 2)

**Source -> Target Field Mapping Table:**

| CSV Source Header | Target Table | Target Field | Data Transformation / Validation |
| :--- | :--- | :--- | :--- |
| `Tanggal` | `TRANSACTIONS` | `date` | Parse Format `YYYY-MM-DD`. Wajib valid date. |
| `Tipe (Masuk/Keluar)`| `TRANSACTIONS` | `type` | Map "Masuk" -> `INCOME`, "Keluar" -> `EXPENSE`. |
| `Kategori` | `CATEGORIES` / `TRANSACTIONS` | `category_id` | Match name exact case-insensitive, if not exist create custom category under user_id. |
| `Jumlah (Rp)` | `TRANSACTIONS` | `amount` | Strip string "Rp", clean dot/comma -> `NUMERIC(15,2)`. Must > 0. |
| `Catatan` | `TRANSACTIONS` | `notes` | Sanitize String HTML entities, max 255 char. |

**Strategi Import, Validasi, Cutover & Rollback:**
1. **Import:** Parser backend memproses file `.csv` maks 5MB via endpoint `/api/v1/transactions/import`.
2. **Validasi:** Row-by-row validation. Jika > 10% baris error, batalkan seluruh transaksi (*Atomic Transaction Rollback*).
3. **Cutover Plan:** System maintenance window 30 menit. Jalankan migrasi schema DB -> Deprecate file template lama -> Aktifkan portal upload.
4. **Rollback Strategy:** Jika migrasi gagal, restore DB dari backup dump terakhir (Bagian 33) tepat sebelum deployment.

**Spesifikasi Edge-Case Parser CSV (wajib diimplementasikan & diuji):**

| # | Edge Case | Contoh Input | Perlakuan Parser |
| :--- | :--- | :--- | :--- |
| 1 | Encoding bukan UTF-8 / ada BOM | Windows-1252, UTF-8 with BOM | Strip BOM; auto-detect encoding; gagal total dengan error `UNSUPPORTED_ENCODING` jika tidak terdekode. |
| 2 | Delimiter berbeda (Excel locale ID memakai `;`) | `;` atau tab | Delimiter sniffing otomatis (`,` `;` `\t`); baris dengan jumlah kolom tak konsisten → `INVALID_ROW`. |
| 3 | Header hilang / kolom wajib tidak ada | Tanpa kolom `Jumlah (Rp)` | Reject seluruh file `422 INVALID_SCHEMA` sebelum memproses baris. |
| 4 | Sel kolom wajib kosong | `Jumlah (Rp)` kosong | Baris ditolak: `MISSING_REQUIRED_FIELD`. |
| 5 | Format tanggal bukan `YYYY-MM-DD` | `05/03/2026`, `5-Maret-26` | Tidak ada asumsi format lokal; baris ditolak `INVALID_DATE_FORMAT`. |
| 6 | Tanggal tidak valid / di masa depan | `2026-02-30`, `2027-01-01` | `2026-02-30` → `INVALID_DATE`; tanggal > hari ini → `FUTURE_DATE` (ditolak). |
| 7 | Format nominal campur lokal ID/EN | `Rp1.500.000` vs `1,500,000.50` | Hanya format Indonesia diterima: `1.500.000` atau `1.500.000,50` (strip `Rp`, titik = ribuan, koma = desimal). Format EN `1,500,000.50` → `INVALID_AMOUNT_FORMAT`. |
| 8 | Nominal 0, negatif, atau non-numerik | `0`, `-5000`, `abc` | Baris ditolak `INVALID_AMOUNT` (wajib > 0). |
| 9 | Kategori kosong / nama duplikat case-insensitive | kosong; `MAKANAN` vs `Makanan` | Kosong → masuk kategori default "Lainnya"; duplikat dipetakan ke kategori existing (tidak membuat kategori baru). |
| 10 | Catatan berlebihan / berbahaya | 300 karakter; `<script>` | Sanitasi HTML entities lalu truncate ke 255 karakter. |
| 11 | Baris duplikat identik dalam file | 2 baris sama persis | Tidak di-dedupe otomatis; keduanya diimport, tetapi dilaporkan sebagai warning `DUPLICATE_ROW` pada hasil. |
| 12 | File kosong / hanya header | 0 baris data | Gagal `EMPTY_IMPORT`, tidak ada perubahan data. |
| 13 | Ukuran / jumlah baris melebihi batas | > 5MB atau > 10.000 baris | Ditolak di level upload: `413 PAYLOAD_TOO_LARGE`. |
| 14 | Error parsial ≤ 10% | 950 valid, 50 gagal dari 1.000 | Baris valid di-commit, baris gagal dilewati; laporan error per-baris (nomor baris + alasan) dapat diunduh sebagai CSV. (> 10% → full rollback, lihat poin 2 di atas.) |

> **Catatan baseline:** fitur import/export (Tahap 2) **tidak menambah tabel baru** — seluruh data dipetakan ke `transactions` dan `categories` yang sudah ada (konsisten dengan skema 5 tabel di Bagian 34).

---

## 11. API Specification

Backend berupa **REST API Node.js + Express** (respons JSON, prefix `/api/v1`). Autentikasi memakai **JWT** yang dikirim melalui cookie `HttpOnly` (bukan disimpan di localStorage). Semua endpoint (kecuali register/login) menjalankan middleware auth; jika sesi tidak valid → `401`.

Format error seragam dan mereferensikan Business Rule (Bagian 35):

```json
{ "status": "error", "code": "BR-TRX-01", "message": "Amount harus lebih dari 0" }
```

### Endpoint Summary

| Method | Endpoint | Deskripsi | Request | Response / Aturan |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Mendaftar Akun | `name`, `email`, `password` | `201` + cookie JWT; email unik case-insensitive (BR-AUTH-01); hash bcrypt (BR-AUTH-02); otomatis buat kategori default. |
| `POST` | `/api/v1/auth/login` | Login | `email`, `password` | `200` + cookie JWT. |
| `POST` | `/api/v1/auth/logout` | Logout | - | Cookie JWT dihapus. |
| `PUT` | `/api/v1/auth/profile` | Ubah nama tampilan | `name` | `200`; JWT diperbarui. |
| `PUT` | `/api/v1/auth/password` | Ganti password | `current_password`, `new_password` | `200`; verifikasi password lama (BR-AUTH-02, US-01); salah → `401`. |
| `DELETE` | `/api/v1/auth/account` | Hapus akun permanen | `password` (konfirmasi) | `200`; cascade seluruh data (BR-DATA-02, Bagian 30). |
| `GET` | `/api/v1/categories` | List kategori | Query `type` | `200` `{"data":[...]}`. |
| `POST` | `/api/v1/categories` | Buat kategori | `name`, `type` | `201`; duplikat nama+type → `409` (BR-CAT-03). |
| `PUT` | `/api/v1/categories/:id` | Ubah kategori | `name`, `type` | `200`. |
| `DELETE` | `/api/v1/categories/:id` | Hapus kategori | - | `204`; jika dipakai transaksi/budget → `409` (BR-DATA-03). |
| `GET` | `/api/v1/transactions` | Riwayat + filter | Query `page`, `limit`, `month`, `category_id`, `type` | `200` `{"data":[...],"total":45}`. |
| `POST` | `/api/v1/transactions` | Catat transaksi | `type`, `amount`, `category_id`, `date`, `notes` | `201` (BR-TRX-01..04); budget recompute (BR-BUD-08). |
| `PUT` | `/api/v1/transactions/:id` | Ubah transaksi | sama di atas | `200`; budget recompute (BR-BUD-08). |
| `DELETE` | `/api/v1/transactions/:id` | Hapus transaksi | - | `200`; dashboard & budget dihitung ulang (BR-TRX-06). |
| `GET` | `/api/v1/budgets` | Budget per bulan | Query `month=YYYY-MM` | `200` `{"data":[{...,usage_percentage,status}]}` (BR-BUD-05..07). |
| `POST` | `/api/v1/budgets` | Set budget | `category_id`, `amount_limit`, `month_year` | `201` (BR-BUD-01..04). |
| `PUT` | `/api/v1/budgets/:id` | Ubah budget | `amount_limit` | `200`. |
| `DELETE` | `/api/v1/budgets/:id` | Hapus budget | - | `204`. |
| `GET` | `/api/v1/todos` | List to-do | Query `status=active\|completed` | `200` `{"data":[...]}`. |
| `POST` | `/api/v1/todos` | Buat to-do | `title`, `amount`, `due_date`, `auto_expense` | `201` (BR-TODO-01..03). |
| `PUT` | `/api/v1/todos/:id` | Ubah to-do | sama di atas | `200`. |
| `PATCH` | `/api/v1/todos/:id/complete` | Selesaikan to-do | - | `200`; jika `auto_expense=true` & `amount>0` → auto expense atomik (BR-AUTO-01..04). |
| `DELETE` | `/api/v1/todos/:id` | Hapus to-do | - | `204`. |
| `GET` | `/api/v1/dashboard/summary` | Ringkasan dashboard | Query `month` | `200` `{"balance","total_income","total_expense","budgets":[...]}` (Bagian 5 & 6 PRD lama → rumus di Bagian 35 & 34). |
| `POST` | `/api/v1/transactions/import` | Import CSV (Tahap 2) | File `.csv` maks 5MB | `200` `{"imported":950,"failed":50}` + laporan error (Bagian 10.2). |
| `GET` | `/api/v1/export` | Export Excel/PDF (Tahap 2) | Query `month`, `format` | File download `.xlsx` / `.pdf`. |

### Rate Limiting & Abuse Prevention (Sederhana)

Untuk skala tugas, proteksi abuse cukup dengan langkah ringan tanpa service tambahan:
* **Login:** maksimal 5 kegagalan berturut-turut per akun → akun dikunci 15 menit (status lock dikelola di layer aplikasi/server, tanpa menambah kolom/tabel di skema final).
* **Validasi server-side di semua endpoint:** nominal > 0, format tanggal, panjang input — request tidak valid ditolak `400` dengan kode BR terkait.
* **Upload:** file maks 5MB, hanya ekstensi `.csv`.
* Pembatasan trafik lanjutan (rate limit per IP) diserahkan ke proteksi bawaan hosting/reverse proxy.

---

## 12. Arsitektur Sistem

Arsitektur baseline final (dikunci untuk Capstone) — seminimal mungkin, tanpa service tambahan:

```
┌───────────────────────────────┐
│           USER                │
│ Desktop / Tablet / Smartphone │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       FRONTEND WEB            │
│ React.js + Tailwind CSS       │
└───────────────┬───────────────┘
                │ HTTPS / REST API
                ▼
┌───────────────────────────────┐
│       BACKEND API             │
│ Node.js + Express             │
│                               │
│ Auth                          │
│ Transaction                   │
│ Category                      │
│ Budget                        │
│ Financial To-Do               │
│ Dashboard                     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         PostgreSQL          │
│                               │
│ users                         │
│ categories                    │
│ transactions                  │
│ budgets                       │
│ financial_todos               │
└───────────────────────────────┘
```

Tidak perlu Redis untuk Capstone. Cukup 1 proses Node.js + 1 database PostgreSQL.

### Pilihan Teknologi
* **Backend:** Node.js 20 LTS + Express (REST API JSON, query parameterized via `pg` (node-postgres)).
* **Database:** PostgreSQL 16+ — produksi: Vercel Postgres (Neon); development: PostgreSQL Laragon. Skema: Bagian 34.
* **Frontend:** React 18 + Tailwind CSS (SPA), `fetch`/Axios untuk konsumsi REST API.
* **Grafik:** Chart.js untuk dashboard ringkasan.
* **Auth:** bcrypt (hash password) + JWT dalam cookie `HttpOnly`, `SameSite=Lax`.
* **Hosting:** platform hosting Node.js / VPS; database PostgreSQL lokal (dev, Laragon) atau Vercel Postgres (produksi).

### Status Deployment Aktif (SUDAH LIVE)

FINTRACK **sudah live** di **https://financialtracking.online/** dengan susunan:

| Komponen | Lokasi | Keterangan |
| :--- | :--- | :--- |
| Frontend (build React) | Docroot hosting | index.html + ssets/app.js + avicon.svg |
| Backend API | Hosting yang sama | PHP 8.1 (pi/index.php), routing query-param ?r=/... |
| Database | Hosting yang sama | MySQL 
ure4885_fintrack (koneksi localhost) |

**Catatan teknis:** hosting memakai LiteSpeed dengan rewrite .htaccess tidak diproses (AllowOverride None), sehingga API dijangkau via /api/index.php?r=<path> — frontend sudah dikonfigurasi demikian. Kredensial database ada di pi/config.php di server (jangan dibagikan). File ackend-php/deploy-fintrack.zip + tp-deploy.ps1 tersedia untuk deploy ulang.

**Alternatif jangka panjang (jika ingin pindah):** Vercel + PostgreSQL (Bagian 34 versi Postgres, file ackend-php/sql/schema-postgres.sql) — backend Node di ackend/ sudah diarsipkan dan tidak dipakai.

---

## 13. Analytics & Event Tracking

### Event Tracking Spec
* `user_registered`: Fired saat pendaftaran sukses.
* `transaction_created`: Fired saat user klik simpan transaksi (Properties: `type`, `category`, `amount`).
* `budget_exceeded_warning`: Fired saat budget kategori mencapai 80% dan 100%.
* `todo_completed`: Fired saat task diklik selesai (Properties: `is_auto_transaction`).

### Conversion Funnel Target
1. **Onboarding Funnel:** Landing Page Visit -> Click Register -> Form Submit Success (Target Konversi: **45%**).
2. **Core Engagement Funnel:** Login -> Buka Form Transaksi -> Save Transaksi (Target Konversi: **80%**).
3. **Goal Adoption Funnel:** Access To-Do Module -> Create To-Do -> Complete To-Do (Target Konversi: **30%**).

---

## 14. Model Distribusi & Pricing (Gratis)

FINTRACK adalah proyek tugas kuliah dan **sepenuhnya gratis**:

* Tidak ada tier berbayar (rencana Pro Tier dihapus) dan tidak ada integrasi payment gateway.
* Tidak ada batasan penggunaan: kategori budget, financial to-do, dan jumlah transaksi unlimited.
* Export data PDF/Excel tersedia gratis untuk semua pengguna (dibangun di Tahap 2).

---

## 15. Keamanan & Privasi

Catatan Keamanan Penting:

SECURITY WARNING: Data finansial bersifat rahasia. Kegagalan isolasi tenant menyebabkan kebocoran data antar pengguna.

1. **Autentikasi & Otorisasi:** Login menerbitkan JWT yang dikirim via cookie `HttpOnly`, `SameSite=Lax`; cookie dihapus saat logout. Password di-hash dengan bcrypt. Selain auth di layer aplikasi, integritas ownership divalidasi di database lewat trigger (Bagian 34, bagian Ownership Validation).
2. **Isolasi Data (Multi-Tenant Logic):** Setiap query database *WAJIB* menyertakan `WHERE user_id = current_user_id`. Tidak boleh ada eksposur data antar ID (BR-AUTH-03).
3. **Enkripsi Data:** Data *in-transit* menggunakan HTTPS. Password tidak pernah disimpan plaintext — hanya `password_hash` (BR-AUTH-02).
4. **Perlindungan Input:** Semua query memakai *parameterized queries* (mencegah *SQL Injection*). Output dirender oleh React (auto-escaping, mencegah *XSS*); input sanitasi di API.

---

## 16. Metodologi Pengujian

* **Functional Testing:** Checklist pengujian manual per fitur: register → login → input transaksi → cek saldo & budget → to-do auto-log → logout.
* **User Acceptance Testing (UAT):** Pengujian usability oleh 15 mahasiswa target persona untuk verifikasi kejelasan UI.
* **Responsiveness Testing:** Cek tampilan di lebar layar 320px–1920px (Chrome DevTools device mode) + HP sungguhan.
* **Data Testing:** Uji import CSV dengan edge-case Bagian 10.2 dan verifikasi hasil via psql/pgAdmin.
* **Security Check:** Verifikasi manual: parameterized queries di semua query, auto-escaping React + sanitasi output, middleware auth JWT di setiap route protected, dan uji isolasi data antar user (BR-AUTH-03).
* **Business Rules Testing:** Test case per BR-ID (Bagian 35), termasuk uji idempotensi Auto Expense (double-request tidak menghasilkan 2 transaksi — BR-AUTO-03).

---

## 17. Milestone / Roadmap (2 Tahap)

### TAHAP 1 — MVP (Minggu 1–5)

| Minggu | Deliverables Inti |
| :--- | :--- |
| **Minggu 1** | Setup repo Git + database PostgreSQL (skema Bagian 34), register/login/logout (bcrypt + JWT), layout responsif dasar (React + Tailwind). |
| **Minggu 2** | CRUD Transaksi + manajemen kategori, daftar riwayat dengan filter bulan/kategori. |
| **Minggu 3** | Engine Budgeting per kategori, progress bar + alert 80%, dashboard ringkasan dengan Chart.js. |
| **Minggu 4** | Financial To-Do + auto-log ke transaksi, penyempurnaan UI responsif, uji internal (alpha). |
| **Minggu 5** | UAT 15 responden, perbaikan bug, deploy beta + backup database pertama. |

**Gate Tahap 1 → Tahap 2:** review kriteria exit di Bagian 7.1 sebagai dasar keputusan lanjut.

### TAHAP 2 — Pengembangan Fitur (Minggu 6–8)

| Minggu | Deliverables Inti |
| :--- | :--- |
| **Minggu 6** | Import CSV (edge-case Bagian 10.2) + Export Excel/PDF. |
| **Minggu 7** | Advanced Analytics (tren & kategori terbesar), kustomisasi threshold (TBD-02), polish UI/UX responsif. |
| **Minggu 8** | Pengujian akhir, dokumentasi, final release & presentasi demo. |

---

## 18. Risiko & Mitigasi

| Risiko Identified | Tingkat Keparahan | Mitigasi |
| :--- | :--- | :--- |
| Pengguna malas input manual transaksi. | High | Buat UI "Quick Add" 2-klik dari dashboard utama, UI responsif cepat. |
| Kebocoran data transaksi finansial user. | Critical | Enkripsi SSL, HttpOnly cookie, audit rutin query `user_id`. |
| Lambat / limit resource hosting saat banyak pengguna. | Medium | Skala tugas kecil (puluhan pengguna) — hosting cukup. Optimasi query + indeks (sudah disediakan di Bagian 34) bila perlu. |

---

## 19. Metrik Keberhasilan Produk

* **Activation Rate:** 60% pengguna baru mencatat minimal 3 transaksi dalam 24 jam pertama setelah registrasi.
* **D7 Retention:** >= 35% pengguna kembali mencatat transaksi pada minggu ke-2.
* **Goal Completion:** Minimal 20% pengguna aktif menyelesaikan minimal 1 Financial To-Do per bulan.

---

## 20. Glossary / Daftar Istilah

* **Financial To-Do:** Daftar tugas berbasis finansial (contoh: bayar kos, simpan tabungan) yang terintegrasi dengan aksi keuangan.
* **Budget Threshold Alert:** Notifikasi visual saat pengeluaran mendekati atau melampaui alokasi yang direncanakan.
* **Quick Add:** Antarmuka ringkas untuk memasukkan transaksi finansial dengan langkah minimal.
* **Auto Expense:** Transaksi `EXPENSE` yang dibuat otomatis oleh sistem saat Financial To-Do dengan `auto_expense=true` dan `amount>0` diselesaikan (BR-AUTO-01..04).

---

## 21. Competitive Analysis

| Parameter | FINTRACK (MVP) | Aplikasi Catat Keuangan Lain (e.g., Monefy) | Buku Kas Manual / Excel |
| :--- | :--- | :--- | :--- |
| **Konsep Utama** | Hybrid Finance + Task Checklist | Murni Pencatatan Transaksi | Input Baris Manual |
| **Kecepatan Input** | Tinggi (Responsive Web / Quick Add)| Tinggi | Rendah |
| **Integrasi Tugas Keuangan**| Ada (Financial To-Do) | Tidak Ada | Tidak Ada |
| **Aksesibilitas Data** | Cloud (Multi-Device) | Lokal Device (Free version) | File Lokal |
| **Kurva Belajar** | Rendah (Untuk Mahasiswa) | Sedang | Tinggi (Perlu Rumus) |

---

## 22. Accessibility / a11y

* Standard acuan: **WCAG 2.1 Level AA**.
* Rasio kontras teks minimal 4.5:1 untuk keterbacaan tinggi.
* Navigasi Form & Modal dapat diakses penuh via keyboard (Tab, Enter, Esc).
* Element interaktif memiliki attribute `aria-label` yang sesuai untuk *Screen Reader*.

---

## 23. Edge Cases & Error Handling

| Skenario | Penyebab | Penanganan / UX Solution |
| :--- | :--- | :--- |
| User input nominal minus (`-50000`). | Error Input / Bypass Frontend. | Server reject request dengan HTTP 400 (`BR-TRX-01`). UX: Tampilkan pesan "Nominal harus lebih dari 0". |
| Koneksi terputus saat submit transaksi. | Jaringan pengguna drop. | Client retry otomatis via service worker / Simpan draft local, UX: Tampilkan banner "Koneksi Terputus". |
| User menghapus kategori yang memiliki transaksi. | Relasi DB `ON DELETE RESTRICT` (BR-DATA-03). | API menolak dengan HTTP 409. UX: Tombol hapus dinonaktifkan untuk kategori yang sudah dipakai; kategori dapat di-rename, bukan dihapus. |
| Double-submit penyelesaian To-Do (retry jaringan). | Request API terkirim dua kali. | Partial unique index `uq_transactions_source_todo` menjamin maksimal 1 Auto Expense per To-Do (BR-AUTO-03). |

---

## 24. Internationalization / Localization Plan

* **Bahasa Utama:** Bahasa Indonesia (`id-ID`).
* **Format Mata Uang:** Standard Rupiah (`Rp X.XXX.XXX`), pembulatan 0 desimal di UI.
* **Format Tanggal:** `DD MMMM YYYY` (Contoh: 30 Maret 2026).
* Persiapan i18n: Teks UI diekstrak ke dalam dictionary file `id.json` untuk antisipasi lokalisasi Bahasa Inggris (`en-US`) pada roadmap mendatang.

---

## 25. Dependencies / Pihak Ketiga

| Dependency | Peran | Catatan |
| :--- | :--- | :--- |
| **Node.js 20 LTS** | Runtime backend API | Baseline final Capstone. |
| **Express** | Framework REST API | Routing, middleware auth, validasi. |
| **PostgreSQL 16+** | Database | Skema final di Bagian 34; produksi di Vercel Postgres (Neon). |
| **pg (node-postgres)** | Driver database | Wajib parameterized queries. |
| **bcrypt** | Hash password | BR-AUTH-02. |
| **jsonwebtoken** | Autentikasi JWT | Dikirim via cookie `HttpOnly`. |
| **React 18 (+ Vite)** | SPA frontend | Build statis, konsumsi REST API. |
| **Tailwind CSS** | Styling responsif | Viewport 320px–1920px (RNF-006). |
| **Chart.js** | Grafik dashboard | Pengeluaran per kategori, tren bulanan. |
| **papaparse (Tahap 2)** | Parser CSV import | Edge case Bagian 10.2. |
| **exceljs / pdfkit (opsional, Tahap 2)** | Export Excel & PDF | Fallback termudah: export CSV bawaan Node.js. |

---

## 26. Sequence Diagram

```
+---------------------------------------------------------------------------------------+
|                    SEQUENCE DIAGRAM: COMPLETE FINANCIAL TO-DO                         |
+---------------------------------------------------------------------------------------+

  User                Client Web App               Backend API                Database
   |                        |                           |                        |
   |--- 1. Check Task ----->|                           |                        |
   |    (Auto-Log Checked)  |                           |                        |
   |                        |--- 2. PATCH /todos/5/complete --->|                |
   |                        |       {auto_expense: true}|                        |
   |                        |                           |--- 3. BEGIN TRANSACTION->|
   |                        |                           |--- 4. Update Todo Status->|
   |                        |                           |--- 5. Insert Transaction->|
   |                        |                           |--- 6. COMMIT --------->|
   |                        |<-- 7. 200 OK Status ------|                        |
   |<-- 8. UI Updated ------|                           |                        |
```

---

## 27. Roles & Responsibilities (RACI)

| Aktivitas / Deliverable | Product Manager | Tech Lead / Backend | Frontend Dev | UI/UX Designer |
| :--- | :--- | :--- | :--- | :--- |
| **PRD & Scope MVP** | **R / A** | C | C | C |
| **Desain Database & API** | I | **R / A** | C | I |
| **UI/UX Prototype** | C | I | C | **R / A** |
| **Implementasi Code Web** | I | R | **R / A** | C |
| **UAT & Quality Assurance** | **R / A** | R | R | I |

*Keterangan: R = Responsible, A = Accountable, C = Consulted, I = Informed.*

---

## 28. Rollout & Launch Strategy

Prosedur Peluncuran Berkelanjutan:

1. **Gelombang 1: Alpha Testing (Internal)** - Pengujian terbatas tim pengembang. Waktu: Minggu 4.
2. **Gelombang 2: Closed Beta** - Mengundang 50 mahasiswa (Persona 1) untuk uji coba real-world selama 1 minggu. Waktu: Minggu 5.
3. **Gelombang 3: Rilis Terbuka** - Link dibagikan ke teman kampus & komunitas. Waktu: Minggu 8 (setelah fitur Tahap 2 stabil).

---

## 29. Monitoring Pasca-Launch (Sederhana)

* **Error tracking:** cek log API (proses Node.js / PM2 / jurnal service) secara rutin; pastikan stack trace tidak terekspos di production.
* **Analytics pengguna:** event tracking sederhana via Google Analytics 4 atau tabel log internal (Bagian 13).
* **Target kesehatan aplikasi:**
  * Halaman utama terbuka < 2 detik.
  * Tidak ada error baru di log API selama masa uji.
  * File backup database tersedia setiap hari.
* **Pelaporan bug:** keluhan pengguna dikumpulkan via form/grup kelas, ditindaklanjuti setiap minggu.

---

## 30. Compliance & Regulasi

1. **Perlindungan Data Pribadi (UU PDP Indonesia):** Menjamin hak pengguna untuk menghapus akun dan seluruh data keuangan secara permanen via fitur *Delete Account* (cascade delete `ON DELETE CASCADE`, BR-DATA-02).
2. **Penanganan Data Transaksi:** FINTRACK tidak menyimpan data kredensial perbankan pada MVP (hanya data nominal inputan manual user).
3. **Pemberitahuan Privasi:** Tampilkan *Privacy Policy* saat pendaftaran awal mengenai penggunaan data internal aplikasi.

---

## 31. Data Dictionary

Semua tabel memakai PK `UUID` (`gen_random_uuid()`) dan kolom audit `created_at` / `updated_at` (`TIMESTAMPTZ`, otomatis via trigger `set_updated_at`).

### Tabel: `users`
| Field Name | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, default `gen_random_uuid()` | Unique identifier user. |; 
| `name` | `VARCHAR(100)` | Not Null | Nama tampilan user. |
| `email` | `VARCHAR(255)` | Not Null, unique case-insensitive (unique index pada `LOWER(email)`) | Email login user (BR-AUTH-01). |
| `password_hash` | `TEXT` | Not Null | Hash bcrypt (BR-AUTH-02). |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | Audit timestamps. |

### Tabel: `categories`
| Field Name | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Unique ID kategori. |
| `user_id` | `UUID` | FK → `users.id`, `ON DELETE CASCADE` | Pemilik kategori (BR-CAT-01). |
| `name` | `VARCHAR(100)` | Not Null | Nama kategori. |
| `type` | `transaction_type` | Not Null (`INCOME` / `EXPENSE`) | Jenis kategori (BR-CAT-02). |
| — | — | `UNIQUE (user_id, name, type)` | Tanpa duplikat per user (BR-CAT-03). |

### Tabel: `transactions`
| Field Name | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Unique ID transaksi. |
| `user_id` | `UUID` | FK → `users.id`, `ON DELETE CASCADE` | Pemilik transaksi. |
| `category_id` | `UUID` | FK → `categories.id`, `ON DELETE RESTRICT` | Kategori terkait; type wajib sama dengan `type` transaksi (BR-TRX-03). |
| `source_todo_id` | `UUID` | Nullable, FK → `financial_todos.id`; partial unique index (`NULL` bebas berulang) | ID To-Do asal jika Auto Expense; `NULL` untuk transaksi biasa (BR-AUTO-02, BR-AUTO-03). |
| `type` | `transaction_type` | Not Null | Tipe arus kas (BR-TRX-02). |
| `amount` | `NUMERIC(15,2)` | Not Null, `CHECK (amount > 0)` | Nominal uang (BR-TRX-01). |
| `date` | `DATE` | Not Null, default `CURRENT_DATE` | Tanggal transaksi (BR-TRX-07). |
| `notes` | `TEXT` | Nullable | Catatan opsional. |

### Tabel: `budgets`
| Field Name | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Unique ID budget. |
| `user_id` | `UUID` | FK → `users.id`, `ON DELETE CASCADE` | Pemilik budget. |
| `category_id` | `UUID` | FK → `categories.id`, `ON DELETE RESTRICT` | Wajib kategori `EXPENSE` (BR-BUD-02, via trigger). |
| `amount_limit` | `NUMERIC(15,2)` | Not Null, `CHECK (amount_limit > 0)` | Batas budget (BR-BUD-01). |
| `month_year` | `DATE` | Not Null, `CHECK` = tanggal pertama bulan (`YYYY-MM-01`) | Periode budget bulanan (BR-BUD-03). |
| — | — | `UNIQUE (user_id, category_id, month_year)` | Satu budget per kategori per bulan (BR-BUD-04). |

### Tabel: `financial_todos`
| Field Name | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Unique ID to-do. |
| `user_id` | `UUID` | FK → `users.id`, `ON DELETE CASCADE` | Pemilik to-do. |
| `title` | `VARCHAR(200)` | Not Null, `CHECK (LENGTH(TRIM(title)) > 0)` | Judul to-do (BR-TODO-01). |
| `amount` | `NUMERIC(15,2)` | Not Null, default `0`, `CHECK (amount >= 0)` | Nominal to-do; `0` boleh (BR-TODO-02). |
| `due_date` | `DATE` | Nullable | Tenggat opsional (BR-TODO-03). |
| `is_completed` | `BOOLEAN` | Not Null, default `FALSE` | Status selesai (BR-TODO-04). |
| `auto_expense` | `BOOLEAN` | Not Null, default `FALSE` | Flag pembuatan Auto Expense (BR-AUTO-01). |

### Trigger & Function (detail SQL: Bagian 34)
| Nama | Peran |
| :--- | :--- |
| `set_updated_at` | Mengisi `updated_at` otomatis di semua tabel. |
| `validate_transaction_ownership` | `category.user_id` dan `source_todo.user_id` wajib = `transaction.user_id` (BR-TRX-04). |
| `validate_budget_ownership` | `category.user_id` wajib = `budget.user_id`; kategori wajib `EXPENSE` (BR-BUD-02). |
| `validate_transaction_category_type` | `category.type` wajib = `transaction.type` (BR-TRX-03). |
| `create_default_categories` | Membuat 11 kategori default (4 INCOME, 7 EXPENSE) setelah register. |

---

## 32. Pertanyaan Terbuka (Open Questions / TBD)

Kebijakan Resolusi TBD: setiap item wajib memiliki PIC dan tanggal resolusi target yang tegas. Item yang memengaruhi scope, data model, atau estimasi Minggu 1 **wajib tuntas paling lambat 3 Oktober 2026**, sebelum pengerjaan dimulai pada **5 Oktober 2026**. Item yang melewati tanggal target tanpa keputusan dieskalasi ke Product Manager untuk diambilkan *default decision* yang dicatat dan bersifat final.

| ID | Pertanyaan | PIC | Target Resolusi | Status | Dampak jika Terlambat |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TBD-01** | Eksport data PDF/CSV tersedia untuk semua pengguna atau berbayar? | Product Manager | **20 Sep 2026** | SELESAI | Keputusan: aplikasi gratis tanpa tier — export tersedia untuk semua pengguna, dibangun di Tahap 2 (Minggu 6). |
| **TBD-02** | Ambang batas alert budget: tetap fixed 80% atau dapat dikustomisasi user di MVP? | Tech Lead + PM | **3 Okt 2026** | OPEN | Memengaruhi skema tabel `BUDGETS` dan kompleksitas engine budgeting (Minggu 3). |
| **TBD-03** | Apakah Pro Tier menyediakan trial 14 hari gratis bagi pengguna baru? | Product Manager | **20 Sep 2026** | DIBATALKAN | Tidak relevan: proyek ini gratis, tanpa tier Pro dan tanpa pembayaran (Bagian 14). |

---

## 33. Disaster Recovery & Data Backup Policy

### 33.1 Strategi Backup

| Jenis Backup | Frekuensi | Metode | Retensi | Lokasi |
| :--- | :--- | :--- | :--- | :--- |
| Export dump database | Harian (`pg_dump` / pgAdmin) | `pg_dump` / pgAdmin | 4 minggu | Di luar server (Google Drive / penyimpanan pribadi) |
| Backup sebelum deploy | Setiap upload fitur baru | Export manual tepat sebelum perubahan | Arsip permanen | Di luar server |
| Kode program | Setiap perubahan | Git (GitHub/GitLab) | Permanen | Remote repository |

Backup wajib disimpan di luar server agar tetap ada jika akun hosting bermasalah.

### 33.2 Target Recovery (RPO / RTO)

| Parameter | Target | Justifikasi |
| :--- | :--- | :--- |
| **RPO** (Recovery Point Objective) | ≤ 24 jam | Backup harian; maksimal data yang hilang adalah transaksi hari terakhir. |
| **RTO** (Recovery Time Objective) | ≤ 4 jam | Deploy ulang build React + API Node + import dump via psql/pgAdmin + verifikasi singkat. |

Target ini menjadi referensi formal RNF-007 dan RNF-008 (Bagian 9).

### 33.3 Skenario DR & Prosedur Recovery

| Skenario | Deteksi | Prosedur Recovery | Target |
| :--- | :--- | :--- | :--- |
| Data terhapus / korup (human error) | Laporan pengguna / cek data | Import dump PostgreSQL terakhir ke database baru → verifikasi jumlah data → update koneksi | RPO ≤ 24 jam, RTO ≤ 4 jam |
| Hosting down / akun bermasalah | Aplikasi tidak bisa diakses | Deploy ulang build React + API Node + DB terbaru ke hosting cadangan → perbarui link | RTO ≤ 4 jam |
| File rusak saat update | Error setelah upload | Pulihkan file dari Git / backup sebelum deploy | RTO ≤ 1 jam |

### 33.4 Verifikasi Backup & DR Drill

1. **Uji restore mingguan:** import satu dump acak ke PostgreSQL lokal (Laragon) dan pastikan aplikasi berjalan normal dengan data tersebut.
2. **Checklist harian:** pastikan file backup hari ini ada dan ukurannya wajar (tidak 0 KB).
3. Backup yang gagal/terlewat ditindaklanjuti sebelum deploy berikutnya.

### 33.5 Tanggung Jawab

Tech Lead/Backend = **R** (eksekusi backup, restore, dan drill), Product Manager = **A** (kepatuhan kebijakan). Rujuk matriks RACI Bagian 27.

---

## 34. Skema Database Final (PostgreSQL)

> **Database produksi & development: PostgreSQL.** File skema utama: `backend-php/sql/schema-postgres.sql` (SQL di bawah = salinan identik). Versi MariaDB (`backend-php/sql/schema.sql`) hanya sisa development awal — tidak dipakai lagi sejak migrasi ke Vercel.

**Catatan versi MariaDB (legacy development awal):** blok SQL di bawah adalah versi MariaDB yang dipakai saat development awal. Versi produksi: ackend/sql/schema-postgres.sql.
| Konsep PostgreSQL semula | Padanan MariaDB |
| :--- | :--- |
| `gen_random_uuid()` (pgcrypto) | `CHAR(36) DEFAULT (UUID())` |
| `TIMESTAMPTZ` + trigger `set_updated_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (native, tanpa trigger) |
| Unique index `LOWER(email)` | Generated column `email_key = LOWER(email)` + `UNIQUE KEY` |
| Partial unique index `WHERE source_todo_id IS NOT NULL` | `UNIQUE KEY (source_todo_id)` — di MariaDB `NULL` boleh berulang, semantik identik (BR-AUTO-03 tetap terjaga) |
| `CHECK (month_year = DATE_TRUNC(...))` | `CHECK (DAY(month_year) = 1)` |
| Trigger PL/pgSQL (3 fungsi validasi) | Trigger BEFORE INSERT/UPDATE dengan `SIGNAL SQLSTATE '45000'` |

```sql
-- =========================================================
-- FINTRACK - MySQL/MariaDB Final Schema (Capstone Project)
-- =========================================================

CREATE TABLE users (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    email_key     VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email_key)                -- BR-AUTH-01
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE categories (
    id         CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id    CHAR(36)     NOT NULL,
    name       VARCHAR(100) NOT NULL,
    type       ENUM('INCOME','EXPENSE') NOT NULL,        -- BR-CAT-02
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_user_name_type (user_id, name, type),  -- BR-CAT-03
    KEY idx_categories_user (user_id),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE           -- BR-DATA-02
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE financial_todos (
    id           CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id      CHAR(36)      NOT NULL,
    title        VARCHAR(200)  NOT NULL,
    amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
    due_date     DATE NULL,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    auto_expense TINYINT(1) NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_financial_todos_user (user_id),
    KEY idx_financial_todos_user_due_date (user_id, due_date),
    CONSTRAINT fk_financial_todos_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_financial_todos_amount_non_negative CHECK (amount >= 0),   -- BR-TODO-02
    CONSTRAINT ck_financial_todos_title_not_empty     CHECK (CHAR_LENGTH(TRIM(title)) > 0)  -- BR-TODO-01
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE transactions (
    id             CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id        CHAR(36)      NOT NULL,
    category_id    CHAR(36)      NOT NULL,
    source_todo_id CHAR(36)      NULL,                    -- BR-AUTO-02
    type           ENUM('INCOME','EXPENSE') NOT NULL,     -- BR-TRX-02
    amount         DECIMAL(15,2) NOT NULL,
    date           DATE NOT NULL DEFAULT (CURRENT_DATE),
    notes          TEXT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_transactions_source_todo (source_todo_id),  -- BR-AUTO-03
    KEY idx_transactions_user_date (user_id, date),
    KEY idx_transactions_user_type (user_id, type),
    KEY idx_transactions_category (category_id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE RESTRICT,    -- BR-DATA-03
    CONSTRAINT ck_transactions_amount_positive CHECK (amount > 0)  -- BR-TRX-01
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE budgets (
    id           CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id      CHAR(36)      NOT NULL,
    category_id  CHAR(36)      NOT NULL,
    amount_limit DECIMAL(15,2) NOT NULL,
    month_year   DATE NOT NULL,                           -- BR-BUD-03: selalu YYYY-MM-01
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_budgets_user_category_month (user_id, category_id, month_year),  -- BR-BUD-04
    KEY idx_budgets_user_month (user_id, month_year),
    KEY idx_budgets_category (category_id),
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT ck_budgets_amount_positive CHECK (amount_limit > 0),          -- BR-BUD-01
    CONSTRAINT ck_budgets_month_first_day CHECK (DAY(month_year) = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

**Trigger validasi** (menggantikan 3 fungsi PL/pgSQL; kode lengkap di `backend-php/sql/schema.sql`):
- `trg_transactions_validate_insert` / `trg_transactions_validate_update` — BR-TRX-03 (type = type kategori), BR-TRX-04 (kategori & `source_todo_id` milik user yang sama). Pelanggaran → `SIGNAL SQLSTATE '45000'`.
- `trg_budgets_validate_insert` / `trg_budgets_validate_update` — BR-BUD-02 (kategori wajib `EXPENSE`) + ownership kategori.
- Prosedur `create_default_categories(p_user_id)` — 11 kategori default (4 INCOME, 7 EXPENSE), dipanggil setelah register: `CALL create_default_categories(?)`.

### Perhitungan Dashboard (tanpa tabel tambahan)

Semua informasi dashboard dihitung dari tabel `transactions` dan `budgets` — saldo TIDAK disimpan sebagai kolom (BR-TRX-05).

```sql
-- Saldo
SELECT COALESCE(SUM(
    CASE WHEN type = 'INCOME' THEN amount
         WHEN type = 'EXPENSE' THEN -amount END
), 0) AS balance
FROM transactions
WHERE user_id = :user_id;

-- Total Pemasukan
SELECT COALESCE(SUM(amount), 0) FROM transactions
WHERE user_id = :user_id AND type = 'INCOME';

-- Total Pengeluaran
SELECT COALESCE(SUM(amount), 0) FROM transactions
WHERE user_id = :user_id AND type = 'EXPENSE';
```

### Perhitungan Budget & Status

Contoh: Budget Makanan September 2026 = Rp1.000.000. Pengeluaran: Rp250.000 + Rp150.000 + Rp200.000 + Rp200.000 = Rp800.000.

```
usage_percentage = (total expense kategori pada bulan tersebut / amount_limit) × 100
800.000 / 1.000.000 × 100 = 80%   → status: WARNING
1.100.000 / 1.000.000 × 100 = 110% → status: OVER_BUDGET
```

`usage_percentage` dan `status` **dihitung on-the-fly** di API (BR-BUD-05..07), bukan disimpan di tabel. Filter bulan memakai `DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(b.month_year, '%Y-%m')`.

**Status verifikasi (backend-php/sql/verify.sql, 18 tes):** 11 tes negatif seluruhnya tertolak oleh mekanisme yang benar (SIGNAL trigger, CHECK, UNIQUE, FK RESTRICT — termasuk BR-AUTO-03 menolak double-request auto expense); 5 tes positif lolos (termasuk `source_todo_id = NULL` berulang dan nama kategori sama dengan type berbeda); 2 query ringkasan menghasilkan angka yang benar.

## 35. Business Rules Final

Business Rules dikunci dengan ID berikut agar dapat direferensikan di API, service, test case, dan laporan Capstone.

### A. Authentication

| ID | Aturan |
| :--- | :--- |
| **BR-AUTH-01** | Email unik per user, perbandingan **case-insensitive** (`user@gmail.com` tidak boleh dipakai dua user). Dijamin `uq_users_email` pada `LOWER(email)`. |
| **BR-AUTH-02** | Password tidak pernah disimpan plaintext — hanya `password_hash` (bcrypt). |
| **BR-AUTH-03** | User Isolation: user hanya boleh mengakses data miliknya sendiri (`WHERE user_id = current_user_id` di semua query). |

### B. Category

| ID | Aturan |
| :--- | :--- |
| **BR-CAT-01** | Setiap kategori wajib memiliki satu `user_id` (ownership). |
| **BR-CAT-02** | Kategori hanya dua jenis: `INCOME` atau `EXPENSE`. |
| **BR-CAT-03** | User tidak boleh punya kategori dengan kombinasi nama + type yang sama (`UNIQUE (user_id, name, type)`). `Makanan-EXPENSE` + `Makanan-INCOME` tetap sah karena type berbeda. |

### C. Transaction

| ID | Aturan |
| :--- | :--- |
| **BR-TRX-01** | `amount > 0`. |
| **BR-TRX-02** | Type hanya `INCOME` atau `EXPENSE`. |
| **BR-TRX-03** | `transaction.type` wajib sama dengan `category.type` (transaksi EXPENSE tidak boleh masuk kategori Gaji/INCOME). |
| **BR-TRX-04** | `transactions.user_id` wajib sama dengan pemilik kategori (dan pemilik `source_todo_id` bila ada). |
| **BR-TRX-05** | `BALANCE = TOTAL INCOME − TOTAL EXPENSE`, dihitung on-the-fly — saldo tidak disimpan sebagai kolom. |
| **BR-TRX-06** | Saat transaksi dihapus, dashboard dan perhitungan budget dihitung ulang. |
| **BR-TRX-07** | Tanggal transaksi wajib valid; boleh masa lalu atau tanggal berjalan. |

### D. Budget

| ID | Aturan |
| :--- | :--- |
| **BR-BUD-01** | `amount_limit > 0`. |
| **BR-BUD-02** | Budget hanya boleh memakai kategori `EXPENSE`. |
| **BR-BUD-03** | Satu budget berlaku untuk satu bulan, disimpan sebagai `YYYY-MM-01` (contoh: September 2026 → `2026-09-01`). |
| **BR-BUD-04** | Satu budget per kombinasi `user + category + month`. |
| **BR-BUD-05** | `usage_percentage = (total expense kategori bulan tersebut / amount_limit) × 100`. |
| **BR-BUD-06** | Jika `usage >= 80%` → status `WARNING`. |
| **BR-BUD-07** | Jika `usage >= 100%` → status `OVER_BUDGET`. |
| **BR-BUD-08** | Setiap expense dibuat/diubah/dihapus → penggunaan budget dihitung ulang. |

### E. Financial To-Do

| ID | Aturan |
| :--- | :--- |
| **BR-TODO-01** | To-Do wajib memiliki judul (contoh: "Bayar listrik"). |
| **BR-TODO-02** | `amount` boleh `0` untuk To-Do non-finansial (contoh: "Cek pengeluaran bulan ini"). |
| **BR-TODO-03** | `due_date` opsional. |
| **BR-TODO-04** | Default `is_completed = false`; berubah `true` saat user menyelesaikan. |

### F. Auto Expense

| ID | Aturan |
| :--- | :--- |
| **BR-AUTO-01** | Jika `is_completed = true AND auto_expense = true AND amount > 0` → sistem membuat transaksi `type = EXPENSE`. |
| **BR-AUTO-02** | Transaksi otomatis wajib menyimpan `source_todo_id = financial_todos.id`. |
| **BR-AUTO-03** | Satu To-Do maksimal menghasilkan satu transaksi otomatis — dijamin partial unique index `uq_transactions_source_todo` (aman dari double-request/retry jaringan). |
| **BR-AUTO-04** | Penyelesaian To-Do dan pembuatan transaksi dilakukan dalam **satu database transaction** (`BEGIN … COMMIT`; gagal → `ROLLBACK`). |

### G. Data Integrity

| ID | Aturan |
| :--- | :--- |
| **BR-DATA-01** | Foreign Key: tidak boleh ada data yang mereferensikan user/category/todo yang tidak ada. |
| **BR-DATA-02** | Menghapus user menghapus seluruh data miliknya (Categories, Transactions, Budgets, Financial Todos) via `ON DELETE CASCADE`. |
| **BR-DATA-03** | Kategori yang sudah dipakai transaksi/budget tidak dapat dihapus (`ON DELETE RESTRICT`). Untuk MVP, UI menonaktifkan tombol hapus kategori yang sudah terpakai. |

---

## 36. Ringkasan Scope Database yang Dikunci

* **5 tabel:** `users`, `categories`, `transactions`, `budgets`, `financial_todos`.
* **Satu relasi tambahan:** `financial_todos ──< transactions.source_todo_id` (1 : 0..1).
* Tidak menambah tabel hanya demi terlihat kompleks — ERD, skema database, Business Rules, API, dan PRD konsisten satu sama lain, dan setiap tabel punya fungsi yang jelas serta langsung berkaitan dengan modul utama FINTRACK (Auth, Category, Transaction, Budget, Financial To-Do, Dashboard).
