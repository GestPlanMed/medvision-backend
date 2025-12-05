# 🚀 Deploy MedVision Backend com Admin Automático

Este guia mostra como fazer o deploy da aplicação e criar automaticamente um usuário admin no banco de produção.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Arquivo `.env` configurado
- Acesso ao servidor VPS (se aplicável)

## 🔧 Configuração do Admin

Antes do deploy, configure as credenciais do admin no arquivo `.env`:

```bash
# Admin inicial (usado no seed)
ADMIN_NAME="Seu Nome"
ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="SuaSenhaForte@123"
```

⚠️ **IMPORTANTE:** Use uma senha forte em produção!

## 🚀 Deploy Completo (Automático)

O script `deploy.sh` faz tudo automaticamente:

```bash
chmod +x deploy.sh
./deploy.sh
```

Este script irá:
1. ✅ Verificar dependências (Docker, Docker Compose)
2. ✅ Puxar últimas mudanças do Git (se aplicável)
3. ✅ Parar containers existentes
4. ✅ Construir e subir novos containers
5. ✅ Executar migrations do banco
6. ✅ **Criar admin automaticamente**
7. ✅ Exibir status dos containers

## 🔑 Criar Admin Manualmente

Se precisar criar o admin depois do deploy:

### Opção 1: Usando npm script (recomendado)

```bash
# No container Docker
docker compose exec app pnpm db:seed:admin

# Localmente
pnpm db:seed:admin
```

### Opção 2: Usando script shell

**Linux/Mac:**
```bash
chmod +x seed-admin.sh
./seed-admin.sh
```

**Windows:**
```cmd
seed-admin.bat
```

### Opção 3: Comando direto

```bash
docker compose exec app pnpm tsx scripts/seed-admin.ts
```

## 📊 Verificar Admin Criado

Após o seed, você verá uma mensagem como:

```
✅ Admin criado com sucesso!
📧 Email: admin@medvision.com
🔑 Senha: Admin@123456
⚠️  IMPORTANTE: Altere a senha após o primeiro login!
👤 ID: uuid-do-admin
```

## 🔐 Segurança

### ✅ Boas Práticas

1. **Altere a senha padrão imediatamente** após o primeiro login
2. Use senhas fortes com:
   - Mínimo 8 caracteres
   - Letras maiúsculas e minúsculas
   - Números
   - Caracteres especiais
3. Nunca compartilhe credenciais em texto plano
4. Use gerenciador de senhas

### ❌ Nunca Faça

- ❌ Usar senhas simples em produção
- ❌ Commitar o arquivo `.env` com credenciais reais
- ❌ Compartilhar credenciais por email ou chat
- ❌ Usar a mesma senha em múltiplos ambientes

## 🔍 Troubleshooting

### Admin já existe

Se você ver:
```
⚠️  Admin com email admin@medvision.com já existe. Pulando seed...
```

O admin já foi criado. Para resetar:

```bash
# Conectar ao banco
docker compose exec postgres psql -U medvision -d medvision

# Deletar admin
DELETE FROM admins WHERE email = 'admin@medvision.com';
```

### Erro de conexão com banco

```bash
# Verificar se o banco está rodando
docker compose ps

# Ver logs do banco
docker compose logs postgres

# Executar migrations
docker compose exec app pnpm db:migrate
```

### Erro "pnpm tsx not found"

```bash
# Instalar dependências
docker compose exec app pnpm install
```

## 📚 Recursos Adicionais

- [Documentação Completa do Seed](./scripts/SEED_ADMIN_README.md)
- [Configuração de Variáveis de Ambiente](./.env.example)

## 🆘 Comandos Úteis

```bash
# Ver logs da aplicação
docker compose logs -f app

# Ver logs do banco
docker compose logs -f postgres

# Parar aplicação
docker compose down

# Reiniciar aplicação
docker compose restart

# Acessar shell do container
docker compose exec app sh

# Acessar Prisma Studio
docker compose exec app pnpm db:studio
```

## 🌐 Endpoints

Após o deploy:

- **API:** http://localhost:3000
- **Documentação:** http://localhost:3000/v1/docs
- **Health Check:** http://localhost:3000/health

## 📝 Primeiro Login

1. Acesse o frontend da aplicação
2. Faça login com as credenciais do admin criado
3. **Altere a senha imediatamente**
4. Configure autenticação de dois fatores (2FA) se disponível

## 🎯 Próximos Passos

1. ✅ Deploy concluído
2. ✅ Admin criado
3. ⏭️ Fazer primeiro login
4. ⏭️ Alterar senha
5. ⏭️ Configurar 2FA
6. ⏭️ Criar outros usuários conforme necessário

---

💡 **Dica:** Mantenha suas credenciais em um gerenciador de senhas seguro!
