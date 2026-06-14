@echo off
setlocal

cd /d "%~dp0"

echo Starting showroom catalog...
start "Showroom Catalog Server" cmd /k npm run dev

echo Waiting for the local server...
timeout /t 8 /nobreak >nul

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk http://localhost:4173/display --edge-kiosk-type=fullscreen --no-first-run
) else (
  start "" http://localhost:4173/display
)

endlocal
