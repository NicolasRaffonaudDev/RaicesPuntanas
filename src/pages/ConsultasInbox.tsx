import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import type { ConsultaEstado, ConsultaWithUser, Pagination } from "../types/commercial";

const defaultPagination: Pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };

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

  return (
    <section className="page">
      <div className="container space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Inbox de Consultas</h1>
          <span className="text-sm text-[var(--color-text-muted)]">
            Operador: {user?.name} ({user?.role})
          </span>
        </div>

        {loading && <p className="text-sm text-[var(--color-text-muted)]">Actualizando consultas...</p>}
        {error && <p className="rounded border border-red-700 bg-red-900/25 p-2 text-sm text-red-300">{error}</p>}
        {toast && <p className="rounded border border-emerald-700 bg-emerald-900/25 p-2 text-sm text-emerald-300">{toast}</p>}

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
              </tr>
            </thead>
            <tbody>
              {consultas.map((consulta) => (
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
                </tr>
              ))}
              {!loading && consultas.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-[var(--color-text-muted)]">
                    No hay consultas para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
