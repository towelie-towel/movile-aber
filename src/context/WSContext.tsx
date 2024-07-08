import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as ExpoLocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LatLng } from 'react-native-maps';

import { PlaceMarkerIconType } from '~/components/markers/AddUserMarker';
import { calculateDistance, calculateBearing, duplicateCoords } from '~/utils/directions';
import type { TaxiProfile } from '~/types/Taxi';
import type { PlaceInfo } from '~/types/Places';
import type { RideInfo } from '~/types/RideFlow';
import type { UserRole } from '~/types/User';

const storedlastLocation = createJSONStorage<PlaceMarkerIconType[]>(() => AsyncStorage)
export const lastLocationAtom = atomWithStorage<PlaceMarkerIconType[]>('last_location', [], storedlastLocation)
const storedLocationPlaces = createJSONStorage<PlaceInfo[]>(() => AsyncStorage)
export const locationPlacesAtom = atomWithStorage<PlaceInfo[]>('location_place', [], storedLocationPlaces)

const WS_LOGS = false;
const LOCATION_TASK_NAME = 'background-location-task';

export interface WSTaxi {
    latitude: number;
    longitude: number;
    header: number;
    userId: string;
}

interface WSStateContext {
    ws: WebSocket | null | undefined;
    wsTaxis: WSTaxi[] | null | undefined;
    confirmedTaxi: TaxiProfile | null;
    position: ExpoLocation.LocationObject | undefined;
    heading: ExpoLocation.LocationHeadingObject | undefined;
    userType: UserRole | undefined;
}
interface WSActionsContext {
    // resetWSConnection: () => Promise<void>;
    // trackPosition: () => Promise<void>;
    sendStringToServer: (message: string) => void;
    findTaxi: (ride: RideInfo, taxiid?: string) => Promise<void>;
    cancelTaxi: () => Promise<void>;
    simulateRoutePosition: (coords: LatLng[]) => Promise<void>;
    stopRouteSimulation: () => Promise<void>;
}

const stateInitialValue: WSStateContext = {
    ws: undefined,
    wsTaxis: undefined,
    confirmedTaxi: null,
    position: undefined,
    heading: undefined,
    userType: undefined,
};
const stateActionslValue: WSActionsContext = {
    /* resetWSConnection: async () => {
        throw new Error('Function not initizaliced yet');
    },
    trackPosition: async () => {
        throw new Error('Function not initizaliced yet');
    }, */
    simulateRoutePosition: async () => {
        throw new Error('Function not initizaliced yet');
    },
    stopRouteSimulation: async () => {
        throw new Error('Function not initizaliced yet');
    },
    sendStringToServer: async () => {
        throw new Error('Function not initizaliced yet');
    },
    findTaxi: async () => {
        throw new Error('Function not initizaliced yet');
    },
    cancelTaxi: async () => {
        throw new Error('Function not initizaliced yet');
    },
};

const WSStateContext = createContext(stateInitialValue);
const WSActionsContext = createContext(stateActionslValue);

export const useWSState = () => {
    return useContext(WSStateContext);
};
export const useWSActions = () => {
    return useContext(WSActionsContext);
};

const requestPermissions = async () => {
    const { status: foregroundStatus } = await ExpoLocation.requestForegroundPermissionsAsync();

    if (foregroundStatus === 'granted') {
        if (WS_LOGS) console.log('foregroundStatus permissions granted');
        const { status: backgroundStatus } = await ExpoLocation.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
            if (WS_LOGS) console.log('backgroundStatus permissions granted');
            await ExpoLocation.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: ExpoLocation.Accuracy.Balanced,
            });
        }
    }
};

export const WSProvider = ({ children, userType }: { children: React.ReactNode, userType: UserRole }) => {
    const { isConnected } = NetInfo.useNetInfo();
    const [wsTaxis, setWsTaxis] = useState<WSTaxi[]>([]);
    const [heading, setHeading] = useState<ExpoLocation.LocationHeadingObject>();
    const [position, setPosition] = useState<ExpoLocation.LocationObject>();
    const [confirmedTaxi, setConfirmedTaxi] = useState<TaxiProfile | null>(null);

    const [currentUserType, setCurrentUserType] = useState(userType);

    const ws = useRef<WebSocket | null>(null);
    const positionSubscription = useRef<ExpoLocation.LocationSubscription | null>();
    const headingSubscription = useRef<ExpoLocation.LocationSubscription | null>();
    const simulationSubscription = useRef<NodeJS.Timeout | null>();


    useEffect(() => {
        setCurrentUserType(userType);
    }, [userType]);

    const sendStringToServer = useCallback((message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send(message);
        } else {
            console.error('');
        }
    }, [ws]);
    const findTaxi = useCallback(async (ride: RideInfo, taxiid: string | undefined) => {
        const nearestTaxi = wsTaxis[0];
        if (WS_LOGS) console.log(wsTaxis)
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send(`findtaxi-${taxiid ?? nearestTaxi.userId}-endid` + JSON.stringify(ride));
        } else {
            console.error('');
        }
        // TODO: Fetch the taxi profile from the server
    }, [wsTaxis, ws]);
    const cancelTaxi = useCallback(async () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send("cancel-");
            setConfirmedTaxi(null)
        } else {
            console.error('');
        }
    }, [ws]);

    const handleWebSocketMessage = useCallback((event: MessageEvent<string>) => {
        const message = event.data;
        if (typeof message !== 'string') {
            return;
        }
        if (WS_LOGS) console.log('handleWebSocketMessage: ', message);
        if (message.startsWith("confirm-")) {
            const taxistring = message.replace('confirm-', '');
            let taxi: TaxiProfile | undefined;
            if (taxistring === 'test') {
                taxi = {
                    type: 'confort',
                    userId: '123',
                    name: 'Gregory Smith',
                    phone: '+535 123 4567',
                    car: 'Toyota Corolla',
                    plate: 'HAB 123',
                    stars: 4.9,
                };
            } else {
                taxi = JSON.parse(taxistring) as TaxiProfile;
            }
            setConfirmedTaxi(taxi)
        }
        const taxis = message
            .replace('taxis-', '')
            .split('$')
            .map((taxiStr) => {
                const taxi = taxiStr.split('&');
                const id = taxi[1];
                const location = taxi[0]!.split(',');
                return {
                    latitude: parseFloat(location[0]!),
                    longitude: parseFloat(location[1]!),
                    header: parseFloat(location[2]!),
                    userId: id ?? '',
                };
            });
        const sortedTaxis = [...taxis].sort((taxiA, taxiB) => {
            const distanceA = calculateDistance(
                position?.coords.latitude ?? 0,
                position?.coords.longitude ?? 0,
                taxiA.latitude,
                taxiA.longitude
            );
            const distanceB = calculateDistance(
                position?.coords.latitude ?? 0,
                position?.coords.longitude ?? 0,
                taxiB.latitude,
                taxiB.longitude
            );
            return distanceA - distanceB;
        });
        if (WS_LOGS) console.log(sortedTaxis)
        setWsTaxis(sortedTaxis);


    }, []);

    const asyncNewWebSocket = useCallback(() => {
        const protocol = `map-client`;

        if (WS_LOGS) console.log('new Web Socket initializing', protocol);
        const suckItToMeBBy = new WebSocket(
            `ws://192.168.1.100:6942/subscribe?id=03563972-fab9-4744-b9a7-15f8d35d38c9&lat=51.5073509&lon=-0.1277581999999997&head=51`,
            protocol
        );

        // TODO: stream depending the role
        suckItToMeBBy.addEventListener('open', (_event) => {
            if (WS_LOGS) console.log('WS Connection opened');
        });

        suckItToMeBBy.addEventListener('close', (_event) => {
            if (WS_LOGS) console.log('WS Connection closed', _event.reason);
        });

        suckItToMeBBy.addEventListener('error', (_error) => {
            if (WS_LOGS)
                console.error('WS Connection error', JSON.stringify(_error, null, 2));
        }, {
            once: true
        });

        suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

        return suckItToMeBBy;
    }, [handleWebSocketMessage]);

    const resetWSConnection = useCallback(async () => {
        if (!isConnected) {
            console.warn('💣 ==> No internet connection ==> ');
            return;
        }
        try {
            if (!ws.current) {
                if (WS_LOGS) console.log('initializasing web socket');
                ws.current = await asyncNewWebSocket();
            } else if (ws.current.readyState === WebSocket.OPEN) {
                console.warn('a ws connection is already open');
            } else if (ws.current.readyState === WebSocket.CLOSED) {
                if (WS_LOGS) console.log('🚿 resetWSConnection ==> reseting connection');
                ws.current = await asyncNewWebSocket();
            } else {
                console.error("ws connection is not OPEN or CLOSED");
                // TODO: handle CONNECTING and CLOSING cases
            }
        } catch (error) {
            console.error(error);
        }
    }, [isConnected, ws, asyncNewWebSocket]);

    const trackPosition = useCallback(async () => {
        await requestPermissions();
        if (positionSubscription.current) {
            return;
        }
        await ExpoLocation.enableNetworkProviderAsync();
        const posSubscrition = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                // timeInterval: 2000,
            },
            (newPosition) => {
                setPosition(newPosition);
            }
        );
        if (WS_LOGS) console.log('Setted position subscriptions');
        positionSubscription.current = posSubscrition;
    }, [positionSubscription]);
    const trackHeading = useCallback(async () => {
        if (headingSubscription.current) {
            return;
        }
        const headSubscrition = await ExpoLocation.watchHeadingAsync((newHeading) => {
            setHeading(newHeading);
        });

        if (WS_LOGS) console.log('Setted heading subscriptions');
        headingSubscription.current = headSubscrition;
    }, [headingSubscription]);

    const simulateRoutePosition = useCallback(async (coords: LatLng[]) => {
        if (positionSubscription.current) {
            positionSubscription.current.remove();
            positionSubscription.current = null;
        }
        if (headingSubscription.current) {
            headingSubscription.current?.remove();
            headingSubscription.current = null;
        }

        const duplicatedCoords = duplicateCoords(coords);
        let currentCoordIndex = 0;

        simulationSubscription.current = setInterval(() => {
            setPosition({
                coords: {
                    latitude: duplicatedCoords[currentCoordIndex]?.latitude,
                    longitude: duplicatedCoords[currentCoordIndex]?.longitude,
                    altitude: 0,
                    accuracy: 0,
                    heading: currentCoordIndex === duplicatedCoords.length - 1 ? position?.coords.heading ?? 0 : calculateBearing(duplicatedCoords[currentCoordIndex]?.latitude, duplicatedCoords[currentCoordIndex]?.longitude, duplicatedCoords[currentCoordIndex + 1]?.latitude, duplicatedCoords[currentCoordIndex + 1]?.longitude),
                    speed: 0,
                    altitudeAccuracy: 0,
                },
                timestamp: new Date().getTime(),
            });
            currentCoordIndex++;
            if (currentCoordIndex >= duplicatedCoords.length) {
                console.log(duplicatedCoords[currentCoordIndex]?.latitude, duplicatedCoords[currentCoordIndex]?.longitude)
                currentCoordIndex = 0;
            }
        }, 2000)

        if (WS_LOGS) console.log('Simulating position route');
    }, [positionSubscription, headingSubscription, simulationSubscription]);
    const stopRouteSimulation = useCallback(async () => {
        /* if (!positionSubscription.current) {
            void trackPosition();
        }
        if (!headingSubscription.current) {
            void trackHeading();
        } */

        if (simulationSubscription.current) {
            clearInterval(simulationSubscription.current!)
            simulationSubscription.current = null
        }

        if (WS_LOGS) console.log('Stopping route simulation');
    }, [positionSubscription, headingSubscription, simulationSubscription]);

    useEffect(() => {
        if (!positionSubscription.current) {
            void trackPosition();
        }
        if (!headingSubscription.current) {
            void trackHeading();
        }

        return () => {
            if (WS_LOGS) console.log('removing position and heading subscriptions', positionSubscription, headingSubscription);
            if (positionSubscription.current) {
                positionSubscription.current.remove();
                positionSubscription.current = null;
                if (WS_LOGS) console.log('removed position subscriptions');
            }
            if (headingSubscription.current) {
                headingSubscription.current.remove();
                headingSubscription.current = null;
                if (WS_LOGS) console.log('removed heading subscriptions');
            }
        };
    }, []);
    useEffect(() => {
        if (WS_LOGS) console.log('WSContext.tsx -> useEffect [isConnected]', isConnected);
        void resetWSConnection();
        return () => {
            if (WS_LOGS) console.log('removing ws subscription', ws);
            if (ws.current?.readyState === WebSocket.OPEN)
                ws.current?.close()
        }
    }, [isConnected]);

    const actions = useMemo(() => ({
        sendStringToServer,
        findTaxi,
        cancelTaxi,
        simulateRoutePosition,
        stopRouteSimulation,
        // resetWSConnection,
        // trackPosition,
    }), [sendStringToServer, findTaxi, cancelTaxi]);

    return (
        <WSStateContext.Provider value={{ ws: ws.current, wsTaxis, heading, position, confirmedTaxi, userType: currentUserType }}>
            <WSActionsContext.Provider value={actions}>
                {children}
            </WSActionsContext.Provider>
        </WSStateContext.Provider>
    );
};

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        // Error occurred - check `error.message` for more details.
        return;
    }
    if (data) {
        if (WS_LOGS) console.log(data);
    }
});
