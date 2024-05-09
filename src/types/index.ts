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
