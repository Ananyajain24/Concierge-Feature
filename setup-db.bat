@echo off
REM Create the lohono database
REM This script assumes PostgreSQL is installed in the default location

setlocal enabledelayedexpansion

REM Try common PostgreSQL installation paths
set "PSQL_PATH="
for %%i in (
  "C:\Program Files\PostgreSQL\16\bin\psql.exe"
  "C:\Program Files\PostgreSQL\15\bin\psql.exe"
  "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe"
  "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
) do (
  if exist %%i (
    set "PSQL_PATH=%%i"
    goto :found
  )
)

:notfound
echo ❌ PostgreSQL not found in common paths
echo.
echo Please do one of the following:
echo 1. Open pgAdmin and create a database named "lohono"
echo 2. Or add PostgreSQL bin folder to your Windows PATH environment variable
echo 3. Or run this command manually in PowerShell:
echo.
echo    psql -U postgres -c "CREATE DATABASE lohono;"
echo.
pause
exit /b 1

:found
echo 🔗 Found PostgreSQL at: !PSQL_PATH!
echo 📁 Creating database 'lohono'...
echo.

!PSQL_PATH! -U postgres -c "CREATE DATABASE lohono;" 2>nul
if !errorlevel! equ 0 (
  echo ✅ Database created successfully!
  echo.
  echo 🚀 Now run: pnpm db:push
) else (
  echo ⚠️  Database may already exist or error occurred
  echo 🚀 Try running: pnpm db:push
)
pause
