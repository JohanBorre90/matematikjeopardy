@echo off
echo Starter Matematik Jeopardy server...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo FEJL: Node.js er ikke installeret.
    echo Hent det gratis fra: https://nodejs.org
    pause
    exit /b
)

if not exist node_modules (
    echo Installerer pakker (kun forste gang)...
    npm install
    echo.
)

node server.js
pause
