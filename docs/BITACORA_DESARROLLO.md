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
