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

## Funcionalidades actuales
- Catalogo de lotes con paginacion server-side.
- Filtros por amenities, precio minimo y orden.
- Busqueda por texto con debounce y sincronizacion con URL.
- Comparador de lotes con hasta 3 selecciones.
- Favoritos locales persistidos en navegador (busqueda local + limpieza masiva).

## Como usar favoritos (usuario final)
- En el listado de lotes, presiona el icono de corazon en cada tarjeta.
- Accede a `/favoritos` para ver tus lotes guardados.
- Vuelve a presionar el corazon para quitar un lote de favoritos.
- Usa la busqueda local para filtrar por nombre o ubicacion.
- Si necesitas limpiar todo, utiliza "Limpiar favoritos".

## Comparador de lotes
### Que hace (usuario)
- Permite ver varios lotes en una tabla comparativa.
- Resalta el menor precio y el mayor tamano para tomar decisiones rapidas.
- Desde la vista puedes quitar lotes o limpiar el comparador.

### Como usarlo
- En `Lotes`, activa el comparador (hasta 3 o 4 lotes recomendados).
- Ingresa a `/comparar` para ver la tabla comparativa.
- Usa "Limpiar comparador" si quieres empezar de nuevo.

### Como esta implementado (dev)
- La URL guarda los ids: `/comparar?ids=1,2,3`.
- Se consultan lotes con `getLotesByIds`.
- Se calcula `minPrice` y `maxSize` con `useMemo` para resaltar valores.

## Contacto con propiedades
### Que hace (usuario)
- Permite consultar un lote desde el listado o el comparador.
- Abre un formulario con mensaje prellenado para enviar la consulta.

### Como usarlo
- En cualquier lote, presiona "Consultar".
- Completa tu nombre, email y mensaje.
- Recibiras un aviso de envio correcto cuando la consulta quede registrada.

### Como esta implementado (dev)
- Modal reusable `ContactModal` recibe el lote por prop.
- Validaciones basicas en frontend + backend.
- Se reutiliza en `Lotes` y en `Comparar` con envio real.

## Sistema de consultas
### Que hace
- Guarda consultas (leads) desde el modal de contacto.
- Persiste datos en PostgreSQL vinculados al lote dentro de `Consulta`, que es la base del CRM unificado.

### Flujo completo (frontend -> backend -> DB)
- `ContactModal` envia `nombreContacto`, `emailContacto`, `mensaje` y `loteId`.
- `POST /api/consultas/public` valida y persiste la consulta.
- Prisma guarda el registro en `Consulta` con `origen=public_form`, relacionado con `Lote`.

### Como probarlo
1. Abri un lote y pulsa "Consultar".
2. Completa el formulario y envia.
3. Verifica en DB la tabla `Consulta` y confirma `origen=public_form`.

## Panel de consultas
### Que permite hacer
- Visualizar las consultas (leads) recibidas por lote.
- Revisar nombre, email, mensaje y fecha.

### Como acceder
- Ruta: `/admin/inquiries` (usuario autenticado).

### Que datos muestra
- Nombre, email, mensaje.
- Lote asociado (titulo y direccion).
- Fecha de creacion.
- Estado de la consulta (pendiente / leido).

### Flujo de gestion
- Las nuevas consultas entran como "pending".
- El admin puede marcar una consulta como "read".

## Filtro de consultas por estado
El panel admin permite filtrar consultas por estado:
- Todas
- Pendientes
- Leidas

El estado se controla mediante query params:
`/admin/inquiries?status=pending`

Esto permite compartir vistas filtradas y mantener consistencia UX.

## Estadisticas de consultas
- Endpoint: `GET /api/inquiries/stats` (requiere autenticacion).
- Devuelve: `{ total, pending, read }`.
- Se usa en el panel admin para mostrar el volumen total y por estado.

## Soporte para leads publicos en consultas
- Se permite crear consultas sin usuario autenticado.
- Nuevo endpoint: `POST /api/consultas/public`.
- Base tecnica para la unificacion CRM entre `Inquiry` y `Consulta`.

## Unificacion CRM (fase 2)
- `ContactModal` ahora crea consultas publicas via `POST /api/consultas/public`.
- `Inquiry` queda activo como sistema legacy para compatibilidad e historico.
- El punto de entrada real del lead ya empieza a converger sobre `Consulta`.

## Unificacion CRM (fase 3)
- La bandeja de `Consultas` ahora incluye tambien leads publicos.
- Se agrega filtro por origen (`user` / `public_form`) para operar una sola cola comercial.
- `Inquiries` queda en proceso de deprecacion como modulo legacy.

## Filtros avanzados CRM
- La bandeja de consultas soporta filtros combinables por `estado`, `origen`, `loteId` y `q`.
- Todos los filtros viven en la URL y se pueden compartir o navegar con back/forward.
- El backend resuelve estos filtros con un `where` dinamico sobre Prisma.

## Acciones CRM
- La bandeja permite seleccion multiple de consultas.
- Se puede actualizar el estado de una consulta individual o en lote.
- La operacion masiva reutiliza el flujo CRM sin romper los endpoints individuales ya existentes.

## Prioridad y notas CRM
- Cada consulta ahora tiene prioridad operativa (`baja`, `media`, `alta`).
- La bandeja permite ajustar prioridad rapidamente desde la lista.
- Las notas internas reutilizan `ConsultaSeguimiento`, evitando duplicar modelos o flujos.

## Upload de imagenes
- El CRUD de lotes ya soporta upload real de una imagen por lote usando `multer`.
- Los archivos se guardan localmente en `backend/uploads/lotes`.
- El backend sirve esos archivos en rutas publicas `/uploads/lotes/<archivo>`.
- El panel admin crea y edita lotes con `FormData`, preview local y reemplazo de imagen existente.
- Al eliminar un lote o reemplazar su imagen, el backend borra el archivo fisico solo si pertenece al storage local.
- En staging Railway, las imagenes locales se consumen siempre desde el dominio del frontend y Nginx las proxyea al backend en `/uploads/`.
- En Railway esto funciona bien para staging y MVP, pero el filesystem local no persiste entre deploys por defecto. Para persistencia real hay que montar un Volume en `/app/uploads`. Fuente: [Railway Volumes](https://docs.railway.com/volumes)
- A futuro, la migracion natural es mover el storage a Cloudinary, S3 o R2 sin cambiar el resto del flujo admin.

### Serving de imagenes
- El navegador no debe pedir imagenes al dominio backend directamente.
- La ruta almacenada en DB para uploads locales es relativa: `/uploads/lotes/<archivo>`.
- El frontend resuelve esas rutas contra `window.location.origin`.
- Nginx recibe `/uploads/...` en el dominio del frontend y lo proxyea al backend staging.
- En Railway, el proxy tambien reenvia el `Host` del backend staging para que el enrutamiento por dominio publico no rompa `/api`, `/uploads/` ni `/socket.io/`.
- Esto evita problemas de CORP/CORS en assets e unifica el serving de imagenes con el mismo dominio publico del frontend.

### Arquitectura de imagenes de lotes
- `Lote.image` sigue existiendo como imagen principal para no romper el contrato actual.
- `LoteImagen` queda agregado como estructura preparada para galeria futura, con `url`, `orden` y relacion por lote.
- Cada create/update sincroniza automaticamente la imagen principal en `LoteImagen` con `orden = 0`.
- El frontend prioriza `lote.imagenes[0]` y mantiene fallback a `lote.image` para datos viejos o migraciones parciales.
- El placeholder visual ya no depende de servicios externos en runtime: se usa `src/assets/lote-placeholder.webp`.
- Esto deja el proyecto listo para evolucionar a multi-imagen o storage cloud sin romper staging.

## Setup local completo
1. Requisito base:
   - Docker Desktop iniciado o una instancia local de PostgreSQL escuchando en `localhost:5432`.
2. Levantar PostgreSQL con Docker:
   - `docker compose up -d postgres`
3. Configurar backend:
   - `cd backend`
   - `Copy-Item .env.example .env`
   - Revisar `DATABASE_URL`, `JWT_SECRET` y `FRONTEND_ORIGIN`.
4. Aplicar esquema y generar cliente Prisma:
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init` para primera instalacion, o `npm run prisma:deploy` si ya existen migraciones versionadas.
5. Cargar datos base opcionales:
   - `npm run db:seed`
6. Levantar backend:
   - `npm run dev`
7. Configurar frontend desde la raiz:
   - `Copy-Item .env.example .env`
   - Verificar `VITE_API_URL=http://localhost:3001/api`
   - `npm install`
   - `npm run dev`

## Preparacion para deploy
- El backend valida variables criticas con Zod antes de iniciar.
- CORS usa `FRONTEND_ORIGIN` explicito; no se usa `*`.
- `POST /api/consultas/public` tiene rate limit especifico para mitigar spam.
- Prisma ya incluye migracion para `prioridad` en consultas; en deploy usar `npm run prisma:deploy`.

## Levantar stack completo con Docker
- Comando principal:
  - `docker compose up --build`
- Servicios expuestos:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`
  - PostgreSQL: `localhost:5432`
- `docker compose` usa `backend/.env.docker` como configuracion base del backend dentro de contenedores.
- El contenedor backend:
  - aplica migraciones Prisma
  - ejecuta seed de datos base
  - inicia la API en puerto `3000`
- El contenedor frontend levanta Vite accesible desde la maquina host.

## Smoke test CRM
- Ejecutar con el stack arriba:
  - `npm run crm:smoke`
- El smoke valida extremo a extremo:
  - creacion de consulta publica
  - login admin
  - cambio de estado
  - cambio de prioridad
  - agregado de nota interna
- Por defecto usa `http://localhost:3000/api`.
- Si necesitas otro destino:
  - `CRM_SMOKE_API_BASE_URL=http://host:puerto/api npm run crm:smoke`

## CI/CD
- GitHub Actions ejecuta validacion automatica sobre cada `push` y `pull_request` a `main`.
- La pipeline cubre:
  - instalacion de dependencias frontend y backend
  - `prisma generate`
  - `prisma migrate deploy`
  - seed de datos base
  - build del frontend
  - arranque del backend y smoke test CRM
  - validacion del stack productivo con `docker-compose.prod.yml`
- Si falla build, Prisma, el backend o el smoke CRM, el workflow falla.

## Deploy produccion
- Stack productivo:
  - `docker compose -f docker-compose.prod.yml up --build -d`
- Servicios expuestos en la configuracion actual:
  - Nginx + frontend SPA: `http://localhost:8080`
  - API solo via reverse proxy en `/api`
- Componentes clave:
  - frontend estatico generado con `npm run build`
  - Nginx sirviendo la SPA con fallback a `index.html`
  - reverse proxy de `/api` y `/socket.io/` hacia `backend:3000`
  - backend en modo `start`, con `prisma migrate deploy` al iniciar
- Archivos de referencia:
  - frontend: `.env.production.example`
  - backend: `backend/.env.production.example`
  - proxy nginx: `nginx/default.conf`
- Variables importantes:
  - `VITE_API_URL=/api`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `FRONTEND_URL`
- Nota operativa:
  - `RUN_DB_SEED=true` queda habilitado por defecto en `docker-compose.prod.yml` para staging/local. En despliegue real conviene apagarlo una vez inicializado el entorno.

## Deploy en Railway
- Objetivo recomendado:
  - un servicio `backend`
  - un servicio `frontend-nginx`
  - una base PostgreSQL gestionada por Railway o externa
- Dockerfiles a usar:
  - frontend: `Dockerfile`
  - backend: `backend/Dockerfile`
- Railway permite definir una ruta custom al Dockerfile con `RAILWAY_DOCKERFILE_PATH`. Esto sirve para apuntar el servicio backend a `backend/Dockerfile`. Fuente: [Railway Dockerfiles](https://docs.railway.com/builds/dockerfiles)
- Railway inyecta la variable `PORT` y espera que el servicio escuche en ese puerto. Este proyecto ya queda alineado:
  - backend escucha `env.PORT`
  - Nginx usa `${PORT}` en runtime
  Fuente: [Railway Public Networking](https://docs.railway.com/public-networking)
- Variables backend minimas:
  - `NODE_ENV=production`
  - `PORT=3000`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `FRONTEND_URL`
  - `FRONTEND_ORIGIN`
- Variables frontend:
  - `VITE_API_URL=/api`
  - `VITE_GOOGLE_MAPS_API_KEY` si se quiere mantener mapas en staging
- Healthchecks recomendados:
  - backend: `/health`
  - frontend nginx: `/nginx-health`
  - Railway soporta healthchecks configurables a nivel de deployment. Fuente: [Railway Healthchecks](https://docs.railway.com/deployments/healthchecks)
- Flujo sugerido:
  1. crear proyecto en Railway
  2. conectar el repositorio GitHub
  3. crear servicio backend usando `backend/Dockerfile`
  4. crear servicio frontend usando `Dockerfile`
  5. cargar variables de entorno
  6. verificar `/health`, `/nginx-health` y el smoke CRM contra la URL publica de staging
- Nota:
- el serving de imagenes locales depende de que Nginx mantenga tambien el proxy de /uploads/`r
  - este repositorio ya queda preparado, pero este PR no despliega nada automaticamente.

## Deploy real en Railway (staging)
### 1. Crear proyecto
1. Entrar a Railway y crear un proyecto nuevo.
2. Conectar este repositorio de GitHub.
3. Crear tres recursos:
   - servicio `backend`
   - servicio `frontend-nginx`
   - PostgreSQL

### 2. Crear PostgreSQL
1. Agregar el plugin/base PostgreSQL desde Railway.
2. Copiar la `DATABASE_URL` generada por Railway.
3. Verificar que el backend use esa URL en sus variables.
4. Si quieres que las imagenes subidas sobrevivan a los redeploys, adjuntar un Railway Volume al servicio backend con mount path `/app/uploads`.

### 3. Variables del backend
Configurar en Railway, como minimo:
- `NODE_ENV=production`
- `JWT_SECRET=<valor largo y aleatorio>`
- `REFRESH_TOKEN_SECRET=<valor largo y aleatorio>`
- `ACCESS_TOKEN_EXPIRES_IN=15m`
- `REFRESH_TOKEN_EXPIRES_DAYS=14`
- `MAX_LOGIN_ATTEMPTS=5`
- `LOCKOUT_MINUTES=15`
- `DATABASE_URL=<la que entrega Railway Postgres>`
- `FRONTEND_URL=https://<dominio-publico-del-frontend>`
- `FRONTEND_ORIGIN=https://<dominio-publico-del-frontend>`
- `SETUP_ADMIN_KEY=<clave larga para bootstrap admin>`
- `SMTP_FROM=<correo emisor>`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` si vas a enviar emails
- `RUN_DB_SEED=false` para staging persistente despues del primer arranque

### 4. Variables del frontend
Configurar:
- `VITE_API_URL=/api`
- `VITE_GOOGLE_MAPS_API_KEY=<opcional pero recomendado si quieres mapas en staging>`

### 5. Deploy backend
1. En el servicio backend, definir:
   - `RAILWAY_DOCKERFILE_PATH=backend/Dockerfile`
2. Confirmar que Railway detecta el Dockerfile correcto en logs.
3. Configurar healthcheck:
   - path: `/health`
4. Revisar logs de arranque esperados:
   - `[startup] db=connected ...`
   - `[startup] api=listening ...`

### 6. Deploy frontend
1. En el servicio frontend, usar el `Dockerfile` de la raiz.
2. El proxy de Nginx hoy apunta de forma explicita al backend staging en `nginx/default.conf`.
3. Railway expondra un dominio publico para ese servicio.
4. Configurar healthcheck:
   - path: `/nginx-health`
5. Verificar:
   - `https://<frontend>/`
   - `https://<frontend>/login`
   - `https://<frontend>/health`
   - `https://<frontend>/uploads/...` para imagenes subidas localmente

Nota:
- el serving de imagenes locales depende de que Nginx mantenga tambien el proxy de `/uploads/`

### 7. Healthchecks
- Backend:
  - `GET /health` debe devolver `{"status":"ok"}`
- Frontend:
  - `GET /nginx-health` debe devolver `ok`
- Si Railway marca el deploy como no saludable:
  - revisar que el servicio escucha en `PORT`
  - revisar logs del servicio
  - revisar variables faltantes

### 8. Logs
- Backend:
  - buscar `[startup] db=connected`
  - buscar `[startup] api=listening`
  - si aparece error de Prisma o env invalido, el deploy no esta listo
- Frontend:
  - verificar que Nginx inicie sin errores
  - verificar que el template de config haya renderizado el `PORT`

### 9. Como validar staging
1. Abrir la URL publica del frontend.
2. Abrir `/health` y `/nginx-health`.
3. Entrar al catalogo y confirmar carga de lotes.
4. Probar login admin.
5. Crear una consulta publica desde la UI.

### 10. Como correr smoke contra staging
Usar cualquiera de estas variantes:
- PowerShell:
  - ``$env:API_URL="https://tu-frontend.up.railway.app/api"; npm run smoke:staging``
- Bash:
  - `API_URL=https://tu-frontend.up.railway.app/api npm run smoke:staging`

El smoke valida:
- creacion de consulta publica
- login admin
- cambio de estado
- cambio de prioridad
- nota interna

## Checklist deploy staging exitoso
### Backend
- `https://tu-backend-o-frontend/health` responde `{"status":"ok"}`
- logs muestran:
  - `[startup] db=connected`
  - `[startup] api=listening`
- no hay errores de Prisma al iniciar

### Frontend
- la home carga sin pantalla en blanco
- `/login` responde correctamente
- rutas SPA profundas siguen funcionando al recargar
- `https://tu-frontend.up.railway.app/nginx-health` responde `ok`

### PostgreSQL
- `DATABASE_URL` apunta a la base Railway real
- el backend arranca sin `migrate deploy` fallido
- el entorno no re-siembra datos si ya desactivaste `RUN_DB_SEED`

### API
- `GET /api/lotes?limit=1` responde `200`
- login admin responde `200`
- `POST /api/consultas/public` crea una consulta

### Smoke
- correr:
  - PowerShell: ``$env:API_URL="https://tu-frontend.up.railway.app/api"; npm run smoke:staging``
  - Bash: `API_URL=https://tu-frontend.up.railway.app/api npm run smoke:staging`
- el resultado esperado termina con:
  - `Smoke CRM completado.`

### Logs
- revisar logs del servicio backend en Railway si falla:
  - variables faltantes
  - errores de conexion a PostgreSQL
  - healthcheck sin respuesta
- revisar logs del frontend si falla:
  - Nginx no inicia
  - `PORT` no aplicado

### Healthchecks
- backend:
  - `/health`
- frontend:
  - `/nginx-health`
- si Railway no marca activo el deploy:
  - verificar path configurado
  - verificar que el servicio escucha en `PORT`
  - revisar timeout del healthcheck

## Fix navegacion admin
- Se corrige un loop de navegacion por doble fuente de verdad (tab <-> URL).
- La URL pasa a ser la unica fuente de verdad del tab en Gestion.

## Fix compilacion admin
- Se corrige una declaracion duplicada de `searchKey` en `GestionComercial`.
- Ajuste final del refactor de navegacion.

## Estabilizacion TypeScript
- Se corrigen errores de tipado en `AddressAutocomplete` y `Lotes`.
- El build del frontend vuelve a pasar correctamente.

## Arquitectura actual (resumen)
- Frontend: React + TypeScript + Vite + React Query.
- Backend: Node.js + Express por capas + Prisma.
- Configuracion: variables de entorno tipadas + validacion con Zod.
- Datos: PostgreSQL, endpoints paginados y filtros server-side.
- Estado cliente: favoritos locales con persistencia en `localStorage`.

## Documentacion de aprendizaje (mentoria)
- Guia tecnica completa: `docs/MENTORIA_TECNICA.md`
- Bitacora incremental de cambios: `docs/bitacora.md` (resumen) y `docs/BITACORA_DESARROLLO.md` (historico)

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
- Alta, edicion y eliminacion de lotes disponibles solo para dmin.
- empleado y usuario mantienen acceso de lectura al catalogo.
- El formulario admin ya soporta upload local de imagenes con preview y una sola imagen principal por lote.
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
   - Ajusta `JWT_SECRET` si corresponde y verifica `DATABASE_URL`.
3. Inicializa esquema y datos:
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init` o `npm run prisma:deploy` si ya existe base versionada
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
- `POST /api/inquiries` (legacy historico)
- `POST /api/consultas/public` (entrada publica actual al CRM)

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
- Rate limit especifico para `/api/consultas/public`.
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

### Reordenamiento de navegacion del backoffice
- Se reorganizo el sidebar en grupos funcionales: `Dashboard`, `Comercial`, `CRM`, `Operaciones`, `Administracion`, `Configuracion` y `Usuario`.
- Se separo la experiencia de usuario final frente a la experiencia operativa/admin para reducir mezcla de contexto.
- `Favoritos` deja de mostrarse como acceso principal para roles operativos (`admin` y `empleado`) y queda centrado en `usuario`.
- `Leads legacy` pasa a mostrarse como `Archivo legacy` para marcar su caracter transicional sin romper rutas existentes.
- Los modulos placeholder administrativos (`Identidad de marca`, `Editor del sitio`) quedan visibles para admin, pero etiquetados como `Beta`.

### Dashboard orientado a negocio
- El dashboard prioriza lectura ejecutiva: KPIs, actividad comercial, accesos rapidos y estado operativo.
- Se elimino la exposicion de permisos tecnicos crudos del panel principal para reducir ruido y evitar mezcla con informacion de debugging.
- Las acciones principales ahora usan lenguaje de operacion: gestionar lotes, ver consultas CRM, clientes y ventas.
- Se mantiene compatibilidad total con backend y rutas existentes, sin cambios de contrato API.

### RediseÃ±o UX de lotes
- `LotCard` se compacto para mejorar escaneo visual y conversion: imagen protagonista, precio destacado y CTA claro.
- Se redujo densidad de contenido: titulo, ubicacion corta, tamano y hasta 3 badges de amenities.
- La experiencia es mobile-first:
  - cards en una columna con spacing mas limpio
  - mapa grande removido en mobile y reemplazado por `Ver ubicacion`
  - mapa compacto mantenido para desktop
- Se preparo el frente para multi-imagen:
  - badge de cantidad de fotos cuando `imagenes[]` tiene mas de una
  - fallback compatible con `imagenes[0]`, `image` y placeholder local
- No hubo cambios de backend ni contratos API.



## Vista detalle de lote
- Se agrega la ruta publica /lotes/:id para concentrar informacion completa del lote.
- El listado mantiene cards resumidas y ahora deriva a detalle con CTA Ver detalle.
- La vista detalle incluye imagen principal, datos completos, amenities, mapa y CTA principal de consulta.
- Se mantiene compatibilidad con lote.image y lote.imagenes[] para preparacion multi-imagen.


### Resolucion consistente de imagenes
- Se unifica la seleccion de imagen principal con getPrimaryLoteImage(lote) para listado y detalle.
- Soporta imagenes[0].url, imagenes[0] string, image y fallback local.
- Las rutas /uploads/... se resuelven siempre contra window.location.origin para mantener serving desde el dominio frontend.


- Resiliencia en imágenes locales: si un lote referencia /uploads/... pero el archivo no existe en runtime (404), el backend ahora devuelve un placeholder para evitar imagen rota en UI.


### Acciones admin de lotes
- La card publica se mantiene compacta para usuarios finales.
- Cuando el usuario tiene permisos de gestion (lotes.write / lotes.delete) se muestra una zona Modo admin dentro de cada card con acciones Editar y Eliminar.
- El fallback de imagen vuelve a ser local en frontend (sin dependencia visual de placeholders externos).


### Galeria multi-imagen de lotes
- El backend acepta multiples archivos en imagenes (ademas del campo image para compatibilidad).
- Al crear/editar, las imagenes se guardan en LoteImagen y se mantiene sincronizado Lote.image como imagen principal.
- Nuevos endpoints admin:
  - PATCH /api/lotes/:loteId/imagenes/:imagenId/principal`n  - DELETE /api/lotes/:loteId/imagenes/:imagenId`n- En detalle (/lotes/:id) se muestra imagen principal + miniaturas clickeables.
- El listado sigue compacto y usa siempre la imagen principal.


### Persistencia de uploads con Railway Volume
- El backend ahora usa UPLOADS_DIR para definir la ruta fisica de almacenamiento de imagenes.
- En local, UPLOADS_DIR puede quedar en uploads (default) y sigue funcionando igual.
- En Docker/Railway se recomienda UPLOADS_DIR=/app/uploads para usar volumen persistente.

Pasos en Railway:
1. Abrir el servicio ackend en Railway.
2. Crear un Volume.
3. Montarlo en /app/uploads.
4. Configurar variable UPLOADS_DIR=/app/uploads.
5. Hacer redeploy del backend.
6. Subir una imagen nueva desde admin.
7. Verificar que la imagen sigue disponible luego de otro redeploy.


### Gestion admin de galeria
- Se corrige el flujo de imagen principal para evitar errores de unicidad (`loteId`, `orden`) al reordenar galeria.
- El reordenamiento ahora se aplica en dos fases dentro de transaccion para no colisionar en estados intermedios.
- En el editor admin, la galeria muestra estado `Principal`/`Secundaria` y acciones mas compactas por imagen.
- El selector de amenities permite seleccion multiple continua sin cerrarse en cada click.

### UX admin de imagenes
- El editor de lotes unifica la carga en un solo bloque de imagenes (una o multiples) para reducir confusion.
- Se prioriza lenguaje operativo: `Portada del lote`, `Portada`, `Usar como portada`.
- Se elimina informacion tecnica de orden en la UI y se refuerza feedback visual de acciones.

### Estado consistente de galeria admin
- La galeria editable toma como fuente principal `LoteImagen[]` y evita duplicar portada legacy en la grilla.
- Las imagenes nuevas quedan separadas en `Imagenes a subir` hasta confirmar guardado.
- Las acciones de portada/eliminar refrescan el lote desde backend para evitar estado stale en UI.

### Pulido visual de detalle de lote
- La vista `/lotes/:id` se reorganiza en un layout de conversion: hero visual + panel lateral de resumen y CTA.
- Se mejora navegacion superior con enlace sutil `Volver a lotes`.
- Se pulen miniaturas, secciones informativas y bloque de mapa para una experiencia mas inmobiliaria y mobile-first.

### Ajuste UX de detalle sin duplicacion
- El resumen comercial queda concentrado en el panel lateral (precio, superficie, ubicacion, destacados y CTA).
- Se elimina la repeticion de cards inferiores para reducir ruido y mejorar jerarquia visual.

### Cierre UX de detalle sin redundancias
- El panel lateral queda enfocado en conversion (precio, superficie, estado y CTA).
- Las comodidades y la ubicacion completa viven solo en secciones inferiores dedicadas.

### Contacto rapido en detalle de lote
- El panel lateral del detalle prioriza conversion: precio, superficie, estado y CTA principal.
- Se agregan accesos rapidos a WhatsApp, Email e Instagram como vias secundarias de contacto.
- Se mantiene ubicacion breve en resumen y ubicacion completa solo en su seccion dedicada.

### Contacto rapido y ubicacion en detalle
- El panel comercial incorpora contacto rapido con accesos visuales (WhatsApp, Email, Instagram).
- Se elimina la ubicacion duplicada del panel y se concentra la informacion completa en `Ubicacion y entorno`.
- El mapa se muestra en formato mas util, con mayor area visual y acceso directo a Google Maps.

### Fix mapa en detalle
- Se corrige regresion de visibilidad en desktop del mapa en `Ubicacion y entorno`.
- El contenedor recupera `md:block`, manteniendo comportamiento mobile sin romper otros contextos.

### Home publico orientado a conversion
- Se rediseno el Home como landing inmobiliaria con hero comercial, doble CTA y propuesta de valor clara.
- Se agrega seccion `Lotes destacados` consumiendo la API existente de lotes, con estados de carga/error/vacio.
- Se suma bloque final de conversion con acceso directo a catalogo completo y contacto.
- Para usuarios operativos (`admin`, `empleado`) se mantiene acceso discreto al panel sin convertir el Home en dashboard.

### ? Lotes destacados en Home
- Los lotes ahora pueden marcarse como `destacados` desde el editor admin.
- El Home consulta primero `GET /api/lotes?destacado=true` y muestra hasta 3 resultados.
- Si no hay destacados, el Home aplica fallback elegante al listado general para no quedar vacio.
- Desde la vista detalle (`/lotes/:id`), usuarios con permiso `lotes.write` pueden abrir edicion directa con el boton `Editar lote`.

### ?? Experiencia por rol
- El Home ahora adapta su hero y CTAs segun perfil:
  - visitante: enfoque comercial publico
  - usuario autenticado: mantiene enfoque publico con acceso a su panel
  - admin/empleado: vista operativa con acceso directo a gestion
- Favoritos quedan orientados a usuario autenticado comun (`usuario`).
- Visitantes y perfiles operativos reciben una invitacion clara a iniciar sesion/crear cuenta para usar favoritos.

### ? Pulido visual premium
- Se aplico una pasada de refinamiento UI en Home, catalogo y detalle de lote para elevar percepcion de producto inmobiliario.
- Mejora de jerarquia visual, spacing y densidad de contenido en cards, CTAs y secciones principales.
- Microinteracciones moderadas (hover/focus/transiciones) para feedback mas claro sin sobrecargar la experiencia.
- Ajustes mobile-first para mejorar tactilidad y lectura en pantallas chicas sin romper desktop.

### ?? Configuracion comercial del sitio
- Los datos comerciales del frontend ahora se centralizan en `src/config/siteConfig.ts`.
- Desde ese archivo se controlan: nombre de marca, subtitulo, email, WhatsApp, Instagram, mensaje por defecto y etiqueta de ubicacion.
- Home, detalle de lote, navbar/sidebar, contacto y modal reutilizan esta fuente unica.
- Tambien se incluyen helpers para generar links dinamicos:
  - WhatsApp por lote con mensaje prearmado
  - `mailto` por lote con subject/body y link directo al detalle
- Esta base permite migrar luego a configuracion editable desde admin sin reescribir componentes.

### ?? Auditoria de modulos del backoffice
- Se audito el estado real de modulos legacy y placeholders visibles en sidebar (`Archivo legacy`, `Auditoria`, `Mi perfil`, `Seguridad`, `Preferencias`, `Identidad de marca`, `Editor del sitio`).
- El objetivo fue definir que mantener visible, que renombrar y que mover a backlog sin romper rutas actuales.
- Esta auditoria deja recomendaciones priorizadas para los proximos PRs sin aplicar cambios destructivos en esta etapa.

### ?? Estructura pública profesional
- Se refina la estructura publica con `NavBar` mas consistente, `Footer` reutilizable y cohesion visual entre header, contenido y cierre.
- Login y Registro ahora incluyen enlaces cruzados para reducir friccion en autenticacion.
- Favoritos en navegacion publica se muestran solo para `usuario` autenticado; visitantes y perfiles operativos no lo ven en el header.

### ?? Fix operativo Railway (backend 502)
- El backend ahora acepta `FRONTEND_ORIGIN` con multiples dominios separados por coma (ej: `https://frontend.app,https://staging.app`).
- Se agregaron defaults operativos para variables no criticas de auth (`ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS`, `MAX_LOGIN_ATTEMPTS`, `LOCKOUT_MINUTES`).
- Si `UPLOADS_DIR` falla por permisos/mount, el servidor aplica fallback a `backend/uploads` para evitar crash de arranque.
- Se robustecio el arranque del backend en contenedor: `prisma migrate deploy` ahora reintenta ante fallos transitorios de red/DB.
- `RUN_DB_SEED=true` ya no tumba el servicio si el seed falla; se registra warning y el API igualmente levanta.

### ?? Runbook Railway 502
1. Probar backend directo: `GET /health`.
2. Probar backend API: `GET /api/lotes?limit=1`.
3. Probar frontend proxy: `GET /api/lotes?limit=1`.
4. Revisar logs del backend en Railway (startup, crash, prisma, env).
5. Verificar `prisma migrate deploy` en arranque.
6. Verificar si `db:seed` fallo y si quedo en modo no bloqueante.
7. Confirmar variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `UPLOADS_DIR`, `NODE_ENV`.
8. Confirmar volume/mount de uploads (`/app/uploads`) y permisos.

### ?? Smoke remoto Railway
- Ejecutar: `npm run smoke:railway`
- Variables opcionales:
  - `BACKEND_URL` (default: `https://backend-production-a499.up.railway.app`)
  - `FRONTEND_URL` (default: `https://frontend-production-1cb7e.up.railway.app`)
- El script valida salud backend, salud nginx y consumo de lotes tanto directo como por proxy.

### ?? Higiene final de navegación
- `Preferencias` se oculta temporalmente del sidebar para reducir ruido de placeholders, manteniendo su ruta disponible.
- `Archivo legacy` queda visible solo para admin como referencia historica de consultas.
- Los modulos `Identidad de marca (Beta)` y `Editor del sitio (Beta)` quedan claramente marcados como beta y solo para admin.
- Se ajusta copy de modulos placeholder para que el backoffice refleje estado real del producto.
