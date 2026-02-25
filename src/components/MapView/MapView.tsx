import { useMemo, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { Lote } from "../../types/interfaces";

interface MapViewProps {
  lote: Lote;
}

const MapView: React.FC<MapViewProps> = ({ lote }) => {
  const [showInteractive, setShowInteractive] = useState(false);
  const hasMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const center = useMemo(() => ({ lat: lote.lat, lng: lote.lng }), [lote.lat, lote.lng]);
  const googleMapsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${lote.lat},${lote.lng}`,
    [lote.lat, lote.lng],
  );

  if (!showInteractive || !hasMapsKey) {
    return (
      <div className="h-52 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full flex-col justify-between rounded border border-[var(--color-border)] bg-black/25 p-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">Ubicacion del lote</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Coordenadas: {lote.lat.toFixed(5)}, {lote.lng.toFixed(5)}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary text-sm text-center"
              data-testid={`open-maps-${lote.id}`}
            >
              Abrir en Google Maps
            </a>
            {hasMapsKey && (
              <button
                type="button"
                className="btn btn-outline text-sm"
                onClick={() => setShowInteractive(true)}
              >
                Ver mapa interactivo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap mapContainerStyle={{ height: "100%", width: "100%" }} center={center} zoom={15}>
          <Marker position={center} title={lote.title} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapView;
