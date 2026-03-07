import type { UserRole } from "../types/auth";
import { hasPermission } from "../utils/permissions";

export interface NavigationItem {
  id: string;
  label: string;
  to: string;
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}

const canAccessGestion = (role: UserRole | undefined) =>
  hasPermission(role, "clientes.read") ||
  hasPermission(role, "productos.read") ||
  hasPermission(role, "ventas.read") ||
  hasPermission(role, "inventario.read") ||
  hasPermission(role, "users.read") ||
  hasPermission(role, "audit.read");

export const getSidebarSections = (role: UserRole | undefined): NavigationSection[] => {
  const sections: NavigationSection[] = [
    {
      id: "dashboard",
      items: [{ id: "dashboard", label: "Dashboard", to: "/dashboard" }],
    },
  ];

  const comercial: NavigationItem[] = [];
  if (hasPermission(role, "lotes.read")) {
    comercial.push({ id: "lotes", label: "Lotes", to: "/lotes" });
  }
  if (role === "usuario" && hasPermission(role, "consultas.read")) {
    comercial.push({ id: "mis-consultas", label: "Mis consultas", to: "/mi-panel" });
  }
  if ((role === "admin" || role === "empleado") && hasPermission(role, "consultas.manage")) {
    comercial.push({ id: "consultas", label: "Consultas", to: "/consultas" });
  }
  if (hasPermission(role, "clientes.read")) {
    comercial.push({ id: "clientes", label: "Clientes", to: "/gestion?tab=clientes" });
  }
  if (comercial.length > 0) {
    sections.push({ id: "comercial", label: "Comercial", items: comercial });
  }

  const operaciones: NavigationItem[] = [];
  if (hasPermission(role, "ventas.read")) {
    operaciones.push({ id: "ventas", label: "Ventas", to: "/gestion?tab=ventas" });
  }
  if (hasPermission(role, "productos.read")) {
    operaciones.push({ id: "productos", label: "Productos", to: "/gestion?tab=productos" });
  }
  if (hasPermission(role, "inventario.read")) {
    operaciones.push({ id: "inventario", label: "Inventario", to: "/gestion?tab=inventario" });
  }
  if (operaciones.length > 0) {
    sections.push({ id: "operaciones", label: "Operaciones", items: operaciones });
  }

  const gestion: NavigationItem[] = [];
  if (hasPermission(role, "users.read")) {
    gestion.push({ id: "usuarios", label: "Usuarios", to: "/gestion?tab=usuarios" });
  }
  if (hasPermission(role, "audit.read")) {
    gestion.push({ id: "auditoria", label: "Auditoria", to: "/gestion?tab=auditoria" });
  }
  if (gestion.length > 0) {
    sections.push({ id: "gestion", label: "Gestion", items: gestion });
  }

  const configuracion: NavigationItem[] = [
    { id: "perfil", label: "Mi perfil", to: "/perfil" },
    { id: "seguridad", label: "Seguridad", to: "/seguridad" },
    { id: "preferencias", label: "Preferencias", to: "/preferencias" },
  ];
  if (role === "admin") {
    configuracion.push({ id: "marca", label: "Identidad de marca", to: "/marca" });
    configuracion.push({ id: "editor-sitio", label: "Editor del sitio", to: "/editor-sitio" });
  }
  sections.push({ id: "configuracion", label: "Configuracion", items: configuracion });

  if (!canAccessGestion(role) && role !== "usuario" && role !== "admin" && role !== "empleado") {
    return sections.filter((section) => section.items.length > 0);
  }

  return sections.filter((section) => section.items.length > 0);
};
