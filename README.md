# Raices Puntanas
[![CI](https://github.com/NicolasRaffonaudDev/RaicesPuntanas/actions/workflows/ci.yml/badge.svg)](https://github.com/NicolasRaffonaudDev/RaicesPuntanas/actions/workflows/ci.yml)

Aplicacion full stack para gestion comercial de lotes, clientes y operaciones.

## Identidad de producto (cliente)
- Nombre comercial: `Raices Puntanas`.
- Paleta oficial:
  - Dorado: `#FFD700`
  - Negro: `#000000`
  - Blanco: `#FFFFFF`
- Regla de UI: fondo oscuro + acentos dorados + texto claro para legibilidad.

## Objetivo operativo
- Entregar una web usable por rol (`admin`, `empleado`, `usuario`) con flujos reales de venta/consulta.
- Mantener consistencia visual y de marca en cada pantalla nueva.
- Priorizar confiabilidad: pruebas smoke + E2E + CI.

## Documentacion de aprendizaje (mentoria)
- Guia tecnica completa: `docs/MENTORIA_TECNICA.md`
- Bitacora incremental de cambios: `docs/BITACORA_DESARROLLO.md`

## Stack actual
- Frontend: React + TypeScript + Vite.
- Backend: Node.js + Express por capas (`routes`, `controllers`, `services`, `repositories`).
- Base de datos: PostgreSQL con Prisma ORM.
- Seguridad: JWT por roles, Helmet, Rate limit, validacion con Zod.
- Tiempo real: Socket.io para eventos de auditoria.
- Observabilidad: Web Vitals (frontend) con ingesta en `POST /api/telemetry/web-vitals`.

## Arquitectura actual del proyecto
### Frontend
- React
- TypeScript
- Vite
- Workspace SaaS con sidebar por roles

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma

### Auth
- JWT access token corto
- Refresh token rotativo
- Interceptor de requests en frontend
- Retry automatico tras `401`
- Validacion de sesion al iniciar la app

### UI System
- Sidebar por roles
- `AuthenticatedLayout` con workspace compartido
- `PageHeader` reusable para modulos internos
- Feedback components:
  - `SectionLoading`
  - `SectionError`
  - `SectionEmpty`

### Modulos actuales
- Dashboard
- Lotes
- Consultas
- Gestion comercial
- Panel de usuario
- Configuracion

### Gestion administrativa de lotes
- Alta, edicion y eliminacion de lotes disponibles solo para `admin`.
- `empleado` y `usuario` mantienen acceso de lectura al catalogo.
- Primera version con formulario simple y una unica imagen por URL/path.
- El modelo `Lote` ya soporta `description` opcional.

## Estado actual del proyecto
- Navegacion por roles consolidada en el portal autenticado
- Workspace SaaS con sidebar, area de trabajo comun y layout compartido
- Manejo robusto de sesion con refresh automatico y reintento de requests protegidas
- Base visual premium negro + dorado aplicada a dashboard, sidebar y encabezados internos
- Arquitectura preparada para crecer por modulos sin romper contratos existentes

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

## Variables de entorno
### Frontend
- `VITE_API_URL`: URL del backend.
- `VITE_GOOGLE_MAPS_API_KEY`: API key de Google Maps (requerida para mapa interactivo).

### Backend
- `NODE_ENV`: entorno de ejecucion.
- `PORT`: puerto del servidor.
- `DATABASE_URL`: conexion PostgreSQL.
- `JWT_SECRET`: secreto para firmar JWT.
- `ACCESS_TOKEN_EXPIRES_IN`: expiracion access token.
- `REFRESH_TOKEN_EXPIRES_DAYS`: expiracion refresh token (dias).
- `MAX_LOGIN_ATTEMPTS`: intentos maximos antes de lockout.
- `LOCKOUT_MINUTES`: minutos de bloqueo.
- `FRONTEND_ORIGIN`: origen permitido para CORS.
- `SMTP_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`: configuracion de email.
- `SETUP_ADMIN_KEY`: clave para bootstrap admin.
- `API_BASE_URL`: URL base usada en smoke tests.
- `SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD`, `SMOKE_TEST_PASSWORD`: credenciales para smoke tests.

## Endpoints principales
- `GET /health`
- `GET /api/lotes`
- `POST /api/lotes` (admin)
- `PUT /api/lotes/:id` (admin)
- `DELETE /api/lotes/:id` (admin)
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
- `POST /api/telemetry/web-vitals` (ingesta de metricas de performance frontend)

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
- Frontend con refresh automatico y retry de requests protegidas tras `401`.

## Permisos destacados por rol
- `admin`:
  - acceso total de gestion
  - CRUD de lotes (`lotes.read`, `lotes.write`, `lotes.delete`)
- `empleado`:
  - lectura de lotes y operacion comercial
  - sin modificacion de catalogo de lotes
- `usuario`:
  - lectura publica/comercial de lotes
  - sin acceso a modificacion de catalogo

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

## Guia operativa para el cliente
1. Usuario final:
- Navega `Lotes`, filtra y ordena opciones.
- Usa `Comparar` para seleccionar hasta 3 lotes y abrir `Comparador de Lotes`.
- Desde comparador puede ir a `Consultar este lote` con asunto precompletado.
- Revisa estado/respuestas en `Mi panel`.

2. Empleado:
- Gestiona consultas en `/consultas`.
- Usa plantillas rapidas para respuestas visibles al cliente o notas internas.
- Actualiza estado de consulta (`pendiente`, `en_revision`, `respondida`, `cerrada`).

3. Admin:
- Todo lo de empleado.
- Gestiona usuarios, roles, auditoria y panel comercial completo.
