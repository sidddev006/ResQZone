# ResQZone One-Command Full Stack Launcher (Windows PowerShell)
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "   RESQZONE — Intelligent Hazard Red Zone & Relocation    " -ForegroundColor Cyan
Write-Host "          Smart India Hackathon 2026 - SIH26191           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow

$env:PYTHONPATH = "."
if (-not (Test-Path "resqzone.db")) {
    Write-Host "Database not found. Initializing and seeding demo data..." -ForegroundColor Yellow
    python -m backend.app.db.seed
}

Write-Host "`nStarting Backend FastAPI Server (http://localhost:8000)..." -ForegroundColor Green
$backendProcess = Start-Process python -ArgumentList "-m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000" -PassThru

Write-Host "Starting Frontend Vite Server (http://localhost:5173)..." -ForegroundColor Green
$frontendProcess = Start-Process cmd.exe -ArgumentList "/c cd frontend && npm run dev" -PassThru

Write-Host "`nResQZone is running!" -ForegroundColor Cyan
Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Frontend Portal:  http://localhost:5173" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C or close this terminal to stop services." -ForegroundColor White

try {
    while ($true) {
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "Stopping ResQZone background processes..." -ForegroundColor Red
    Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
}
