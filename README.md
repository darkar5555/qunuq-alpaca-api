# Qunuq Alpaca — API (NestJS + Prisma + PostgreSQL)

API REST del ERP de Qunuq Alpaca. Centraliza lógica de negocio, autenticación y
acceso a datos. Ver el plan general en [`../PLAN-ERP.md`](../PLAN-ERP.md).

## Requisitos

- Node.js 20.19+ (o 22+)
- PostgreSQL 14+ corriendo localmente (o una cadena `DATABASE_URL` accesible)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear tu .env a partir del ejemplo y ajustar DATABASE_URL / CORS_ORIGIN
cp .env.example .env

# 3. Generar el cliente de Prisma
npm run prisma:generate

# 4. Crear las tablas en la base de datos (primera migración)
npm run prisma:migrate -- --name init

# 5. Levantar la API en modo desarrollo (con recarga)
npm run start:dev
```

La API queda en `http://localhost:3000`. Prueba el health check:

```bash
curl http://localhost:3000/health
# { "status": "ok", "service": "qunuq-alpaca-api", "timestamp": "..." }
```

> Si aún no tienes PostgreSQL, los pasos 1–3 y el `build` funcionan igual; solo
> los pasos 4–5 (y los endpoints que consultan datos) necesitan la base levantada.

## Estructura

```
api/
  prisma/
    schema.prisma        Modelo de datos (entidades de PLAN-ERP.md)
  src/
    main.ts              Bootstrap + CORS + validación global
    app.module.ts        Módulo raíz (registra todos los dominios)
    prisma/              PrismaService + PrismaModule (global)
    health/              GET /health
    usuarios/            Acceso al ERP (Fase 1)
    clientes/            Gestión de clientes (Fase 1)
    productos/           Catálogo de productos (Fase 1)
    catalogos/           Fibra / Color / Técnica (Fase 1)
    pedidos/             Pedidos y su detalle (Fase 1)
    comprobantes/        Facturación electrónica (Fase 2)
    pagos/               Pagos y cobranzas (Fase 4)
    insumos/             Inventario (Fase 3)
  .env.example           Plantilla de variables de entorno
```

Cada dominio es un módulo NestJS independiente (controller + service). Los módulos
de Fases 2–4 quedan como esqueleto de solo lectura para ir completándolos por fase.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | API con recarga en caliente |
| `npm run start` | API una sola vez |
| `npm run build` | Compila a `dist/` |
| `npm run prisma:generate` | Genera el cliente tipado de Prisma |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run prisma:studio` | Explorador visual de la base de datos |

## Endpoints actuales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la API |
| GET | `/usuarios` | Lista de usuarios (sin password) |
| GET | `/clientes` | Lista de clientes |
| GET | `/productos` | Catálogo de productos |
| GET | `/catalogos/fibras` · `/colores` · `/tecnicas` | Catálogos del configurador |
| GET | `/pedidos` | Pedidos con cliente e ítems |
| GET | `/comprobantes` · `/pagos` · `/insumos` | Lectura base (fases siguientes) |
