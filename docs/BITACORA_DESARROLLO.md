# Bitacora de Desarrollo

Formato sugerido por entrada:
- Fecha:
- Scope:
- Cambios:
- Motivo tecnico:
- Impacto en cliente:
- Riesgos:
- Validacion:
- Siguiente paso:

---

## 2026-05-14 - Preparacion de staging en Railway
- Scope: `chore(deploy)` + `railway` + `docs`
- Cambios:
  - Se agrega `nginx-health` para healthchecks de infraestructura en el frontend productivo.
  - El backend mejora sus logs de arranque para mostrar `NODE_ENV`, `PORT`, `FRONTEND_ORIGIN` y conexion de DB.
  - Se documenta el deploy en Railway con variables, healthchecks, smoke remoto y uso de Dockerfiles separados por servicio.
  - El frontend productivo pasa a escuchar el `PORT` inyectado por Railway a traves del template de Nginx.
- Motivo tecnico:
  - Reducir incertidumbre al pasar de entorno local validado a un staging publico real en plataforma gestionada.
- Impacto en cliente:
  - Menor riesgo de despliegues opacos y mejor capacidad de diagnostico ante fallas de arranque.
- Riesgos:
  - Railway puede requerir ajustes puntuales de red o dominios segun como se expongan los servicios, pero la base del stack queda preparada.
- Validacion:
  - `docker compose -f docker-compose.prod.yml up --build -d`, `GET /health`, `GET /nginx-health` y smoke CRM.
- Siguiente paso:
  - Crear el proyecto staging en Railway y conectar variables reales del entorno.

## 2026-05-14 - CI basico con validacion automatica
- Scope: `chore(ci)` + `github-actions` + `docs`
- Cambios:
  - Se actualiza `ci.yml` para validar frontend, backend, Prisma y el flujo CRM.
  - Se agrega un job dedicado a levantar y verificar `docker-compose.prod.yml`.
  - El smoke CRM pasa a ser una proteccion automatica contra regresiones del flujo comercial critico.
- Motivo tecnico:
  - Evitar merges a `main` que rompan build, migraciones o el camino principal de consultas sin deteccion temprana.
- Impacto en cliente:
  - Menor probabilidad de regresiones invisibles antes de staging/produccion.
- Riesgos:
  - La pipeline ahora es mas exigente y puede requerir ajustar tiempos si el runner tiene latencia alta al construir imagenes.
- Validacion:
  - El workflow corre build, backend smoke y compose prod con smoke CRM.
- Siguiente paso:
  - Agregar proteccion de rama y exigir CI verde antes de mergear a `main`.

## 2026-05-12 - Preparacion de deploy real con Nginx
- Scope: `chore(deploy)` + `docker` + `nginx` + `docs`
- Cambios:
  - Se separan los Dockerfiles de desarrollo y produccion para frontend y backend.
  - El frontend de produccion pasa a build estatico servido por `nginx`.
  - Se agrega `docker-compose.prod.yml` con `postgres`, `backend` y `frontend-nginx`.
  - Nginx resuelve SPA fallback y reverse proxy de `/api` y `/socket.io/`.
- Motivo tecnico:
  - Preparar una arquitectura realmente desplegable en VPS/Hostinger sin depender de Vite en modo desarrollo.
- Impacto en cliente:
  - Mejor base de performance, menor superficie de error en produccion y arquitectura mas cercana al entorno final.
- Riesgos:
  - La configuracion productiva usa `RUN_DB_SEED=true` por defecto para staging/local; antes de un deploy real debe revisarse segun el estado de la base.
- Validacion:
  - `docker compose -f docker-compose.prod.yml up --build`, frontend servido por Nginx y smoke CRM ejecutado a traves de `/api`.
- Siguiente paso:
  - Agregar pipeline de build/publish de imagenes y definir manejo seguro de secretos en VPS.

## 2026-05-12 - Stack Docker completo y smoke CRM
- Scope: `chore(devops)` + `docker` + `smoke` + `docs`
- Cambios:
  - Se unifica `docker compose` para levantar `postgres`, `backend` y `frontend` con una sola orden.
  - Se agregan Dockerfiles para backend y frontend orientados a desarrollo real.
  - Se crea `scripts/crm-smoke.js` para validar el flujo CRM critico de punta a punta.
- Motivo tecnico:
  - Reducir friccion de setup y asegurar que el camino principal del producto quede cubierto por una prueba operativa automatizada.
- Impacto en cliente:
  - Menor riesgo de despliegues incompletos y mayor confianza en el flujo de consultas comerciales.
- Riesgos:
  - El frontend dockerizado usa Vite en modo dev; para produccion convendra reemplazarlo por build estatico servido por nginx o similar.
- Validacion:
  - `docker compose up --build`, `npm run build` y `npm run crm:smoke`.
- Siguiente paso:
  - Integrar este smoke en CI o en una etapa de predeploy y evaluar imagenes de produccion separadas.

## 2026-05-04 - Setup de base y preparacion para deploy
- Scope: `chore(setup)` + `infra` + `docs`
- Cambios:
  - Se valida el flujo real de Docker + PostgreSQL para levantar la base local del proyecto.
  - Se actualiza `docker-compose.yml` con `healthcheck` y sin atributo `version` obsoleto.
  - Se endurece `POST /api/consultas/public` con rate limit especifico.
  - Se dejan ejemplos de entorno consistentes y documentacion de setup/migraciones lista para deploy.
- Motivo tecnico:
  - Cerrar la brecha entre codigo correcto y entorno operativo real, especialmente alrededor de Prisma y la migracion pendiente de `prioridad`.
- Impacto en cliente:
  - Menor riesgo de caidas por despliegues incompletos y mejor proteccion basica contra spam en el formulario publico.
- Riesgos:
  - Si el entorno usa otro host/puerto/origen, hay que adaptar `.env` antes de desplegar.
- Validacion:
  - PostgreSQL levantado por Docker, Prisma detecta y aplica migraciones, y el backend queda listo para arrancar con esquema consistente.
- Siguiente paso:
  - Ejecutar smoke funcional del flujo CRM completo sobre la base ya migrada y definir pipeline de deploy.

## 2026-05-04 - Prioridad y notas internas en CRM
- Scope: `feat(crm)` + `prisma` + `docs`
- Cambios:
  - Se agrega `prioridad` a `Consulta` con valores operativos `baja`, `media`, `alta`.
  - Nuevo endpoint `PATCH /api/consultas/:id/prioridad`.
  - La bandeja muestra prioridad visual y reutiliza `ConsultaSeguimiento` para notas internas.
- Motivo tecnico:
  - Incorporar contexto operativo real sin crear un segundo sistema paralelo de notas.
- Impacto en cliente:
  - El equipo comercial puede decidir mas rapido que atender primero y dejar contexto interno por consulta.
- Riesgos:
  - La prioridad usa string controlado; si en el futuro crecen reglas mas complejas convendra formalizarla mas.
- Validacion:
  - La prioridad se puede editar desde la lista y las notas internas siguen viviendo en el historial.
- Siguiente paso:
  - Evaluar filtros por prioridad y vistas resumidas para supervisores.

## 2026-05-04 - Acciones operativas en la bandeja CRM
- Scope: `feat(crm)` + `docs`
- Cambios:
  - Se agrega seleccion multiple por fila y seleccion global de la pagina actual.
  - Nuevo endpoint `PATCH /api/consultas/status` para actualizacion masiva de estado.
  - La bandeja permite actualizar estado individual o en lote con React Query.
- Motivo tecnico:
  - Pasar de una vista de observacion a una herramienta operativa real para el equipo comercial.
- Impacto en cliente:
  - El operador puede avanzar varias consultas en bloque sin repetir acciones una por una.
- Riesgos:
  - La seleccion masiva se limita a la pagina visible, por lo que hay que comunicar bien ese alcance en UX.
- Validacion:
  - El flujo individual sigue funcionando y la actualizacion masiva invalida la cache de consultas.
- Siguiente paso:
  - Incorporar reglas de negocio por estado y acciones masivas adicionales.

## 2026-05-04 - Filtros avanzados en bandeja CRM
- Scope: `feat(crm)` + `docs`
- Cambios:
  - La bandeja `ConsultasInbox` ahora sincroniza `estado`, `origen`, `loteId`, `q` y `page` directamente con la URL.
  - `GET /api/consultas` soporta filtrado dinamico por `where` en Prisma.
  - Se migra el listado a React Query para mantener cache y paginacion consistentes.
- Motivo tecnico:
  - Llevar la bandeja a un flujo CRM real con filtros combinables, persistentes y navegables.
- Impacto en cliente:
  - El equipo comercial puede refinar la cola por origen, estado, lote o texto sin perder contexto al navegar.
- Riesgos:
  - La lista de lotes para el selector usa un fetch simple de apoyo y podria necesitar evolucion si el catalogo crece mucho.
- Validacion:
  - Los filtros ya pueden combinarse en URL sin romper paginacion ni back/forward.
- Siguiente paso:
  - Incorporar contadores por filtro y acciones masivas propias de CRM.

## 2026-05-04 - Consolidacion de bandeja comercial
- Scope: `feat(crm)` + `docs`
- Cambios:
  - `ConsultasInbox` ahora muestra tambien leads publicos creados desde formulario.
  - Se agrega filtro por origen usando `?origen=user|public_form`.
  - `InquiriesAdmin` queda marcado visualmente como modulo legacy.
- Motivo tecnico:
  - Consolidar la operacion comercial en una sola bandeja sin romper compatibilidad historica.
- Impacto en cliente:
  - El equipo comercial deja de alternar entre dos vistas para gestionar entradas nuevas.
- Riesgos:
  - Siguen conviviendo datos legacy en `Inquiry` hasta una migracion posterior.
- Validacion:
  - La bandeja CRM ya puede distinguir leads y usuarios por `origen`.
- Siguiente paso:
  - Evaluar migracion historica y retiro progresivo del modulo legacy.

## 2026-04-22 - Estabilizacion TypeScript del frontend
- Scope: `fix(frontend)` + `docs`
- Cambios:
  - Se corrige el tipado de `libraries` en `AddressAutocomplete`.
  - Se ajusta el rollback de React Query en `Lotes` usando `QueryKey`.
  - El build del frontend vuelve a pasar.
- Motivo tecnico:
  - Destrabar la compilacion y dejar una base estable antes de seguir iterando features.
- Impacto en cliente:
  - No cambia la UX, pero se recupera la estabilidad del pipeline frontend.
- Riesgos:
  - Bajos; son cambios de tipado sin cambio funcional.
- Validacion:
  - `npm run build` exitoso.
- Siguiente paso:
  - Mantener la disciplina de tipado al migrar mas flujos al CRM unificado.

## 2026-04-22 - Migracion del formulario publico a consultas
- Scope: `feat(consultas)` + `docs`
- Cambios:
  - `ContactModal` deja de crear `Inquiry` y pasa a usar `POST /api/consultas/public`.
  - Se agrega `createPublicConsulta` en el API layer del frontend.
  - Se mantiene compatibilidad con `Inquiry` y `InquiriesAdmin` para datos historicos.
- Motivo tecnico:
  - Mover el punto de entrada real del lead hacia `Consulta` sin romper el sistema anterior.
- Impacto en cliente:
  - El usuario sigue viendo el mismo formulario y la misma UX, pero la consulta ahora entra al flujo CRM objetivo.
- Riesgos:
  - Durante la transicion conviven `Inquiry` historico y nuevas `Consulta` publicas en backoffice distinto.
- Validacion:
  - El flujo publico ya apunta al endpoint de consultas publicas.
- Siguiente paso:
  - Unificar la bandeja operativa para que admin gestione un solo flujo comercial.

## 2026-04-22 - Base para leads publicos en consultas
- Scope: `feat(consultas)` + `prisma`
- Cambios:
  - `Consulta` ahora soporta `userId` opcional.
  - Se agregan `nombreContacto`, `emailContacto`, `telefonoContacto` y `origen`.
  - Nuevo endpoint `POST /api/consultas/public`.
- Motivo tecnico:
  - Iniciar la unificacion `Inquiry -> Consulta` sin romper flujos existentes.
- Impacto en cliente:
  - Todavia no cambia la UI, pero el backend ya acepta leads publicos como consultas reales.
- Riesgos:
  - Conviven temporalmente `Inquiry` y `Consulta` como entradas distintas hasta la migracion de frontend.
- Validacion:
  - Migracion Prisma aplicada y cliente regenerado.
- Siguiente paso:
  - Conectar el formulario publico a `POST /api/consultas/public`.

## 2026-04-13 - Fix loop de navegacion en panel admin
- Scope: `fix(admin)`
- Cambios:
  - Se elimina la doble sincronizacion tab <-> URL en `GestionComercial`.
  - La URL queda como unica fuente de verdad del tab.
  - Guardas para evitar `setSearchParams` repetidos.
- Motivo tecnico:
  - Evitar loops de navegacion al cambiar entre secciones admin.
- Impacto en cliente:
  - Navegacion estable entre secciones del panel.
- Riesgos:
  - Si se agregan nuevos params en Gestion, hay que mantener el criterio URL-first.
- Validacion:
  - Navegacion entre tabs y secciones sin redirects automaticos.
- Siguiente paso:
  - Si aparecen nuevos loops, revisar que no existan nuevas fuentes de verdad.

## 2026-04-13 - Fix compilacion post-refactor
- Scope: `fix(admin)`
- Cambios:
  - Se elimina la declaracion duplicada de `searchKey` en `GestionComercial`.
  - Se mantiene el efecto sincronizado con la URL.
- Motivo tecnico:
  - Error de compilacion por duplicacion de identificadores.
- Impacto en cliente:
  - Compilacion estable y sin regresiones de navegacion.
- Riesgos:
  - Ninguno, el comportamiento permanece igual.
- Validacion:
  - Build OK y navegacion estable entre tabs.

## 2026-04-13 - Estadisticas de consultas en admin
- Scope: `feat(inquiries)` + `docs`
- Cambios:
  - Nuevo endpoint `GET /api/inquiries/stats`.
  - Hook `useInquiryStats` con React Query.
  - UI con contadores de total, pendientes y leidas.
  - Invalidacion de stats al cambiar estado.
- Motivo tecnico:
  - Evitar recalculos en frontend y mejorar performance operativa.
- Impacto en cliente:
  - Visibilidad inmediata del volumen de consultas.
- Riesgos:
  - Si se agregan mas estados, hay que actualizar conteos y UI.
- Validacion:
  - Contadores coinciden con listado y cambian al marcar leido.
- Siguiente paso:
  - Filtros avanzados y acciones masivas.

## 2026-04-02 - Filtro por estado en consultas
- Scope: `feat(inquiries)` + `docs`
- Cambios:
  - Backend filtra `GET /api/inquiries` por `status` y ajusta `count`.
  - UI agrega botones de filtro y usa URL como fuente de verdad.
  - React Query cachea por `{ page, limit, status }`.
- Motivo tecnico:
  - Habilitar segmentacion de consultas sin duplicar estado en cliente.
- Impacto en cliente:
  - El admin filtra pendientes o leidas y comparte la vista filtrada.
- Riesgos:
  - Si se agregan mas estados, hay que actualizar validaciones y UI.
- Validacion:
  - Filtros funcionando con `?status=pending|read`.
- Siguiente paso:
  - Contadores por estado y retorno a "pending".

## 2026-04-01 - Busqueda local + limpieza masiva en favoritos
- Scope: `feat(favoritos)` + `docs`
- Cambios:
  - Busqueda local en `/favoritos` por `title` y `address`.
  - Boton de limpieza masiva con confirmacion.
  - Resultado filtrado en memoria con `useMemo`.
- Motivo tecnico:
  - Mantener UX rapida sin depender del backend para un listado pequeno.
- Impacto en cliente:
  - El usuario encuentra y limpia favoritos mas rapido.
- Riesgos:
  - Para listas enormes, el filtrado local puede ser costoso (aceptable por ahora).
- Validacion:
  - Busqueda local OK, limpieza masiva persiste en localStorage.
- Siguiente paso:
  - Evaluar sync con backend si se requiere multi-dispositivo.

## 2026-04-01 - Comparador visual mejorado
- Scope: `feat(comparador)` + `docs`
- Cambios:
  - Tabla comparativa con columnas de precio, tamano, direccion y amenities.
  - Resaltado del menor precio y mayor tamano.
  - Acciones para quitar items y limpiar comparador.
- Motivo tecnico:
  - Hacer mas clara la comparacion de lotes en una sola vista.
- Impacto en cliente:
  - Mejores decisiones al ver diferencias clave rapidamente.
- Riesgos:
  - Si se comparan muchos lotes, la tabla puede necesitar scroll horizontal.
- Validacion:
  - URL `?ids=` sincronizada y acciones de quitar/limpiar funcionando.
- Siguiente paso:
  - Resaltar columnas con valores distintos entre lotes.

## 2026-04-01 - Contacto por lote con modal
- Scope: `feat(contacto)` + `docs`
- Cambios:
  - Boton "Consultar" en cards y comparador.
  - Modal reutilizable con formulario y validaciones basicas.
  - Envio simulado con feedback de exito.
- Motivo tecnico:
  - Facilitar el contacto desde el contexto del lote sin navegar.
- Impacto en cliente:
  - Reduccion de friccion para iniciar una consulta.
- Riesgos:
  - Envio simulado puede generar expectativa (documentado).
- Validacion:
  - Formulario valida campos obligatorios y muestra confirmacion.
- Siguiente paso:
  - Conectar con backend real y log de consultas.

## 2026-04-01 - Sistema de consultas persistente
- Scope: `feat(inquiries)` + `docs`
- Cambios:
  - Nuevo modelo `Inquiry` en Prisma con relacion a `Lote`.
  - Endpoint publico `POST /inquiries` con validacion Zod.
  - Modal de contacto envia consultas reales al backend.
- Motivo tecnico:
  - Transformar el contacto en un lead persistente para seguimiento comercial.
- Impacto en cliente:
  - Las consultas quedan guardadas y se pueden gestionar luego.
- Riesgos:
  - Sin panel admin aun, la visibilidad es limitada (planificado).
- Validacion:
  - Requests OK y registros en DB.
- Siguiente paso:
  - Panel administrativo y notificaciones.

## 2026-04-01 - Panel admin de consultas
- Scope: `feat(admin)` + `docs`
- Cambios:
  - Endpoint `GET /api/inquiries` con paginacion.
  - Vista `/admin/inquiries` con tabla y paginacion.
  - Hook `useInquiries` y componente `InquiriesTable`.
- Motivo tecnico:
  - Dar visibilidad comercial a las consultas recibidas.
- Impacto en cliente:
  - El admin ve leads sin acceder a la base de datos.
- Riesgos:
  - Faltan filtros/estados (planificado).
- Validacion:
  - Listado OK con paginacion basica.
- Siguiente paso:
  - Agregar filtros por estado y marcar leido.

## 2026-04-01 - Estado de consultas (pending/read)
- Scope: `feat(inquiries)` + `docs`
- Cambios:
  - Campo `status` en `Inquiry` con default `pending`.
  - Endpoint `PATCH /api/inquiries/:id/status`.
  - UI con badge de estado y accion "Marcar como leido".
- Motivo tecnico:
  - Permitir gestion basica del flujo de consultas.
- Impacto en cliente:
  - El admin puede diferenciar consultas pendientes.
- Riesgos:
  - Falta filtro por estado en UI (planificado).
- Validacion:
  - Update OK con optimistic update.
- Siguiente paso:
  - Filtros por estado y notificaciones.

## 2026-04-01 - Favoritos locales + vista dedicada
- Scope: `feat(favoritos)` + `docs`
- Cambios:
  - Nueva ruta `/favoritos` con listado de lotes guardados en `localStorage`.
  - Integracion con `getLotesByIds` y reutilizacion de `LotCard`.
  - Acceso visible desde navbar y sidebar.
  - Documentacion actualizada con funcionalidades y uso de favoritos.
- Motivo tecnico:
  - Centralizar favoritos en el cliente para UX rapida y sin dependencia de autenticacion.
- Impacto en cliente:
  - El usuario puede guardar lotes y consultarlos rapidamente desde "Mis favoritos".
- Riesgos:
  - Favoritos locales no se sincronizan entre dispositivos (aceptable por ahora).
- Validacion:
  - Navegacion OK, favoritos persistidos al recargar.
- Siguiente paso:
  - Evaluar sincronizacion opcional con backend para multi-dispositivo.

## 2026-02-26 - Performance de frontend
- Scope: `perf(frontend)`
- Cambios:
  - lazy loading por rutas en `App.tsx`.
  - `manualChunks` en `vite.config.ts` (`react`, `router`, `maps`, `socket`).
- Motivo tecnico:
  - bajar peso inicial y acelerar primer render.
- Impacto en cliente:
  - carga inicial mas rapida, mejor experiencia en equipos medios.
- Riesgos:
  - posibles flashes de fallback en navegacion (controlado por `Suspense`).
- Validacion:
  - build exitoso con chunks separados.
- Siguiente paso:
  - prefetch selectivo de rutas comerciales criticas.

## 2026-02-26 - Prefetch inteligente de rutas
- Scope: `perf(frontend)` + `test(e2e)` + `docs`
- Cambios:
  - `lazyWithPreload` para componentes de pagina.
  - centralizacion de paginas lazy/preload en `src/routes/lazy-pages.ts`.
  - prefetch por `hover/focus` e `idle` en navbar para rutas clave.
  - E2E de navegacion para verificar carga correcta de rutas lazy.
- Motivo tecnico:
  - mantener code splitting pero reducir latencia percibida al navegar.
- Impacto en cliente:
  - sitio se siente mas rapido en navegacion comercial frecuente.
- Riesgos:
  - prefetch excesivo en redes lentas (mitigado: rutas criticas y carga en idle).
- Validacion:
  - build OK.
  - E2E navegacion lazy OK.
- Siguiente paso:
  - medir TTI/FCP y ajustar estrategia de preload por telemetria real.

## 2026-02-26 - Web Vitals + optimizacion media/mapa
- Scope: `feat(perf)` + `test` + `docs`
- Cambios:
  - captura de Web Vitals en frontend y envio a backend.
  - endpoint backend para ingesta de metricas (`/api/telemetry/web-vitals`).
  - imagenes de lotes con `loading/decoding/fetchPriority`.
  - mapa con comportamiento adaptado para viewport movil.
- Motivo tecnico:
  - combinar medicion real con mejoras concretas de carga y UX.
- Impacto en cliente:
  - experiencia mas fluida en catalogo de lotes.
  - base para monitorear performance en produccion.
- Riesgos:
  - telemetria excesiva si se amplian eventos sin control.
- Validacion:
  - build OK.
  - E2E OK.
  - smoke backend con prueba de endpoint telemetry.
- Siguiente paso:
  - persistencia agregada de metricas (almacenamiento + dashboard interno).
