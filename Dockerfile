# ---- Etapa de build ----
FROM node:22-slim AS builder
WORKDIR /app

# Prisma necesita OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instala dependencias con el lockfile de npm (reproducible)
COPY package.json package-lock.json ./
RUN npm ci

# Genera el cliente de Prisma y compila la app
COPY . .
RUN npx prisma generate && npm run build

# ---- Etapa de ejecución ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia lo ya construido desde la etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Carpeta para imágenes subidas (se monta como volumen en docker-compose)
RUN mkdir -p uploads

EXPOSE 3000

# Al arrancar: aplica migraciones pendientes y levanta la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
