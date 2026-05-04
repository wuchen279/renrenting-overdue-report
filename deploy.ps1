$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$gitPath = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    Write-Host "[ERROR] Git not found at $gitPath" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RenRenTing Risk Control Deploy Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "  Dir: $ScriptDir" -ForegroundColor Gray

Write-Host ""
Write-Host "[1/5] Init git repo..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    & $gitPath init
    & $gitPath add -A
    & $gitPath commit -m "feat: init renrenting risk dashboard"
} else {
    Write-Host "  Repo exists, skip"
}

Write-Host ""
Write-Host "[2/5] Config remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/wuchen279/renrenting-overdue-report.git"
try { $existingRemote = & $gitPath remote get-url origin 2>$null } catch { $existingRemote = "" }
if ($existingRemote) {
    if ($existingRemote -ne $remoteUrl) {
        & $gitPath remote set-url origin $remoteUrl
        Write-Host "  Remote updated"
    } else { Write-Host "  Remote configured" }
} else {
    & $gitPath remote add origin $remoteUrl
    Write-Host "  Remote added"
}

Write-Host ""
Write-Host "[3/5] Push to GitHub..." -ForegroundColor Yellow
try {
    & $gitPath branch -M main
    & $gitPath push -u origin main --force
    Write-Host "  Push OK!" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Push failed" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[4/5] Enable GitHub Pages..." -ForegroundColor Yellow
Write-Host "  Step 1: Open https://github.com/wuchen279/renrenting-overdue-report/settings/pages"
Write-Host "  Step 2: Source = GitHub Actions"
Write-Host "  Step 3: Save and wait ~2 min"

Write-Host ""
Write-Host "[5/5] Supabase DB init..." -ForegroundColor Yellow
Write-Host "  Open supabase_schema.sql in Supabase SQL Editor and run it"
Write-Host "  URL: https://mufudfalsojocgibetpm.supabase.co"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DONE!" -ForegroundColor Green
Write-Host "  Frontend: https://wuchen279.github.io/renrenting-overdue-report/" -ForegroundColor Green
Write-Host "  Admin:    https://wuchen279.github.io/renrenting-overdue-report/admin.html" -ForegroundColor Green
Write-Host "  DB:       https://mufudfalsojocgibetpm.supabase.co" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
