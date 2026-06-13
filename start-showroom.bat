@echo off
title Showroom Catalog Dev Server
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies. This can take a few minutes the first time.
  npm install
)
echo Starting showroom catalog at http://localhost:5173/display
start "" "http://localhost:5173/display"
npm run dev
pause
