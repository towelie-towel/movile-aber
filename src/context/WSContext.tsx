import NetInfo from '@react-native-community/netinfo';
import * as ExpoLocation from 'expo-location';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface WSTaxi {
  latitude: number;
  longitude: number;
  userId: string;
}

interface WSContext {
  ws: WebSocket | null | undefined;
  wsTaxis: WSTaxi[] | undefined;
  position: ExpoLocation.LocationObject | undefined;
  heading: ExpoLocation.LocationHeadingObject | undefined;
  resetConnection: () => Promise<void>;
  trackPosition: () => Promise<void>;
}

const initialValue: WSContext = {
  ws: undefined,
  wsTaxis: undefined,
  position: undefined,
  heading: undefined,
  resetConnection: async () => {
    throw new Error('Function not initizaliced yet');
  },
  trackPosition: async () => {
    throw new Error('Function not initizaliced yet');
  },
};

const WSContext = createContext(initialValue);

export const useWSConnection = () => {
  return useContext(WSContext);
};

export const WSProvider = ({ children }: { children: React.ReactNode }) => {
  const [wsTaxis, setWsTaxis] = useState<WSTaxi[]>([]);
  const [heading, setHeading] = useState<ExpoLocation.LocationHeadingObject>();
  const [position, setPosition] = useState<ExpoLocation.LocationObject>();

  const [streamingTo, _setStreamingTo] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const positionSubscription = useRef<ExpoLocation.LocationSubscription | null>();
  const headingSubscription = useRef<ExpoLocation.LocationSubscription | null>();

  const { isConnected, isInternetReachable } = NetInfo.useNetInfo();

  const sendStringToServer = (message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current?.send(message);
    } else {
      console.error('❌ sendStringToServer ==> !WebSocket.OPEN');
    }
  };

  const handleWebSocketMessage = (event: MessageEvent<string>) => {
    const message = event.data;
    if (typeof message !== 'string') {
      return;
    }
    console.log('✅ handleWebSocketMessage ==> message = ', message);
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
          userId: id ?? '',
        };
      });
    console.log('🚀 ~ file: WSContext.tsx:79 ~ handleWebSocketMessage ~ taxis:', taxis);
    setWsTaxis(taxis);
  };

  const asyncNewWebSocket = () => {
    const protocol = `map-client`;

    console.log('🌊 asyncNewWebSocket ==> websuckItToMeBBy ', protocol);
    const suckItToMeBBy = new WebSocket(
      `ws://192.168.1.103:6942/subscribe?id=03563972-fab9-4744-b9a7-15f8d35d38c9&lat=51.5073509&lon=-0.1277581999999997`,
      protocol
    );

    // TODO: stream depending the role
    suckItToMeBBy.addEventListener('open', (_event) => {
      console.log('🎯 asyncNewWebSocket ==> (Connection opened)');
    });

    suckItToMeBBy.addEventListener('close', (_event) => {
      console.log('❌ asyncNewWebSocket ==> (Connection closed)');

      setTimeout(() => {
        resetConnection();
      }, 5000);
    });

    suckItToMeBBy.addEventListener('error', (_error) => {
      console.log('💥 asyncNewWebSocket ==> (Connection error)', JSON.stringify(_error, null, 2));
    });

    suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

    return suckItToMeBBy;
  };

  const trackPosition = async () => {
    const { granted: permissionGranted } = await ExpoLocation.getForegroundPermissionsAsync();

    if (!permissionGranted) {
      console.log('🚫 trackPosition ==> permissionGranted = false (requesting permission)');
      await ExpoLocation.requestForegroundPermissionsAsync();
    }

    if (positionSubscription.current) {
      console.log('🌬️ trackPosition ==> positionSubscription = true ');
      return;
    }

    await ExpoLocation.enableNetworkProviderAsync();

    const posSubscrition = await ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
        timeInterval: 2000,
      },
      (newPosition) => {
        try {
          if (streamingTo) {
            sendStringToServer(`${newPosition.coords.latitude},${newPosition.coords.longitude}`);
          }
          setPosition(newPosition);
        } catch (error) {
          console.error(error);
        }
      }
    );

    console.log('📌 trackPosition ==> (Setted position subscriptions)');
    positionSubscription.current = posSubscrition;
  };

  const trackHeading = async () => {
    if (headingSubscription.current) {
      console.log('🌬️ trackHeading ==> headingSubscription = true ');
      return;
    }
    const headSubscrition = await ExpoLocation.watchHeadingAsync((newHeading) => {
      setHeading(newHeading);
    });

    console.log('📌 trackPosition ==> (Setted heading subscriptions)');
    headingSubscription.current = headSubscrition;
  };

  const resetConnection = async () => {
    if (!isConnected || !isInternetReachable) {
      console.warn('💣 ==> No internet connection ==> ');
      return;
    }

    try {
      if (!ws.current) {
        console.log('🎯 resetConnection ==> initializasing web socket');
        ws.current = await asyncNewWebSocket();
      } else if (ws.current.readyState === WebSocket.OPEN) {
        console.warn('🌬️ resetConnection ==> a connection is already open');
      } else if (ws.current.readyState === WebSocket.CLOSED) {
        console.log('🚿 resetConnection ==> reseting connection');
        ws.current = await asyncNewWebSocket();
      } else {
        console.error(
          '🪠 resetConnection ==> ws.current.readyState = "CONNECTING" || "CLOSING" ',
          JSON.stringify(ws.current, null, 2)
        );
        // TODO: handle CONNECTING and CLOSING cases
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!positionSubscription.current) {
      console.log('📭 <== useEffect ==> WSContext.tsx ==> [] (📌trackPosition) ');
      void trackPosition();
    }
    if (!headingSubscription.current) {
      console.log('📭 <== useEffect ==> WSContext.tsx ==> [] (📌trackHeading) ');
      void trackHeading();
    }

    return () => {
      console.log(
        '📪 <== useEffect-return ==> WSContext.tsx ==> [] (🔪position/heading subscriptions)'
      );
      if (positionSubscription.current) {
        positionSubscription.current.remove();
        positionSubscription.current = null;
      }
      if (headingSubscription.current) {
        headingSubscription.current.remove();
        headingSubscription.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('📭 <== useEffect ==> WSContext.tsx ==> [isConnected] (📈resetConnection)');
    void resetConnection();
  }, [isConnected]);

  return (
    <WSContext.Provider
      value={{
        ws: ws.current,
        wsTaxis,
        position,
        heading,
        resetConnection,
        trackPosition,
      }}>
      {children}
    </WSContext.Provider>
  );
};
