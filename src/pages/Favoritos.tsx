import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LotCard from "../components/LotCard/LotCard";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import { useFavorites } from "../hooks/useFavorites";
import { commercialApi } from "../services/commercialApi";

const Favoritos: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, favoriteSet, toggleFavorite, clearFavorites, count } = useFavorites();
  const [searchInput, setSearchInput] = useState("");
  const normalizedSearch = searchInput.trim().toLowerCase();
  const favoriteIds = useMemo(
    () => favorites.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
    [favorites],
  );

  const {
    data: lotes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favoritos-lotes", favoriteIds],
    enabled: favoriteIds.length > 0,
    queryFn: () => commercialApi.getLotesByIds(favoriteIds),
  });

  const visibleLotes = useMemo(() => {
    const base = lotes.filter((lote) => favoriteSet.has(String(lote.id)));
    if (!normalizedSearch) return base;

    return base.filter((lote) => {
      const title = lote.title.toLowerCase();
      const address = lote.address ? lote.address.toLowerCase() : "";
      return title.includes(normalizedSearch) || address.includes(normalizedSearch);
    });
  }, [favoriteSet, lotes, normalizedSearch]);

  const handleClearFavorites = () => {
    const confirmed = window.confirm("Se eliminaran todos tus favoritos guardados. Esta accion no se puede deshacer.");
    if (!confirmed) return;
    clearFavorites();
    setSearchInput("");
  };

  return (
    <section className="page">
      <div className="container space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">Mis favoritos</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Guardados localmente en este navegador.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white">
              Favoritos: {count}
            </span>
            {count > 0 && (
              <button type="button" className="btn btn-outline text-xs" onClick={handleClearFavorites}>
                Limpiar favoritos
              </button>
            )}
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="card space-y-2 p-4">
            <label htmlFor="favoritos-search" className="text-sm text-[var(--color-text-muted)]">
              Buscar en favoritos
            </label>
            <input
              id="favoritos-search"
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o ubicacion..."
              className="field"
            />
            {normalizedSearch && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
                <span>Buscando...</span>
                <span>Resultados: {visibleLotes.length}</span>
              </div>
            )}
            {!normalizedSearch && (
              <span className="text-xs text-[var(--color-text-muted)]">Resultados: {visibleLotes.length}</span>
            )}
          </div>
        )}

        {favorites.length === 0 && (
          <SectionEmpty
            title="Aun no tenes favoritos guardados"
            message="Explora el catalogo y marca lotes con el corazon para tenerlos siempre a mano."
            action={(
              <button type="button" className="btn btn-primary text-sm" onClick={() => navigate("/lotes")}>
                Explorar lotes
              </button>
            )}
          />
        )}

        {favorites.length > 0 && isLoading && (
          <SectionLoading title="Cargando favoritos" message="Estamos preparando tus lotes guardados." />
        )}

        {favorites.length > 0 && !isLoading && error && (
          <SectionError
            title="No pudimos cargar tus favoritos"
            message={error instanceof Error ? error.message : "Error al cargar favoritos"}
          />
        )}

        {favorites.length > 0 && !isLoading && !error && visibleLotes.length === 0 && (
          <SectionEmpty
            title={
              normalizedSearch
                ? `No hay resultados en tus favoritos para '${searchInput.trim()}'`
                : "Aun no tenes favoritos guardados"
            }
            message={
              normalizedSearch
                ? "Prueba con otra busqueda o limpia el filtro para ver todos tus favoritos."
                : "Explora el catalogo y marca lotes con el corazon para tenerlos siempre a mano."
            }
            action={(
              <button type="button" className="btn btn-primary text-sm" onClick={() => navigate("/lotes")}>
                Explorar lotes
              </button>
            )}
          />
        )}

        {favorites.length > 0 && !isLoading && !error && visibleLotes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleLotes.map((lote, index) => (
              <LotCard
                key={lote.id}
                lote={lote}
                prioritizeImage={index < 2}
                highlightQuery={searchInput}
                isFavorite={favoriteSet.has(String(lote.id))}
                onToggleFavorite={() => toggleFavorite(lote.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favoritos;
