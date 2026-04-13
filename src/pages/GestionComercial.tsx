import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import { API_ORIGIN } from "../services/apiClient";
import type { SystemUser, UserRole } from "../types/auth";
import { hasPermission } from "../utils/permissions";
import type {
  AuditEntry,
  Cliente,
  InventarioMovimiento,
  Pagination,
  Producto,
  Venta,
} from "../types/commercial";

type Tab = "clientes" | "productos" | "ventas" | "inventario" | "usuarios" | "auditoria";

interface ConfirmState {
  type: "cliente" | "producto";
  id: string | number;
  label: string;
}

const defaultPagination: Pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };

const validTabs: Tab[] = ["clientes", "productos", "ventas", "inventario", "usuarios", "auditoria"];

const resolveTab = (value: string | null): Tab => {
  if (value && validTabs.includes(value as Tab)) {
    return value as Tab;
  }
  return "clientes";
};

const GestionComercial: React.FC = () => {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState<Tab>(() => resolveTab(searchParams.get("tab")));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [movimientos, setMovimientos] = useState<InventarioMovimiento[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [audits, setAudits] = useState<AuditEntry[]>([]);

  const [clientesPagination, setClientesPagination] = useState<Pagination>(defaultPagination);
  const [productosPagination, setProductosPagination] = useState<Pagination>(defaultPagination);
  const [ventasPagination, setVentasPagination] = useState<Pagination>(defaultPagination);
  const [movimientosPagination, setMovimientosPagination] = useState<Pagination>(defaultPagination);
  const [usersPagination, setUsersPagination] = useState<Pagination>(defaultPagination);
  const [auditsPagination, setAuditsPagination] = useState<Pagination>(defaultPagination);

  const [searchCliente, setSearchCliente] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [searchVenta, setSearchVenta] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchAudit, setSearchAudit] = useState("");

  const [clientePage, setClientePage] = useState(1);
  const [productoPage, setProductoPage] = useState(1);
  const [ventaPage, setVentaPage] = useState(1);
  const [movPage, setMovPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  const [onlyActive, setOnlyActive] = useState(true);
  const [lowStock, setLowStock] = useState(false);

  const [ventaFrom, setVentaFrom] = useState("");
  const [ventaTo, setVentaTo] = useState("");
  const [movFrom, setMovFrom] = useState("");
  const [movTo, setMovTo] = useState("");
  const [movTipo, setMovTipo] = useState<"" | "entrada" | "salida" | "ajuste">("");
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [auditUserId, setAuditUserId] = useState("");

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const [clienteForm, setClienteForm] = useState({ nombre: "", email: "", telefono: "" });
  const [productoForm, setProductoForm] = useState({ nombre: "", sku: "", precio: "", stock: "" });
  const [ventaForm, setVentaForm] = useState({ clienteId: "", productoId: "", cantidad: "1" });
  const [movForm, setMovForm] = useState({ productoId: "", tipo: "entrada", cantidad: "1", motivo: "" });

  const [editingClienteId, setEditingClienteId] = useState<string | null>(null);
  const [editingClienteForm, setEditingClienteForm] = useState({ nombre: "", email: "", telefono: "" });
  const [editingProductoId, setEditingProductoId] = useState<number | null>(null);
  const [editingProductoForm, setEditingProductoForm] = useState({ nombre: "", precio: "", stock: "", activo: true });
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "", role: "usuario" as UserRole });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const can = useCallback((permission: string) => hasPermission(user?.role, permission), [user?.role]);

  const searchKey = searchParams.toString();

  useEffect(() => {
    const nextTab = resolveTab(searchParams.get("tab"));
    setTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [searchKey]);

  useEffect(() => {
    const current = searchParams.get("tab");
    if (current === tab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    if (nextParams.toString() === searchParams.toString()) return;
    if (import.meta.env.DEV) {
      console.log("NAVIGATE SYNC", {
        pathname: window.location.pathname,
        from: searchParams.toString(),
        to: nextParams.toString(),
      });
    }
    setSearchParams(nextParams, { replace: true });
  }, [tab, searchKey, setSearchParams]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const loadClientes = useCallback(async () => {
    if (!token) return;
    const result = await commercialApi.listClientes(token, { page: clientePage, limit: 10, search: searchCliente });
    setClientes(result.data);
    setClientesPagination(result.pagination);
  }, [token, clientePage, searchCliente]);

  const loadProductos = useCallback(async () => {
    if (!token) return;
    const result = await commercialApi.listProductos(token, {
      page: productoPage,
      limit: 10,
      search: searchProducto,
      onlyActive,
      lowStock,
    });
    setProductos(result.data);
    setProductosPagination(result.pagination);
  }, [token, productoPage, searchProducto, onlyActive, lowStock]);

  const loadVentas = useCallback(async () => {
    if (!token) return;
    const result = await commercialApi.listVentas(token, {
      page: ventaPage,
      limit: 10,
      search: searchVenta,
      from: ventaFrom || undefined,
      to: ventaTo || undefined,
    });
    setVentas(result.data);
    setVentasPagination(result.pagination);
  }, [token, ventaPage, searchVenta, ventaFrom, ventaTo]);

  const loadMovimientos = useCallback(async () => {
    if (!token) return;
    const result = await commercialApi.listMovimientos(token, {
      page: movPage,
      limit: 10,
      tipo: movTipo || undefined,
      from: movFrom || undefined,
      to: movTo || undefined,
    });
    setMovimientos(result.data);
    setMovimientosPagination(result.pagination);
  }, [token, movPage, movTipo, movFrom, movTo]);

  const loadUsers = useCallback(async () => {
    if (!token || !hasPermission(user?.role, "users.read")) return;
    const result = await commercialApi.listUsers(token, {
      page: userPage,
      limit: 10,
      search: searchUser,
    });
    setUsers(result.data);
    setUsersPagination(result.pagination);
  }, [token, userPage, searchUser, user?.role]);

  const loadAudits = useCallback(async () => {
    if (!token || !hasPermission(user?.role, "audit.read")) return;
    const result = await commercialApi.listAudit(token, {
      page: auditPage,
      limit: 10,
      search: searchAudit,
      action: auditAction || undefined,
      userId: auditUserId || undefined,
      from: auditFrom || undefined,
      to: auditTo || undefined,
    });
    setAudits(result.data);
    setAuditsPagination(result.pagination);
  }, [token, auditPage, searchAudit, auditAction, auditUserId, auditFrom, auditTo, user?.role]);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const tasks = [loadClientes(), loadProductos(), loadVentas(), loadMovimientos()];
      if (hasPermission(user?.role, "users.read")) tasks.push(loadUsers());
      if (hasPermission(user?.role, "audit.read")) tasks.push(loadAudits());
      await Promise.all(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar datos");
    } finally {
      setLoading(false);
    }
  }, [loadClientes, loadProductos, loadVentas, loadMovimientos, loadUsers, loadAudits, user?.role]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const socket = io(API_ORIGIN, { transports: ["polling"] });

    socket.on("audit:created", () => {
      void refreshAll();
    });

    return () => {
      socket.disconnect();
    };
  }, [refreshAll]);

  const ventasTotal = useMemo(() => ventas.reduce((acc, venta) => acc + venta.total, 0), [ventas]);

  const validateClienteForm = () => {
    const errs: Record<string, string> = {};
    if (!clienteForm.nombre.trim()) errs.clienteNombre = "Nombre requerido";
    if (clienteForm.email && !clienteForm.email.includes("@")) errs.clienteEmail = "Email invalido";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateProductoForm = () => {
    const errs: Record<string, string> = {};
    if (!productoForm.nombre.trim()) errs.productoNombre = "Nombre requerido";
    if (!productoForm.sku.trim()) errs.productoSku = "SKU requerido";
    if (Number(productoForm.precio) <= 0) errs.productoPrecio = "Precio invalido";
    if (Number(productoForm.stock) < 0) errs.productoStock = "Stock invalido";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !validateClienteForm()) return;

    try {
      await commercialApi.createCliente(token, {
        nombre: clienteForm.nombre,
        email: clienteForm.email || undefined,
        telefono: clienteForm.telefono || undefined,
      });
      setClienteForm({ nombre: "", email: "", telefono: "" });
      showToast("Cliente creado");
      await loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando cliente");
    }
  };

  const submitProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !validateProductoForm()) return;

    try {
      await commercialApi.createProducto(token, {
        nombre: productoForm.nombre,
        sku: productoForm.sku,
        precio: Number(productoForm.precio),
        stock: Number(productoForm.stock),
      });
      setProductoForm({ nombre: "", sku: "", precio: "", stock: "" });
      showToast("Producto creado");
      await loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando producto");
    }
  };

  const submitVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await commercialApi.createVenta(token, {
        clienteId: ventaForm.clienteId || undefined,
        items: [{ productoId: Number(ventaForm.productoId), cantidad: Number(ventaForm.cantidad) }],
      });
      setVentaForm({ clienteId: "", productoId: "", cantidad: "1" });
      showToast("Venta registrada");
      await Promise.all([loadVentas(), loadProductos(), loadMovimientos()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error registrando venta");
    }
  };

  const submitMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await commercialApi.createMovimiento(token, {
        productoId: Number(movForm.productoId),
        tipo: movForm.tipo as "entrada" | "salida" | "ajuste",
        cantidad: Number(movForm.cantidad),
        motivo: movForm.motivo || undefined,
      });
      setMovForm({ productoId: "", tipo: "entrada", cantidad: "1", motivo: "" });
      showToast("Movimiento registrado");
      await Promise.all([loadMovimientos(), loadProductos()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error registrando movimiento");
    }
  };

  const submitEditCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingClienteId) return;

    await commercialApi.updateCliente(token, editingClienteId, {
      nombre: editingClienteForm.nombre,
      email: editingClienteForm.email || undefined,
      telefono: editingClienteForm.telefono || undefined,
    });

    setEditingClienteId(null);
    showToast("Cliente actualizado");
    await loadClientes();
  };

  const submitEditProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || editingProductoId === null) return;

    await commercialApi.updateProducto(token, editingProductoId, {
      nombre: editingProductoForm.nombre,
      precio: Number(editingProductoForm.precio),
      stock: Number(editingProductoForm.stock),
      activo: editingProductoForm.activo,
    });

    setEditingProductoId(null);
    showToast("Producto actualizado");
    await loadProductos();
  };

  const confirmDelete = async () => {
    if (!token || !confirmState) return;

    try {
      if (confirmState.type === "cliente") {
        await commercialApi.deleteCliente(token, String(confirmState.id));
        await loadClientes();
      }
      if (confirmState.type === "producto") {
        await commercialApi.deleteProducto(token, Number(confirmState.id));
        await loadProductos();
      }
      showToast("Registro eliminado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setConfirmState(null);
    }
  };

  const handleRoleChange = async (targetUserId: string, role: UserRole) => {
    if (!token || !can("users.manage")) return;

    try {
      await commercialApi.updateUserRole(token, targetUserId, role);
      showToast("Rol actualizado");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar rol");
    }
  };

  const createUserByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !can("users.manage")) return;

    try {
      await commercialApi.createUser(token, newUserForm);
      setNewUserForm({ name: "", email: "", password: "", role: "usuario" });
      showToast("Usuario creado");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear usuario");
    }
  };

  const exportAuditCsv = () => {
    const header = ["fecha", "accion", "usuario", "email", "rol", "meta"];
    const rows = audits.map((entry) => [
      new Date(entry.createdAt).toISOString(),
      entry.action,
      entry.user?.name || "",
      entry.user?.email || "",
      entry.user?.role || "",
      entry.meta ? JSON.stringify(entry.meta).replaceAll("\"", "'") : "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((field) => `"${String(field ?? "").replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria-raices-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderPagination = (pagination: Pagination, onPageChange: (next: number) => void) => (
    <div className="flex items-center justify-end gap-2 text-sm">
      <button className="btn btn-outline" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} type="button">Anterior</button>
      <span>
        Pagina {pagination.page} de {pagination.totalPages}
      </span>
      <button className="btn btn-outline" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)} type="button">Siguiente</button>
    </div>
  );

  return (
    <section className="page">
      <div className="container space-y-4">
        <PageHeader
          compact
          eyebrow="Modulo de gestion"
          title="Gestion Comercial Pro"
          description="Centro operativo para administrar clientes, productos, ventas, inventario y vistas avanzadas de gestion segun el rol activo."
          meta={(
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-black/25 px-3 py-1.5">
              <span className="text-[var(--color-text-muted)]">Rol activo</span>
              <span className="capitalize font-medium text-[var(--color-primary)]">{user?.role}</span>
              <span className="text-[rgba(255,255,255,0.28)]">/</span>
              <span className="text-white">Vista multipanel</span>
            </div>
          )}
        />

        {loading && <p className="text-sm text-[var(--color-text-muted)]">Actualizando datos...</p>}
        {error && <p className="rounded border border-red-700 bg-red-900/25 p-2 text-sm text-red-300">{error}</p>}
        {toast && <p className="rounded border border-emerald-700 bg-emerald-900/25 p-2 text-sm text-emerald-300">{toast}</p>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="card p-3">Clientes: {clientesPagination.total}</div>
          <div className="card p-3">Productos: {productosPagination.total}</div>
          <div className="card p-3">Ventas: {ventasPagination.total}</div>
          <div className="card p-3">Facturacion vista: ${ventasTotal.toLocaleString("es-AR")}</div>
        </div>

        <div className="card flex flex-wrap gap-2 p-2">
          <button className={`btn text-sm ${tab === "clientes" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("clientes")} type="button">Clientes</button>
          <button className={`btn text-sm ${tab === "productos" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("productos")} type="button">Productos</button>
          <button className={`btn text-sm ${tab === "ventas" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("ventas")} type="button">Ventas</button>
          <button className={`btn text-sm ${tab === "inventario" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("inventario")} type="button">Inventario</button>
          {can("users.read") && (
            <button className={`btn text-sm ${tab === "usuarios" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("usuarios")} type="button">Usuarios</button>
          )}
          {can("audit.read") && (
            <button className={`btn text-sm ${tab === "auditoria" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("auditoria")} type="button">Auditoria</button>
          )}
        </div>

        {tab === "clientes" && (
          <div className="space-y-3">
            <form className="card grid gap-2 p-4 md:grid-cols-4" onSubmit={submitCliente}>
              <input className="field" placeholder="Nombre" value={clienteForm.nombre} onChange={(e) => setClienteForm((p) => ({ ...p, nombre: e.target.value }))} />
              <input className="field" placeholder="Email" value={clienteForm.email} onChange={(e) => setClienteForm((p) => ({ ...p, email: e.target.value }))} />
              <input className="field" placeholder="Telefono" value={clienteForm.telefono} onChange={(e) => setClienteForm((p) => ({ ...p, telefono: e.target.value }))} />
              <button className="btn btn-primary" type="submit">Crear cliente</button>
              {formErrors.clienteNombre && <p className="text-xs text-red-400">{formErrors.clienteNombre}</p>}
              {formErrors.clienteEmail && <p className="text-xs text-red-400">{formErrors.clienteEmail}</p>}
            </form>

            <input className="field" placeholder="Buscar clientes..." value={searchCliente} onChange={(e) => { setSearchCliente(e.target.value); setClientePage(1); }} />

            <div className="card overflow-auto p-3">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Telefono</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-t border-[var(--color-border)]">
                      <td className="p-2">{cliente.nombre}</td>
                      <td className="p-2">{cliente.email || "-"}</td>
                      <td className="p-2">{cliente.telefono || "-"}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button className="btn btn-outline text-xs" onClick={() => { setEditingClienteId(cliente.id); setEditingClienteForm({ nombre: cliente.nombre, email: cliente.email || "", telefono: cliente.telefono || "" }); }} type="button">Editar</button>
                          {can("clientes.delete") && <button className="btn btn-outline text-xs" onClick={() => setConfirmState({ type: "cliente", id: cliente.id, label: cliente.nombre })} type="button">Eliminar</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(clientesPagination, setClientePage)}

            {editingClienteId && (
              <form className="card grid gap-2 p-4 md:grid-cols-4" onSubmit={submitEditCliente}>
                <input className="field" value={editingClienteForm.nombre} onChange={(e) => setEditingClienteForm((p) => ({ ...p, nombre: e.target.value }))} />
                <input className="field" value={editingClienteForm.email} onChange={(e) => setEditingClienteForm((p) => ({ ...p, email: e.target.value }))} />
                <input className="field" value={editingClienteForm.telefono} onChange={(e) => setEditingClienteForm((p) => ({ ...p, telefono: e.target.value }))} />
                <div className="flex gap-2">
                  <button className="btn btn-primary" type="submit">Guardar</button>
                  <button className="btn btn-outline" onClick={() => setEditingClienteId(null)} type="button">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === "productos" && (
          <div className="space-y-3">
            <form className="card grid gap-2 p-4 md:grid-cols-5" onSubmit={submitProducto}>
              <input className="field" placeholder="Nombre" value={productoForm.nombre} onChange={(e) => setProductoForm((p) => ({ ...p, nombre: e.target.value }))} />
              <input className="field" placeholder="SKU" value={productoForm.sku} onChange={(e) => setProductoForm((p) => ({ ...p, sku: e.target.value }))} />
              <input className="field" type="number" placeholder="Precio" value={productoForm.precio} onChange={(e) => setProductoForm((p) => ({ ...p, precio: e.target.value }))} />
              <input className="field" type="number" placeholder="Stock" value={productoForm.stock} onChange={(e) => setProductoForm((p) => ({ ...p, stock: e.target.value }))} />
              <button className="btn btn-primary" type="submit">Crear producto</button>
              {formErrors.productoNombre && <p className="text-xs text-red-400">{formErrors.productoNombre}</p>}
              {formErrors.productoSku && <p className="text-xs text-red-400">{formErrors.productoSku}</p>}
              {formErrors.productoPrecio && <p className="text-xs text-red-400">{formErrors.productoPrecio}</p>}
              {formErrors.productoStock && <p className="text-xs text-red-400">{formErrors.productoStock}</p>}
            </form>

            <div className="card grid gap-2 p-3 md:grid-cols-4">
              <input className="field" placeholder="Buscar productos..." value={searchProducto} onChange={(e) => { setSearchProducto(e.target.value); setProductoPage(1); }} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />Solo activos</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />Stock bajo</label>
              <button className="btn btn-outline" type="button" onClick={() => { setOnlyActive(true); setLowStock(false); setSearchProducto(""); setProductoPage(1); }}>Limpiar filtros</button>
            </div>

            <div className="card overflow-auto p-3">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Precio</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-t border-[var(--color-border)]">
                      <td className="p-2">{producto.nombre}</td>
                      <td className="p-2">{producto.sku}</td>
                      <td className="p-2">${producto.precio.toLocaleString("es-AR")}</td>
                      <td className="p-2">{producto.stock}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button className="btn btn-outline text-xs" onClick={() => { setEditingProductoId(producto.id); setEditingProductoForm({ nombre: producto.nombre, precio: String(producto.precio), stock: String(producto.stock), activo: producto.activo }); }} type="button">Editar</button>
                          {can("productos.delete") && <button className="btn btn-outline text-xs" type="button" onClick={() => setConfirmState({ type: "producto", id: producto.id, label: producto.nombre })}>Eliminar</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(productosPagination, setProductoPage)}

            {editingProductoId !== null && (
              <form className="card grid gap-2 p-4 md:grid-cols-5" onSubmit={submitEditProducto}>
                <input className="field" value={editingProductoForm.nombre} onChange={(e) => setEditingProductoForm((p) => ({ ...p, nombre: e.target.value }))} />
                <input className="field" type="number" value={editingProductoForm.precio} onChange={(e) => setEditingProductoForm((p) => ({ ...p, precio: e.target.value }))} />
                <input className="field" type="number" value={editingProductoForm.stock} onChange={(e) => setEditingProductoForm((p) => ({ ...p, stock: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingProductoForm.activo} onChange={(e) => setEditingProductoForm((p) => ({ ...p, activo: e.target.checked }))} />Activo</label>
                <div className="flex gap-2">
                  <button className="btn btn-primary" type="submit">Guardar</button>
                  <button className="btn btn-outline" type="button" onClick={() => setEditingProductoId(null)}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === "ventas" && (
          <div className="space-y-3">
            <form className="card grid gap-2 p-4 md:grid-cols-4" onSubmit={submitVenta}>
              <select className="field" value={ventaForm.clienteId} onChange={(e) => setVentaForm((p) => ({ ...p, clienteId: e.target.value }))}>
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}
              </select>
              <select className="field" value={ventaForm.productoId} onChange={(e) => setVentaForm((p) => ({ ...p, productoId: e.target.value }))}>
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => <option key={producto.id} value={producto.id}>{producto.nombre} ({producto.stock})</option>)}
              </select>
              <input className="field" type="number" min={1} value={ventaForm.cantidad} onChange={(e) => setVentaForm((p) => ({ ...p, cantidad: e.target.value }))} />
              <button className="btn btn-primary" type="submit">Registrar venta</button>
            </form>

            <div className="card grid gap-2 p-3 md:grid-cols-4">
              <input className="field" placeholder="Buscar venta..." value={searchVenta} onChange={(e) => { setSearchVenta(e.target.value); setVentaPage(1); }} />
              <input className="field" type="date" value={ventaFrom} onChange={(e) => { setVentaFrom(e.target.value); setVentaPage(1); }} />
              <input className="field" type="date" value={ventaTo} onChange={(e) => { setVentaTo(e.target.value); setVentaPage(1); }} />
              <button className="btn btn-outline" type="button" onClick={() => { setSearchVenta(""); setVentaFrom(""); setVentaTo(""); setVentaPage(1); }}>Limpiar filtros</button>
            </div>

            <div className="card overflow-auto p-3">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Cliente</th>
                    <th className="p-2">Items</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="border-t border-[var(--color-border)]">
                      <td className="p-2">{new Date(venta.createdAt).toLocaleString("es-AR")}</td>
                      <td className="p-2">{venta.cliente?.nombre || "Sin cliente"}</td>
                      <td className="p-2">{venta.items.map((item) => `${item.producto.nombre} x${item.cantidad}`).join(", ")}</td>
                      <td className="p-2">${venta.total.toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(ventasPagination, setVentaPage)}
          </div>
        )}

        {tab === "inventario" && (
          <div className="space-y-3">
            <form className="card grid gap-2 p-4 md:grid-cols-5" onSubmit={submitMovimiento}>
              <select className="field" value={movForm.productoId} onChange={(e) => setMovForm((p) => ({ ...p, productoId: e.target.value }))}>
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => <option key={producto.id} value={producto.id}>{producto.nombre}</option>)}
              </select>
              <select className="field" value={movForm.tipo} onChange={(e) => setMovForm((p) => ({ ...p, tipo: e.target.value }))}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <input className="field" type="number" min={1} value={movForm.cantidad} onChange={(e) => setMovForm((p) => ({ ...p, cantidad: e.target.value }))} />
              <input className="field" placeholder="Motivo" value={movForm.motivo} onChange={(e) => setMovForm((p) => ({ ...p, motivo: e.target.value }))} />
              <button className="btn btn-primary" type="submit">Registrar movimiento</button>
            </form>

            <div className="card grid gap-2 p-3 md:grid-cols-5">
              <select className="field" value={movTipo} onChange={(e) => { setMovTipo(e.target.value as "" | "entrada" | "salida" | "ajuste"); setMovPage(1); }}>
                <option value="">Todos los tipos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <input className="field" type="date" value={movFrom} onChange={(e) => { setMovFrom(e.target.value); setMovPage(1); }} />
              <input className="field" type="date" value={movTo} onChange={(e) => { setMovTo(e.target.value); setMovPage(1); }} />
              <button className="btn btn-outline md:col-span-2" type="button" onClick={() => { setMovTipo(""); setMovFrom(""); setMovTo(""); setMovPage(1); }}>Limpiar filtros</button>
            </div>

            <div className="card overflow-auto p-3">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Producto</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Cantidad</th>
                    <th className="p-2">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => (
                    <tr key={mov.id} className="border-t border-[var(--color-border)]">
                      <td className="p-2">{new Date(mov.createdAt).toLocaleString("es-AR")}</td>
                      <td className="p-2">{mov.producto?.nombre || `#${mov.productoId}`}</td>
                      <td className="p-2">{mov.tipo}</td>
                      <td className="p-2">{mov.cantidad}</td>
                      <td className="p-2">{mov.motivo || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(movimientosPagination, setMovPage)}
          </div>
        )}

        {tab === "usuarios" && can("users.read") && (
          <div className="space-y-3">
            {can("users.manage") && (
              <form className="card grid gap-2 p-3 md:grid-cols-5" onSubmit={createUserByAdmin}>
                <input
                  className="field"
                  placeholder="Nombre"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="field"
                  type="email"
                  placeholder="Email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  className="field"
                  type="password"
                  minLength={8}
                  placeholder="Password temporal"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <select
                  className="field"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <option value="usuario">usuario</option>
                  <option value="empleado">empleado</option>
                  <option value="admin">admin</option>
                </select>
                <button className="btn btn-primary" type="submit">
                  Crear usuario
                </button>
              </form>
            )}

            <div className="card grid gap-2 p-3 md:grid-cols-3">
              <input
                className="field md:col-span-2"
                placeholder="Buscar usuario por nombre, email o rol..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setUserPage(1);
                }}
              />
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setSearchUser("");
                  setUserPage(1);
                }}
              >
                Limpiar filtro
              </button>
            </div>

            <div className="card overflow-auto p-3">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Rol</th>
                    <th className="p-2">Creado</th>
                    <th className="p-2">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-[var(--color-border)]">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2">{new Date(u.createdAt).toLocaleString("es-AR")}</td>
                      <td className="p-2">
                        <select
                          className="field min-w-[140px]"
                          value={u.role}
                          disabled={u.id === user?.id}
                          onChange={(e) => void handleRoleChange(u.id, e.target.value as UserRole)}
                        >
                          <option value="admin">admin</option>
                          <option value="empleado">empleado</option>
                          <option value="usuario">usuario</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(usersPagination, setUserPage)}
          </div>
        )}

        {tab === "auditoria" && can("audit.read") && (
          <div className="space-y-3">
            <div className="card grid gap-2 p-3 md:grid-cols-6">
              <input
                className="field md:col-span-2"
                placeholder="Buscar por accion o usuario..."
                value={searchAudit}
                onChange={(e) => {
                  setSearchAudit(e.target.value);
                  setAuditPage(1);
                }}
              />
              <select
                className="field"
                value={auditAction}
                onChange={(e) => {
                  setAuditAction(e.target.value);
                  setAuditPage(1);
                }}
              >
                <option value="">Todas las acciones</option>
                <option value="user.login">user.login</option>
                <option value="user.register">user.register</option>
                <option value="venta.create">venta.create</option>
                <option value="inventario.movement">inventario.movement</option>
                <option value="admin.user.role_update">admin.user.role_update</option>
              </select>
              <select
                className="field"
                value={auditUserId}
                onChange={(e) => {
                  setAuditUserId(e.target.value);
                  setAuditPage(1);
                }}
              >
                <option value="">Todos los usuarios</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <input
                className="field"
                type="date"
                value={auditFrom}
                onChange={(e) => {
                  setAuditFrom(e.target.value);
                  setAuditPage(1);
                }}
              />
              <input
                className="field"
                type="date"
                value={auditTo}
                onChange={(e) => {
                  setAuditTo(e.target.value);
                  setAuditPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-outline" type="button" onClick={exportAuditCsv}>
                Exportar CSV
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setSearchAudit("");
                  setAuditAction("");
                  setAuditUserId("");
                  setAuditFrom("");
                  setAuditTo("");
                  setAuditPage(1);
                }}
              >
                Limpiar filtros
              </button>
            </div>

            <div className="card overflow-auto p-3">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Accion</th>
                    <th className="p-2">Usuario</th>
                    <th className="p-2">Rol</th>
                    <th className="p-2">Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((entry) => (
                    <tr key={entry.id} className="border-t border-[var(--color-border)]">
                      <td className="p-2">{new Date(entry.createdAt).toLocaleString("es-AR")}</td>
                      <td className="p-2 font-mono text-xs">{entry.action}</td>
                      <td className="p-2">{entry.user?.name || entry.user?.email || "-"}</td>
                      <td className="p-2">{entry.user?.role || "-"}</td>
                      <td className="p-2 text-xs">{entry.meta ? JSON.stringify(entry.meta) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(auditsPagination, setAuditPage)}
          </div>
        )}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card w-full max-w-md p-5">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">Confirmar eliminacion</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Se eliminara {confirmState.type} <strong>{confirmState.label}</strong>. Esta accion no se puede deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setConfirmState(null)} type="button">Cancelar</button>
              <button className="btn btn-primary" onClick={() => void confirmDelete()} type="button">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GestionComercial;
