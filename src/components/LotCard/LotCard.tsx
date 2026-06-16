import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Lote } from "../../types/interfaces";
import MapView from "../MapView/MapView";
import { highlightText } from "../../utils/highlightText";
import { getPrimaryLoteImage, LOTE_IMAGE_FALLBACK_SRC, resolveLoteImageUrl } from "../../utils/resolveLoteImageUrl";

interface LotCardProps {
  lote: Lote;
  prioritizeImage?: boolean;
  highlightQuery?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onContact?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const LotCard: React.FC<LotCardProps> = ({
  lote,
  prioritizeImage = false,
  highlightQuery = "",
  isFavorite = false,
  onToggleFavorite,
  onContact,
  onEdit,
  onDelete,
}) => {
  const resolvedImageSrc = resolveLoteImageUrl(getPrimaryLoteImage(lote));
  const [imageSrc, setImageSrc] = useState(resolvedImageSrc);
  const totalPhotos = lote.imagenes?.length ?? 0;
  const visibleAmenities = lote.amenities.slice(0, 3);
  const showAdminActions = Boolean(onEdit || onDelete);
  const hasAddress = Boolean(lote.address);

  useEffect(() => {
    setImageSrc(resolvedImageSrc);
  }, [resolvedImageSrc]);

  return (
    <article
      className="card group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-200 md:hover:-translate-y-0.5 md:hover:shadow-[0_22px_40px_rgba(0,0,0,0.36)]"
      data-testid={`lote-card-${lote.id}`}
      data-price={lote.price}
      data-size={lote.size}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={lote.title}
          className="h-48 w-full bg-[var(--color-surface-alt)] object-cover transition duration-300 group-hover:scale-[1.02] sm:h-52"
          loading={prioritizeImage ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={prioritizeImage ? "high" : "auto"}
          onError={() => {
            if (imageSrc !== LOTE_IMAGE_FALLBACK_SRC) {
              setImageSrc(LOTE_IMAGE_FALLBACK_SRC);
            }
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {lote.destacado && (
            <span className="rounded-full border border-amber-300/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
              Destacado
            </span>
          )}
          {totalPhotos > 1 && (
            <span className="rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
              {`Fotos: ${totalPhotos}`}
            </span>
          )}
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
            {`${lote.size} m2`}
          </span>
        </div>
      </div>
      <div className="border-t border-[rgba(255,255,255,0.05)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Ubicacion</p>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-white">
              {hasAddress ? highlightText(lote.address as string, highlightQuery) : "Coordenadas disponibles para abrir en Google Maps"}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Mapa
          </span>
        </div>
        <MapView lote={lote} desktopHeightClass="md:h-40" mobileMap compact />
      </div>
      <div className="space-y-3 p-3.5 sm:p-4">
        <div className="space-y-1">
          <p className="text-xl font-semibold text-[var(--color-primary)]">${lote.price.toLocaleString("es-AR")} USD</p>
          <h2 className="line-clamp-1 text-base font-semibold text-white sm:text-lg">
            {highlightText(lote.title, highlightQuery)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 pt-0.5">
          {visibleAmenities.map((amenity) => (
            <span
              key={amenity.id}
              className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-[var(--color-text-muted)]"
            >
              {amenity.name}
            </span>
          ))}
          {lote.amenities.length > 3 && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-[var(--color-text-muted)]">
              {`+${lote.amenities.length - 3}`}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              onClick={onToggleFavorite}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                isFavorite
                  ? "border-amber-300/60 bg-amber-400/15 text-amber-200"
                  : "border-white/12 bg-white/5 text-[var(--color-text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {isFavorite ? "Guardado" : "Guardar"}
            </button>
          )}
          {lote.destacado && (
            <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
              Seleccion destacada
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/lotes/${lote.id}`} className="btn btn-primary w-full text-sm sm:w-auto">
            Ver detalle
          </Link>
          {onContact && (
            <button type="button" className="btn btn-outline w-full text-sm sm:w-auto" onClick={onContact}>
              Consultar
            </button>
          )}
        </div>
        {showAdminActions && (
          <div className="rounded-lg border border-dashed border-amber-400/30 bg-amber-500/10 p-2">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-200">Modo admin</p>
            <div className="flex gap-2">
              {onEdit && (
                <button type="button" className="btn btn-outline flex-1 text-xs" onClick={onEdit}>
                  Editar
                </button>
              )}
              {onDelete && (
                <button type="button" className="btn btn-outline flex-1 text-xs" onClick={onDelete}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default LotCard;

