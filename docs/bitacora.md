# Bitacora del Proyecto

Formato por entrada:
- Fecha
- Feature implementada
- Que se hizo
- Que se aprendio (enfoque pedagogico)
- Proximos pasos
- Uso para cliente (impacto)

---

## 2026-04-13 - Estadisticas de consultas en admin
- Feature implementada:
  - Endpoint `/api/inquiries/stats` con conteos por estado.
  - Contadores visibles en el panel admin (total, pendientes, leidas).
- Que se hizo:
  - Backend agrega conteos eficientes con Prisma.
  - Frontend consume stats con React Query y actualiza al cambiar estado.
- Que se aprendio (enfoque pedagogico):
  - Es mejor contar en backend para evitar traer listas completas.
  - Las invalidaciones de cache mantienen datos derivados consistentes.
- Proximos pasos:
  - Agregar filtros avanzados (fecha/texto).
  - Permitir volver a "pending".
- Uso para cliente (impacto):
  - El admin entiende volumen operativo de un vistazo.

## 2026-04-02 - Filtro por estado en consultas
- Feature implementada:
  - Filtro por estado (todas, pendientes, leidas) en `/admin/inquiries`.
  - URL como fuente de verdad con `?status=pending|read`.
- Que se hizo:
  - Backend agrega `status` en query para listado y conteo.
  - Frontend sincroniza filtro en React Query y botones de UI.
- Que se aprendio (enfoque pedagogico):
  - Los filtros en URL mejoran el shareability y la persistencia del estado.
  - React Query permite cachear por clave sin duplicar estados.
- Proximos pasos:
  - Agregar contadores por estado.
  - Permitir volver a "pending" desde la UI.
- Uso para cliente (impacto):
  - El admin puede revisar pendientes rapidamente y compartir el enlace filtrado.

## 2026-04-01 - Busqueda local y limpieza masiva en favoritos
- Feature implementada:
  - Busqueda local en `/favoritos` por titulo y direccion.
  - Boton "Limpiar favoritos" con confirmacion.
- Que se hizo:
  - Filtro en memoria con `useMemo` para mantener rendimiento.
  - Resumen de resultados y mensajes de vacio segun busqueda.
- Que se aprendio (enfoque pedagogico):
  - Filtros client-side funcionan bien cuando el dataset es pequeno y local.
  - Filtros server-side son mejores cuando la data es grande o compartida.
- Proximos pasos:
  - Evaluar sincronizacion opcional con backend para multi-dispositivo.
  - Agregar ordenamiento local si la lista crece.
- Uso para cliente (impacto):
  - El usuario puede encontrar y limpiar favoritos sin salir de la vista.

## 2026-04-01 - Comparador visual mejorado
- Feature implementada:
  - Tabla comparativa con precio, tamano, direccion y amenities.
  - Resaltado del menor precio y mayor tamano.
  - Acciones para quitar items y limpiar comparador.
- Que se hizo:
  - Calculos derivados con `useMemo` para valores extremos.
  - Componentes `CompareTable` y `CompareRow` para orden y claridad.
- Que se aprendio (enfoque pedagogico):
  - Como comparar datasets en frontend sin duplicar render.
  - Uso de `useMemo` para datos derivados y performance.
- Proximos pasos:
  - Agregar comparacion visual de valores distintos por columna.
  - Mostrar links directos a contacto desde la tabla.
- Uso para cliente (impacto):
  - Decisiones mas rapidas al ver diferencias clave en una sola vista.

## 2026-04-01 - Contacto por lote con modal
- Feature implementada:
  - Boton "Consultar" en cards y comparador.
  - Modal reutilizable con formulario y validaciones basicas.
- Que se hizo:
  - Mensaje prellenado con datos del lote.
  - Envio simulado con feedback de exito y loading.
- Que se aprendio (enfoque pedagogico):
  - Estructurar modales reutilizables con props y estado local.
  - Validaciones minimas para UX clara sin backend.
- Proximos pasos:
  - Integrar envio real con endpoint de consultas.
  - Agregar tracking de conversion de consultas.
- Uso para cliente (impacto):
  - El usuario puede iniciar una consulta sin salir del listado o comparador.

## 2026-04-01 - Consultas persistentes (leads)
- Feature implementada:
  - Endpoint `POST /api/inquiries` con validacion.
  - Persistencia en DB con modelo `Inquiry`.
  - Modal de contacto conectado a backend real.
- Que se hizo:
  - Prisma modela consultas con relacion a `Lote`.
  - Frontend envia datos reales en lugar de simulacion.
- Que se aprendio (enfoque pedagogico):
  - Integracion fullstack: formulario -> API -> DB.
  - Importancia de validar en cliente y servidor.
- Proximos pasos:
  - Panel admin para listar consultas.
  - Notificaciones por email.
- Uso para cliente (impacto):
  - Las consultas quedan registradas para seguimiento comercial.

## 2026-04-01 - Panel admin de consultas
- Feature implementada:
  - Vista `/admin/inquiries` con listado paginado.
  - Tabla con datos de cliente, mensaje, lote y fecha.
- Que se hizo:
  - Hook `useInquiries` con React Query.
  - Componentes de tabla reutilizables.
- Que se aprendio (enfoque pedagogico):
  - Como construir paneles administrativos con paginacion real.
  - Separacion de datos (hook) y presentacion (tabla).
- Proximos pasos:
  - Agregar filtros por estado o busqueda.
  - Marcar consultas como leidas.
- Uso para cliente (impacto):
  - El admin puede revisar leads desde el panel sin ir a la DB.

## 2026-04-01 - Estado de consultas (pending/read)
- Feature implementada:
  - Campo `status` en `Inquiry` con valores pending/read.
  - Accion "Marcar como leido" con actualizacion optimista.
- Que se hizo:
  - Endpoint `PATCH /api/inquiries/:id/status`.
  - UI con badge de estado y actualizacion inmediata.
- Que se aprendio (enfoque pedagogico):
  - Manejo de estados en entidades con actualizacion parcial.
  - Optimistic updates con React Query.
- Proximos pasos:
  - Filtros por estado y notificaciones.
- Uso para cliente (impacto):
  - El admin puede organizar consultas leidas vs pendientes.

## 2026-04-01 - Vista de favoritos + documentacion
- Feature implementada:
  - Vista "Mis favoritos" consumiendo `getLotesByIds`.
  - Favoritos persistidos en `localStorage`.
  - Navegacion directa desde navbar.
- Que se hizo:
  - Nueva pagina `/favoritos` con estados de carga, error y vacio.
  - Reutilizacion de `LotCard` y highlight de busqueda si existe `q`.
  - Documentacion actualizada en README y bitacora.
- Que se aprendio (enfoque pedagogico):
  - Como reutilizar estado local para vistas derivadas sin duplicar logica.
  - Importancia de usar IDs como fuente de verdad y luego hidratar datos.
  - Buenas practicas para estados vacios con CTA claro.
- Proximos pasos:
  - Permitir buscar dentro de favoritos (filtro local opcional).
  - Sincronizar favoritos con backend si se requiere multi-dispositivo.
- Uso para cliente (impacto):
  - El usuario puede guardar lotes y consultarlos rapido desde "Mis favoritos".
