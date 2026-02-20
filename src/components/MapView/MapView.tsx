import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { Lote } from "../../types/interfaces";

interface MapViewProps {
  lote: Lote;
}

const MapView: React.FC<MapViewProps> = ({ lote }) => {
  const center = { lat: lote.lat, lng: lote.lng };

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