# Start WhizWizard Backend Server
Write-Host "`n🚀 Starting WhizWizard Backend Server..." -ForegroundColor Cyan

# Kill any existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 1

# Start the backend
&"C:\Program Files\nodejs\node.exe" "server\server.js"
