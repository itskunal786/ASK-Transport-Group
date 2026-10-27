# ========================================================
# ASK Transport - Startup Script
# ========================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting ASK Transport Group System " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

$projectRoot = $PSScriptRoot
$webRoot = Join-Path $projectRoot "ASK.Transport.Web"

# 1. Start Backend API in a new PowerShell window
Write-Host "`n[1/2] Starting ASP.NET Core Web API (Port: 5208)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host '--- ASK TRANSPORT API (Port 5208) ---' -ForegroundColor Cyan; dotnet run --urls 'http://localhost:5208'"

# 2. Start Frontend in a new PowerShell window
Write-Host "[2/2] Starting React + Vite Frontend (Port: 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webRoot'; Write-Host '--- ASK TRANSPORT WEB (Port 5173) ---' -ForegroundColor Cyan; npm run dev"

# 3. Wait briefly and open browser
Start-Sleep -Seconds 3
Write-Host "`n[+] Opening Browser: http://localhost:5173" -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`nBoth Backend & Frontend are running!" -ForegroundColor Cyan
Write-Host "Press any key in this window to close this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
