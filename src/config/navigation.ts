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

export const getSidebarSections = (role: UserRole | undefined): NavigationSection[] => {
  if (!role) return [];

  const sections: NavigationSection[] = [];

  if (role === "admin" || role === "empleado") {
    sections.push({
      id: "dashboard",
      label: "Dashboard",
      items: [{ id: "dashboard", label: "Dashboard", to: "/dashboard" }],
    });

    const comercial: NavigationItem[] = [];
    if (hasPermission(role, "lotes.read")) {
      comercial.push({ id: "lotes", label: "Lotes", to: "/lotes" });
    }
    if (hasPermission(role, "clientes.read")) {
      comercial.push({ id: "clientes", label: "Clientes", to: "/gestion?tab=clientes" });
    }
    if (comercial.length > 0) {
      sections.push({ id: "comercial", label: "Comercial", items: comercial });
    }

    
    const operaciones: NavigationItem[] = [];
    if (hasPermission(role, "productos.read")) {
      operaciones.push({ id: "productos", label: "Productos", to: "/gestion?tab=productos" });
    }
    if (hasPermission(role, "ventas.read")) {
      operaciones.push({ id: "ventas", label: "Ventas", to: "/gestion?tab=ventas" });
    }
    if (hasPermission(role, "inventario.read")) {
      operaciones.push({ id: "inventario", label: "Inventario", to: "/gestion?tab=inventario" });
    }
    if (operaciones.length > 0) {
      sections.push({ id: "operaciones", label: "Operaciones", items: operaciones });
    }
    
    if (hasPermission(role, "consultas.manage")) {
      const crmItems: NavigationItem[] = [{ id: "consultas", label: "Consultas CRM", to: "/consultas" }];
      if (role === "admin") {
        crmItems.push({ id: "inquiries", label: "Archivo legacy", to: "/admin/inquiries" });
      }
      sections.push({
        id: "crm",
        label: "CRM",
        items: crmItems,
      });
    }
    
    if (role === "admin") {
      const administracion: NavigationItem[] = [];
      if (hasPermission(role, "users.read")) {
        administracion.push({ id: "usuarios", label: "Usuarios", to: "/gestion?tab=usuarios" });
      }
      if (hasPermission(role, "audit.read")) {
        administracion.push({ id: "auditoria", label: "Auditoria", to: "/gestion?tab=auditoria" });
      }
      if (administracion.length > 0) {
        sections.push({ id: "administracion", label: "Administracion", items: administracion });
      }
    }
  }

  if (role === "usuario") {
    const usuario: NavigationItem[] = [];
    if (hasPermission(role, "consultas.read")) {
      usuario.push({ id: "mi-panel", label: "Mi panel", to: "/mi-panel" });
    }
    if (hasPermission(role, "favoritos.read")) {
      usuario.push({ id: "favoritos", label: "Favoritos", to: "/favoritos" });
    }
    if (hasPermission(role, "lotes.read")) {
      usuario.push({ id: "lotes", label: "Lotes", to: "/lotes" });
    }
    if (usuario.length > 0) {
      sections.push({ id: "usuario", label: "Usuario", items: usuario });
    }
  }

  const configuracion: NavigationItem[] = [
    { id: "perfil", label: "Mi perfil", to: "/perfil" },
    { id: "seguridad", label: "Seguridad", to: "/seguridad" },
  ];
  if (role === "admin") {
    configuracion.push({ id: "marca", label: "Identidad de marca (Beta)", to: "/marca" });
    configuracion.push({ id: "editor-sitio", label: "Editor del sitio (Beta)", to: "/editor-sitio" });
  }
  sections.push({ id: "configuracion", label: "Configuracion", items: configuracion });

  return sections.filter((section) => section.items.length > 0);
};
