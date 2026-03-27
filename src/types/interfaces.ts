export interface Lote {
    id: number;
    title: string;
    price: number;
    size: number;
    amenities: string[];
    image: string;
    lat: number;
    lng: number;
    address?: string | null;
    description?: string | null;
}
