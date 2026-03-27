export interface Amenity {
    id: string;
    name: string;
}

export interface Lote {
    id: number;
    title: string;
    price: number;
    size: number;
    amenities: Amenity[];
    image: string;
    lat: number;
    lng: number;
    address?: string | null;
    description?: string | null;
}
