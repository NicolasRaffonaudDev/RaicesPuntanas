export interface Cliente {
  id: string;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Producto {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VentaItem {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  producto: Producto;
}

export interface Venta {
  id: string;
  clienteId?: string | null;
  userId: string;
  total: number;
  createdAt: string;
  cliente?: Cliente | null;
  items: VentaItem[];
}

export interface InventarioMovimiento {
  id: string;
  productoId: number;
  userId?: string | null;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo?: string | null;
  createdAt: string;
  producto?: Producto;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role: "admin" | "empleado" | "usuario";
  };
}
