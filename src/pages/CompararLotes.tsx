import { useEffect, useMemo, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { commercialApi } from "../services/commercialApi";
import type { Lote } from "../types/interfaces";

const parseIds = (raw: string | null): number[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
};

const CompararLotes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedIds = useMemo(() => parseIds(searchParams.get("ids")), [searchParams]);
  const hasMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    commercialApi
      .listLotes()
      .then((data) => {
        setLotes(data.filter((lote) => selectedIds.includes(lote.id)));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const center = useMemo(() => {
    if (lotes.length === 0) return { lat: -33.3017, lng: -66.3378 };
    const latAvg = lotes.reduce((acc, lote) => acc + lote.lat, 0) / lotes.length;
    const lngAvg = lotes.reduce((acc, lote) => acc + lote.lng, 0) / lotes.length;
    return { lat: latAvg, lng: lngAvg };
  }, [lotes]);

  return (
    <section className="page">
      <div className="container space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Comparador de Lotes</h1>
          <button type="button" className="btn btn-outline text-sm" onClick={() => navigate("/lotes")}>
            Volver a lotes
          </button>
        </div>

        {loading && <p className="text-[var(--color-text-muted)]">Preparando comparacion...</p>}
        {error && <p className="rounded border border-red-700 bg-red-900/30 p-2 text-sm text-red-300">{error}</p>}

        {!loading && !error && lotes.length < 2 && (
          <div className="card p-4 text-sm text-[var(--color-text-muted)]">
            Necesitas seleccionar al menos 2 lotes para comparar. Regresa a <strong className="text-[var(--color-primary)]">Lotes</strong> y activa el comparador.
          </div>
        )}

        {!loading && !error && lotes.length >= 2 && (
          <>
            <div className="card p-4">
              <div className="grid gap-3 md:grid-cols-3">
                {lotes.map((lote) => (
                  <article key={lote.id} className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3" data-testid={`compare-card-${lote.id}`}>
                    <p className="font-semibold text-[var(--color-primary)]">{lote.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">Precio: ${lote.price.toLocaleString("es-AR")} USD</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Tamano: {lote.size} m2</p>
                    <button
                      type="button"
                      className="btn btn-primary mt-3 w-full text-sm"
                      data-testid={`compare-consult-${lote.id}`}
                      onClick={() => navigate(`/contact?loteId=${lote.id}&asunto=${encodeURIComponent(`Consulta por ${lote.title}`)}`)}
                    >
                      Consultar este lote
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden">
              {!hasMapsKey ? (
                <div className="space-y-3 p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Mapa interactivo deshabilitado (falta `VITE_GOOGLE_MAPS_API_KEY`). Igual puedes abrir cada ubicacion en Google Maps.
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {lotes.map((lote) => (
                      <a
                        key={lote.id}
                        href={`https://www.google.com/maps/search/?api=1&query=${lote.lat},${lote.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline text-sm text-center"
                      >
                        Ver {lote.title}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[420px] w-full">
                  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
                    <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={12}>
                      {lotes.map((lote) => (
                        <Marker key={lote.id} position={{ lat: lote.lat, lng: lote.lng }} title={lote.title} />
                      ))}
                    </GoogleMap>
                  </LoadScript>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CompararLotes;
