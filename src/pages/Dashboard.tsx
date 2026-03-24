import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { authApi } from "../services/authApi";
import { API_ORIGIN } from "../services/apiClient";
import { commercialApi } from "../services/commercialApi";
import { hasPermission } from "../utils/permissions";

interface DashboardData {
  summary: string;
  widgets: string[];
  permissions?: string[];
  metrics?: {
    clientes: number;
    productosActivos: number;
    productosStockBajo: number;
    ventasTotales: number;
    facturacion30d: number;
  };
}

const Dashboard: React.FC = () => {
  const { token, user, logoutAll } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [pendingConsultas, setPendingConsultas] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canManageConsultas = hasPermission(user?.role, "consultas.manage");

  useEffect(() => {
    if (!token) return;

    authApi
      .dashboard(token)
      .then((response) => setData(response.data))
      .catch((err: Error) => setError(err.message));
  }, [token]);

  const loadPendingConsultas = useCallback(async () => {
    if (!token || !canManageConsultas) {
      setPendingConsultas(0);
      return;
    }

    try {
      const count = await commercialApi.getConsultasPendientesCount(token);
      setPendingConsultas(count);
    } catch {
      setPendingConsultas(0);
    }
  }, [token, canManageConsultas]);

  useEffect(() => {
    void loadPendingConsultas();
  }, [loadPendingConsultas]);

  useEffect(() => {
    if (!canManageConsultas) return;

    const socket = io(API_ORIGIN, { transports: ["websocket"] });
    socket.on("audit:created", (entry: { action?: string }) => {
      if (entry?.action?.startsWith("consulta.")) {
        void loadPendingConsultas();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [canManageConsultas, loadPendingConsultas]);

  const kpiCards = useMemo(() => {
    if (!data?.metrics) return [];

    const maxForScale = Math.max(
      data.metrics.clientes,
      data.metrics.productosActivos,
      data.metrics.ventasTotales,
      data.metrics.productosStockBajo || 1,
      1,
    );

    return [
      { label: "Clientes", value: data.metrics.clientes },
      { label: "Productos", value: data.metrics.productosActivos },
      { label: "Ventas", value: data.metrics.ventasTotales },
      { label: "Stock bajo", value: data.metrics.productosStockBajo },
    ].map((item) => ({
      ...item,
      ratio: Math.min(100, Math.round((item.value / maxForScale) * 100)),
    }));
  }, [data]);

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      setMessage("Todas las sesiones fueron cerradas. Vuelve a iniciar sesion.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cerrar sesiones");
    }
  };

  return (
    <section className="page">
      <div className="container">
        <div className="max-w-5xl space-y-6">
          <header className="rounded-[1rem] border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(18,18,18,0.96)_45%,rgba(18,18,18,0.98)_100%)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">Panel principal</p>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-tight text-white">Panel</h1>
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    {data?.summary || "Resumen ejecutivo de tu operacion comercial y acceso rapido a los modulos habilitados."}
                  </p>
                </div>
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[rgba(212,175,55,0.2)] bg-black/35 px-3 py-2 text-sm text-[var(--color-text-muted)]">
                  <span className="font-medium text-white">{user?.name}</span>
                  <span className="text-[rgba(255,255,255,0.28)]">/</span>
                  <span className="capitalize text-[var(--color-primary)]">{user?.role}</span>
                </div>
              </div>

              <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-[24rem]">
                {(user?.role === "admin" || user?.role === "empleado") && (
                  <>
                    <Link
                      className="rounded-[0.9rem] border border-[rgba(212,175,55,0.24)] bg-[rgba(212,175,55,0.06)] px-4 py-3 text-sm font-medium text-[rgba(255,255,255,0.94)] transition-[border-color,background-color,color,transform,box-shadow] duration-180 hover:border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.12)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.34)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-[1px] active:border-[rgba(191,154,47,0.42)] active:bg-[rgba(191,154,47,0.14)]"
                      to="/gestion"
                    >
                      Ir a Gestion
                    </Link>
                    <Link
                      className="flex items-center justify-between gap-3 rounded-[0.9rem] border border-[rgba(212,175,55,0.28)] bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(212,175,55,0.08))] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_22px_rgba(0,0,0,0.16)] transition-[border-color,background-color,color,transform,box-shadow] duration-180 hover:border-[rgba(212,175,55,0.46)] hover:bg-[linear-gradient(180deg,rgba(212,175,55,0.16),rgba(212,175,55,0.11))] hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.38)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-[1px] active:border-[rgba(191,154,47,0.48)] active:bg-[linear-gradient(180deg,rgba(191,154,47,0.18),rgba(191,154,47,0.12))]"
                      to="/consultas"
                    >
                      <span>Consultas en la bandeja de entrada</span>
                      {pendingConsultas > 0 && (
                        <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(0,0,0,0.22)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                          {pendingConsultas}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <button
                  className="rounded-[0.9rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-left text-sm font-medium text-[rgba(255,255,255,0.9)] transition-[border-color,background-color,color,transform,box-shadow] duration-180 hover:border-[rgba(212,175,55,0.26)] hover:bg-[rgba(212,175,55,0.06)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.28)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-[1px] active:border-[rgba(191,154,47,0.3)] active:bg-[rgba(191,154,47,0.08)]"
                  type="button"
                  onClick={() => void handleLogoutAll()}
                >
                  Cerrar todas las sesiones
                </button>
              </div>
            </div>
          </header>

          {error && <p className="rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-3 text-sm text-emerald-200">{message}</p>}

          {data && (
            <div className="space-y-6">
              {kpiCards.length > 0 && (
                <section className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Indicadores clave</p>
                    <h2 className="text-xl font-semibold text-white">Vista rapida del panel</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {kpiCards.map((item) => (
                      <article
                        key={item.label}
                        className="rounded-[0.95rem] border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(29,29,29,0.96))] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{item.label}</span>
                          <span className="text-2xl font-semibold text-[var(--color-primary)]">{item.value}</span>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-[rgba(255,255,255,0.07)]">
                          <div
                            className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(191,154,47,0.9),rgba(212,175,55,1))]"
                            style={{ width: `${item.ratio}%` }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Operacion</p>
                  <h2 className="text-xl font-semibold text-white">Actividad comercial</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {data.metrics && (
                    <article className="rounded-[0.95rem] border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(180deg,rgba(212,175,55,0.06),rgba(18,18,18,0.96))] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Facturacion 30d</p>
                      <p className="mt-3 text-3xl font-semibold text-white">
                        <span className="text-[var(--color-primary)]">$</span>
                        {data.metrics.facturacion30d.toLocaleString("es-AR")}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Total facturado en la ventana operativa reciente.</p>
                    </article>
                  )}

                  {canManageConsultas && (
                    <article className="rounded-[0.95rem] border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(18,18,18,0.96))] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Consultas pendientes</p>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-3xl font-semibold text-white">{pendingConsultas}</p>
                        <span className="rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(212,175,55,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                          Prioridad comercial
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Seguimiento en tiempo real para el inbox operativo del equipo.</p>
                    </article>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <article className="rounded-[0.95rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(18,18,18,0.96))] p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Permisos</p>
                    <h2 className="text-xl font-semibold text-white">Permisos del rol</h2>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(data.permissions || []).map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full border border-[rgba(212,175,55,0.18)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="rounded-[0.95rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(18,18,18,0.96))] p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Configuracion</p>
                    <h2 className="text-xl font-semibold text-white">Widgets habilitados</h2>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
                    {data.widgets.map((widget) => (
                      <li key={widget} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                        <span>{widget}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
