#!/bin/bash

# Script simplificado para configurar SSL usando webroot
# Uso: ./setup-ssl-simple.sh seu-dominio.com

set -e

if [ -z "$1" ]; then
    echo "❌ Erro: Você precisa fornecer um domínio"
    echo "Uso: ./setup-ssl-simple.sh seu-dominio.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@$DOMAIN}

echo "🔐 Configurando SSL para $DOMAIN"
echo "📧 Email de contato: $EMAIL"

# Criar diretórios necessários
mkdir -p certbot/conf certbot/www

# Atualizar nginx.conf para servir webroot
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://app:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "🔄 Reiniciando nginx..."
docker compose restart nginx

echo "📜 Obtendo certificado SSL..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Certificado obtido com sucesso!"
    
    # Atualizar nginx.conf com SSL
    cat > nginx.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\\\$host\\\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://app:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

    echo "🔄 Reiniciando nginx com SSL..."
    docker compose restart nginx
    
    echo ""
    echo "✅ Pronto! Sua API está acessível em:"
    echo "   https://$DOMAIN"
    echo "   https://$DOMAIN/v1/docs"
else
    echo "❌ Erro ao obter certificado SSL"
    exit 1
fi
