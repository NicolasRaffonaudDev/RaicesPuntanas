import type { Lote } from "../../types/interfaces";
import MapView from "../MapView/MapView";

interface LotCardProps {
  lote: Lote;
}

const LotCard: React.FC<LotCardProps> = ({ lote }) => {
  return (
    <article className="card overflow-hidden">
      <img src={lote.image} alt={lote.title} className="h-48 w-full object-cover" />
      <div className="space-y-2 p-4">
        <h2 className="text-xl font-bold text-[var(--color-primary)]">{lote.title}</h2>
        <p className="text-[var(--color-text-muted)]">Precio: ${lote.price.toLocaleString("es-AR")} USD</p>
        <p className="text-[var(--color-text-muted)]">Tamano: {lote.size} m2</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-text-muted)]">
          {lote.amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      </div>
      <MapView lote={lote} />
    </article>
  );
};

export default LotCard;