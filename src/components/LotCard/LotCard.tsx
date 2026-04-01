import type { Lote } from "../../types/interfaces";
import MapView from "../MapView/MapView";
import { highlightText } from "../../utils/highlightText";

interface LotCardProps {
  lote: Lote;
  prioritizeImage?: boolean;
  highlightQuery?: string;
}

const LotCard: React.FC<LotCardProps> = ({ lote, prioritizeImage = false, highlightQuery = "" }) => {
  return (
    <article className="card overflow-hidden" data-testid={`lote-card-${lote.id}`} data-price={lote.price} data-size={lote.size}>
      <img
        src={lote.image}
        alt={lote.title}
        className="h-48 w-full object-cover"
        loading={prioritizeImage ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={prioritizeImage ? "high" : "auto"}
      />
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
