# ResQZone Reset Demo (PowerShell)
$ErrorActionPreference = "Stop"
Write-Host "=== ResQZone: Resetting Demo Environment ===" -ForegroundColor Cyan
if (Test-Path "resqzone.db") {
    Remove-Item "resqzone.db" -Force
}
$env:PYTHONPATH = "."
python -m backend.app.db.seed
Write-Host "=== Reset Complete ===" -ForegroundColor Green
