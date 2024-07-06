
export type TaxiType = 'bike' | 'auto' | 'confort' | 'confort_plus' | 'vip';

export interface TaxiProfile {
    userId: string;
    name: string;
    stars: number;
    phone: string;
    type: TaxiType;
    car: string;
    plate: string;
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
