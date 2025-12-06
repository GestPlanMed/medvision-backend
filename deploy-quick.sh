#!/bin/bash

# Script de deploy rápido para produção

echo "🚀 Iniciando deploy rápido..."

# Commit e push das alterações
echo "📝 Commitando alterações..."
git add .
git commit -m "fix: configurar CORS e tornar email service opcional"
git push origin main

echo "✅ Alterações enviadas para o repositório!"
echo ""
echo "⚠️  Agora execute no servidor:"
echo "cd /opt/medvision-backend"
echo "git pull"
echo "docker-compose down"
echo "docker-compose up -d --build"
