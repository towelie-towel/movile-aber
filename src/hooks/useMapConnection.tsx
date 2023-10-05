 
import { useEffect, useRef,  useState } from 'react'
import * as ExpoLocation from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

import type { WSTaxi, MarkerData } from '~/constants/Markers';
import { useUser } from '~/context/UserContext';

// 🔓🔒🗡️💣🔫🔪📴📳📲💻🖥️
// 📸📷📺🎬🎥📽️💡🕯️🔎🔍🔦
// 📃🔖🏷️💰💵📨📦📪📭📬📫
// 📁📂💼📌📈📉⌛⏲️🕰️⏱️⏰
// 🎭🪄🔮🎲🔨⛏️⚒️🛠️🔧🪛🔩
// 🎶🎵🗑️🪠🧻🚽🛁🚿🎯🌀🌬️
// ⚡🔥❄️🌊💧💨💦💥💫🕳️♻️
// ❌🆘⛔⭕🔞📵🚭🚫☢️❗☣️

const useMapConnection = () => {
    const [wsTaxis, setWsTaxis] = useState<WSTaxi[]>([]);
    const [taxis, setTaxis] = useState<MarkerData[]>([]);
    const [heading, setHeading] = useState<ExpoLocation.LocationHeadingObject>();
    const [position, setPosition] = useState<ExpoLocation.LocationObject>();

    const [streamingTo, _setStreamingTo] = useState<string | null>(null)

    const ws = useRef<WebSocket | null>(null);
    const positionSubscription = useRef<ExpoLocation.LocationSubscription | null>()
    const headingSubscription = useRef<ExpoLocation.LocationSubscription | null>()

    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();

    const sendStringToServer = (message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send(message);
            return;
        } else {
            console.error("❌ sendStringToServer ==> !WebSocket.OPEN")
        }
    }

    const handleWebSocketMessage = (event: MessageEvent<string>) => {
        const message = event.data;
        if (typeof message !== "string") {
            return;
        }
        console.log("✅ handleWebSocketMessage ==> message = ", message)
        const taxis = message.replace("taxis-", "").split("$").map(taxiStr => {
            const taxi = taxiStr.split("&")
            const id = taxi[1];
            const location = taxi[0]!.split(",");
            return ({
                latitude: parseFloat(location[0]!),
                longitude: parseFloat(location[1]!),
                userId: id ?? "",
            })
        });
        console.log(taxis);
        setWsTaxis(taxis);
    }

    const asyncNewWebSocket = () => {
        const protocol = `map-client`;

        console.log("🌊 asyncNewWebSocket ==> websuckItToMeBBy ", protocol)
        const suckItToMeBBy = new WebSocket(`ws://192.168.1.103:6942/subscribe?id=eff41f96-178e-4e97-9f43-35d4de7b7a18&lat=51.5073509&lon=-0.1277581999999997`, protocol);

        // TODO: stream depending the role
        suckItToMeBBy.addEventListener("open", (_event) => {
            console.log("🎯 asyncNewWebSocket ==> (Connection opened)");
        });

        suckItToMeBBy.addEventListener('close', (_event) => {
            console.log("❌ asyncNewWebSocket ==> (Connection closed)");
        });

        suckItToMeBBy.addEventListener('error', (_error) => {
            console.log("💥 asyncNewWebSocket ==> (Connection error)");
        });

        suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

        return suckItToMeBBy;
    }

    const trackPosition = async () => {
        const { granted: permissionGranted } = await ExpoLocation.getForegroundPermissionsAsync()

        if (!permissionGranted) {
            console.log('🚫 trackPosition ==> permissionGranted = false (requesting permission)');
            await ExpoLocation.requestForegroundPermissionsAsync();
        }

        if (positionSubscription.current) {
            console.log("🌬️ trackPosition ==> positionSubscription = true ")
            return;
        }

        await ExpoLocation.enableNetworkProviderAsync()

        const posSubscrition = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: 2000,
            },
            (newPosition) => {
                try {
                    if (streamingTo) {
                        sendStringToServer(`${newPosition.coords.latitude},${newPosition.coords.longitude}`)
                    }
                    setPosition(newPosition)
                } catch (error) {
                    console.error(error)
                }
            },

        )

        console.log("📌 trackPosition ==> (Setted position subscriptions)")
        positionSubscription.current = posSubscrition
    }

    const trackHeading = async () => {
        if (headingSubscription.current) {
            console.log("🌬️ trackHeading ==> headingSubscription = true ")
            return;
        }
        const headSubscrition = await ExpoLocation.watchHeadingAsync(
            (newHeading) => {
                setHeading(newHeading);
            },
        )

        console.log("📌 trackPosition ==> (Setted heading subscriptions)")
        headingSubscription.current = headSubscrition
    }

    const resetConnection = async () => {
        if (!isConnected || !isInternetReachable) {
            console.warn("💣 ==> No internet connection ==> ");
            return;
        }

        try {
            if (!ws.current) {
                console.log("🎯 resetConnection ==> initializasing web socket")
                ws.current = await asyncNewWebSocket()
            } else if (ws.current.readyState === WebSocket.OPEN) {
                console.warn("🌬️ resetConnection ==> a connection is already open")
            } else if (ws.current.readyState === WebSocket.CLOSED) {
                console.log("🚿 resetConnection ==> reseting connection")
                ws.current = await asyncNewWebSocket()
            } else {
                console.error("🪠 resetConnection ==> ws.current.readyState = \"CONNECTING\" || \"CLOSING\" ", JSON.stringify(ws.current, null, 2))
                // TODO: handle CONNECTING and CLOSING cases
            } 

        } catch (error) {
            console.error(error)
        }
    }

    return {
        taxis,
        ws,
        wsTaxis,
        sendStringToServer,
        position,
        heading,
        handleWebSocketMessage,
        resetConnection,
        trackPosition
    }
}

export default useMapConnection


/* CREATE TABLE Location (
    id INT PRIMARY KEY,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    accuracy FLOAT,
    altitude FLOAT,
    altitudeAccuracy FLOAT,
    heading FLOAT,
    speed FLOAT
);

CREATE TABLE Marker (
    id INT PRIMARY KEY,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    imageURL TEXT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Location(id)
);

CREATE TABLE Profile (
    id INT PRIMARY KEY,
    userId VARCHAR(255),
    marker_id INT,
    phone_number VARCHAR(255),
    email VARCHAR(255),
    userName VARCHAR(255),
    alias VARCHAR(255),
    profile_identifier VARCHAR(255) UNIQUE NOT NULL,
    userRole VARCHAR(255) DEFAULT 'client',
    licenceNo VARCHAR(255),
    taxi_category VARCHAR(255),
    taxi_start FLOAT(2) CHECK (taxi_start >= 1 AND taxi_start <= 5),
    active BOOLEAN DEFAULT false,
    last_location_id INT NOT NULL,
    FOREIGN KEY (last_location_id) REFERENCES Location(id),
    FOREIGN KEY (marker_id) REFERENCES Marker(id)
); */