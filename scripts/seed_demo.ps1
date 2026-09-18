# ResQZone Demo Seeding (PowerShell)
$ErrorActionPreference = "Stop"
Write-Host "=== ResQZone: Seeding Demo Data ===" -ForegroundColor Cyan
$env:PYTHONPATH = "."
python -m backend.app.db.seed
Write-Host "=== Seeding Complete ===" -ForegroundColor Green
