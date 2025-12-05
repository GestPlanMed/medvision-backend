# 🚀 Deploy MedVision Backend - VPS Hostinger

## Pré-requisitos no VPS

1. **Docker e Docker Compose instalados**
2. **Git instalado**
3. **Portas liberadas**: 3000 (API) e 5432 (PostgreSQL - opcional expor)

## 📋 Passo a Passo

### 1. Conectar no VPS via SSH

```bash
ssh usuario@seu-vps-ip
```

### 2. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/medvision-backend.git
cd medvision-backend
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
nano .env
```

**IMPORTANTE**: Configure valores seguros para produção:

```env
# Database Configuration
DATABASE_URL=postgresql://medvision_user:SENHA_FORTE_AQUI@postgres:5432/medvision_prod

# PostgreSQL
POSTGRES_USER=medvision_user
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
POSTGRES_DB=medvision_prod

# API Configuration
API_VERSION=1
PORT=3000
NODE_ENV=production

# Security Secrets - GERE SENHAS FORTES!
JWT_SECRET=USE_UM_HASH_ALEATORIO_FORTE_AQUI
COOKIE_SECRET=USE_OUTRO_HASH_ALEATORIO_FORTE_AQUI

# Daily.co (se usar videochamadas)
DAILY_CO_API_KEY=sua-chave-daily-co

# Database Port (opcional expor externamente)
DB_PORT=5432
```

**💡 Dica**: Gere senhas fortes com:
```bash
openssl rand -base64 32
```

### 4. Construir e Subir os Containers

```bash
docker-compose up -d --build
```

### 5. Executar Migrações do Banco

```bash
docker-compose exec app pnpm run db:migrate
```

### 6. Verificar se Está Funcionando

```bash
# Ver logs
docker-compose logs -f app

# Verificar containers rodando
docker-compose ps
```

Acesse: `http://SEU_IP:3000/v1/docs`

## 🔧 Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose logs -f
```

### Reiniciar serviços
```bash
docker-compose restart
```

### Parar serviços
```bash
docker-compose down
```

### Parar e remover volumes (cuidado: apaga banco!)
```bash
docker-compose down -v
```

### Atualizar aplicação
```bash
git pull
docker-compose up -d --build
docker-compose exec app pnpm run db:migrate
```

### Entrar no container
```bash
docker-compose exec app sh
```

### Backup do banco
```bash
docker-compose exec postgres pg_dump -U medvision_user medvision_prod > backup.sql
```

### Restaurar backup
```bash
cat backup.sql | docker-compose exec -T postgres psql -U medvision_user medvision_prod
```

## 🔒 Configuração de Firewall (UFW)

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir API
sudo ufw allow 3000/tcp

# NÃO exponha a porta do PostgreSQL publicamente
# sudo ufw allow 5432/tcp  # ❌ NÃO FAÇA ISSO

# Ativar firewall
sudo ufw enable
```

## 🌐 Configurar Domínio (Opcional)

### Com Nginx Reverse Proxy

1. **Instalar Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

2. **Criar configuração:**
```bash
sudo nano /etc/nginx/sites-available/medvision
```

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
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
```

3. **Ativar site:**
```bash
sudo ln -s /etc/nginx/sites-available/medvision /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Configurar SSL com Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

Depois, atualize o `CORS` no `src/server.ts` para incluir seu domínio.

## 📊 Monitoramento

### Ver uso de recursos
```bash
docker stats
```

### Ver espaço em disco
```bash
df -h
docker system df
```

### Limpar imagens antigas
```bash
docker system prune -a
```

## ⚠️ Checklist de Segurança

- [ ] Senhas fortes para JWT_SECRET e COOKIE_SECRET
- [ ] Senha forte para PostgreSQL
- [ ] Firewall configurado (UFW)
- [ ] PostgreSQL NÃO exposto publicamente
- [ ] Variáveis de ambiente em `.env` (não commitadas no Git)
- [ ] SSL/HTTPS configurado (se usando domínio)
- [ ] CORS configurado com domínios permitidos
- [ ] Backups automáticos do banco configurados
- [ ] NODE_ENV=production
- [ ] Logs sendo monitorados

## 🔄 Auto-restart em Caso de Reboot

Os containers têm `restart: unless-stopped` configurado no docker-compose, então reiniciarão automaticamente.

Para garantir que o Docker inicie com o sistema:

```bash
sudo systemctl enable docker
```

## 📝 Notas Importantes

1. **Não exponha a porta 5432** do PostgreSQL publicamente por segurança
2. **Faça backups regulares** do banco de dados
3. **Monitore os logs** regularmente
4. **Atualize as dependências** periodicamente
5. **Use HTTPS em produção** (configure Nginx + Let's Encrypt)

## 🆘 Troubleshooting

### Container não inicia
```bash
docker-compose logs app
docker-compose logs postgres
```

### Erro de conexão com banco
- Verifique se o container do Postgres está rodando: `docker-compose ps`
- Verifique a string de conexão no `.env`
- Verifique os logs: `docker-compose logs postgres`

### Porta já em uso
```bash
sudo lsof -i :3000
# ou
sudo netstat -tulpn | grep 3000
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec app pnpm run db:migrate
```

## 📞 Suporte

Para mais informações, consulte a documentação oficial:
- [Docker Compose](https://docs.docker.com/compose/)
- [Prisma](https://www.prisma.io/docs/)
- [Fastify](https://www.fastify.io/)
