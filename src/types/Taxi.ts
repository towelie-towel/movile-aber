import { Profile } from "./User";

export type TaxiCategory = 'bike' | 'basic' | 'confort' | 'confort_plus' | 'vip';

export interface TaxiProfile extends Profile {
    category?: TaxiCategory;
    stars?: string | null;
    car_model?: string | null;
    years_of_experience?: string | null;
    color?: string | null;
    plate_number?: string | null;
}

export interface TaxiCategoryInfo {
    slug: TaxiCategory;
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
