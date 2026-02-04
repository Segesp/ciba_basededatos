@echo off
REM EventHub - Batch para iniciar el sistema
REM Este archivo inicia el servidor automáticamente

echo.
echo ========================================
echo   EventHub - Sistema de Gestión de Eventos
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detectado
echo.

REM Navegar al directorio
cd /d "%~dp0"

REM Verificar si existe package.json
if not exist package.json (
    echo [ERROR] package.json no encontrado
    echo Por favor ejecuta este script en el directorio raíz del proyecto
    pause
    exit /b 1
)

echo [OK] Proyecto encontrado
echo.

REM Instalar dependencias si no existen node_modules
if not exist node_modules (
    echo [INSTALAR] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo [OK] Dependencias listas
echo.

REM Iniciar el servidor
echo [INICIAR] Arrancando servidor...
echo.
echo ========================================
echo   Servidor ejecutándose en:
echo   http://localhost:5000
echo.
echo   Abre tu navegador y accede a la URL
echo   Presiona Ctrl+C para detener
echo ========================================
echo.

call npm start

pause
