import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { Lote } from "../../types/interfaces";

interface MapViewProps {
  lote: Lote;
}

const MapView: React.FC<MapViewProps> = ({ lote }) => {
  const [showInteractive, setShowInteractive] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasMapsKey = Boolean(mapsKey);
  const lat = Number(lote.lat);
  const lng = Number(lote.lng);
  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const googleMapsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    [lat, lng],
  );
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey || "",
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const updateViewport = () => setIsMobileViewport(media.matches);
    updateViewport();

    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    console.log("ENV DEBUG", {
      raw: import.meta.env,
      mapsKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });
  }, []);

  const canUseInteractive = hasMapsKey && !isMobileViewport;

  useEffect(() => {
    console.log("Map render", { lat, lng, hasValidCoords, isLoaded, hasMapsKey });
    if (import.meta.env.DEV && !hasMapsKey) {
      console.warn("Google Maps API key missing (VITE_GOOGLE_MAPS_API_KEY)");
    }
  }, [lat, lng, hasValidCoords, isLoaded, hasMapsKey]);

  useEffect(() => {
    if (!mapInstance || !hasValidCoords) return;
    mapInstance.setCenter({ lat, lng });
  }, [mapInstance, hasValidCoords, lat, lng]);

  if (!hasValidCoords) {
    return (
      <div className="h-52 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Ingresá coordenadas para ver el mapa
        </div>
      </div>
    );
  }

  if (!showInteractive || !canUseInteractive) {
    return (
      <div className="h-52 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full flex-col justify-between rounded border border-[var(--color-border)] bg-black/25 p-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">Ubicacion del lote</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Coordenadas: {lat.toFixed(5)}, {lng.toFixed(5)}
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
            {canUseInteractive && (
              <button
                type="button"
                className="btn btn-outline text-sm"
                onClick={() => setShowInteractive(true)}
              >
                Ver mapa interactivo
              </button>
            )}
          </div>
          {!canUseInteractive && hasMapsKey && (
            <p className="text-xs text-[var(--color-text-muted)]">
              En pantallas moviles recomendamos abrir la ubicacion en Google Maps para mejor rendimiento.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-52 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Error cargando mapa
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-52 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Cargando mapa...
        </div>
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <GoogleMap
        mapContainerStyle={{ height: "300px", width: "100%" }}
        center={center}
        zoom={15}
        onLoad={(map) => setMapInstance(map)}
        onUnmount={() => setMapInstance(null)}
      >
        <Marker position={center} title={lote.title} />
      </GoogleMap>
    </div>
  );
};

export default MapView;
