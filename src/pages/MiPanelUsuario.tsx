import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import { PageHeader } from "../components/PageHeader";
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
        <PageHeader
          compact
          eyebrow="Panel de usuario"
          title="Mi Panel"
          description="Resumen personal de tus lotes guardados, consultas realizadas y respuestas visibles del equipo comercial."
          meta={(
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-black/25 px-3 py-1.5">
              <span className="font-medium text-white">{user?.name}</span>
              <span className="text-[rgba(255,255,255,0.28)]">/</span>
              <span className="capitalize text-[var(--color-primary)]">{user?.role}</span>
            </div>
          )}
          actions={(
            <>
              {canWriteConsultas && (
                <Link to="/contact" className="btn btn-primary text-sm">
                  Nueva consulta
                </Link>
              )}
              <Link to="/lotes" className="btn btn-outline text-sm">
                Ver lotes
              </Link>
            </>
          )}
        />

        {loading ? (
          <SectionLoading
            title="Cargando tu panel"
            message="Estamos reuniendo tus favoritos, consultas y actividad reciente para mostrarte un resumen actualizado."
          />
        ) : error ? (
          <SectionError
            title="No pudimos cargar tu panel"
            message={error}
          />
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
                  <SectionEmpty
                    compact
                    title="Sin favoritos guardados"
                    message="Aun no tienes lotes favoritos. Puedes explorar el catalogo y guardar los que quieras seguir de cerca."
                    action={(
                      <Link to="/lotes" className="btn btn-outline text-sm">
                        Ver lotes
                      </Link>
                    )}
                  />
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
                  <SectionEmpty
                    compact
                    title="Sin consultas registradas"
                    message="Todavia no tienes consultas enviadas. Cuando necesites informacion sobre un lote, podras iniciarla desde contacto."
                    action={canWriteConsultas ? (
                      <Link to="/contact" className="btn btn-outline text-sm">
                        Nueva consulta
                      </Link>
                    ) : undefined}
                  />
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
