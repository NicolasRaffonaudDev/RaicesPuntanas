import { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { commercialApi } from "../services/commercialApi";
import ContactModal from "../components/ContactModal";
import type { Lote } from "../types/interfaces";

const parseIds = (raw: string | null): number[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
};

const formatPrice = (price: number) => `$${price.toLocaleString("es-AR")} USD`;

interface CompareRowProps {
  lote: Lote;
  isBestPrice: boolean;
  isBestSize: boolean;
  onRemove: (id: number) => void;
  onContact: (lote: Lote) => void;
}

const CompareRow: React.FC<CompareRowProps> = ({ lote, isBestPrice, isBestSize, onRemove, onContact }) => (
  <tr className="border-t border-[var(--color-border)]">
    <td className="px-4 py-4 text-sm font-semibold text-white">{lote.title}</td>
    <td className={`px-4 py-4 text-sm ${isBestPrice ? "text-emerald-300" : "text-[var(--color-text-muted)]"}`}>
      <span className={isBestPrice ? "rounded bg-emerald-500/15 px-2 py-1" : undefined}>
        {formatPrice(lote.price)}
      </span>
    </td>
    <td className={`px-4 py-4 text-sm ${isBestSize ? "text-emerald-300" : "text-[var(--color-text-muted)]"}`}>
      <span className={isBestSize ? "rounded bg-emerald-500/15 px-2 py-1" : undefined}>
        {lote.size} m2
      </span>
    </td>
    <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">{lote.address || "Sin direccion"}</td>
    <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
      {lote.amenities.length > 0 ? lote.amenities.map((amenity) => amenity.name).join(", ") : "Sin amenities"}
    </td>
    <td className="px-4 py-4 text-right">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="btn btn-primary text-xs" onClick={() => onContact(lote)}>
          Contactar
        </button>
        <button type="button" className="btn btn-outline text-xs" onClick={() => onRemove(lote.id)}>
          Quitar
        </button>
      </div>
    </td>
  </tr>
);

interface CompareTableProps {
  lotes: Lote[];
  minPrice: number | null;
  maxSize: number | null;
  onRemove: (id: number) => void;
  onContact: (lote: Lote) => void;
}

const CompareTable: React.FC<CompareTableProps> = ({ lotes, minPrice, maxSize, onRemove, onContact }) => (
  <div className="card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-surface-alt)] text-xs uppercase text-[var(--color-text-muted)]">
          <tr>
            <th className="px-4 py-3">Titulo</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Tamano</th>
            <th className="px-4 py-3">Direccion</th>
            <th className="px-4 py-3">Amenities</th>
            <th className="px-4 py-3 text-right">Accion</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote) => (
            <CompareRow
              key={lote.id}
              lote={lote}
              isBestPrice={minPrice !== null && lote.price === minPrice}
              isBestSize={maxSize !== null && lote.size === maxSize}
              onRemove={onRemove}
              onContact={onContact}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CompararLotes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactLote, setContactLote] = useState<Lote | null>(null);
  const selectedIds = useMemo(() => parseIds(searchParams.get("ids")), [searchParams]);
  const hasMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  const updateIds = useCallback(
    (nextIds: number[]) => {
      const params = new URLSearchParams(searchParams);
      if (nextIds.length > 0) {
        params.set("ids", nextIds.join(","));
      } else {
        params.delete("ids");
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (selectedIds.length === 0) {
      setLotes([]);
      setLoading(false);
      return;
    }

    commercialApi
      .getLotesByIds(selectedIds)
      .then(setLotes)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const minPrice = useMemo(() => {
    if (lotes.length === 0) return null;
    return Math.min(...lotes.map((lote) => lote.price));
  }, [lotes]);

  const maxSize = useMemo(() => {
    if (lotes.length === 0) return null;
    return Math.max(...lotes.map((lote) => lote.size));
  }, [lotes]);

  const handleRemove = (id: number) => {
    updateIds(selectedIds.filter((item) => item !== id));
  };

  const handleClear = () => {
    const confirmed = window.confirm("Se limpiara el comparador. Esta accion no se puede deshacer.");
    if (!confirmed) return;
    updateIds([]);
  };

  const openContactModal = (lote: Lote) => {
    setContactLote(lote);
    setIsContactOpen(true);
  };

  const closeContactModal = () => {
    setIsContactOpen(false);
    setContactLote(null);
  };

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
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <button type="button" className="btn btn-outline text-sm" onClick={handleClear}>
                Limpiar comparador
              </button>
            )}
            <button type="button" className="btn btn-outline text-sm" onClick={() => navigate("/lotes")}>
              Volver a lotes
            </button>
          </div>
        </div>

        {loading && <p className="text-[var(--color-text-muted)]">Preparando comparacion...</p>}
        {error && <p className="rounded border border-red-700 bg-red-900/30 p-2 text-sm text-red-300">{error}</p>}

        {!loading && !error && lotes.length === 0 && (
          <div className="card p-6 text-center text-sm text-[var(--color-text-muted)]">
            <p className="text-base text-white">Agrega lotes para comparar</p>
            <p className="mt-2">Selecciona hasta 3 o 4 lotes para una comparacion clara.</p>
            <button type="button" className="btn btn-primary mt-4 text-sm" onClick={() => navigate("/lotes")}>
              Explorar lotes
            </button>
          </div>
        )}

        {!loading && !error && lotes.length > 0 && (
          <>
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-[var(--color-text-muted)]">
              <div>
                Comparando <strong className="text-white">{lotes.length}</strong> lotes.
                <span className="ml-2">Recomendado: 3 a 4 lotes.</span>
              </div>
              <button
                type="button"
                className="btn btn-primary text-sm"
                onClick={() => navigate("/lotes")}
              >
                Agregar mas lotes
              </button>
            </div>

            <CompareTable
              lotes={lotes}
              minPrice={minPrice}
              maxSize={maxSize}
              onRemove={handleRemove}
              onContact={openContactModal}
            />

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
      <ContactModal isOpen={isContactOpen} lote={contactLote} onClose={closeContactModal} />
    </section>
  );
};

export default CompararLotes;
