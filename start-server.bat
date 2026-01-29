@echo off
echo Starting local server for Doomsday Project...
echo.
echo If you have Node.js installed, we will use 'serve'.
echo If not, we will try Python.
echo.

where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo Using npx serve...
    npx serve .
    pause
    goto :eof
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Using Python http.server...
    echo Open http://localhost:8000 in your browser.
    python -m http.server 8000
    pause
    goto :eof
)

echo.
echo Error: Neither Node.js (npx) nor Python was found.
echo Please install Node.js or Python to run this server and load the 3D model.
pause
