import { useMemo, useState } from "react";

interface AmenitiesSelectorProps {
  options: string[];
  value: string[];
  onChange: (newAmenities: string[]) => void;
}

const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortedOptions = useMemo(
    () => options.slice().sort((a, b) => a.localeCompare(b)),
    [options],
  );

  const toggleAmenity = (amenity: string) => {
    if (value.includes(amenity)) {
      onChange(value.filter((item) => item !== amenity));
      return;
    }
    onChange([...value, amenity]);
  };

  const removeAmenity = (amenity: string) => {
    onChange(value.filter((item) => item !== amenity));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="field flex w-full items-center justify-between text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-sm">
          {value.length > 0 ? `${value.length} seleccionadas` : "Seleccionar amenities"}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">{isOpen ? "Cerrar" : "Abrir"}</span>
      </button>

      {isOpen && (
        <div className="max-h-48 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-2">
          <div className="grid gap-2">
            {sortedOptions.map((amenity) => (
              <button
                key={amenity}
                type="button"
                className={`flex items-center justify-between rounded px-3 py-2 text-sm transition ${
                  value.includes(amenity)
                    ? "bg-[var(--color-primary)]/15 text-white"
                    : "bg-black/20 text-[var(--color-text-muted)] hover:text-white"
                }`}
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
                {value.includes(amenity) && <span className="text-xs">Seleccionado</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((amenity) => (
            <button
              key={amenity}
              type="button"
              className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white"
              onClick={() => removeAmenity(amenity)}
            >
              {amenity} x
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmenitiesSelector;
