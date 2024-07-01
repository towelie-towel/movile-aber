import { LatLng } from 'react-native-maps';
import { Profile } from './User';

export enum ClientSteps {
    SEARCH = 1,
    PINNING = 2,
    TAXI = 3,
    FINDING = 4,
    PICKUP = 5,
    RIDE = 6,
    FINISHED = 7,
}
export enum TaxiSteps {
    WAITING = 1,
    CONFIRM = 2,
    PICKUP = 3,
    RIDE = 4,
    FINISHED = 5,
}

export type RideStatus = "pending" | "ongoing" | "calceled" | "completed" | "error"
export interface DBRide {
    id: number,
    status: RideStatus;
    origin: LatLng,
    origin_address: string,
    destination: LatLng,
    destination_address: string,
    clientid: string,
    driverid: string,
    payment_method: string,
    started_at: string,
    completed_at: string,
    price: number,
    distance: number,
    duration: number,
    overview_polyline_points: string
}

export interface RideInfo {
    status: RideStatus;
    name: string;
    client: Profile;
    origin: {
        address: string;
        latitude: number;
        longitude: number;
    };
    destination: {
        latitude: number;
        longitude: number;
        address: string;
    };
    price: number;
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    overview_polyline: {
        points: string;
    };
    // navigationInfo: google.maps.DirectionsLeg;
}

export type NavigationInfo = {
    coords: LatLng[];
} & google.maps.DirectionsLeg