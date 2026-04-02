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
