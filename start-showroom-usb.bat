@echo off
title Showroom Catalog USB Server
cd /d "%~dp0"
echo Serving built showroom catalog at http://localhost:4173/display
node serve-dist.cjs
pause
