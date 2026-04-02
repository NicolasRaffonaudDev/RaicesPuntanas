# Bitacora del Proyecto

Formato por entrada:
- Fecha
- Feature implementada
- Que se hizo
- Que se aprendio (enfoque pedagogico)
- Proximos pasos
- Uso para cliente (impacto)

---

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
