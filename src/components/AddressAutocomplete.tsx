import { useMemo, useRef } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (payload: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

const libraries = ["places"] as const;

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Buscar dirección...",
}) => {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey || "",
    libraries,
  });

  const options = useMemo(
    () => ({
      fields: ["formatted_address", "geometry"],
    }),
    [],
  );

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || value;
    onChange(address);
    onSelect({ address, lat, lng });
  };

  if (loadError) {
    return (
      <div className="rounded border border-dashed border-[var(--color-border)] bg-black/20 p-3 text-sm text-[var(--color-text-muted)]">
        Error cargando Google Places
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded border border-dashed border-[var(--color-border)] bg-black/20 p-3 text-sm text-[var(--color-text-muted)]">
        Cargando buscador de direcciones...
      </div>
    );
  }

  return (
    <Autocomplete onLoad={(instance) => (autocompleteRef.current = instance)} onPlaceChanged={handlePlaceChanged} options={options}>
      <input
        className="field w-full"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Autocomplete>
  );
};

export default AddressAutocomplete;
