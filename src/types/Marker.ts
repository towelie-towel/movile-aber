export interface IMarker {
    coordinate: {
        latitude: number;
        longitude: number;
        heading?: number | null;
        accuracy?: number | null;
        altitude?: number | null;
        speed?: number | null;
        altitudeAccuracy?: number | null;
    };
    title?: string;
    description?: string;
    imageURL?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
    id?: string;
    icon?: string;
}

export type AddMarker = {
    name?: string;
    icon?: string;
    color?: string;
}