== CARA DEPLOY FINTRACK KE HOSTING (cPanel File Manager) ==

1. Buka cPanel hosting (nurlintang.sch.id) → File Manager.
2. Masuk ke folder: /home/nure4885/public_html/financialtracking/
   (ini docroot domain financialtracking.online — buat foldernya jika belum ada)
3. Upload file "deploy-fintrack.zip" ke folder tersebut.
4. Klik kanan zip → Extract → ekstrak di folder yang sama.
   Hasil extract: index.html, favicon.svg, assets/, .htaccess, api/, install.php, schema-hosting.sql
5. Buka phpMyAdmin → pilih database "nure4885_fintrack" → tab Import
   → pilih "schema-hosting.sql" → Go. (Lewati jika tabel sudah dibuat.)
6. Buka https://financialtracking.online/install.php?key=FindtrackInstall2026
   → harus tampil "Tabel 1: OK ... SELESAI".
7. HAPUS install.php dan schema-hosting.sql dari File Manager (wajib, keamanan).
8. Buka https://financialtracking.online/ → daftar akun → aplikasi berfungsi penuh.

== CATATAN ==
- Jika login berhasil tapi setiap halaman melempar ke login lagi:
  berarti cookie belum terkirim — pastikan URL di address bar adalah HTTPS.
- Kredensial database ada di api/config.php (jangan dibagikan di luar tim).
- Setelah HTTPS aktif sepenuhnya, tidak perlu perubahan apa pun di kode.
