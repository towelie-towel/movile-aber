import { UserRole } from "./User";

export type TaxiType = 'bike' | 'auto' | 'confort' | 'confort_plus' | 'vip';

export interface TaxiProfile {
    id?: string | null;
    username?: string | null;
    full_name?: string | null;
    role?: UserRole;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;

    type?: TaxiType;
    stars?: string | null;
    car_model?: string | null;
    years_of_experience?: string | null;
    color?: string | null;
    plate_number?: string | null;
}

export interface TaxiTypesInfo {
    slug: TaxiType;
    name: string;
    pricePerKm: number;
    timePerKm: number;
    distance: {
        value: number;
        text: string;
    };
    duration: {
        value: number;
        text: string;
    };
}
