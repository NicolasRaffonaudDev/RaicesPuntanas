# QA Pre-Entrega

## Objetivo
Checklist funcional y operativa para validar demo con cliente sin introducir cambios de arquitectura.

## 1) Checklist Publico
- [ ] Home carga sin errores visuales ni de consola.
- [ ] Seccion de lotes destacados visible y con CTA funcional.
- [ ] Listado de lotes carga datos reales (`/lotes`).
- [ ] Card de lote muestra imagen/placeholder correcto.
- [ ] `Ver detalle` abre `/lotes/:id`.
- [ ] Galeria en detalle cambia imagen principal al clickear miniatura.
- [ ] CTA `Consultar por este lote` abre modal.
- [ ] Links de contacto rapido (WhatsApp / Email / Instagram) funcionan.
- [ ] Mapa en detalle se renderiza y `Abrir en Google Maps` funciona.
- [ ] Pagina de contacto envia consulta cuando hay sesion.

## 2) Checklist Usuario Autenticado
- [ ] Login funciona.
- [ ] Register funciona.
- [ ] Favoritos: agregar/quitar desde cards.
- [ ] Vista `/favoritos` carga lotes guardados.
- [ ] `Mi panel` carga datos sin errores.
- [ ] `Seguridad` permite `Cerrar todas las sesiones`.
- [ ] Logout devuelve a flujo publico correctamente.

## 3) Checklist Admin
- [ ] Dashboard carga KPIs sin errores.
- [ ] Lotes CRUD completo (crear, editar, eliminar).
- [ ] Upload de imagen (1 y multiples) funciona.
- [ ] Marcar portada/eliminar imagen en galeria admin funciona.
- [ ] `Destacado` persiste y se refleja en Home.
- [ ] Consultas CRM lista y filtros funcionan.
- [ ] Modulo legacy (`/admin/inquiries`) accesible solo admin.
- [ ] Gestion comercial: clientes, productos, ventas, inventario.
- [ ] Usuarios y auditoria visibles solo admin.

## 4) Checklist Deploy / API
- [ ] `GET BACKEND_URL/health` => 200
- [ ] `GET BACKEND_URL/api/lotes?limit=1` => 200
- [ ] `GET FRONTEND_URL/nginx-health` => 200
- [ ] `GET FRONTEND_URL/api/lotes?limit=1` => 200
- [ ] `GET BACKEND_URL/health/details` => estado operativo esperado

## 5) Checklist Demo Cliente
- [ ] Recorrido publico: Home -> Lotes -> Detalle -> Contacto
- [ ] Recorrido usuario: Login -> Favoritos -> Mi panel
- [ ] Recorrido admin: Dashboard -> Lotes -> Consultas CRM
- [ ] Mostrar runbook y smoke para confianza operativa

## 6) Comandos utiles
```bash
npm run build
npm run smoke:railway
```

## 7) URLs staging (default)
- Frontend: https://frontend-production-1cb7e.up.railway.app
- Backend: https://backend-production-a499.up.railway.app

## 8) Endpoints health
- https://backend-production-a499.up.railway.app/health
- https://backend-production-a499.up.railway.app/health/details
- https://frontend-production-1cb7e.up.railway.app/nginx-health
