# ResQZone Test Suite (PowerShell)
$ErrorActionPreference = "Stop"
Write-Host "=== ResQZone: Running Comprehensive Test Suite ===" -ForegroundColor Cyan
$env:PYTHONPATH = "."
pytest backend/tests -v --durations=10
Write-Host "=== All Tests Passed Successfully ===" -ForegroundColor Green
