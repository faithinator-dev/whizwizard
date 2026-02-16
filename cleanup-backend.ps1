# WhizWizard - Backend Cleanup Script
# This script removes all backend-related files after Firebase migration

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  WhizWizard Backend Cleanup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$backendFiles = @(
    "server",
    "node_modules",
    "package-lock.json",
    ".env",
    "start-backend.ps1",
    "setup-backend.ps1",
    "src/js/api.js",
    "src/js/database.js"
)

Write-Host "This script will delete the following files/folders:" -ForegroundColor Yellow
foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "  - $file" -ForegroundColor Red
    } else {
        Write-Host "  - $file (already deleted)" -ForegroundColor Gray
    }
}
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (yes/no)"

if ($confirmation -eq "yes") {
    Write-Host ""
    Write-Host "Cleaning up backend files..." -ForegroundColor Yellow
    
    foreach ($file in $backendFiles) {
        if (Test-Path $file) {
            Remove-Item -Path $file -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Deleted: $file" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  Cleanup Complete! ✓" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your app now runs on Firebase only!" -ForegroundColor Green
    Write-Host "See HOW_TO_RUN.md for instructions." -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    Write-Host ""
}

Pause
