import type {
  AuditEntry,
  Cliente,
  InventarioMovimiento,
  PaginatedResult,
  Producto,
  Venta,
} from "../types/commercial";
import type { SystemUser, UserRole } from "../types/auth";

const API_URL = "http://localhost:3001/api";

const parseResponse = async (res: Response) => {
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.message || "Error de servidor");
  return payload;
};

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const commercialApi = {
  listClientes: async (
    token: string,
    query?: { page?: number; limit?: number; search?: string },
  ): Promise<PaginatedResult<Cliente>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);

    const res = await fetch(`${API_URL}/clientes?${params.toString()}`, { headers: authHeaders(token) });
    return parseResponse(res);
  },

  createCliente: async (token: string, body: { nombre: string; email?: string; telefono?: string }) => {
    const res = await fetch(`${API_URL}/clientes`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Cliente;
  },

  updateCliente: async (
    token: string,
    id: string,
    body: { nombre?: string; email?: string; telefono?: string; direccion?: string },
  ) => {
    const res = await fetch(`${API_URL}/clientes/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Cliente;
  },

  deleteCliente: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/clientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudo eliminar cliente");
    }
  },

  listProductos: async (
    token: string,
    query?: { page?: number; limit?: number; search?: string; onlyActive?: boolean; lowStock?: boolean },
  ): Promise<PaginatedResult<Producto>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.onlyActive) params.set("onlyActive", "true");
    if (query?.lowStock) params.set("lowStock", "true");

    const res = await fetch(`${API_URL}/productos?${params.toString()}`, { headers: authHeaders(token) });
    return parseResponse(res);
  },

  createProducto: async (
    token: string,
    body: { nombre: string; sku: string; precio: number; stock: number },
  ) => {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Producto;
  },

  updateProducto: async (
    token: string,
    id: number,
    body: { nombre?: string; precio?: number; stock?: number; activo?: boolean },
  ) => {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Producto;
  },

  deleteProducto: async (token: string, id: number) => {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudo eliminar producto");
    }
  },

  listVentas: async (
    token: string,
    query?: { page?: number; limit?: number; search?: string; from?: string; to?: string },
  ): Promise<PaginatedResult<Venta>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.from) params.set("from", query.from);
    if (query?.to) params.set("to", query.to);

    const res = await fetch(`${API_URL}/ventas?${params.toString()}`, { headers: authHeaders(token) });
    return parseResponse(res);
  },

  createVenta: async (
    token: string,
    body: { clienteId?: string; items: Array<{ productoId: number; cantidad: number }> },
  ) => {
    const res = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Venta;
  },

  listMovimientos: async (
    token: string,
    query?: { page?: number; limit?: number; tipo?: "entrada" | "salida" | "ajuste"; from?: string; to?: string },
  ): Promise<PaginatedResult<InventarioMovimiento>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.tipo) params.set("tipo", query.tipo);
    if (query?.from) params.set("from", query.from);
    if (query?.to) params.set("to", query.to);

    const res = await fetch(`${API_URL}/inventario/movimientos?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },

  createMovimiento: async (
    token: string,
    body: { productoId: number; tipo: "entrada" | "salida" | "ajuste"; cantidad: number; motivo?: string },
  ) => {
    const res = await fetch(`${API_URL}/inventario/movimientos`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as InventarioMovimiento;
  },

  listUsers: async (
    token: string,
    query?: { page?: number; limit?: number; search?: string },
  ): Promise<PaginatedResult<SystemUser>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);

    const res = await fetch(`${API_URL}/users?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },

  updateUserRole: async (token: string, userId: string, role: UserRole): Promise<SystemUser> => {
    const res = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ role }),
    });
    const payload = await parseResponse(res);
    return payload.data as SystemUser;
  },

  listAudit: async (
    token: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      action?: string;
      userId?: string;
      from?: string;
      to?: string;
    },
  ): Promise<PaginatedResult<AuditEntry>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.action) params.set("action", query.action);
    if (query?.userId) params.set("userId", query.userId);
    if (query?.from) params.set("from", query.from);
    if (query?.to) params.set("to", query.to);

    const res = await fetch(`${API_URL}/audit?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },
};
