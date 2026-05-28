@echo off
setlocal
cd /d "%~dp0"

echo Iniciando Nexa en http://localhost:3000
echo Este wrapper usa npm.cmd para evitar el bloqueo de npm.ps1 en PowerShell.
echo Si ves un error de puerto ocupado, cierra la instancia anterior antes de reintentar.
echo.

call npm.cmd run dev
