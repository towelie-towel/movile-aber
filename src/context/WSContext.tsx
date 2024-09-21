import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as ExpoLocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LatLng } from 'react-native-maps';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { calculateDistance, calculateBearing, duplicateCoords } from '~/utils/directions';
import { getTaxiProfile, saveExpoPushTokenToDB } from '~/utils/auth';
import type { TaxiProfile } from '~/types/Taxi';
import type { RideInfo, RideStatus } from '~/types/RideFlow';
import type { Profile } from '~/types/User';
import type { ChatMessage } from '~/types/Chat';
import { Platform } from 'react-native';
import { useAtom } from 'jotai/react';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function sendPushNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Original Title',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(pushTokenString);
            return pushTokenString;
        } catch (e: unknown) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}


const storedExpoPushToken = createJSONStorage<string | null | undefined>(() => AsyncStorage)
export const expoPushTokenAtom = atomWithStorage<string | null | undefined>('expo_push_token', undefined, storedExpoPushToken)

const WS_LOGS = true;
const LOCATION_TASK_NAME = 'background-location-task';

export interface WSTaxi {
    latitude: number;
    longitude: number;
    header: number;
    userId: string;
}

interface WSStateContext {
    ws: WebSocket | null | undefined;
    recievedMessages: ChatMessage[] | undefined | null;
    wsTaxis: WSTaxi[] | null | undefined;
    confirmedTaxi: TaxiProfile & { status: RideStatus } | undefined | null;
    position: ExpoLocation.LocationObject | undefined;
    heading: ExpoLocation.LocationHeadingObject | undefined;
}
interface WSActionsContext {
    sendStringToServer: (message: string) => void;
    sendMessageTo: (message: ChatMessage) => void;
    findTaxi: (ride: RideInfo, taxiid?: string) => Promise<void>;
    cancelTaxi: () => Promise<void>;
    /* simulateRoutePosition: (coords: LatLng[]) => Promise<void>;
    stopRouteSimulation: () => Promise<void>; */
}

const stateInitialValue: WSStateContext = {
    ws: undefined,
    recievedMessages: undefined,
    wsTaxis: undefined,
    confirmedTaxi: undefined,
    position: undefined,
    heading: undefined,
};
const stateActionslValue: WSActionsContext = {
    /* simulateRoutePosition: async () => {
        throw new Error('Function not initizaliced yet');
    },
    stopRouteSimulation: async () => {
        throw new Error('Function not initizaliced yet');
    }, */
    sendStringToServer: async () => {
        throw new Error('Function not initizaliced yet');
    },
    sendMessageTo: async () => {
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

        /* const { status: backgroundStatus } = await ExpoLocation.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
            if (WS_LOGS) console.log('backgroundStatus permissions granted');
            await ExpoLocation.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: ExpoLocation.Accuracy.Balanced,
            });
        } */
    }
};

export const WSProvider = ({ children, userProfile }: { children: React.ReactNode, userProfile: Profile | null }) => {
    const ws = useRef<WebSocket | null>(null);
    const positionSubscription = useRef<ExpoLocation.LocationSubscription | null>();
    const headingSubscription = useRef<ExpoLocation.LocationSubscription | null>();
    const simulationSubscription = useRef<NodeJS.Timeout | null>();

    const { isConnected } = NetInfo.useNetInfo();
    const [wsTaxis, setWsTaxis] = useState<WSTaxi[]>([]);
    const [heading, setHeading] = useState<ExpoLocation.LocationHeadingObject>();
    const [position, setPosition] = useState<ExpoLocation.LocationObject>();
    const [confirmedTaxi, setConfirmedTaxi] = useState<TaxiProfile & { status: RideStatus } | null>();
    const [recievedMessages, setRecievedMessages] = useState<ChatMessage[] | null>();

    const [expoPushToken, setExpoPushToken] = useAtom(expoPushTokenAtom);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

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

    const handleWebSocketMessage = useCallback(async (event: MessageEvent<string>) => {
        const message = event.data;
        if (typeof message !== 'string') {
            return;
        }
        if (WS_LOGS) console.log('handleWebSocketMessage: ', message);
        if (message.startsWith("taxis-")) {

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
            setWsTaxis(sortedTaxis);

        } else if (message.startsWith("confirm-")) {

            const taxiUid = message.replace('confirm-', '');
            let taxi: TaxiProfile | undefined;
            taxi = await getTaxiProfile(taxiUid)
            setConfirmedTaxi({ ...taxi, status: "confirmed" })

        } else if (message.startsWith("ridestart-")) {

            const taxiUid = message.replace('ridestart-', '');
            let taxi: TaxiProfile | undefined;
            taxi = await getTaxiProfile(taxiUid)
            setConfirmedTaxi({ ...taxi, status: "ongoing" })

        } else if (message.startsWith("completed-")) {

            const taxiUid = message.replace('completed-', '');
            let taxi: TaxiProfile | undefined;
            taxi = await getTaxiProfile(taxiUid)
            setConfirmedTaxi({ ...taxi, status: "completed" })

        } else if (message.startsWith("sentfrom-")) {

            const chatMsgJSON = message.replace('sentfrom-', '');
            const chatMsg = JSON.parse(chatMsgJSON) as ChatMessage;

            console.log(JSON.stringify({ chatMsg, userProfile }, null, 2))
            // while development could be same sended message
            if (chatMsg.sender_id === userProfile?.id) {
                return
            }

            setRecievedMessages(prev => {
                return prev ? [...prev, chatMsg] : [chatMsg]
            })

        }

        // while development could be same sended message
    }, [userProfile, confirmedTaxi]);

    const asyncNewWebSocket = useCallback(() => {
        const protocol = `map-client`;

        if (WS_LOGS) console.log('new Web Socket initializing', protocol);
        const suckItToMeBBy = new WebSocket(
            `ws://192.168.1.100:6942/subscribe?id=e117adcb-f429-42f7-95d9-07f1c92a1c8b&lat=51.5073509&lon=-0.1277581999999997&head=51`,
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

    const closeWSConnection = useCallback(() => {
        if (WS_LOGS) console.log('removing ws subscription', ws);
        if (ws.current?.readyState === WebSocket.OPEN)
            ws.current?.close()
    }, [ws])
    const openWSConnection = useCallback(() => {
        if (!isConnected) {
            console.warn('💣 ==> No internet connection ==> ');
            return;
        }
        try {
            if (!ws.current) {
                if (WS_LOGS) console.log('initializasing web socket');
                ws.current = asyncNewWebSocket();
            } else if (ws.current.readyState === WebSocket.OPEN) {
                console.warn('a ws connection is already open');
            } else if (ws.current.readyState === WebSocket.CLOSED) {
                if (WS_LOGS) console.log('🚿 openWSConnection ==> reseting connection');
                ws.current = asyncNewWebSocket();
            } else {
                console.error("ws connection is not OPEN or CLOSED");
                // TODO: handle CONNECTING and CLOSING cases
            }
        } catch (error) {
            console.error(error);
        }
        return closeWSConnection
    }, [isConnected, ws, asyncNewWebSocket, closeWSConnection]);

    const trackPosition = useCallback(async () => {
        await requestPermissions();
        if (positionSubscription.current) {
            console.warn("Position subscription already setted")
            return;
        }
        // await ExpoLocation.enableNetworkProviderAsync();
        const posSubscrition = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: 1800,
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
            console.warn("Heading subscription already setted")
            return;
        }
        const headSubscrition = await ExpoLocation.watchHeadingAsync((newHeading) => {
            setHeading(newHeading);
        });

        if (WS_LOGS) console.log('Setted heading subscriptions');
        headingSubscription.current = headSubscrition;
    }, [headingSubscription]);


    const startTracking = useCallback(() => {
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
    }, [positionSubscription, trackPosition, headingSubscription, trackHeading]);

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
    }, [/* positionSubscription, headingSubscription,  */simulationSubscription]);

    const sendMessageTo = useCallback((message: ChatMessage) => {
        sendStringToServer(`sendto-${JSON.stringify(message)}`)
    }, [sendStringToServer]);

    useEffect(startTracking, []);
    useEffect(openWSConnection, [isConnected]);

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => {
                if (token && token !== expoPushToken) {
                    if (userProfile?.id) {
                        saveExpoPushTokenToDB({ token, profile_id: userProfile.id });
                        setExpoPushToken(token ?? null)
                    } else {
                        console.error("user profile not found during push token saving")
                    }
                }
            })
            .catch((error: any) => setExpoPushToken(`${error}`));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const actions = useMemo(() => ({
        sendStringToServer,
        sendMessageTo,
        findTaxi,
        cancelTaxi,
        /* simulateRoutePosition,
        stopRouteSimulation, */
    }), [sendStringToServer, findTaxi, cancelTaxi, /* simulateRoutePosition, stopRouteSimulation */]);

    return (
        <WSStateContext.Provider value={{ ws: ws.current, recievedMessages, wsTaxis, heading, position, confirmedTaxi }}>
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

/* 
curl -X POST https://exp.host/--/api/v2/push/send \
-H "Accept: application/json" \
-H "Accept-Encoding: gzip, deflate" \
-H "Content-Type: application/json" \
-d '{
    "to": "GpSFRtDIvXf4t_uR1_3EZ0",
    "sound": "default",
    "title": "Original Title",
    "body": "And here is the body!",
    "data": { "someData": "goes here" }
}'
*/