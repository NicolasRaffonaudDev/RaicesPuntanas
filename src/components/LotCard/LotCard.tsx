import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Lote } from "../../types/interfaces";
import MapView from "../MapView/MapView";
import { highlightText } from "../../utils/highlightText";
import { LOTE_IMAGE_FALLBACK_SRC, resolvePrimaryLoteImageUrl } from "../../utils/resolveLoteImageUrl";

interface LotCardProps {
  lote: Lote;
  prioritizeImage?: boolean;
  highlightQuery?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onContact?: () => void;
}

const LotCard: React.FC<LotCardProps> = ({
  lote,
  prioritizeImage = false,
  highlightQuery = "",
  isFavorite = false,
  onToggleFavorite,
  onContact,
}) => {
  const resolvedImageSrc = resolvePrimaryLoteImageUrl(lote);
  const [imageSrc, setImageSrc] = useState(resolvedImageSrc);
  const totalPhotos = lote.imagenes?.length ?? 0;
  const visibleAmenities = lote.amenities.slice(0, 3);

  useEffect(() => {
    setImageSrc(resolvedImageSrc);
  }, [resolvedImageSrc]);

  return (
    <article
      className="card group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition-transform duration-200 md:hover:-translate-y-0.5"
      data-testid={`lote-card-${lote.id}`}
      data-price={lote.price}
      data-size={lote.size}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={lote.title}
          className="h-52 w-full bg-[var(--color-surface-alt)] object-cover sm:h-56"
          loading={prioritizeImage ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={prioritizeImage ? "high" : "auto"}
          onError={() => setImageSrc(LOTE_IMAGE_FALLBACK_SRC)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        onClick={onToggleFavorite}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
          isFavorite
            ? "border-amber-300/60 bg-amber-400/20 text-amber-200"
            : "border-white/15 bg-black/40 text-white hover:border-white/40 hover:bg-black/60"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>
      <div className="space-y-3 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-[var(--color-primary)]">${lote.price.toLocaleString("es-AR")} USD</p>
          <h2 className="line-clamp-1 text-base font-semibold text-white sm:text-lg">
            {highlightText(lote.title, highlightQuery)}
          </h2>
        </div>
        {lote.address && (
          <p className="line-clamp-1 text-sm text-[var(--color-text-muted)]">
            {highlightText(lote.address, highlightQuery)}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
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
      </div>
      <MapView lote={lote} />
    </article>
  );
};

export default LotCard;
