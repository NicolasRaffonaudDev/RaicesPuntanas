import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import { API_ORIGIN } from "../services/apiClient";
import type { ConsultaEstado, ConsultaPrioridad, ConsultaSeguimiento, Pagination } from "../types/commercial";
import type { Lote } from "../types/interfaces";

const defaultPagination: Pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
const consultaEstados: ConsultaEstado[] = ["pendiente", "en_revision", "respondida", "cerrada"];
const consultaPrioridades: ConsultaPrioridad[] = ["baja", "media", "alta"];
const parsePositiveInt = (raw: string | null, fallback?: number) => {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};
const getPrioridadTone = (prioridad?: string) => {
  if (prioridad === "alta") return "border border-red-500/30 bg-red-500/10 text-red-200";
  if (prioridad === "baja") return "border border-slate-500/30 bg-slate-500/10 text-slate-200";
  return "border border-amber-500/30 bg-amber-500/10 text-amber-200";
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkEstado, setBulkEstado] = useState<ConsultaEstado | "">("");
  const [seguimientos, setSeguimientos] = useState<Record<string, ConsultaSeguimiento[]>>({});
  const [newMessageByConsulta, setNewMessageByConsulta] = useState<Record<string, string>>({});
  const [isInternalByConsulta, setIsInternalByConsulta] = useState<Record<string, boolean>>({});

  const page = useMemo(() => parsePositiveInt(searchParams.get("page"), 1) ?? 1, [searchParams]);
  const q = useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const estadoParam = searchParams.get("estado") || "";
  const estado = consultaEstados.includes(estadoParam as ConsultaEstado) ? (estadoParam as ConsultaEstado) : "";
  const origenParam = searchParams.get("origen");
  const origen = origenParam === "user" || origenParam === "public_form" ? origenParam : "";
  const loteId = useMemo(() => parsePositiveInt(searchParams.get("loteId")), [searchParams]);
  const hasActiveFilters = q.length > 0 || estado.length > 0 || origen.length > 0 || typeof loteId === "number";

  const originLabel = useMemo(() => {
    if (origen === "user") return "Usuarios";
    if (origen === "public_form") return "Leads";
    return "Todas";
  }, [origen]);

  const updateSearchParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const nextParams = new URLSearchParams(searchParams);
      updater(nextParams);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const consultasQueryKey = useMemo(
    () => ["consultas", { page, q, estado, origen, loteId: loteId ?? null }] as const,
    [page, q, estado, origen, loteId],
  );

  const {
    data: consultasResponse,
    isLoading,
    isFetching,
    error: queryError,
  } = useQuery({
    queryKey: consultasQueryKey,
    enabled: !!token,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.listConsultas(token, {
        page,
        limit: 10,
        q: q || undefined,
        estado: estado || undefined,
        origen: origen || undefined,
        loteId,
      });
    },
  });

  const { data: loteOptionsResponse } = useQuery({
    queryKey: ["consultas-lote-options"],
    placeholderData: keepPreviousData,
    queryFn: () => commercialApi.listLotes({ page: 1, limit: 100 }),
  });

  const consultas = consultasResponse?.data ?? [];
  const meta = consultasResponse?.pagination ?? defaultPagination;
  const loteOptions: Lote[] = loteOptionsResponse?.data ?? [];
  const allVisibleSelected = consultas.length > 0 && consultas.every((consulta) => selectedIds.includes(consulta.id));
  const hasSelected = selectedIds.length > 0;

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "No se pudo cargar consultas");
      return;
    }
    setError("");
  }, [queryError]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => consultas.some((consulta) => consulta.id === id)));
  }, [consultas]);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_ORIGIN, { transports: ["polling"] });
    socket.on("audit:created", (entry: { action?: string }) => {
      if (entry?.action?.startsWith("consulta.")) {
        void queryClient.invalidateQueries({ queryKey: ["consultas"] });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const updateEstadoMutation = useMutation({
    mutationFn: async ({ ids, estado }: { ids: string[]; estado: ConsultaEstado }) => {
      if (!token) throw new Error("No autenticado");
      if (ids.length === 1) {
        await commercialApi.updateConsultaEstado(token, ids[0], estado);
        return { ids, estado, count: 1 };
      }
      return commercialApi.updateConsultasEstado(token, ids, estado);
    },
    onSuccess: async (result) => {
      setError("");
      setSelectedIds((prev) => prev.filter((id) => !result.ids.includes(id)));
      setBulkEstado("");
      showToast(
        result.count > 1
          ? `${result.count} consultas actualizadas a ${result.estado}.`
          : `Estado actualizado a ${result.estado}.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["consultas"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "No se pudo actualizar estado");
    },
  });

  const updatePrioridadMutation = useMutation({
    mutationFn: async ({ id, prioridad }: { id: string; prioridad: ConsultaPrioridad }) => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.updateConsultaPrioridad(token, id, prioridad);
    },
    onSuccess: async (result) => {
      setError("");
      showToast(`Prioridad actualizada a ${result.prioridad ?? "media"}.`);
      await queryClient.invalidateQueries({ queryKey: ["consultas"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "No se pudo actualizar prioridad");
    },
  });

  const toggleSeguimientos = async (consultaId: string) => {
    if (expandedId === consultaId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(consultaId);
    if (!token || seguimientos[consultaId]) return;

    try {
      setError("");
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
      setError("");
      await commercialApi.addConsultaSeguimiento(token, consultaId, {
        mensaje,
        esInterno: isInternalByConsulta[consultaId] ?? true,
      });
      setNewMessageByConsulta((prev) => ({ ...prev, [consultaId]: "" }));
      const data = await commercialApi.listConsultaSeguimientos(token, consultaId);
      setSeguimientos((prev) => ({ ...prev, [consultaId]: data }));
      showToast("Seguimiento agregado");
      await queryClient.invalidateQueries({ queryKey: ["consultas"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar seguimiento");
    }
  };

  const applyTemplate = (consultaId: string, template: { mensaje: string; esInterno: boolean }) => {
    setNewMessageByConsulta((prev) => ({ ...prev, [consultaId]: template.mensaje }));
    setIsInternalByConsulta((prev) => ({ ...prev, [consultaId]: template.esInterno }));
  };

  const toggleSelected = (consultaId: string) => {
    setSelectedIds((prev) =>
      prev.includes(consultaId) ? prev.filter((id) => id !== consultaId) : [...prev, consultaId],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !consultas.some((consulta) => consulta.id === id)));
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      consultas.forEach((consulta) => next.add(consulta.id));
      return Array.from(next);
    });
  };

  const submitBulkEstado = async () => {
    if (!bulkEstado || selectedIds.length === 0) return;
    setError("");
    await updateEstadoMutation.mutateAsync({ ids: selectedIds, estado: bulkEstado });
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

        <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <div>
            <p className="font-medium text-white">Bandeja unificada</p>
            <p className="text-[var(--color-text-muted)]">
              Aqui ves consultas de usuarios autenticados y leads publicos en una sola operacion.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--color-text-muted)]">
            Filtro actual: <span className="text-[var(--color-primary)]">{originLabel}</span>
          </div>
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--color-text-muted)]">
              Seleccionadas: <span className="text-[var(--color-primary)]">{selectedIds.length}</span>
            </span>
            {hasSelected && (
              <button
                type="button"
                className="btn btn-outline text-sm"
                onClick={() => setSelectedIds([])}
              >
                Limpiar seleccion
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="field min-w-[170px]"
              value={bulkEstado}
              onChange={(e) => setBulkEstado(e.target.value as ConsultaEstado | "")}
              disabled={!hasSelected || updateEstadoMutation.isPending}
            >
              <option value="">Marcar como...</option>
              <option value="pendiente">pendiente</option>
              <option value="en_revision">en_revision</option>
              <option value="respondida">respondida</option>
              <option value="cerrada">cerrada</option>
            </select>
            <button
              type="button"
              className="btn btn-primary text-sm"
              disabled={!hasSelected || !bulkEstado || updateEstadoMutation.isPending}
              onClick={() => void submitBulkEstado()}
            >
              {updateEstadoMutation.isPending ? "Actualizando..." : "Aplicar a seleccion"}
            </button>
          </div>
        </div>

        {toast && <p className="rounded border border-emerald-700 bg-emerald-900/25 p-2 text-sm text-emerald-300">{toast}</p>}
        {isFetching && !isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">Actualizando resultados...</p>
        )}

        {isLoading && (
          <SectionLoading
            title="Actualizando inbox"
            message="Estamos cargando consultas, estados y seguimiento comercial para mostrarte la bandeja actual."
          />
        )}
        {!isLoading && error && (
          <SectionError
            title="No pudimos cargar el inbox"
            message={error}
          />
        )}

        <div className="card grid gap-2 p-3 md:grid-cols-5">
          <input
            className="field md:col-span-2"
            placeholder="Buscar por contacto, asunto o mensaje..."
            value={q}
            onChange={(e) => {
              const nextValue = e.target.value;
              updateSearchParams((params) => {
                if (nextValue.trim()) {
                  params.set("q", nextValue);
                } else {
                  params.delete("q");
                }
                params.delete("page");
              });
            }}
          />
          <select
            className="field"
            value={estado}
            onChange={(e) => {
              const nextEstado = e.target.value;
              updateSearchParams((params) => {
                if (nextEstado) {
                  params.set("estado", nextEstado);
                } else {
                  params.delete("estado");
                }
                params.delete("page");
              });
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">pendiente</option>
            <option value="en_revision">en_revision</option>
            <option value="respondida">respondida</option>
            <option value="cerrada">cerrada</option>
          </select>
          <select
            className="field"
            value={typeof loteId === "number" ? String(loteId) : ""}
            onChange={(e) => {
              const nextValue = e.target.value;
              updateSearchParams((params) => {
                if (nextValue) {
                  params.set("loteId", nextValue);
                } else {
                  params.delete("loteId");
                }
                params.delete("page");
              });
            }}
          >
            <option value="">Todos los lotes</option>
            {loteOptions.map((lote) => (
              <option key={lote.id} value={String(lote.id)}>
                {lote.id} - {lote.title}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`btn ${!origen ? "btn-primary" : "btn-outline"} text-sm`}
              onClick={() =>
                updateSearchParams((params) => {
                  params.delete("origen");
                  params.delete("page");
                })
              }
            >
              Todas
            </button>
            <button
              type="button"
              className={`btn ${origen === "user" ? "btn-primary" : "btn-outline"} text-sm`}
              onClick={() =>
                updateSearchParams((params) => {
                  params.set("origen", "user");
                  params.delete("page");
                })
              }
            >
              Usuarios
            </button>
            <button
              type="button"
              className={`btn ${origen === "public_form" ? "btn-primary" : "btn-outline"} text-sm`}
              onClick={() =>
                updateSearchParams((params) => {
                  params.set("origen", "public_form");
                  params.delete("page");
                })
              }
            >
              Leads
            </button>
          </div>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              setError("");
              setSearchParams({}, { replace: true });
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="card overflow-auto p-3">
          {!isLoading && !error && consultas.length === 0 ? (
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
                    setError("");
                    setSearchParams({}, { replace: true });
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
                  <th className="p-2">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      aria-label="Seleccionar consultas visibles"
                      onChange={toggleSelectAllVisible}
                    />
                  </th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Contacto</th>
                  <th className="p-2">Asunto</th>
                  <th className="p-2">Mensaje</th>
                  <th className="p-2">Lote</th>
                  <th className="p-2">Prioridad</th>
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
                  const isLead = consulta.origen === "public_form" || !consulta.userId;
                  const contactName = consulta.user?.name || consulta.nombreContacto || "-";
                  const contactEmail = consulta.user?.email || consulta.emailContacto || "-";
                  const contactPhone = consulta.telefonoContacto || "";
                  const prioridad = consultaPrioridades.includes(consulta.prioridad as ConsultaPrioridad)
                    ? (consulta.prioridad as ConsultaPrioridad)
                    : "media";

                  return (
                    <Fragment key={consulta.id}>
                      <tr key={consulta.id} className="border-t border-[var(--color-border)]">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(consulta.id)}
                            aria-label={`Seleccionar consulta ${consulta.id}`}
                            onChange={() => toggleSelected(consulta.id)}
                          />
                        </td>
                        <td className="p-2">{new Date(consulta.createdAt).toLocaleString("es-AR")}</td>
                        <td className="p-2">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              isLead
                                ? "border border-amber-500/30 bg-amber-500/10 text-amber-200"
                                : "border border-sky-500/30 bg-sky-500/10 text-sky-200"
                            }`}
                          >
                            {isLead ? "Lead" : "Usuario"}
                          </span>
                        </td>
                        <td className="p-2">
                          <p>{contactName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{contactEmail}</p>
                          {contactPhone && <p className="text-xs text-[var(--color-text-muted)]">{contactPhone}</p>}
                        </td>
                        <td className="p-2">{consulta.asunto}</td>
                        <td className="p-2 max-w-[300px] text-xs text-[var(--color-text-muted)]">{consulta.mensaje}</td>
                        <td className="p-2">{consulta.lote ? `${consulta.lote.id} - ${consulta.lote.title}` : "-"}</td>
                        <td className="p-2">
                          <div className="space-y-2">
                            <span className={`inline-flex rounded px-2 py-1 text-xs font-medium uppercase ${getPrioridadTone(prioridad)}`}>
                              {prioridad}
                            </span>
                            <select
                              className="field min-w-[120px]"
                              value={prioridad}
                              disabled={updatePrioridadMutation.isPending}
                              onChange={(e) =>
                                void updatePrioridadMutation.mutateAsync({
                                  id: consulta.id,
                                  prioridad: e.target.value as ConsultaPrioridad,
                                })
                              }
                            >
                              <option value="baja">baja</option>
                              <option value="media">media</option>
                              <option value="alta">alta</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="rounded border border-[var(--color-primary)] px-2 py-1 text-xs uppercase text-[var(--color-primary)]">
                            {consulta.estado}
                          </span>
                        </td>
                        <td className="p-2">
                          <select
                            className="field min-w-[130px]"
                            value={consulta.estado}
                            disabled={updateEstadoMutation.isPending}
                            onChange={(e) =>
                              void updateEstadoMutation.mutateAsync({
                                ids: [consulta.id],
                                estado: e.target.value as ConsultaEstado,
                              })
                            }
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
                          <td className="p-3" colSpan={11}>
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
                                    <li
                                      key={item.id}
                                      className={`rounded border p-2 ${
                                        item.esInterno
                                          ? "border-slate-500/20 bg-slate-800/40"
                                          : "border-[var(--color-border)] bg-[var(--color-surface-alt)]"
                                      }`}
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                          {item.autor?.name || item.autor?.email || "Sistema"} - {new Date(item.createdAt).toLocaleString("es-AR")}
                                        </span>
                                        <span
                                          className={`rounded px-2 py-0.5 text-xs ${item.esInterno ? "bg-slate-700/60 text-slate-200" : "bg-emerald-900/40 text-emerald-300"}`}
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
                                  placeholder={
                                    (isInternalByConsulta[consulta.id] ?? true)
                                      ? "Escribe una nota interna para el equipo..."
                                      : "Escribe una respuesta visible para el cliente..."
                                  }
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
                                    {(isInternalByConsulta[consulta.id] ?? true) ? "Agregar nota interna" : "Enviar respuesta"}
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
            disabled={meta.page <= 1}
            onClick={() =>
              updateSearchParams((params) => {
                const nextPage = Math.max(1, page - 1);
                if (nextPage <= 1) {
                  params.delete("page");
                } else {
                  params.set("page", String(nextPage));
                }
              })
            }
            type="button"
          >
            Anterior
          </button>
          <span>
            Pagina {meta.page} de {meta.totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={meta.page >= meta.totalPages}
            onClick={() =>
              updateSearchParams((params) => {
                const nextPage = Math.min(meta.totalPages, page + 1);
                if (nextPage <= 1) {
                  params.delete("page");
                } else {
                  params.set("page", String(nextPage));
                }
              })
            }
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
