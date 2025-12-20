@echo off
echo ========================================
echo   Rocket League Bingo - Server Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python gefunden! Starte Server...
    echo.
    echo Server läuft auf: http://localhost:8000
    echo.
    echo Drücke STRG+C zum Beenden
    echo ========================================
    echo.
    python -m http.server 8000
    goto :end
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js gefunden! Starte Server...
    echo.
    echo Server läuft auf: http://localhost:8080
    echo.
    echo Drücke STRG+C zum Beenden
    echo ========================================
    echo.
    npx -y http-server -p 8080
    goto :end
)

REM No server found
echo FEHLER: Weder Python noch Node.js gefunden!
echo.
echo Bitte installiere eines der folgenden:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo Oder öffne einfach die index.html direkt im Browser.
echo.
pause

:end
