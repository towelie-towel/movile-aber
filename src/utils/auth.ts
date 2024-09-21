import { TaxiProfile } from "~/types/Taxi";
import { Profile } from "~/types/User";

export async function saveExpoPushTokenToDB(payload: {
    profile_id: string;
    token: string;
}) {
    const response = await fetch('http://192.168.1.100:6942/savepushtoken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save token: ${error}`);
    }

    const data = await response.json();
    console.log('Expo token saved:', data);
}

export const getTaxiProfile = async (taxiId: string) => {
    try {
        const resp = await fetch(
            `http://192.168.1.100:6942/taxiprofile?id=${taxiId}`
        );
        const respJson = await resp.json();
        return respJson as TaxiProfile;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchProfile = async (id: string) => {
    try {
        const resp = await fetch(
            `http://192.168.1.100:6942/profile?id=${id}`
        );
        const respJson = await resp.json();
        return respJson as Profile;
    } catch (error) {
        console.error(error);
        throw error;
    }
};