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
