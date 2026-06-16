import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { Lote } from "../../types/interfaces";
interface MapViewProps {
  lote: Lote;
  desktopHeightClass?: string;
  mobileMap?: boolean;
  compact?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  lote,
  desktopHeightClass = "md:h-60",
  mobileMap = false,
  compact = false,
}) => {
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
      <div className="w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
        <div className="flex h-40 items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] md:h-56">
          Ingresa coordenadas para ver el mapa
        </div>
      </div>
    );
  }

  const openGoogleMaps = () => {
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const renderMobileLocationButton = () => (
      <div className="p-3 md:hidden">
        <button
          type="button"
          onClick={openGoogleMaps}
          className="btn btn-outline w-full text-sm"
        >
          Ver ubicacion
        </button>
      </div>
  );

  if (!hasMapsKey) {
    return (
      <div className="w-full bg-[var(--color-surface-alt)]">
        {mobileMap ? (
          <div className="p-3">
            <div className="flex h-32 items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] sm:h-36">
              Configura VITE_GOOGLE_MAPS_API_KEY para ver el mapa
            </div>
          </div>
        ) : (
          renderMobileLocationButton()
        )}
        <div className="hidden p-3 md:block">
          <div className={`flex items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] ${compact ? "h-36" : "h-56"}`}>
            Configura VITE_GOOGLE_MAPS_API_KEY para ver el mapa
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full bg-[var(--color-surface-alt)]">
        {mobileMap ? (
          <div className="p-3">
            <div className="flex h-32 items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] sm:h-36">
              Error cargando mapa
            </div>
          </div>
        ) : (
          renderMobileLocationButton()
        )}
        <div className="hidden p-3 md:block">
          <div className={`flex items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] ${compact ? "h-36" : "h-56"}`}>
            Error cargando mapa
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-[var(--color-surface-alt)]">
        {mobileMap ? (
          <div className="p-3">
            <div className="flex h-32 items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] sm:h-36">
              Cargando mapa...
            </div>
          </div>
        ) : (
          renderMobileLocationButton()
        )}
        <div className="hidden p-3 md:block">
          <div className={`flex items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-black/25 p-3 text-sm text-[var(--color-text-muted)] ${compact ? "h-36" : "h-56"}`}>
            Cargando mapa...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--color-surface-alt)]">
      {mobileMap ? (
        <div
          className="group relative block h-32 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-2 shadow-[0_10px_20px_rgba(0,0,0,0.24)] sm:h-36 md:hidden"
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
          <div className="pointer-events-none absolute inset-2 flex items-end justify-end rounded-xl bg-gradient-to-t from-black/45 via-transparent to-transparent p-3">
            <span className="rounded-full border border-white/30 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              Ver mapa
            </span>
          </div>
        </div>
      ) : (
        renderMobileLocationButton()
      )}
      <div
        className={`group relative hidden w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 shadow-[0_14px_26px_rgba(0,0,0,0.28)] md:block ${desktopHeightClass}`}
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
          <div className="pointer-events-none absolute left-6 top-6 rounded-full border border-white/30 bg-black/55 px-3 py-1 text-xs text-white">
            {lote.address}
          </div>
        )}
        <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full border border-white/40 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Ver en Google Maps
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;


