@echo off
title Superior 460A Catalog - Production Server
cd /d "D:\Codex\Superior_460A_Catalog"

echo Building Superior 460A Catalog...
call npm run build

echo.
echo Starting production server...
node serve-dist.cjs

pause