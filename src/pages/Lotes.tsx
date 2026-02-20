import { useEffect, useMemo, useState } from "react";
import LotCard from "../components/LotCard/LotCard";
import type { Lote } from "../types/interfaces";

const Lotes: React.FC = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/lotes")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el listado de lotes");
        return res.json();
      })
      .then((data: Lote[]) => {
        setLotes(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const allAmenities = useMemo(
    () => Array.from(new Set(lotes.flatMap((lote) => lote.amenities))),
    [lotes],
  );

  const filteredLotes = useMemo(
    () =>
      lotes
        .filter((lote) => lote.price >= filtroPrecio)
        .filter((lote) => selectedAmenities.every((amenity) => lote.amenities.includes(amenity))),
    [lotes, filtroPrecio, selectedAmenities],
  );

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity],
    );
  };

  return (
    <section className="page">
      <div className="container space-y-5">
        <h1 className="text-center text-3xl font-bold text-[var(--color-primary)]">Lotes Disponibles</h1>

        <div className="card grid gap-4 p-4 md:grid-cols-2">
          <div>
            <label htmlFor="precio-min" className="mb-1 block text-sm text-[var(--color-text-muted)]">
              Precio minimo (USD)
            </label>
            <input
              id="precio-min"
              type="number"
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(Number(e.target.value) || 0)}
              placeholder="Ej: 40000"
              className="field"
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-[var(--color-text-muted)]">Filtrar por amenities</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {allAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>

        {loading && <p className="text-center text-[var(--color-text-muted)]">Cargando lotes...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        {!loading && !error && filteredLotes.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)]">No hay lotes que coincidan con los filtros.</p>
        )}

        {!loading && !error && filteredLotes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLotes.map((lote) => (
              <LotCard key={lote.id} lote={lote} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Lotes;