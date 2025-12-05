# Seed Admin - Variáveis de Configuração

Este script cria um admin inicial no banco de dados durante o deploy.

## Variáveis de Ambiente

Adicione estas variáveis no seu arquivo `.env` para configurar o admin inicial:

```bash
# Admin inicial (usado no seed)
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@medvision.com"
ADMIN_PASSWORD="Admin@123456"
```

## Como Usar

### 1. Durante o Deploy Automático

O script `deploy.sh` já executa automaticamente o seed do admin:

```bash
./deploy.sh
```

### 2. Executar Manualmente

Se precisar criar o admin manualmente após o deploy:

```bash
# No container Docker
docker compose exec app pnpm tsx scripts/seed-admin.ts

# Localmente (desenvolvimento)
pnpm tsx scripts/seed-admin.ts
```

## Funcionalidades

- ✅ Verifica se o admin já existe antes de criar
- ✅ Usa variáveis de ambiente para configuração
- ✅ Aplica hash na senha automaticamente
- ✅ Valores padrão caso as variáveis não estejam definidas

## Valores Padrão

Se as variáveis não forem definidas, o script usa:

- **Nome:** Administrador
- **Email:** admin@medvision.com
- **Senha:** Admin@123456

## Segurança

⚠️ **IMPORTANTE:**

1. **Altere a senha padrão imediatamente após o primeiro login**
2. Use senhas fortes em produção
3. Nunca commite o arquivo `.env` com credenciais reais
4. Considere usar um gerenciador de senhas

## Exemplos de Senhas Fortes

```bash
ADMIN_PASSWORD="Mv$2024!Secure#Pass"
ADMIN_PASSWORD="P@ssw0rd!MedV1si0n#2024"
```

## Troubleshooting

### Admin já existe

Se você ver a mensagem:
```
⚠️  Admin com email admin@medvision.com já existe. Pulando seed...
```

O admin já foi criado anteriormente. Se precisar resetar:

1. Conecte ao banco de dados
2. Delete o admin existente:
   ```sql
   DELETE FROM admins WHERE email = 'admin@medvision.com';
   ```
3. Execute o seed novamente

### Erro de conexão com o banco

Certifique-se de que:
- O banco de dados está rodando
- A variável `DATABASE_URL` está correta no `.env`
- As migrations foram executadas

```bash
docker compose exec app pnpm prisma migrate deploy
```
