# Raices Puntanas

Aplicacion full stack para gestion comercial de lotes, clientes y operaciones.

## Stack actual
- Frontend: React + TypeScript + Vite.
- Backend: Node.js + Express por capas (`routes`, `controllers`, `services`, `repositories`).
- Base de datos: PostgreSQL con Prisma ORM.
- Seguridad: JWT por roles, Helmet, Rate limit, validacion con Zod.
- Tiempo real: Socket.io para eventos de auditoria.

## Roles implementados
- `admin`: acceso total (usuarios + auditoria).
- `empleado`: gestion operativa limitada.
- `usuario`: vista basica y operaciones propias.
- Registro publico: crea solo rol `usuario` (sin escalada de privilegios).

## Arranque local (metodico)
1. Levanta PostgreSQL:
   - `docker compose up -d`
2. Configura backend:
   - `cd backend`
   - `Copy-Item .env.example .env`
   - Ajusta `JWT_SECRET` si corresponde.
3. Inicializa esquema y datos:
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init`
   - `npm run db:seed`
4. Inicia backend:
   - `npm run dev`
5. Inicia frontend (desde raiz):
   - `npm install`
   - `npm run dev`

## Endpoints principales
- `GET /health`
- `GET /api/lotes`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all` (JWT)
- `POST /api/auth/password-reset`
- `POST /api/auth/setup-admin` (bootstrap inicial por `SETUP_ADMIN_KEY`)
- `GET /api/dashboard/me` (JWT)
- `GET /api/audit` (admin)
  - filtros: `page`, `limit`, `search`, `action`, `userId`, `from`, `to`
- `GET /api/users` (admin)
- `GET/POST/PUT/DELETE /api/clientes` (admin/empleado, delete admin)
- `GET/POST/PUT/DELETE /api/productos` (admin/empleado, delete admin)
- `GET/POST /api/ventas` (GET todos autenticados, POST admin/empleado)
- `GET/POST /api/inventario/movimientos` (admin/empleado)

## Credenciales seed
- `email`: `admin@raicespuntanas.local`
- `password`: `admin1234`

## Bootstrap admin (si aun no tienes admin)
1. Define `SETUP_ADMIN_KEY` en `backend/.env`.
2. Inicia backend y frontend.
3. Entra a `/setup-admin` y crea tu primer admin con esa clave.

## Seguridad auth (hardening)
- Access token corto (`ACCESS_TOKEN_EXPIRES_IN`, default `15m`).
- Refresh token rotativo con revocacion en base de datos.
- Lockout por intentos fallidos (`MAX_LOGIN_ATTEMPTS`, `LOCKOUT_MINUTES`).
- Rate limit especifico para `/api/auth/login`, `/api/auth/refresh` y `/api/auth/setup-admin`.

## Migraciones nuevas
- `20260220113000_comercial_core` agrega:
  - `Cliente`
  - `Producto`
  - `Venta`
  - `VentaItem`
  - `InventarioMovimiento`

## Ruta de aprendizaje recomendada
1. TypeScript frontend: modelado de tipos de dominio (`AuthUser`, `Lote`, respuestas API).
2. Backend por capas: separar HTTP de reglas de negocio y acceso a datos.
3. Seguridad API: JWT + middlewares + validacion de payload.
4. Base de datos profesional: migraciones y seed reproducibles con Prisma.
5. DevOps inicial: Docker para DB y luego CI/CD con GitHub Actions.
