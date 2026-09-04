# SAGC - Preparación de herramientas de desarrollo en Windows
# Ejecutar desde PowerShell. winget puede solicitar permisos de administrador.

$ErrorActionPreference = "Stop"

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command "winget")) {
  Write-Error "winget no está disponible. Instala/actualiza App Installer desde Microsoft Store y vuelve a ejecutar este script."
  exit 1
}

$packages = @(
  @{ Id = "Git.Git"; Name = "Git" },
  @{ Id = "OpenJS.NodeJS.LTS"; Name = "Node.js LTS" },
  @{ Id = "Oracle.MySQL"; Name = "MySQL Server / Installer" },
  @{ Id = "Oracle.MySQLWorkbench"; Name = "MySQL Workbench" },
  @{ Id = "Microsoft.VisualStudioCode"; Name = "Visual Studio Code" }
)

Write-Host ""
Write-Host "=== SAGC · Instalación de herramientas ===" -ForegroundColor Cyan

foreach ($package in $packages) {
  Write-Host ""
  Write-Host "Instalando/verificando $($package.Name)..." -ForegroundColor Yellow

  winget install --id $package.Id --exact --accept-package-agreements --accept-source-agreements --silent

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "winget devolvió código $LASTEXITCODE para $($package.Name). Si ya estaba instalado, puede ignorarse; en otro caso, ejecuta: winget search $($package.Id)"
  }
}

Write-Host ""
Write-Host "Herramientas solicitadas." -ForegroundColor Green
Write-Host "Cierra y abre una nueva terminal antes de continuar para refrescar PATH." -ForegroundColor Green
Write-Host ""
Write-Host "Después, dentro del repositorio, ejecuta:" -ForegroundColor Cyan
Write-Host "  npm run setup:project"
Write-Host ""
