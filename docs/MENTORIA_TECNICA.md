# Mentoria Tecnica - Raices Puntanas

## 1) Objetivo de este documento
Este archivo es tu guia de aprendizaje dentro del proyecto. Resume:
- que hace cada modulo,
- por que se implemento de esa forma,
- como extenderlo sin romper calidad.

Meta del proyecto: una web comercial operativa, segura, escalable y mantenible para un cliente real.

## 2) Arquitectura general
### Frontend
- Stack: React + TypeScript + Vite.
- Patron: UI por paginas + componentes reutilizables + servicios API tipados.
- Clave tecnica:
  - rutas lazy-loaded para bajar peso inicial,
  - separacion por dominios (`pages`, `components`, `services`, `types`, `context`).

### Backend
- Stack: Node.js + Express + Prisma + PostgreSQL.
- Patron por capas:
  - `routes`: define endpoints y permisos.
  - `controllers`: adapta request/response.
  - `services`: reglas de negocio.
  - `repositories`: acceso a datos.
- Seguridad:
  - JWT con refresh token rotativo,
  - RBAC por permisos,
  - validacion de payload con Zod,
  - rate limiting + helmet.

## 3) Frontend por modulo (que hace y por que)
### `src/App.tsx`
- Define rutas y `ProtectedRoute`.
- Usa `React.lazy` + `Suspense`.
- Razon: reducir carga inicial y escalar rutas sin bloquear toda la app.

### `src/routes/lazy-pages.ts` + `src/utils/lazyWithPreload.ts`
- Centraliza paginas lazy y su metodo `preload`.
- Razon:
  - mantener code splitting,
  - habilitar prefetch controlado para rutas de alto uso.

### `src/context/AuthContext.tsx`
- Maneja sesion, login/register/logout, refresh periodico.
- Razon: centralizar estado de autenticacion y evitar logica duplicada.

### `src/components/NavBar/NavBar.tsx`
- Navegacion por rol + contador de consultas pendientes.
- Prefetch de rutas criticas por `hover/focus` y en `idle`.
- Razon: UX orientada a operacion diaria (admin/empleado).

### `src/pages/Lotes.tsx`
- Listado comercial: filtros, orden, favoritos, comparador (hasta 3).
- Razon: acelerar descubrimiento y decision del usuario.

### `src/pages/CompararLotes.tsx`
- Vista comparativa + mapa global + CTA a consulta.
- Razon: convertir comparacion en accion comercial.

### `src/components/MapView/MapView.tsx`
- Mapa liviano por defecto + interactivo bajo demanda.
- Razon: rendimiento y estabilidad (evitar cargar scripts pesados en cada card).

### `src/pages/Contact.tsx`
- Crea consultas autenticadas, con validacion y lote opcional.
- Razon: canal claro de contacto ligado al interes comercial.

### `src/pages/MiPanelUsuario.tsx`
- Usuario ve favoritos, consultas y respuestas visibles.
- Razon: transparencia y seguimiento del estado comercial.

### `src/pages/ConsultasInbox.tsx`
- Admin/empleado gestionan consultas, estados, seguimientos y plantillas.
- Razon: flujo operativo de atencion al cliente con trazabilidad.

### `src/pages/GestionComercial.tsx`
- Modulo operativo (clientes, productos, ventas, inventario, usuarios, auditoria).
- Razon: backoffice unificado.

### `src/services/authApi.ts` y `src/services/commercialApi.ts`
- Capa unica de llamadas HTTP, tipada.
- Razon: desacoplar UI de detalles API.

## 4) Backend por modulo (que hace y por que)
### Auth
- Archivos: `auth-routes`, `auth-controller`, `auth-service`, `auth-schema`.
- Funcion: registro/login/refresh/logout/setup-admin/password-reset.
- Razon: separar autenticacion de la logica comercial.

### Consultas y seguimiento
- Archivos: `consulta-*`, `favorito-*`.
- Funcion:
  - usuario crea consultas,
  - admin/empleado gestionan estado,
  - seguimiento interno y visible,
  - envio de email para seguimiento visible.
- Razon: CRM basico trazable y accionable.

### Comercial core
- Archivos: `cliente-*`, `producto-*`, `venta-*`, `inventario-*`.
- Funcion: operaciones comerciales base.
- Razon: cubrir flujo real de negocio.

### Auditoria
- Archivos: `audit-*`.
- Funcion: registrar acciones criticas.
- Razon: observabilidad, soporte y control operativo.

## 5) Modelo de datos (resumen mental)
- `User`: identidad + rol.
- `Cliente`, `Producto`, `Venta`, `InventarioMovimiento`: nucleo comercial.
- `Lote`, `LoteFavorito`, `Consulta`, `ConsultaSeguimiento`: experiencia inmobiliaria + CRM.
- `AuditLog`, `RefreshToken`: seguridad y trazabilidad.

## 6) Flujos clave (end-to-end)
### Flujo A: Interes comercial de usuario
1. Usuario navega lotes y compara.
2. Usuario crea consulta desde contacto/comparador.
3. Admin/empleado responde desde inbox.
4. Usuario ve respuesta en su panel.

### Flujo B: Operacion interna
1. Empleado/admin gestiona clientes/productos/ventas/inventario.
2. Sistema audita eventos.
3. Admin revisa auditoria y roles.

## 7) Calidad y DevOps
- CI con jobs separados: `build`, `smoke`, `e2e`.
- E2E con Playwright.
- Smoke backend por roles.
- Convencion de commits: `feat`, `test`, `docs`, `ci`, `perf`.

## 8) Convenciones para que el proyecto siga sano
1. Cada feature debe cerrar con:
- implementacion,
- pruebas (minimo smoke/E2E segun impacto),
- doc corta de uso.
2. No mezclar cambios de dominios distintos en un solo commit.
3. Mantener permisos por rol en frontend y backend.
4. Priorizar claridad de nombres y tipos antes que "atajos".

## 9) Roadmap de aprendizaje recomendado (tu ruta)
1. Dominio de TypeScript en UI:
- tipos de respuesta API,
- narrowing,
- contratos UI <-> backend.
2. Backend por capas:
- reglas en `services`,
- endpoints delgados.
3. Seguridad:
- JWT lifecycle,
- RBAC/ABAC,
- hardening de endpoints.
4. Performance:
- lazy loading,
- chunking,
- profiling de render.
5. Operacion real:
- CI/CD,
- logs y alertas,
- despliegue reproducible.

## 10) Como usar este documento en cada iteracion
- Antes de codear: define objetivo funcional + criterio de exito.
- Durante: valida que respeta arquitectura y seguridad.
- Al cerrar: agrega breve nota de "que cambio y por que".
