@echo off
echo Starting ngrok tunnel for Al-Khatib Software...
echo.
echo Port 8080: Frontend (Vite)
echo Port 3000: Backend (NestJS)
echo.
echo Make sure your local servers are running!
echo.
start ngrok http 8080 --host-header=localhost:8080
start ngrok http 3000 --host-header=localhost:3000
echo.
echo Tunnels started. Check your ngrok dashboard or terminal windows for URLs.
pause
