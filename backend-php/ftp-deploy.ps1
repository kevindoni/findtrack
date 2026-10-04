# =========================================================
# FINTRACK — FTP Deploy otomatis ke hosting
# Jalankan: powershell -File ftp-deploy.ps1
# Menghapus semua isi docroot (kecuali .well-known) lalu
# mengunggah isi folder deploy-stage/ dan menjalankan installer.
# =========================================================

$ErrorActionPreference = 'Continue'
$FTPHOST = 'ftp.nurlintang.sch.id'
$FTPUSER = 'findtrack@financialtracking.online'
$FTPPASS = 'Findtrack17'
$FTPBASE = "ftp://findtrack%40financialtracking.online:Findtrack17@ftp.nurlintang.sch.id:21"
$REMOTE  = '/public_html/financialtracking'
$STAGE   = 'D:\laragon\www\findtrack\backend-php\deploy-stage'
$INSTALL_URL = 'https://financialtracking.online/install.php?key=FindtrackInstall2026'

function FtpCmd([string]$cmd, [string]$url, [int]$tries = 3) {
    for ($i = 1; $i -le $tries; $i++) {
        $out = curl.exe -s -Q $cmd --max-time 90 $url 2>&1
        if ($LASTEXITCODE -eq 0) { return $true }
        Start-Sleep 3
    }
    Write-Host "  FTP gagal ($cmd): $out"
    return $false
}

function FtpUpload([string]$local, [string]$remote, [int]$tries = 3) {
    for ($i = 1; $i -le $tries; $i++) {
        curl.exe -s -S --max-time 120 -T "$local" --ftp-create-dirs "$FTPBASE$REMOTE$remote" -o NUL 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { Write-Host "  UP $remote OK"; return $true }
        Start-Sleep 3
    }
    Write-Host "  UP $remote GAGAL"
    return $false
}

function FtpDeleteAll([string]$path) {
    $listing = curl.exe -s --max-time 90 "$FTPBASE$REMOTE$path/" 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Host "  LIST gagal: $path"; return }
    foreach ($line in $listing) {
        if ($line -notmatch '^[d\-]') { continue }
        $parts = $line -split '\s+', 9
        $name = $parts[8]
        if ($name -in '.', '..', '.well-known') { continue }
        if ($line -match '^d') {
            FtpDeleteAll "$path/$name"
            FtpCmd "-RMD $REMOTE$path/$name" $FTPBASE | Out-Null
            Write-Host "  RMD $path/$name"
        } else {
            FtpCmd "-DELE $REMOTE$path/$name" $FTPBASE | Out-Null
            Write-Host "  DELE $path/$name"
        }
    }
}

Write-Host '== 1. HAPUS SEMUA ISI DOCROOT =='
FtpDeleteAll ''
Write-Host '== 2. UPLOAD FILE BARU =='
Get-ChildItem $STAGE -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($STAGE.Length + 1).Replace('\', '/')
    FtpUpload $_.FullName "/$rel" | Out-Null
}
Write-Host '== 3. JALANKAN INSTALLER (buat tabel + config.php) =='
$r = curl.exe -sk --max-time 120 $INSTALL_URL
Write-Host $r
Write-Host '== 4. HAPUS install.php + schema-hosting.sql dari server =='
FtpCmd "-DELE $REMOTE/install.php" $FTPBASE | Out-Null
FtpCmd "-DELE $REMOTE/schema-hosting.sql" $FTPBASE | Out-Null
Write-Host '== SELESAI =='
