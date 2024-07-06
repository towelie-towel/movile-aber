import { LatLng } from 'react-native-maps';
import { Profile } from '~/types/User';

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
} & google.maps.DirectionsLeg;