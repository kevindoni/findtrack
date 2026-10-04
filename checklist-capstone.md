# FINTRACK — Pemetaan & Checklist Capstone Project (STSI4440)

> Sumber resmi: `USAJ - STSI4440 - Panduan Capstone Project - Mahasiswa.pdf` (Edisi 1, Universitas Terbuka).
> Dokumen ini memetakan seluruh ketentuan resmi ke aset FINTRACK yang sudah ada (`fintrack.md`, `design.md`) dan daftar apa yang masih harus dibuat. **Perbarui status checklist ini setiap sesi tuton.**

---

## 1. Ketentuan Resmi yang Wajib Dipatuhi

| Aspek | Ketentuan |
| :--- | :--- |
| Mata kuliah | STSI4440 Capstone Project, **6 SKS** (sesuai pengumuman tutor), 1 semester, Prodi Sistem Informasi UT |
| Nilai | 100% dari tutorial online: **Tugas 1 (20%) + Tugas 2 (30%) + Tugas 3 (50%)** |
| Urutan unggah | Tugas 2 hanya setelah Tugas 1; Tugas 3 hanya setelah Tugas 2 — semua via e-learning |
| Kelompok | 5 mahasiswa, dibentuk lewat tuweb **sesi 1**; 1 tutor membimbing & menilai. **Kelompok B (resmi):** Dita Cahaya Wulandari, Doni, Isnaini Khoirun Nisa, Renita Eka Iswandi, Tati Nuraisah — tutor: **Asri Maspupah** |
| Topik | Pendidikan, ekonomi, kesehatan, lingkungan, teknologi, pemerintahan → **FINTRACK masuk bidang EKONOMI** (aplikasi pencatatan & analisis keuangan pribadi). Topik sama dengan kelompok lain diperbolehkan asalkan masalah & solusi berbeda |
| Produk | Wajib menghasilkan **produk** (karya orisinal: analisis → perancangan → desain → implementasi → pengujian). Bukan penelitian novelty |

**Titik kumpul di tuton (8 sesi):** Tugas 1 (Proposal) di sesi 3 · Tugas 2 (Laporan Kemajuan) di sesi 5 · Tugas 3 (Laporan Akhir + Video + Poster + PPT + Karya Ilmiah) & presentasi di sesi 7.

---

## 2. Luaran Wajib vs Aset FINTRACK yang Sudah Ada

| # | Luaran resmi | Aset FINTRACK siap pakai | Yang masih harus dibuat | Deadline |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Tugas 1 — Proposal** (20%) | `fintrack.md` Bag. 1–3 (latar belakang, tujuan/metrik, personas), Bag. 7 (ruang lingkup + jadwal 2 tahap), Bag. 21 (kompetitor → bahan tinjauan pustaka) | **DRAFT SUDAH ADA** (`Proposal_FINTRACK_Tugas_1_STSI4440_Kelompok_B.docx`): bab I–II lengkap + 6 referensi + lampiran. **Tinggal:** isi NIM 5 anggota, tempat/tanggal surat pernyataan, bersihkan artefak angka di cover, tanda tangan | Sesi 3 |
| 2 | **Tugas 2 — Laporan Kemajuan** (30%) | Semua di atas + Bag. 10 (ERD), Bag. 34 (skema PostgreSQL), Bag. 35 (Business Rules), Bag. 11–12 (API & arsitektur), Bag. 17 (roadmap), `design.md` (desain UI) | Naskah laporan kemajuan (sistematika Bagian 4) + bukti progres implementasi (screenshot awal) | Sesi 5 |
| 3 | **Tugas 3 — Laporan Akhir** (komponen Tugas 3) | Seluruh dokumen teknis + Bag. 16 (rencana pengujian) + Bag. 26 (sequence diagram) | Hasil implementasi & pengujian nyata (screenshot, hasil test BR), Kesimpulan & Rekomendasi, lampiran lengkap | Sesi 7 |
| 4 | **Video** 4–7 menit (YouTube) | — | Naskah video + rekaman demo produk; **semua 5 anggota harus tampil**; link ditempel di Tugas 3 | Sesi 7 |
| 5 | **Poster A4** | Branding FINTRACK dari mockup (logo, palet warna, tagline "To-Do List untuk Keuangan") | Poster 1 halaman A4: masalah → solusi → cara kerja produk → screenshot | Sesi 7 |
| 6 | **PowerPoint** (8–12 slide, presentasi 10–15 menit) | Struktur cerita tersedia: masalah → spesifikasi → desain (ERD, UI) → implementasi → pengujian | Slide deck + pembagian bicara **5 anggota bergantian** + penjelasan trade-off & kendala + rincian kontribusi per anggota | Sesi 7 |
| 7 | **Karya Ilmiah** (artikel ilmiah) | — | Ikuti panduan terpisah **MKWI4560** (unduh dari https://si-fst.ut.ac.id/arsip/) — belum kita pegang | Sesi 7 |

---

## 3. Pemetaan Sistematika Proposal (Tugas 1) → Sumber

| Bab resmi | Ambil dari | Status |
| :--- | :--- | :--- |
| I. Pendahuluan — Latar Belakang | `fintrack.md` Bag. 1 + 3 (masalah: lupa catat pengeluaran, tidak tahu alokasi dana) | ✅ bahan siap |
| I. Pendahuluan — Tujuan | Bag. 2 (metrik MAU/DAU/retensi) + Bag. 19 | ✅ bahan siap |
| I. Pendahuluan — Ruang Lingkup | Bag. 7.1–7.3 (MVP 4 modul, Tahap 2, out-of-scope) | ✅ bahan siap |
| I. Pendahuluan — Jadwal Kegiatan | Bag. 17 (roadmap Minggu 1–8) — sesuaikan dengan kalender tuton | ✅ bahan siap |
| II. Tinjauan Pustaka | Bag. 21 (competitive analysis) + perlu tambahan: teori sistem informasi, literatur aplikasi keuangan pribadi, referensi minimal 5–10 sumber | ⚠️ perlu ditulis |
| III. Metodologi | **Dikosongkan** di proposal (aturan resmi) | — |
| IV–V | **Dikosongkan** di proposal | — |
| VI. Lampiran | Cover resmi + Surat Pernyataan + Berita Acara (template di PDF panduan, hal. 16/20/21) | ⚠️ isi data anggota |

## 4. Pemetaan Sistematika Laporan Kemajuan (Tugas 2) → Sumber

Sama dengan Proposal, ditambah:

| Bab resmi | Ambil dari | Status |
| :--- | :--- | :--- |
| III. Metodologi — Metode Penelitian | Deskripsi pendekatan pengembangan (berbasis produk: analisis → rancang → bangun → uji) — tulis 1–2 paragraf | ⚠️ perlu ditulis |
| III. Metodologi — Proses Analisis | `fintrack.md` Bag. 4 (user stories), Bag. 8 (RF), Bag. 23 (edge cases) | ✅ bahan siap |
| III. Metodologi — Proses Perancangan | Bag. 10 (ERD & kardinalitas), Bag. 34 (skema DB), Bag. 12 (arsitektur), `design.md` (desain UI) | ✅ bahan siap |
| III. Metodologi — Implementasi | Bag. 11 (API), Bag. 25 (dependency), progres coding nyata | ✅ kerangka siap |
| III. Metodologi — Pengujian & Evaluasi | Bag. 16 (metodologi pengujian) — hasilnya menyusul di Laporan Akhir | ✅ kerangka siap |
| IV–V | **Dikosongkan** di laporan kemajuan | — |
| VI. Lampiran | + screenshot progres, berita acara kerja kelompok | ⚠️ kumpulkan |

## 5. Pemetaan Laporan Akhir (Tugas 3) → Sumber

Sama dengan Laporan Kemajuan (bab I–III lengkap), ditambah:

| Bab resmi | Ambil dari | Status |
| :--- | :--- | :--- |
| IV. Hasil dan Pembahasan | Screenshot aplikasi jadi, hasil pengujian per fitur & per BR-ID (Bag. 16 + 35), temuan & kendala | ❌ menunggu implementasi |
| V. Kesimpulan & Rekomendasi | Ditulis di akhir proyek; rekomendasi = fitur Tahap 2/backlog (Bag. 7.2) | ❌ menunggu |
| VI. Lampiran | Kode program (repo), diagram (ERD, arsitektur, sequence), data pengujian, **link video, file PPT, poster**, surat pernyataan, berita acara | ❌ menunggu |

---

## 6. Dokumen Administratif (Template Resmi ada di PDF, hal. 16–21)

| Dokumen | Data yang harus diisi | Status |
| :--- | :--- | :--- |
| Cover (Proposal/Kemajuan/Akhir) | Judul proyek, nama + NIM 5 anggota, tahun pelaksanaan | ⬜ belum diisi |
| Surat Pernyataan orisinalitas | Nama + NIM 5 anggota, judul, tempat + tanggal, tanda tangan | ⬜ |
| Berita Acara Kerja Kelompok | Diisi **per pertemuan kelompok** (judul, hari/tanggal, aktivitas, luaran, PJ, kendala, ttd yang hadir, foto dokumentasi) | ⬜ mulai isi sejak pertemuan pertama — jangan ditumpuk di akhir |

---

## 7. Jadwal Sinkronisasi Roadmap FINTRACK ↔ Tuton

| Sesi tuton | Milestone resmi | Aktivitas FINTRACK |
| :--- | :--- | :--- |
| Sesi 1 | Pembentukan kelompok + topik (tuweb) | ✅ SELESAI — Kelompok B resmi, topik FINTRACK, berita acara mulai diisi |
| Sesi 2 | Diskusi | Susun proposal dari `fintrack.md` + tinjauan pustaka |
| Sesi 3 | **Kumpul Tugas 1 (Proposal)** | Unggah proposal |
| Sesi 4 | Diskusi | Mulai coding Minggu 1–2 (setup, auth, transaksi) — roadmap `fintrack.md` Bag. 17 |
| Sesi 5 | **Kumpul Tugas 2 (Laporan Kemajuan)** | Laporan kemajuan + bukti progres; target: auth + transaksi + kategori jalan |
| Sesi 6 | Diskusi | Lanjut budget + to-do + dashboard; siapkan video/poster/PPT |
| Sesi 7 | **Kumpul Tugas 3 + presentasi (tuweb)** | Laporan akhir + semua luaran; presentasi 10–15 menit semua anggota bicara |
| Sesi 8 | Diskusi penutup | Refleksi & evaluasi |

---

## 8. Kesimpulan Gap Analysis

**Sudah kuat (± 70% bahan dokumen):** analisis masalah, requirement, ERD + skema database, business rules, arsitektur, API, desain UI, roadmap, rencana pengujian.

**Yang belum ada dan harus disiapkan:**
1. ~~Tinjauan pustaka~~ → **sudah ada draftnya di Proposal** (6 referensi: Petter & McLean, Jeyaraj, Frisancho dkk., Fitria dkk., Ratnasari dkk., Imawan dkk.).
2. Implementasi produk + hasil pengujian terdokumentasi — inti nilai Tugas 3.
3. Video (semua anggota tampil), poster A4, PPT 8–12 slide.
4. Karya ilmiah — **unduh panduan MKWI4560** dari https://si-fst.ut.ac.id/arsip/ (ketentuannya terpisah).
5. Administratif: ~~cover & surat pernyataan~~ (sudah ada di lampiran proposal, tinggal isi NIM) + **berita acara rutin tiap pertemuan**.
