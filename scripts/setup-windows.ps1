# SAGC - Preparación inteligente de herramientas de desarrollo en Windows
# Supabase/PostgreSQL es remoto; no instala MySQL ni Workbench.

$ErrorActionPreference = "Stop"

function Test-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-WingetPackage($Id) {
  try {
    $output = winget list --id $Id --exact --accept-source-agreements 2>$null | Out-String
    return $output -match [regex]::Escape($Id)
  }
  catch {
    return $false
  }
}

if (-not (Test-Command "winget")) {
  Write-Error "winget no está disponible. Instala o actualiza App Installer desde Microsoft Store."
  exit 1
}

$packages = @(
  @{
    Id = "Git.Git"
    Name = "Git"
    Check = { (Test-Command "git") -or (Test-WingetPackage "Git.Git") }
  },
  @{
    Id = "OpenJS.NodeJS.LTS"
    Name = "Node.js LTS"
    Check = { (Test-Command "node") -or (Test-WingetPackage "OpenJS.NodeJS.LTS") }
  },
  @{
    Id = "Microsoft.VisualStudioCode"
    Name = "Visual Studio Code"
    Check = { (Test-Command "code") -or (Test-WingetPackage "Microsoft.VisualStudioCode") }
  }
)

$installedNow = 0
$skipped = 0
$failed = 0

Write-Host ""
Write-Host "=== SAGC · Verificación e instalación ===" -ForegroundColor Cyan
Write-Host "Base de datos: Supabase + PostgreSQL (remoto)" -ForegroundColor Cyan
Write-Host ""

foreach ($package in $packages) {
  Write-Host "Comprobando $($package.Name)..." -ForegroundColor Gray
  $isInstalled = & $package.Check

  if ($isInstalled) {
    Write-Host "  [OK] Ya está instalado. Se omite." -ForegroundColor Green
    $skipped++
    continue
  }

  Write-Host "  [--] No está instalado. Instalando..." -ForegroundColor Yellow
  winget install --id $package.Id --exact --accept-package-agreements --accept-source-agreements --silent
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0 -or (& $package.Check)) {
    Write-Host "  [OK] Instalado correctamente." -ForegroundColor Green
    $installedNow++
  }
  else {
    Write-Host "  [ERROR] Falló la instalación de $($package.Name)." -ForegroundColor Red
    $failed++
  }

  Write-Host ""
}

Write-Host ""
Write-Host "========== RESUMEN ==========" -ForegroundColor Cyan
Write-Host "Omitidos porque ya existían: $skipped" -ForegroundColor Green
Write-Host "Instalados ahora:            $installedNow" -ForegroundColor Green
if ($failed -gt 0) {
  Write-Host "Fallos:                      $failed" -ForegroundColor Red
} else {
  Write-Host "Fallos:                      0" -ForegroundColor Green
}
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) { exit 1 }

Write-Host "Supabase no requiere instalar un servidor de base de datos local." -ForegroundColor Cyan
Write-Host "Después ejecuta dentro del repositorio:" -ForegroundColor Cyan
Write-Host "  npm run setup:project"
Write-Host "Luego configura SUPABASE_URL y SUPABASE_SECRET_KEY en server/.env."
Write-Host ""
