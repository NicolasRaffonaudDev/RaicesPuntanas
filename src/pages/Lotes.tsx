import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LotCard from "../components/LotCard/LotCard";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import type { Lote } from "../types/interfaces";
import { hasPermission } from "../utils/permissions";

const Lotes: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [compareError, setCompareError] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState(0);
  const [orden, setOrden] = useState<"recomendado" | "precio_asc" | "precio_desc" | "tamano_desc">("recomendado");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    commercialApi
      .listLotes()
      .then((data: Lote[]) => {
        setLotes(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!token || !hasPermission(user?.role, "favoritos.read")) {
      setFavoriteIds(new Set());
      return;
    }

    setFavoritesLoading(true);
    commercialApi
      .listFavoritos(token)
      .then((items) => {
        setFavoriteIds(new Set(items.map((item) => item.loteId)));
      })
      .catch((err: Error) => setFavoriteError(err.message))
      .finally(() => setFavoritesLoading(false));
  }, [token, user?.role]);

  const allAmenities = useMemo(
    () => Array.from(new Set(lotes.flatMap((lote) => lote.amenities))),
    [lotes],
  );

  const filteredLotes = useMemo(() => {
    const filtered = lotes
      .filter((lote) => lote.price >= filtroPrecio)
      .filter((lote) => selectedAmenities.every((amenity) => lote.amenities.includes(amenity)));

    if (orden === "precio_asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (orden === "precio_desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (orden === "tamano_desc") return [...filtered].sort((a, b) => b.size - a.size);
    return filtered;
  }, [lotes, filtroPrecio, selectedAmenities, orden]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity],
    );
  };

  const canManageFavorites = !!token && hasPermission(user?.role, "favoritos.write");

  const toggleCompare = (loteId: number) => {
    setCompareError("");
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(loteId)) {
        next.delete(loteId);
        return next;
      }

      if (next.size >= 3) {
        setCompareError("Puedes comparar hasta 3 lotes a la vez.");
        return prev;
      }

      next.add(loteId);
      return next;
    });
  };

  const goToCompare = () => {
    if (compareIds.size < 2) {
      setCompareError("Selecciona al menos 2 lotes para comparar.");
      return;
    }

    navigate(`/comparar?ids=${Array.from(compareIds).join(",")}`);
  };

  const toggleFavorite = async (lote: Lote) => {
    if (!token || !canManageFavorites) return;

    setFavoriteError("");
    const isFavorite = favoriteIds.has(lote.id);

    try {
      if (isFavorite) {
        await commercialApi.removeFavorito(token, lote.id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(lote.id);
          return next;
        });
      } else {
        await commercialApi.addFavorito(token, lote.id);
        setFavoriteIds((prev) => new Set(prev).add(lote.id));
      }
    } catch (err) {
      setFavoriteError(err instanceof Error ? err.message : "No se pudo actualizar favorito");
    }
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
          <div>
            <label htmlFor="orden-lotes" className="mb-1 block text-sm text-[var(--color-text-muted)]">
              Ordenar por
            </label>
            <select
              id="orden-lotes"
              className="field"
              value={orden}
              onChange={(e) => setOrden(e.target.value as "recomendado" | "precio_asc" | "precio_desc" | "tamano_desc")}
            >
              <option value="recomendado">Recomendado</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="tamano_desc">Tamano: mayor a menor</option>
            </select>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 text-sm">
            <p className="text-[var(--color-text-muted)]">
              Mostrando <strong className="text-[var(--color-primary)]">{filteredLotes.length}</strong> lotes.
            </p>
            {filteredLotes.length > 0 && (
              <p className="mt-1 text-[var(--color-text-muted)]">
                Desde <strong className="text-[var(--color-primary)]">${Math.min(...filteredLotes.map((l) => l.price)).toLocaleString("es-AR")}</strong> USD
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Comparador activo: <strong className="text-[var(--color-primary)]">{compareIds.size}</strong>/3 lotes seleccionados.
                </p>
                <button type="button" className="btn btn-primary text-sm" data-testid="compare-button" onClick={goToCompare}>
                  Comparar en mapa
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && <p className="text-center text-[var(--color-text-muted)]">Cargando lotes...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {favoriteError && <p className="text-center text-amber-300">{favoriteError}</p>}
        {compareError && <p className="text-center text-amber-300">{compareError}</p>}

        {!loading && !error && filteredLotes.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)]">No hay lotes que coincidan con los filtros.</p>
        )}

        {!loading && !error && filteredLotes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLotes.map((lote) => (
              <div key={lote.id} className="space-y-2">
                <LotCard lote={lote} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn ${compareIds.has(lote.id) ? "btn-primary" : "btn-outline"} flex-1 text-sm`}
                    data-testid={`compare-toggle-${lote.id}`}
                    onClick={() => toggleCompare(lote.id)}
                  >
                    {compareIds.has(lote.id) ? "En comparador" : "Comparar"}
                  </button>
                  <button
                    type="button"
                    className={`btn ${favoriteIds.has(lote.id) ? "btn-outline" : "btn-primary"} flex-1 text-sm`}
                    onClick={() => void toggleFavorite(lote)}
                    disabled={!canManageFavorites || favoritesLoading}
                  >
                    {favoriteIds.has(lote.id) ? "Quitar favorito" : "Guardar favorito"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline flex-1 text-sm"
                    onClick={() => navigate(`/contact?loteId=${lote.id}&asunto=${encodeURIComponent(`Consulta por ${lote.title}`)}`)}
                  >
                    Consultar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Lotes;
