export interface Amenity {
    id: string;
    name: string;
}

export interface LoteImagen {
    id: number;
    loteId: number;
    url: string;
    orden: number;
    createdAt: string;
}

export interface Lote {
    id: number;
    title: string;
    price: number;
    size: number;
    amenities: Amenity[];
    image: string;
    imagenes?: LoteImagen[];
    lat: number;
    lng: number;
    address?: string | null;
    description?: string | null;
}
