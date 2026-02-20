import { useEffect, useState } from "react";
import { authApi } from "../services/authApi";
import { useAuth } from "../context/useAuth";

interface DashboardData {
  summary: string;
  widgets: string[];
  metrics?: {
    clientes: number;
    productosActivos: number;
    productosStockBajo: number;
    ventasTotales: number;
    facturacion30d: number;
  };
}

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    authApi
      .dashboard(token)
      .then((response) => setData(response.data))
      .catch((err: Error) => setError(err.message));
  }, [token]);

  return (
    <section className="page">
      <div className="container space-y-4">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Dashboard</h1>
        <p className="text-[var(--color-text-muted)]">
          Usuario: {user?.name} ({user?.role})
        </p>

        {error && <p className="text-red-400">{error}</p>}

        {data && (
          <div className="card space-y-3 p-5">
            <p>{data.summary}</p>
            {data.metrics && (
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                  Clientes: {data.metrics.clientes}
                </div>
                <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                  Productos activos: {data.metrics.productosActivos}
                </div>
                <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                  Stock bajo: {data.metrics.productosStockBajo}
                </div>
                <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                  Ventas totales: {data.metrics.ventasTotales}
                </div>
                <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                  Facturacion 30d: ${data.metrics.facturacion30d.toLocaleString("es-AR")}
                </div>
              </div>
            )}
            <ul className="list-disc space-y-1 pl-5 text-[var(--color-text-muted)]">
              {data.widgets.map((widget) => (
                <li key={widget}>{widget}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
