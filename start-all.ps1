# ========================================================
# ASK Transport - Startup Script
# ========================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting ASK Transport Group System " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

$projectRoot = $PSScriptRoot
$webRoot = Join-Path $projectRoot "ASK.Transport.Web"

# Auto-check and install frontend dependencies if node_modules is missing
$nodeModulesPath = Join-Path $webRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "`n[!] node_modules not found in ASK.Transport.Web." -ForegroundColor Yellow
    Write-Host "[*] Automatically running 'npm install' (this only happens once)..." -ForegroundColor Cyan
    Push-Location $webRoot
    npm install
    Pop-Location
    Write-Host "[+] Dependencies installed successfully!`n" -ForegroundColor Green
}

# 1. Start Backend API in a new PowerShell window
Write-Host "[1/2] Starting ASP.NET Core Web API (Port: 5208)..." -ForegroundColor Yellow
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
