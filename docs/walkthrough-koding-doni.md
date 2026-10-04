> **CATATAN:** Dokumen ini ditulis untuk backend Node.js (versi arsip — sudah diganti PHP). Konsep keamanan & pola kodingnya tetap berlaku di `backend-php/api/`; padanan filenya: routes → `api/index.php`, middleware → `lib/helpers.php` (require_auth), db.js → `lib/db.php`.

# Walkthrough Koding — Bekal Doni (Fullstack Developer)

> Materi belajar untuk menguasai seluruh kode FINTRACK sebelum presentasi.
> Target: bisa **menjelaskan alur satu fitur dari tombol sampai database**, membuka file terkait, dan menjawab pertanyaan teknis.
> Bahan pendukung: `fintrack.md` Bagian 11 (API) & 35 (Business Rules) — kode kalian adalah implementasi dari aturan-aturan itu.

---

## 1. Peta Proyek

```
findtrack/
├── backend/
│   ├── .env                  → konfigurasi rahasia (port, DB, JWT_SECRET)
│   ├── sql/
│   │   ├── schema.sql        → pembuatan 5 tabel + 4 trigger + 1 prosedur
│   │   └── verify.sql        → 18 tes bukti business rules di level database
│   └── src/
│       ├── server.js         → pintu masuk: bikin server Express, pasang semua rute, error handler pusat
│       ├── config.js         → baca file .env jadi satu objek konfigurasi
│       ├── db.js             → koneksi pool ke MySQL/MariaDB (mysql2)
│       ├── middleware/
│       │   └── auth.js       → cek JWT cookie di setiap request (middleware authenticate)
│       ├── utils/
│       │   └── asyncHandler.js → pembungkus async route agar error masuk ke error handler pusat
│       └── routes/
│           ├── auth.routes.js         → register, login, logout, me, profile, password, hapus akun
│           ├── category.routes.js     → CRUD kategori
│           ├── transaction.routes.js  → CRUD transaksi + filter + search
│           ├── budget.routes.js       → CRUD budget + hitung usage/status
│           ├── todo.routes.js         → CRUD to-do + complete (auto expense)
│           └── dashboard.routes.js    → ringkasan + grafik 6 bulan + donut kategori
└── frontend/
    ├── vite.config.js        → proxy /api ke localhost:3000 (agar tidak kena CORS saat dev)
    ├── index.html            → satu-satunya HTML (React SPA)
    └── src/
        ├── main.jsx          → pasang React Router
        ├── App.jsx           → cek sesi login, sidebar desktop, bottom nav mobile
        ├── index.css         → Tailwind + design tokens (warna pine, mint, dll)
        ├── lib/api.js        → SATU pintu semua request ke API (fetch + cookie)
        ├── components/       → modal (Transaction/Budget/Todo), Charts, CategoryAvatar, LogoMark
        └── pages/            → Landing, Login, Register, Dashboard, Transactions, Budgets, Todos, Settings
```

---

## 2. Cara Kerja Satu Request (WAJIB paham)

Contoh: user menekan **Simpan Transaksi**.

```
[Browser] klik Simpan
   │  fetch POST /api/v1/transactions  (cookie "token" ikut terkirim otomatis)
   ▼
[Vite dev server :5173]  proxy /api → http://localhost:3000   (hanya saat development)
   ▼
[Express :3000]
   1. express.json()          → body JSON diparse; kalau rusak → 400 INVALID_JSON
   2. cookieParser()          → cookie dibaca jadi req.cookies.token
   3. router.use(authenticate)→ jwt.verify(token); valid → req.user = {sub: user_id}
   4. validateTransactionBody → cek type, amount > 0, format kategori/tanggal (BR-TRX-01/02/07)
   5. pool.execute(INSERT...) → query PARAMETERIZED (nilai dipisah dari SQL, anti SQL injection)
   ▼
[MariaDB]
   6. UNIQUE KEY uq_transactions_source_todo   → BR-AUTO-03
   7. CHECK amount > 0                          → BR-TRX-01
   8. TRIGGER trg_transactions_validate_insert → cek pemilik kategori + kesesuaian tipe
      (pelanggaran → SIGNAL SQLSTATE '45000' → error balik ke Express)
   ▼
[Express] INSERT sukses → SELECT barisnya → kirim JSON 201
   ▼
[Browser] onSaved() → daftar transaksi di-load ulang → baris baru muncul
```

Kalau ada error di langkah 6–8, **error handler pusat** di `server.js` yang menerjemahkannya:

| Error MariaDB | Respons API |
| :--- | :--- |
| `ER_SIGNAL_EXCEPTION` (pelanggaran trigger BR) | `409` + pesan trigger |
| `ER_DUP_ENTRY` (duplikat unik) | `409` |
| `ER_CHECK_CONSTRAINT_VIOLATED` (pelanggaran CHECK) | `400` |
| `ER_ROW_IS_REFERENCED_2` (hapus terpakai) | `409` `BR-DATA-03` |
| Body JSON rusak | `400` `INVALID_JSON` |

---

## 3. Urutan Belajar (ikuti berurutan, ±2–3 jam total)

### Langkah 1 — Jalankan & rasakan (15 menit)
1. Pastikan API + web jalan, buka http://localhost:5173
2. Register akun baru → buka **DevTools (F12) → Application → Cookies** → lihat cookie `token` (HttpOnly — tidak bisa dibaca JavaScript, ini alasan aman dari XSS)
3. Buka **Network tab**, lakukan 1 aksi → perhatikan request-nya (URL, method, cookie, respons)

### Langkah 2 — Middleware auth.js (10 menit)
File terpendek, tapi inti keamanan. Pahami:
- `jwt.verify(token, secret)` → kalau valid, `req.user = {sub: user_id}` → **sub inilah user_id** yang dipakai SEMUA query (BR-AUTH-03)
- Tidak ada cookie / token rusak → `401` sebelum menyentuh data

### Langkah 3 — auth.routes.js (20 menit)
Pola semua route ada di sini: validasi → query → respons.
- **Register:** `crypto.randomUUID()` (ID dibuat aplikasi) → `bcrypt.hash(password, 10)` → `conn.beginTransaction()` → INSERT user + `CALL create_default_categories(?)` → COMMIT. Kalau email duplikat → ROLLBACK + `409 BR-AUTH-01`
- **Login:** cari user by `email_key` (kolom generated = LOWER(email)) → `bcrypt.compare` → 5 kali gagal = kunci 15 menit (Map di memori)
- **Ganti password:** `bcrypt.compare(password_lama)` dulu → salah → 401

### Langkah 4 — category.routes.js (15 menit)
CRUD paling sederhana. Perhatikan pola **cek kepemilikan**:
```js
SELECT id FROM categories WHERE id = ? AND user_id = ?   // user lain → 404, bukan 403
```
Dan alasan kenapa 404 (bukan 403): jangan bocorkan ke user bahwa data milik orang lain itu ada.

### Langkah 5 — transaction.routes.js (30 menit, paling penting)
- Filter dinamis: parameter ditumpuk sesuai urutan `?` di SQL (query COUNT ikut JOIN categories untuk search nama)
- `parseAmount`: menolak 0, negatif, non-angka (BR-TRX-01)
- POST gagal karena trigger → direspons jadi `409 BR-TRX-03` dengan pesan dari database

### Langkah 6 — todo.routes.js PATCH complete (30 menit, fitur andalan)
Alur **auto expense atomik** (BR-AUTO-01..04):
```
BEGIN TRANSACTION
  SELECT ... FOR UPDATE          → kunci baris to-do (anti balapan 2 request)
  kalau sudah completed → commit, return (idempoten)
  UPDATE is_completed = 1
  kalau auto_expense && amount > 0:
     cari kategori 'Lainnya' (EXPENSE)
     INSERT transactions (source_todo_id = id to-do)
     kalau ER_DUP_ENTRY → berarti pernah dibuat → abaikan (tetap 1 transaksi)
COMMIT                             → sukses semua ATAU gagal semua
```
Uji pemahaman: kenapa `FOR UPDATE`? Kenapa ada unique index di `source_todo_id` padahal sudah dicek di kode? (Jawaban: kode bisa dobel klik/race; database adalah benteng terakhir.)

### Langkah 7 — budget + dashboard (20 menit)
- `usage_percentage` & status **dihitung di query** (CASE WHEN), tidak disimpan di tabel → selalu akurat (BR-BUD-05..07)
- `series` grafik 6 bulan: query GROUP BY bulan, lalu diisi bulan kosong di JavaScript

### Langkah 8 — Frontend (30 menit)
- `lib/api.js`: semua fetch lewat satu fungsi (`credentials: 'include'` agar cookie ikut); error dilempar dengan `err.code`
- `App.jsx`: panggil `api.me()` saat load → simpan `user` → belum login otomatis dilempar ke /auth/login
- Modal simpan transaksi → `onSaved()` memanggil `load()` (pola: ubah data → muat ulang)

### Langkah 9 — Database (20 menit)
Baca `schema.sql` sambil buka phpMyAdmin. Perhatikan: generated column `email_key`, `ON UPDATE CURRENT_TIMESTAMP` (updated_at otomatis, tanpa trigger), `UNIQUE` boleh banyak NULL.

---

## 4. Konsep yang WAJIB Bisa Dijelaskan

| Konsep | Penjelasan 1 kalimat (pakai bahasa sendiri saat ditanya) |
| :--- | :--- |
| JWT | "Tiket digital berisi user_id yang ditandatangani server; klien tidak bisa memalsukan isinya tanpa secret." |
| Cookie HttpOnly | "Token disimpan di cookie yang tidak bisa dibaca JavaScript → aman dari pencurian lewat XSS." |
| bcrypt | "Hash satu arah + salt; password asli tidak bisa dipulihkan dari hash-nya." |
| Parameterized query | "Nilai dikirim terpisah dari SQL sehingga input jahat tidak bisa menyuntik perintah." |
| ON DELETE CASCADE / RESTRICT | "CASCADE = ikut terhapus dengan user; RESTRICT = tolak hapus kalau masih dipakai." |
| Trigger SIGNAL 45000 | "Validasi terakhir di database — walau ada yang bypass API, data tetap tak bisa salah." |
| BEGIN/COMMIT/ROLLBACK | "Semua langkah berhasil semua atau dibatalkan semua — dipakai di register dan auto expense." |
| Idempoten | "Dipanggil berkali-kali hasilnya tetap sama — auto expense dijamin maksimal 1 transaksi (unique index)." |

---

## 5. Latihan Mandiri (lakukan semua, ±1 jam)

1. Daftar akun baru via UI → cek cookie di DevTools + 11 kategori default di phpMyAdmin
2. Register ulang email sama (huruf besar/kecil beda) → lihat 409
3. Kirim transaksi nominal minus lewat DevTools Console:
   `fetch('/api/v1/transactions',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'EXPENSE',amount:-5,category_id:'<id-kategori>'})}).then(r=>r.json()).then(console.log)`
   → amati respons 400/409
4. Centang to-do auto-expense dua kali cepat → bukti hanya 1 transaksi (lihat phpMyAdmin)
5. Buka `verify.sql`, pahami 5 tes pertama, jalankan kembali
6. Kecilkan lebar browser ke 390px → amati bottom nav muncul, sidebar hilang

---

## 6. Persiapan Demo Presentasi (3 menit)

1. **Login** (tunjukkan cookie HttpOnly di DevTools → "ini sesinya")
2. **Tambah transaksi** → tunjukkan saldo & budget berubah
3. **Buka phpMyAdmin** sebelahan → tunjukkan baris baru di tabel (bukti datanya nyata)
4. **Centang to-do auto-expense** → tunjukkan transaksi muncul otomatis dengan `source_todo_id`
5. **Coba hapus kategori terpakai** → tunjukkan ditolak (integritas data)
6. Tutup dengan dashboard grafik

Siapkan jawaban: "kenapa pakai Node + React?" → "REST API terpisah + SPA: frontend dan backend bisa dikembangkan/di-deploy independen, dan desainnya mengikuti arsitektur di PRD Bagian 12."

---

## 7. Hal yang Sengaja BELUM Ada (jangan tambah sendiri sebelum UAT)

- TypeScript, Redux/state library besar, Docker, CI/CD — tidak diminta PRD
- Fitur Tahap 2 (import/export, laporan analisis, goal) — sengaja ditunda
- Tabel/skolom di luar skema Bagian 34

Alasannya sama: **kode 1:1 dengan PRD agar semua bisa dipertanggungjawabkan saat ditanya.**
