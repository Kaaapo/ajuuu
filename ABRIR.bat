@echo off
echo ========================================
echo   ME VALE V - Tito Double P
echo   Abriendo la landing...
echo ========================================
echo.
start http://localhost:8080
python -m http.server 8080
pause
