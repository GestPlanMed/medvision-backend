#!/bin/bash

# Script de Health Check - MedVision Backend
# Verifica se a API está funcionando corretamente

set -e

API_URL="${API_URL:-https://medvision.njsolutions.com.br}"
FRONTEND_URL="${FRONTEND_URL:-https://medvision-frontend.vercel.app}"

echo "🏥 MedVision Backend Health Check"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função de verificação
check() {
    local name=$1
    local command=$2
    
    echo -n "Verificando $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# 1. Verificar se API responde
echo -e "${YELLOW}1. Conectividade${NC}"
check "API online" "curl -f -s -o /dev/null ${API_URL}/v1/docs"

# 2. Verificar containers Docker (se no servidor)
if command -v docker &> /dev/null; then
    echo ""
    echo -e "${YELLOW}2. Containers Docker${NC}"
    check "Container API rodando" "docker ps | grep medvision-api"
    check "Container Postgres rodando" "docker ps | grep medvision-postgres"
fi

# 3. Verificar logs para erros críticos (se no servidor)
if command -v docker &> /dev/null; then
    echo ""
    echo -e "${YELLOW}3. Logs recentes${NC}"
    echo "Últimos erros (se houver):"
    docker logs medvision-api --tail 20 2>&1 | grep -i "error\|critical\|fatal" || echo "Nenhum erro crítico encontrado"
fi

# 4. Testar endpoint de signin
echo ""
echo -e "${YELLOW}4. Teste de Cookies${NC}"
echo "Testando signin com cookies..."

RESPONSE=$(curl -s -i -X POST "${API_URL}/v1/admin/auth/signin" \
  -H "Content-Type: application/json" \
  -H "Origin: ${FRONTEND_URL}" \
  -d '{"email":"test@test.com","password":"test"}')

if echo "$RESPONSE" | grep -qi "set-cookie"; then
    echo -e "${GREEN}✓${NC} Cookie Set-Cookie presente na resposta"
    echo "$RESPONSE" | grep -i "set-cookie"
else
    echo -e "${RED}✗${NC} Cookie Set-Cookie NÃO encontrado na resposta"
fi

# 5. Verificar headers CORS
echo ""
echo -e "${YELLOW}5. Headers CORS${NC}"
CORS_RESPONSE=$(curl -s -i -X OPTIONS "${API_URL}/v1/admin/auth/signin" \
  -H "Origin: ${FRONTEND_URL}" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✓${NC} CORS configurado corretamente"
else
    echo -e "${RED}✗${NC} CORS pode estar com problema"
fi

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-credentials.*true"; then
    echo -e "${GREEN}✓${NC} Credentials habilitado"
else
    echo -e "${RED}✗${NC} Credentials pode estar desabilitado"
fi

echo ""
echo "=================================="
echo "Health check completo!"
