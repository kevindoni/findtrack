# FINTRACK — Pembagian Tugas Kelompok (5 Anggota)

> **Kelompok B — Tutor: Asri Maspupah**
> Anggota: Dita Cahaya Wulandari, Doni, Isnaini Khoirun Nisa, Renita Eka Iswandi, Tati Nuraisah
>
> Pembagian tugas mengikuti peran tim pengembangan sistem informasi: manajer proyek, analis sistem, programmer, penguji, dan dokumentator. Koding (backend + frontend) ditanggung satu anggota; anggota lainnya memegang analisis, perancangan, pengujian, dan dokumentasi/multimedia. Pembagian dapat disesuaikan berdasarkan keahlian masing-masing.
>
> **Dokumen acuan anggota:** `FINTRACK-Dokumen-Lengkap-Kelompok-B.docx`. Rujukan "**Bagian 4**" berarti bagian 4 di dokumen itu (PRD & Dokumentasi Teknis).

---

## A. Pembagian Utama

| Anggota | Peran (Teori) | Tugas Utama di FINTRACK | Akan ditanya tentang |
| :--- | :--- | :--- | :--- |
| **Anggota 1 — Dita Cahaya Wulandari** | **Manajer Proyek + Analis Kebutuhan** | Koordinasi tim, jadwal, identifikasi masalah & kebutuhan, user stories, Berita Acara | Masalah, kebutuhan pengguna, ruang lingkup, jadwal |
| **Anggota 2 — Doni** | **Programmer (Fullstack)** | Seluruh kode: API backend + frontend React, database, keamanan | Kode API & halaman, alur data, implementasi business rules |
| **Anggota 3 — Isnaini Khoirun Nisa** | **Analis Sistem & Perancang** | Analisis kebutuhan detail, ERD 5 tabel, business rules, alur sistem, data dictionary | ERD, relasi tabel, business rules, alur sistem |
| **Anggota 4 — Renita Eka Iswandi** | **Penguji Sistem (Tester)** | Test case 35 Business Rules, pengujian manual & database, UAT 15 responden | Cara menguji, hasil pengujian, bukti pengujian |
| **Anggota 5 — Tati Nuraisah** | **Dokumentator & Multimedia** | Dokumentasi laporan, poster A4, video, PPT, design system | Dokumentasi, alasan desain, poster/video/PPT |

---

## B. Tugas Spesifik Per Orang

### Anggota 1 — Manajer Proyek + Analis Kebutuhan
**Tugas:**
1. Mengkoordinasi tim, menyusun jadwal, mengatur pembagian tugas, memimpin rapat
2. Mengidentifikasi masalah & kebutuhan pengguna → menyusun user stories
3. Menyusun bab Pendahuluan proposal & laporan (latar belakang, tujuan, ruang lingkup, jadwal)
4. Mengisi & mengarsipkan **Berita Acara setiap pertemuan**
5. Menjadi penghubung dengan tutor/dosen

**Bahan:** Dokumen Lengkap — **Bagian 4** (bagian 1–4, 7–9, 32) · **Bagian 6** (Proposal)

**Prediksi pertanyaan dosen:** "Apa masalahnya?", "Kenapa fiturnya hanya ini?", "Bagaimana pembagian tugas tim?", "Apa jadwal proyeknya?"
→ Jawaban ada di: Bagian 1, 3, 7, 32 PRD + `pembagian-tugas.md`.

---

### Anggota 2 (Doni) — Programmer (Fullstack)
**Tugas:**
1. Memahami & menjelaskan ERD 5 tabel + kardinalitas (users, categories, transactions, budgets, financial_todos)
2. Menjelaskan relasi `source_todo_id` (1 : 0..1) dan kenapa ada
3. Menjelaskan business rules di database (trigger, unique index, check constraint)
4. Menyusun bab Perancangan di Laporan Kemajuan & Laporan Akhir (ERD, kamus data, arsitektur)
5. Menyusun Data Dictionary

**Bahan:** Dokumen Lengkap — **Bagian 4** (bagian 10, 31, 34, 35) · **Bagian 5** (design system)

**Prediksi pertanyaan dosen:** "Kenapa tabelnya 5?", "Kenapa relasi to-do ke transaksi 1:0..1?", "Apa fungsi trigger?", "Bagaimana mencegah data antar user tercampur?"
→ Jawaban ada di: Bagian 10.1 (kenapa source_todo_id), 34 (skema), 35 (BR-DATA/BR-TRX).

---

### Anggota 3 (Isnaini Khoirun Nisa) — Analis Sistem & Perancang
**Tugas:**
1. **Backend:** API auth (register/login/ganti password/hapus akun), kategori, transaksi, budget, to-do + auto expense, dashboard; keamanan (bcrypt, JWT cookie HttpOnly, isolasi data per user)
2. **Frontend:** 9 halaman React (Landing, Login, Register, Dashboard + grafik, Transaksi, Budget, To-Do, Pengaturan), integrasi API, responsif mobile
3. Menjelaskan implementasi business rules di kode: validasi nominal, email unik, auto expense idempoten (BR-AUTO-03)
4. Menjalankan **demo aplikasi lengkap** saat presentasi (alur: login → input transaksi → budget/grafik ter-update → to-do auto expense)
5. Menulis bagian Implementasi di Laporan Kemajuan & Laporan Akhir

**Bahan:** kode proyek (`backend/src/`, `frontend/src/`) · Dokumen Lengkap — **Bagian 4** (bagian 11, 34, 35)

**Prediksi pertanyaan dosen:** "Tunjukkan alur simpan transaksi dari awal sampai akhir?", "Bagaimana mencegah transaksi ganda di auto expense?", "Di mana password diverifikasi dan di-hash?", "Bagaimana isolasi data antar user?", "Kenapa pakai React + Node.js?"
→ Jawaban ada di: kode sendiri + Dokumen Lengkap — Bagian 4 (bagian 11, 34, 35) · Bagian 5 (design system).

> **Dukungan tim:** seluruh dokumen, pengujian, dan multimedia ditangani anggota lain sehingga bisa fokus penuh pada koding. Basis kode sudah tersedia dan terdokumentasi lengkap di `fintrack.md`, sehingga tugas utamanya adalah membangun serta menyempurnakan fitur yang sudah ada.

---

### Anggota 4 — Penguji Sistem (Tester) & QA
**Tugas:**
1. Menyusun **test case per fitur & per Business Rule** (35 BR → tabel uji: langkah, hasil harapan, hasil nyata)
2. Menjalankan skrip verifikasi database (`backend-php/sql/verify.sql` — 18 tes) dan menjelaskan hasilnya
3. Melakukan pengujian manual semua fitur + mencatat bukti (screenshot) — bahan bab Pengujian Laporan Akhir
4. Menyelenggarakan **UAT 15 responden** (bagikan aplikasi, kumpulkan umpan balik)
5. Menulis bab Pengujian & Evaluasi di Laporan Akhir

**Bahan:** Dokumen Lengkap — **Bagian 4** (bagian 16, 35) · bukti uji di `docs/screenshots/`

**Prediksi pertanyaan dosen:** "Bagaimana cara menguji auto expense?", "Apa yang diuji dan apa hasilnya?", "Bagaimana jika input nominal minus?", "Tunjukkan bukti pengujian."
→ Jawaban ada di: test case miliknya + `verify.sql` (18 tes: BR-TRX-01/03, BR-AUTO-03, BR-BUD-02/03, dll).

---

### Anggota 5 — Dokumentator & Multimedia
**Tugas:**
1. Mengelola **dokumentasi seluruh laporan** (kerapian, konsistensi format, kelengkapan bab)
2. Menjaga konsistensi **design system** (warna, ikon, komponen) dan meninjau semua halaman
3. Membuat **Poster A4** produk (gambaran produk + cara kerja)
4. Menyusun **PPT 8–12 slide** (identifikasi masalah → spesifikasi → desain → implementasi → pengujian + kontribusi per anggota)
5. Mengarahkan & menyunting **Video 4–7 menit** (skrip, demo, semua anggota tampil)

**Bahan:** Dokumen Lengkap — **Bagian 5** (design system) · mockup produk

**Prediksi pertanyaan dosen:** "Kenapa desainnya seperti ini?", "Bagaimana memastikan responsif di HP?", "Apa alasan pemilihan warna/ikon?"
→ Jawaban ada di: Dokumen Lengkap — **Bagian 5**, bagian 1–2 (design tokens, layout mobile) + mockup.

---

## C. Tugas Bersama (Semua Anggota — wajib panduan)

| Tugas | Ketentuan |
| :--- | :--- |
| **Video 4–7 menit** | Semua tampil; upload ke YouTube; link di Tugas 3 |
| **PPT** | 8–12 slide; semua anggota bicara bergantian 10–15 menit |
| **Berita Acara** | Diisi setiap pertemuan (jangan ditumpuk) |
| **UAT** | Membagikan aplikasi ke 15 responden + kumpulkan hasil |

---

## D. Jadwal Per Sesi Tuton (siapa mengerjakan apa)

| Sesi | Anggota 1 (Dita) | Anggota 2 (Doni – Koding) | Anggota 3 (Isnaini – Perancangan) | Anggota 4 (Renita – Uji) | Anggota 5 (Tati – Multimedia) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Draft proposal bab I | Setup backend + frontend | ERD + rancangan DB | Template test case | Desain poster + tema visual |
| 2 | Tinjauan pustaka + review proposal | Koding: auth + kategori | Review rancangan | Susun test case BR | Susun PPT kerangka |
| 3 | **Unggah Tugas 1** | Koding: transaksi + budget | Bantu revisi | Uji auth + transaksi | Rekam materi poster |
| 4 | Draft Laporan Kemajuan bab I–II | Koding: to-do + dashboard | Draft bab perancangan | Uji budget + to-do + auto expense | Edit video |
| 5 | **Unggah Tugas 2** | Perbaikan bug | Bantu revisi | Rekap hasil pengujian | Finalisasi poster + PPT |
| 6 | Draft Laporan Akhir bab I–II | Perbaikan + polish | Draft bab IV (data uji) | UAT 15 responden | Finalisasi video |
| 7 | **Bantu finalisasi semua** | **Siap ditanya koding** | **Siap ditanya perancangan** | **Siap ditanya pengujian** | **Siap ditanya desain + multimedia** |
| 8 | Refleksi & evaluasi | — | — | — | — |

---

## E. Matriks Kontribusi (template untuk slide PPT)

| Nama | Peran | Kontribusi Utama | Luaran |
| :--- | :--- | :--- | :--- |
| Dita Cahaya Wulandari | Manajer Proyek + Analis Kebutuhan | Koordinasi tim, identifikasi masalah & kebutuhan, bab Pendahuluan | Proposal, Laporan, Berita Acara |
| Doni | Programmer (Fullstack) | API + 9 halaman React (backend & frontend), auto expense | Aplikasi web lengkap, demo |
| Isnaini Khoirun Nisa | Analis Sistem & Perancang | ERD 5 tabel, 35 business rules, data dictionary | Skema DB, bab perancangan |
| Renita Eka Iswandi | Penguji Sistem & QA | Test case 35 BR, 18 tes database, UAT 15 responden | Data pengujian, bab pengujian |
| Tati Nuraisah | Dokumentator & Multimedia | Dokumentasi laporan, design system, poster, video, PPT | Poster, video, PPT |

---

## F. Pembagian Penulisan Proposal (Tugas 1)

Pembagian bagian proposal sesuai peran masing-masing:

| Anggota | Bagian Proposal yang Ditulis |
| :--- | :--- |
| **Dita Cahaya Wulandari** | Bab 1.1 Latar Belakang + 1.2 Tujuan |
| **Doni** | Bab 1.4 Jadwal Kegiatan + kajian teknologi pada 2.4 (Aplikasi Personal Finance Management) |
| **Isnaini Khoirun Nisa** | Bab 1.3 Ruang Lingkup + konsep Financial To-Do List pada 2.5 + sintesis kebutuhan pada 2.6 |
| **Renita Eka Iswandi** | Kajian pengelolaan keuangan mahasiswa pada 2.3 + rencana indikator keberhasilan pada 1.2 |
| **Tati Nuraisah** | Format dokumen, Daftar Pustaka, lampiran (daftar anggota, surat pernyataan, berita acara) |

> Semua anggota wajib membaca ulang keseluruhan proposal sebelum dikumpulkan — isi milik kelompok, bukan milik perorangan.
