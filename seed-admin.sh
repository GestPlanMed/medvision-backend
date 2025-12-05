#!/bin/bash

# Script para criar admin manualmente
# Uso: ./seed-admin.sh

set -e

echo "🌱 Criando admin no banco de dados..."

# Verificar se está usando Docker
if docker compose ps | grep -q "app"; then
    echo "🐳 Executando no container Docker..."
    docker compose exec app pnpm tsx scripts/seed-admin.ts
else
    echo "💻 Executando localmente..."
    pnpm tsx scripts/seed-admin.ts
fi

echo "✅ Processo concluído!"
