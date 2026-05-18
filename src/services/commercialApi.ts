import type {
  AuditEntry,
  Cliente,
  Consulta,
  ConsultaEstado,
  ConsultaPrioridad,
  ConsultaSeguimiento,
  ConsultaWithUser,
  Inquiry,
  InventarioMovimiento,
  LoteFavorito,
  PaginatedResult,
  Pagination,
  Producto,
  Venta,
} from "../types/commercial";
import type { SystemUser, UserRole } from "../types/auth";
import type { Amenity, Lote } from "../types/interfaces";
import { apiRequest } from "./apiClient";

const parseResponse = async (res: Response) => {
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.message || "Error de servidor");
  return payload;
};

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

interface LotesQuery {
  page?: number;
  limit?: number;
  minPrice?: number;
  amenities?: string[];
  sort?: "price_asc" | "price_desc" | "size_desc";
  q?: string;
}

interface LotesResponse {
  data: Lote[];
  meta: Pagination;
}

interface LoteUpsertInput {
  title: string;
  price: number;
  size: number;
  amenities: string[];
  image?: string;
  imageFile?: File | null;
  address?: string;
  lat: number;
  lng: number;
  description?: string;
}

const buildLoteFormData = (body: Partial<LoteUpsertInput>) => {
  const formData = new FormData();
  const hasImageFile = Boolean(body.imageFile);

  if (body.title !== undefined) formData.append("title", body.title);
  if (body.price !== undefined) formData.append("price", String(body.price));
  if (body.size !== undefined) formData.append("size", String(body.size));
  if (!hasImageFile && body.image !== undefined) formData.append("image", body.image);
  if (body.address !== undefined) formData.append("address", body.address);
  if (body.lat !== undefined) formData.append("lat", String(body.lat));
  if (body.lng !== undefined) formData.append("lng", String(body.lng));
  if (body.description !== undefined) formData.append("description", body.description);

  body.amenities?.forEach((amenityId) => {
    formData.append("amenities", amenityId);
  });

  if (body.imageFile) {
    formData.append("image", body.imageFile);
  }

  return formData;
};

export const commercialApi = {
  listLotes: async (query: LotesQuery = {}): Promise<LotesResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (typeof query.minPrice === "number") params.set("minPrice", String(query.minPrice));
    if (query.amenities && query.amenities.length > 0) params.set("amenities", query.amenities.join(","));
    if (query.sort) params.set("sort", query.sort);
    if (query.q) params.set("q", query.q);

    const queryString = params.toString();
    const res = await apiRequest(queryString ? `/lotes?${queryString}` : "/lotes", { skipAuth: true });
    if (!res.ok) throw new Error("No se pudo cargar el listado de lotes");
    return res.json();
  },

  getLotesByIds: async (ids: number[]): Promise<Lote[]> => {
    if (!ids || ids.length === 0) return [];
    const params = new URLSearchParams();
    params.set("ids", ids.join(","));
    const res = await apiRequest(`/lotes/by-ids?${params.toString()}`, { skipAuth: true });
    if (!res.ok) throw new Error("No se pudieron cargar los lotes seleccionados");
    return res.json();
  },

  getLoteFilters: async (): Promise<{ amenities: Amenity[] }> => {
    const res = await apiRequest("/lotes/filters", { skipAuth: true });
    if (!res.ok) throw new Error("No se pudieron cargar los filtros");
    return res.json();
  },

  createLote: async (
    token: string,
    body: LoteUpsertInput,
  ): Promise<Lote> => {
    const res = await apiRequest("/lotes", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: buildLoteFormData(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Lote;
  },

  updateLote: async (
    token: string,
    id: number,
    body: Partial<LoteUpsertInput>,
  ): Promise<Lote> => {
    const res = await apiRequest(`/lotes/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: buildLoteFormData(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Lote;
  },

  deleteLote: async (token: string, id: number) => {
    const res = await apiRequest(`/lotes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudo eliminar lote");
    }
  },

  listClientes: async (
    token: string,
    query?: { page?: number; limit?: number; search?: string },
  ): Promise<PaginatedResult<Cliente>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);

    const res = await apiRequest(`/clientes?${params.toString()}`, { headers: authHeaders(token) });
    return parseResponse(res);
  },

  createCliente: async (token: string, body: { nombre: string; email?: string; telefono?: string }) => {
    const res = await apiRequest("/clientes", {
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
    const res = await apiRequest(`/clientes/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Cliente;
  },

  deleteCliente: async (token: string, id: string) => {
    const res = await apiRequest(`/clientes/${id}`, {
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

    const res = await apiRequest(`/productos?${params.toString()}`, { headers: authHeaders(token) });
    return parseResponse(res);
  },

  createProducto: async (
    token: string,
    body: { nombre: string; sku: string; precio: number; stock: number },
  ) => {
    const res = await apiRequest("/productos", {
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
    const res = await apiRequest(`/productos/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Producto;
  },

  deleteProducto: async (token: string, id: number) => {
    const res = await apiRequest(`/productos/${id}`, {
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

    const res = await apiRequest(`/ventas?${params.toString()}`, { headers: authHeaders(token) });
    return parseResponse(res);
  },

  createVenta: async (
    token: string,
    body: { clienteId?: string; items: Array<{ productoId: number; cantidad: number }> },
  ) => {
    const res = await apiRequest("/ventas", {
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

    const res = await apiRequest(`/inventario/movimientos?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },

  createMovimiento: async (
    token: string,
    body: { productoId: number; tipo: "entrada" | "salida" | "ajuste"; cantidad: number; motivo?: string },
  ) => {
    const res = await apiRequest("/inventario/movimientos", {
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

    const res = await apiRequest(`/users?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },

  updateUserRole: async (token: string, userId: string, role: UserRole): Promise<SystemUser> => {
    const res = await apiRequest(`/users/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ role }),
    });
    const payload = await parseResponse(res);
    return payload.data as SystemUser;
  },

  createUser: async (
    token: string,
    body: { name: string; email: string; password: string; role: UserRole },
  ): Promise<SystemUser> => {
    const res = await apiRequest("/users", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
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

    const res = await apiRequest(`/audit?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },

  listFavoritos: async (token: string): Promise<LoteFavorito[]> => {
    const res = await apiRequest("/favoritos", { headers: authHeaders(token) });
    const payload = await parseResponse(res);
    return payload.data as LoteFavorito[];
  },

  getFavoritos: async (token: string): Promise<number[]> => {
    const items = await commercialApi.listFavoritos(token);
    return items.map((item) => item.loteId);
  },

  addFavorito: async (token: string, loteId: number): Promise<LoteFavorito> => {
    const res = await apiRequest(`/favoritos/${loteId}`, {
      method: "POST",
      headers: authHeaders(token),
    });
    const payload = await parseResponse(res);
    return payload.data as LoteFavorito;
  },

  removeFavorito: async (token: string, loteId: number): Promise<void> => {
    const res = await apiRequest(`/favoritos/${loteId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudo quitar favorito");
    }
  },

  createConsulta: async (
    token: string,
    body: { asunto: string; mensaje: string; loteId?: number },
  ): Promise<Consulta> => {
    const res = await apiRequest("/consultas", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Consulta;
  },

  createPublicConsulta: async (body: {
    nombreContacto: string;
    emailContacto: string;
    mensaje: string;
    loteId: number;
    telefonoContacto?: string;
  }): Promise<Consulta> => {
    const res = await apiRequest("/consultas/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as Consulta;
  },

  createInquiry: async (body: { name: string; email: string; message: string; loteId: number }) => {
    const res = await apiRequest("/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudo enviar la consulta");
    }
    const payload = await res.json();
    return payload.data;
  },

  listInquiries: async (
    token: string,
    query?: { page?: number; limit?: number; status?: "pending" | "read" },
  ): Promise<{ data: Inquiry[]; meta: Pagination }> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.status) params.set("status", query.status);

    const queryString = params.toString();
    const res = await apiRequest(queryString ? `/inquiries?${queryString}` : "/inquiries", {
      headers: authHeaders(token),
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudieron cargar las consultas");
    }
    return res.json();
  },

  getInquiryStats: async (token: string): Promise<{ total: number; pending: number; read: number }> => {
    const res = await apiRequest("/inquiries/stats", { headers: authHeaders(token) });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudieron cargar las estadisticas");
    }
    return res.json();
  },

  updateInquiryStatus: async (token: string, id: string, status: "pending" | "read") => {
    const res = await apiRequest(`/inquiries/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.message || "No se pudo actualizar la consulta");
    }
    const payload = await res.json();
    return payload.data as Inquiry;
  },

  listMisConsultas: async (token: string): Promise<Consulta[]> => {
    const res = await apiRequest("/consultas/mine", { headers: authHeaders(token) });
    const payload = await parseResponse(res);
    return payload.data as Consulta[];
  },

  listConsultas: async (
    token: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      q?: string;
      estado?: string;
      origen?: "user" | "public_form";
      loteId?: number;
    },
  ): Promise<PaginatedResult<ConsultaWithUser>> => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.q) {
      params.set("q", query.q);
    } else if (query?.search) {
      params.set("search", query.search);
    }
    if (query?.estado) params.set("estado", query.estado);
    if (query?.origen) params.set("origen", query.origen);
    if (typeof query?.loteId === "number") params.set("loteId", String(query.loteId));

    const res = await apiRequest(`/consultas?${params.toString()}`, {
      headers: authHeaders(token),
    });
    return parseResponse(res);
  },

  getConsultasPendientesCount: async (token: string): Promise<number> => {
    const result = await commercialApi.listConsultas(token, { page: 1, limit: 1, estado: "pendiente" });
    return result.pagination.total;
  },

  updateConsultaEstado: async (token: string, consultaId: string, estado: ConsultaEstado): Promise<ConsultaWithUser> => {
    const res = await apiRequest(`/consultas/${consultaId}/estado`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ estado }),
    });
    const payload = await parseResponse(res);
    return payload.data as ConsultaWithUser;
  },

  updateConsultaPrioridad: async (
    token: string,
    consultaId: string,
    prioridad: ConsultaPrioridad,
  ): Promise<ConsultaWithUser> => {
    const res = await apiRequest(`/consultas/${consultaId}/prioridad`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ prioridad }),
    });
    const payload = await parseResponse(res);
    return payload.data as ConsultaWithUser;
  },

  updateConsultasEstado: async (
    token: string,
    ids: string[],
    estado: ConsultaEstado,
  ): Promise<{ ids: string[]; estado: ConsultaEstado; count: number }> => {
    const res = await apiRequest("/consultas/status", {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ ids, estado }),
    });
    const payload = await parseResponse(res);
    return payload.data as { ids: string[]; estado: ConsultaEstado; count: number };
  },

  listConsultaSeguimientos: async (token: string, consultaId: string): Promise<ConsultaSeguimiento[]> => {
    const res = await apiRequest(`/consultas/${consultaId}/seguimientos`, {
      headers: authHeaders(token),
    });
    const payload = await parseResponse(res);
    return payload.data as ConsultaSeguimiento[];
  },

  addConsultaSeguimiento: async (
    token: string,
    consultaId: string,
    body: { mensaje: string; esInterno?: boolean },
  ): Promise<ConsultaSeguimiento> => {
    const res = await apiRequest(`/consultas/${consultaId}/seguimientos`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(res);
    return payload.data as ConsultaSeguimiento;
  },
};
