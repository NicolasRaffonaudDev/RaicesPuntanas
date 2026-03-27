import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { Lote } from "../../types/interfaces";
interface MapViewProps {
  lote: Lote;
}

const MapView: React.FC<MapViewProps> = ({ lote }) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasMapsKey = Boolean(mapsKey);
  const lat = Number(lote.lat);
  const lng = Number(lote.lng);
  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const googleMapsUrl = useMemo(
    () => `https://www.google.com/maps?q=${lat},${lng}`,
    [lat, lng],
  );
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey || "",
  });

  useEffect(() => {
    if (import.meta.env.DEV && !hasMapsKey) {
      console.warn("Google Maps API key missing (VITE_GOOGLE_MAPS_API_KEY)");
    }
  }, [hasMapsKey]);

  useEffect(() => {
    if (!mapInstance || !hasValidCoords) return;
    mapInstance.setCenter({ lat, lng });
  }, [mapInstance, hasValidCoords, lat, lng]);

  if (!hasValidCoords) {
    return (
      <div className="h-72 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Ingresa coordenadas para ver el mapa
        </div>
      </div>
    );
  }

  if (!hasMapsKey) {
    return (
      <div className="h-72 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Configura VITE_GOOGLE_MAPS_API_KEY para ver el mapa
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-72 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Error cargando mapa
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-72 w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)]">
          Cargando mapa...
        </div>
      </div>
    );
  }

  const openGoogleMaps = () => {
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="group relative h-72 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]"
      role="button"
      tabIndex={0}
      onClick={openGoogleMaps}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") openGoogleMaps();
      }}
    >
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        center={center}
        zoom={15}
        options={{ disableDefaultUI: true, clickableIcons: false }}
        onLoad={(map) => setMapInstance(map)}
        onUnmount={() => setMapInstance(null)}
      >
        <Marker position={center} title={lote.title} />
      </GoogleMap>
      {lote.address && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/30 bg-black/55 px-3 py-1 text-xs text-white">
          {lote.address}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="rounded-full border border-white/40 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Ver en Google Maps
        </span>
      </div>
    </div>
  );
};

export default MapView;


