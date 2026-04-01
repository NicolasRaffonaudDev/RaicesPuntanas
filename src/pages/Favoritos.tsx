import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LotCard from "../components/LotCard/LotCard";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import { useFavorites } from "../hooks/useFavorites";
import { commercialApi } from "../services/commercialApi";

const normalizeQuery = (raw: string | null) => (raw ? raw.trim() : "");

const Favoritos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { favorites, favoriteSet, toggleFavorite, count } = useFavorites();

  const searchQuery = useMemo(() => normalizeQuery(searchParams.get("q")), [searchParams]);
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

  const visibleLotes = useMemo(
    () => lotes.filter((lote) => favoriteSet.has(String(lote.id))),
    [lotes, favoriteSet],
  );

  return (
    <section className="page">
      <div className="container space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">Mis favoritos</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Guardados localmente en este navegador.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white">
            Favoritos: {count}
          </span>
        </div>

        {favorites.length === 0 && (
          <SectionEmpty
            title="Aún no tenés favoritos guardados"
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
            title="Aún no tenés favoritos guardados"
            message="Explora el catalogo y marca lotes con el corazon para tenerlos siempre a mano."
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
                highlightQuery={searchQuery}
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
