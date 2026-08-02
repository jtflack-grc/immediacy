# Deploy the Interdependency live-search API to Fly.io
# Prerequisites:
#   1. .\ .tools\flyctl\flyctl.exe auth login   (or set $env:FLY_API_TOKEN)
#   2. From repo root: .\scripts\deploy-api.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$fly = Join-Path $root ".tools\flyctl\flyctl.exe"
if (-not (Test-Path $fly)) {
  Write-Error "flyctl not found at $fly — download portable flyctl into .tools/flyctl first."
}

Write-Host "Whoami:" -ForegroundColor Cyan
& $fly auth whoami

Write-Host "Ensuring app exists..." -ForegroundColor Cyan
& $fly apps list | Out-String | Write-Host
$apps = & $fly apps list --json 2>$null | ConvertFrom-Json
if (-not ($apps | Where-Object { $_.Name -eq "interdependency-api" })) {
  & $fly apps create interdependency-api --org personal 2>$null
  if ($LASTEXITCODE -ne 0) {
    & $fly apps create interdependency-api
  }
}

Write-Host "Setting secrets..." -ForegroundColor Cyan
& $fly secrets set `
  "CORS_ORIGINS=https://jtflack-grc.github.io,http://localhost:5275,http://127.0.0.1:5275" `
  "SEC_USER_AGENT=Interdependency Educational TPRM jtflack-grc@users.noreply.github.com" `
  --app interdependency-api

Write-Host "Deploying..." -ForegroundColor Cyan
& $fly deploy --remote-only --ha=false --app interdependency-api

Write-Host "Health check:" -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
  Invoke-RestMethod "https://interdependency-api.fly.dev/health" | ConvertTo-Json -Compress
} catch {
  Write-Warning "Health check failed yet — DNS/start may still be warming: $_"
}

Write-Host "Done. Live search URL: https://interdependency-api.fly.dev" -ForegroundColor Green
