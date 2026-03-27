import { useEffect, useMemo, useRef, useState } from "react";

interface AmenitiesSelectorProps {
  options: string[];
  value: string[];
  onChange: (newAmenities: string[]) => void;
}

const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const sortedOptions = useMemo(
    () => options.slice().sort((a, b) => a.localeCompare(b)),
    [options],
  );
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedOptions;
    return sortedOptions.filter((item) => item.toLowerCase().includes(query));
  }, [search, sortedOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAmenity = (amenity: string) => {
    if (value.includes(amenity)) {
      onChange(value.filter((item) => item !== amenity));
      return;
    }
    onChange([...value, amenity]);
    setIsOpen(false);
  };

  const removeAmenity = (amenity: string) => {
    onChange(value.filter((item) => item !== amenity));
  };

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <button
        type="button"
        className="field flex w-full items-center justify-between text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="text-sm">
          {value.length > 0 ? `Amenities (${value.length} seleccionados)` : "Seleccionar amenities"}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">{isOpen ? "Cerrar" : "Abrir"}</span>
      </button>

      {isOpen && (
        <div className="space-y-2 rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-2 shadow-md">
          <input
            type="text"
            className="field w-full text-sm"
            placeholder="Buscar amenities..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-h-48 overflow-auto">
            <div className="grid gap-2">
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">No hay coincidencias</p>
              )}
              {filteredOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  className={`flex items-center justify-between rounded px-3 py-2 text-sm transition hover:bg-white/10 ${
                    value.includes(amenity)
                      ? "bg-[var(--color-primary)]/15 text-white"
                      : "bg-black/20 text-[var(--color-text-muted)]"
                  }`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                  {value.includes(amenity) && <span className="text-xs">Seleccionado</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((amenity) => (
            <button
              key={amenity}
              type="button"
              className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white transition hover:border-white/30 hover:bg-black/50"
              onClick={() => removeAmenity(amenity)}
            >
              {amenity} <span className="ml-1 text-[10px]">x</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmenitiesSelector;
