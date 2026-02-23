import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import type { Consulta, LoteFavorito } from "../types/commercial";
import { hasPermission } from "../utils/permissions";

const MiPanelUsuario: React.FC = () => {
  const { token, user } = useAuth();
  const [favoritos, setFavoritos] = useState<LoteFavorito[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canReadFavoritos = hasPermission(user?.role, "favoritos.read");
  const canReadConsultas = hasPermission(user?.role, "consultas.read");
  const canWriteConsultas = hasPermission(user?.role, "consultas.write");

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError("");

    const calls: Promise<void>[] = [];

    if (canReadFavoritos) {
      calls.push(
        commercialApi.listFavoritos(token).then((data) => {
          setFavoritos(data);
        }),
      );
    }

    if (canReadConsultas) {
      calls.push(
        commercialApi.listMisConsultas(token).then((data) => {
          setConsultas(data);
        }),
      );
    }

    Promise.all(calls)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, canReadConsultas, canReadFavoritos]);

  const pendientes = useMemo(() => consultas.filter((item) => item.estado === "pendiente").length, [consultas]);

  return (
    <section className="page">
      <div className="container space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Mi Panel</h1>
          <div className="flex gap-2">
            {canWriteConsultas && (
              <Link to="/contact" className="btn btn-primary text-sm">
                Nueva consulta
              </Link>
            )}
            <Link to="/lotes" className="btn btn-outline text-sm">
              Ver lotes
            </Link>
          </div>
        </div>

        <p className="text-[var(--color-text-muted)]">
          Usuario: {user?.name} ({user?.role})
        </p>

        {error && <p className="rounded border border-red-700 bg-red-900/30 p-2 text-sm text-red-300">{error}</p>}

        {loading ? (
          <p className="text-[var(--color-text-muted)]">Cargando datos del panel...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="card p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Favoritos</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{favoritos.length}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Consultas</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{consultas.length}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Pendientes</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{pendientes}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="card space-y-3 p-4">
                <h2 className="text-lg font-semibold text-[var(--color-primary)]">Lotes favoritos</h2>
                {favoritos.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Aun no tienes favoritos. Desde <Link to="/lotes" className="underline">Lotes</Link> puedes guardar los que te interesen.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {favoritos.map((item) => (
                      <li key={item.id} className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                        <p className="font-medium text-white">{item.lote.title}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Precio: ${item.lote.price.toLocaleString("es-AR")} USD
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="card space-y-3 p-4">
                <h2 className="text-lg font-semibold text-[var(--color-primary)]">Mis consultas</h2>
                {consultas.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">No registras consultas todavia.</p>
                ) : (
                  <ul className="space-y-2">
                    {consultas.map((item) => (
                      <li key={item.id} className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-white">{item.asunto}</p>
                          <span className="rounded border border-[var(--color-primary)] px-2 py-1 text-xs uppercase text-[var(--color-primary)]">
                            {item.estado}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.mensaje}</p>
                        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                          {new Date(item.createdAt).toLocaleString("es-AR")}
                        </p>
                        {item.seguimientos && item.seguimientos.length > 0 && (
                          <div className="mt-3 space-y-2 rounded border border-[var(--color-border)] bg-black/20 p-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                              Respuestas del equipo
                            </p>
                            <ul className="space-y-1">
                              {item.seguimientos.map((seg) => (
                                <li key={seg.id} className="text-xs text-[var(--color-text-muted)]">
                                  {new Date(seg.createdAt).toLocaleString("es-AR")} - {seg.mensaje}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MiPanelUsuario;
