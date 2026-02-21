import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { authApi } from "../services/authApi";

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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    authApi
      .dashboard(token)
      .then((response) => setData(response.data))
      .catch((err: Error) => setError(err.message));
  }, [token]);

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
      <div className="container space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Dashboard</h1>
          <div className="flex gap-2">
            {(user?.role === "admin" || user?.role === "empleado") && (
              <>
                <Link className="btn btn-outline text-sm" to="/gestion">
                  Ir a Gestion
                </Link>
                <Link className="btn btn-outline text-sm" to="/consultas">
                  Inbox Consultas
                </Link>
              </>
            )}
            <button className="btn btn-outline text-sm" type="button" onClick={() => void handleLogoutAll()}>
              Cerrar todas las sesiones
            </button>
          </div>
        </div>

        <p className="text-[var(--color-text-muted)]">
          Usuario: {user?.name} ({user?.role})
        </p>

        {error && <p className="rounded border border-red-700 bg-red-900/30 p-2 text-sm text-red-300">{error}</p>}
        {message && <p className="rounded border border-emerald-700 bg-emerald-900/30 p-2 text-sm text-emerald-300">{message}</p>}

        {data && (
          <div className="card space-y-4 p-5">
            <p className="text-sm text-[var(--color-text-muted)]">{data.summary}</p>

            {kpiCards.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((item) => (
                  <div key={item.label} className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{item.label}</span>
                      <span className="text-lg font-bold text-[var(--color-primary)]">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded bg-black/50">
                      <div className="h-2 rounded bg-[var(--color-primary)]" style={{ width: `${item.ratio}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.metrics && (
              <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 text-sm">
                <span className="text-[var(--color-text-muted)]">Facturacion 30d:</span>{" "}
                <strong className="text-[var(--color-primary)]">${data.metrics.facturacion30d.toLocaleString("es-AR")}</strong>
              </div>
            )}

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Permisos del rol</h2>
              <div className="flex flex-wrap gap-2">
                {(data.permissions || []).map((permission) => (
                  <span key={permission} className="rounded border border-[var(--color-border)] bg-black/40 px-2 py-1 text-xs text-[var(--color-text-muted)]">
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Widgets habilitados</h2>
              <ul className="list-disc space-y-1 pl-5 text-[var(--color-text-muted)]">
                {data.widgets.map((widget) => (
                  <li key={widget}>{widget}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
