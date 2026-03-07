import { Fragment, useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import type { ConsultaEstado, ConsultaSeguimiento, ConsultaWithUser, Pagination } from "../types/commercial";

const defaultPagination: Pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };

const quickTemplates = [
  {
    label: "Recepcion de consulta",
    mensaje:
      "Gracias por tu consulta. Ya la registramos y nuestro equipo comercial te contactara en las proximas 24 horas.",
    esInterno: false,
  },
  {
    label: "Solicitud de datos",
    mensaje:
      "Para avanzar con tu solicitud, por favor comparte tu telefono y franja horaria preferida para coordinar una llamada.",
    esInterno: false,
  },
  {
    label: "Coordinar visita",
    mensaje:
      "Podemos coordinar una visita al lote esta semana. Indicanos que dia y horario te resulta mas comodo.",
    esInterno: false,
  },
  {
    label: "Nota interna comercial",
    mensaje: "Cliente interesado. Priorizar seguimiento comercial y actualizar estado luego de llamada.",
    esInterno: true,
  },
];

const ConsultasInbox: React.FC = () => {
  const { token, user } = useAuth();
  const [consultas, setConsultas] = useState<ConsultaWithUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [seguimientos, setSeguimientos] = useState<Record<string, ConsultaSeguimiento[]>>({});
  const [newMessageByConsulta, setNewMessageByConsulta] = useState<Record<string, string>>({});
  const [isInternalByConsulta, setIsInternalByConsulta] = useState<Record<string, boolean>>({});
  const hasActiveFilters = search.trim().length > 0 || estado.trim().length > 0;

  const loadConsultas = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const result = await commercialApi.listConsultas(token, {
        page,
        limit: 10,
        search: search || undefined,
        estado: estado || undefined,
      });
      setConsultas(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar consultas");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, estado]);

  useEffect(() => {
    void loadConsultas();
  }, [loadConsultas]);

  useEffect(() => {
    const socket = io("http://localhost:3001", { transports: ["websocket"] });
    socket.on("audit:created", (entry: { action?: string }) => {
      if (entry?.action?.startsWith("consulta.")) {
        void loadConsultas();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [loadConsultas]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const updateEstado = async (consultaId: string, nextEstado: ConsultaEstado) => {
    if (!token) return;
    try {
      await commercialApi.updateConsultaEstado(token, consultaId, nextEstado);
      showToast("Estado actualizado");
      await loadConsultas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar estado");
    }
  };

  const toggleSeguimientos = async (consultaId: string) => {
    if (expandedId === consultaId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(consultaId);
    if (!token || seguimientos[consultaId]) return;

    try {
      const data = await commercialApi.listConsultaSeguimientos(token, consultaId);
      setSeguimientos((prev) => ({ ...prev, [consultaId]: data }));
      setIsInternalByConsulta((prev) => ({ ...prev, [consultaId]: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar seguimiento");
    }
  };

  const submitSeguimiento = async (consultaId: string) => {
    if (!token) return;
    const mensaje = (newMessageByConsulta[consultaId] || "").trim();
    if (!mensaje) return;

    try {
      await commercialApi.addConsultaSeguimiento(token, consultaId, {
        mensaje,
        esInterno: isInternalByConsulta[consultaId] ?? true,
      });
      setNewMessageByConsulta((prev) => ({ ...prev, [consultaId]: "" }));
      const data = await commercialApi.listConsultaSeguimientos(token, consultaId);
      setSeguimientos((prev) => ({ ...prev, [consultaId]: data }));
      showToast("Seguimiento agregado");
      await loadConsultas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar seguimiento");
    }
  };

  const applyTemplate = (consultaId: string, template: { mensaje: string; esInterno: boolean }) => {
    setNewMessageByConsulta((prev) => ({ ...prev, [consultaId]: template.mensaje }));
    setIsInternalByConsulta((prev) => ({ ...prev, [consultaId]: template.esInterno }));
  };

  return (
    <section className="page">
      <div className="container space-y-4">
        <PageHeader
          compact
          eyebrow="Modulo comercial"
          title="Inbox de Consultas"
          description="Bandeja operativa para revisar consultas entrantes, actualizar estados y registrar seguimiento visible o interno."
          meta={(
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-black/25 px-3 py-1.5">
              <span className="text-[var(--color-text-muted)]">Operador</span>
              <span className="font-medium text-white">{user?.name}</span>
              <span className="text-[rgba(255,255,255,0.28)]">/</span>
              <span className="capitalize text-[var(--color-primary)]">{user?.role}</span>
            </div>
          )}
        />

        {toast && <p className="rounded border border-emerald-700 bg-emerald-900/25 p-2 text-sm text-emerald-300">{toast}</p>}

        {loading && (
          <SectionLoading
            title="Actualizando inbox"
            message="Estamos cargando consultas, estados y seguimiento comercial para mostrarte la bandeja actual."
          />
        )}
        {!loading && error && (
          <SectionError
            title="No pudimos cargar el inbox"
            message={error}
          />
        )}

        <div className="card grid gap-2 p-3 md:grid-cols-4">
          <input
            className="field md:col-span-2"
            placeholder="Buscar por asunto, mensaje o email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="field"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">pendiente</option>
            <option value="en_revision">en_revision</option>
            <option value="respondida">respondida</option>
            <option value="cerrada">cerrada</option>
          </select>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              setSearch("");
              setEstado("");
              setPage(1);
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="card overflow-auto p-3">
          {!loading && !error && consultas.length === 0 ? (
            <SectionEmpty
              compact
              title={hasActiveFilters ? "No encontramos consultas para esos filtros" : "Todavia no hay consultas registradas"}
              message={
                hasActiveFilters
                  ? "Prueba ajustar la busqueda o limpiar los filtros para volver a ver el listado completo."
                  : "Cuando ingresen nuevas consultas del sitio, apareceran aqui para su gestion y seguimiento."
              }
              action={hasActiveFilters ? (
                <button
                  className="btn btn-outline text-sm"
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setEstado("");
                    setPage(1);
                  }}
                >
                  Limpiar filtros
                </button>
              ) : undefined}
            />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Usuario</th>
                  <th className="p-2">Asunto</th>
                  <th className="p-2">Mensaje</th>
                  <th className="p-2">Lote</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Accion</th>
                  <th className="p-2">Seguimiento</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => {
                  const isExpanded = expandedId === consulta.id;
                  const items = seguimientos[consulta.id] || [];
                  const visibleCount = items.filter((item) => !item.esInterno).length;
                  const internoCount = items.length - visibleCount;

                  return (
                    <Fragment key={consulta.id}>
                      <tr key={consulta.id} className="border-t border-[var(--color-border)]">
                        <td className="p-2">{new Date(consulta.createdAt).toLocaleString("es-AR")}</td>
                        <td className="p-2">
                          <p>{consulta.user?.name || "-"}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{consulta.user?.email || "-"}</p>
                        </td>
                        <td className="p-2">{consulta.asunto}</td>
                        <td className="p-2 max-w-[300px] text-xs text-[var(--color-text-muted)]">{consulta.mensaje}</td>
                        <td className="p-2">{consulta.lote ? `${consulta.lote.id} - ${consulta.lote.title}` : "-"}</td>
                        <td className="p-2">
                          <span className="rounded border border-[var(--color-primary)] px-2 py-1 text-xs uppercase text-[var(--color-primary)]">
                            {consulta.estado}
                          </span>
                        </td>
                        <td className="p-2">
                          <select
                            className="field min-w-[130px]"
                            value={consulta.estado}
                            onChange={(e) => void updateEstado(consulta.id, e.target.value as ConsultaEstado)}
                          >
                            <option value="pendiente">pendiente</option>
                            <option value="en_revision">en_revision</option>
                            <option value="respondida">respondida</option>
                            <option value="cerrada">cerrada</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <button className="btn btn-outline text-xs" type="button" onClick={() => void toggleSeguimientos(consulta.id)}>
                            {isExpanded ? "Ocultar" : "Gestionar"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-t border-[var(--color-border)] bg-black/20">
                          <td className="p-3" colSpan={8}>
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-[var(--color-primary)]">Historial de seguimiento</p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                  Total: {items.length} | Visibles: {visibleCount} | Internos: {internoCount}
                                </p>
                              </div>

                              {items.length === 0 ? (
                                <p className="text-xs text-[var(--color-text-muted)]">No hay seguimientos aun.</p>
                              ) : (
                                <ul className="space-y-2">
                                  {items.map((item) => (
                                    <li key={item.id} className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-2">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                          {item.autor?.name || item.autor?.email || "Sistema"} - {new Date(item.createdAt).toLocaleString("es-AR")}
                                        </span>
                                        <span
                                          className={`rounded px-2 py-0.5 text-xs ${item.esInterno ? "bg-red-900/40 text-red-300" : "bg-emerald-900/40 text-emerald-300"}`}
                                        >
                                          {item.esInterno ? "Interno" : "Visible cliente"}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.mensaje}</p>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <div className="grid gap-2 md:grid-cols-6">
                                <textarea
                                  className="field md:col-span-4"
                                  rows={3}
                                  placeholder="Escribe una nota interna o respuesta al cliente..."
                                  data-testid={`seguimiento-input-${consulta.id}`}
                                  value={newMessageByConsulta[consulta.id] || ""}
                                  onChange={(e) => setNewMessageByConsulta((prev) => ({ ...prev, [consulta.id]: e.target.value }))}
                                />
                                <div className="space-y-2 md:col-span-2">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={isInternalByConsulta[consulta.id] ?? true}
                                      onChange={(e) => setIsInternalByConsulta((prev) => ({ ...prev, [consulta.id]: e.target.checked }))}
                                    />
                                    Marcar como interno
                                  </label>
                                  <button
                                    className="btn btn-primary w-full text-sm"
                                    type="button"
                                    data-testid={`seguimiento-submit-${consulta.id}`}
                                    onClick={() => void submitSeguimiento(consulta.id)}
                                  >
                                    Guardar seguimiento
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {quickTemplates.map((template) => (
                                  <button
                                    key={template.label}
                                    type="button"
                                    className="btn btn-outline text-xs"
                                    data-testid={`template-${template.label.replaceAll(" ", "-").toLowerCase()}-${consulta.id}`}
                                    onClick={() => applyTemplate(consulta.id, template)}
                                  >
                                    {template.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            className="btn btn-outline"
            disabled={pagination.page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            type="button"
          >
            Anterior
          </button>
          <span>
            Pagina {pagination.page} de {pagination.totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            type="button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConsultasInbox;
