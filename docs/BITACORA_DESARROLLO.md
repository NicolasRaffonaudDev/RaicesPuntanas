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
