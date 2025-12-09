@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo.
echo ============================================
echo   웹 서버 시작 중...
echo ============================================
echo.

python server.py

pause
