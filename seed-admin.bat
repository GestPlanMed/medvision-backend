@echo off
REM Script para criar admin manualmente no Windows
REM Uso: seed-admin.bat

echo 🌱 Criando admin no banco de dados...

REM Verificar se está usando Docker
docker compose ps | findstr "app" >nul 2>&1
if %errorlevel% == 0 (
    echo 🐳 Executando no container Docker...
    docker compose exec app pnpm tsx scripts/seed-admin.ts
) else (
    echo 💻 Executando localmente...
    pnpm tsx scripts/seed-admin.ts
)

echo ✅ Processo concluído!
pause
