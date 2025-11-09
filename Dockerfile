FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependency
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install

# Copiar código-fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["pnpm", "run", "dev"]
