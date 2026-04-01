import type { Lote } from "../../types/interfaces";
import MapView from "../MapView/MapView";
import { highlightText } from "../../utils/highlightText";

interface LotCardProps {
  lote: Lote;
  prioritizeImage?: boolean;
  highlightQuery?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const LotCard: React.FC<LotCardProps> = ({
  lote,
  prioritizeImage = false,
  highlightQuery = "",
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <article
      className="card relative overflow-hidden"
      data-testid={`lote-card-${lote.id}`}
      data-price={lote.price}
      data-size={lote.size}
    >
      <img
        src={lote.image}
        alt={lote.title}
        className="h-48 w-full object-cover"
        loading={prioritizeImage ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={prioritizeImage ? "high" : "auto"}
      />
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        onClick={onToggleFavorite}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
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
      <div className="space-y-2 p-4">
        <h2 className="text-xl font-bold text-[var(--color-primary)]">{highlightText(lote.title, highlightQuery)}</h2>
        <p className="text-[var(--color-text-muted)]">Precio: ${lote.price.toLocaleString("es-AR")} USD</p>
        <p className="text-[var(--color-text-muted)]">Tamano: {lote.size} m2</p>
        {lote.address && (
          <p className="text-[var(--color-text-muted)]">{highlightText(lote.address, highlightQuery)}</p>
        )}
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-text-muted)]">
          {lote.amenities.map((amenity) => (
            <li key={amenity.id}>{amenity.name}</li>
          ))}
        </ul>
      </div>
      <MapView lote={lote} />
    </article>
  );
};

export default LotCard;
