import React, { useEffect, useState } from 'react';
// import { useColorScheme } from 'react-native';

import TaxiMarker from './TaxiMarker';

import { IMarker } from '~/constants/Markers';
import { useWSConnection } from '~/context/WSContext';

interface props {
  onPressTaxi: (taxiId: string) => void;
}

const TaxisMarkers = ({ onPressTaxi }: props) => {
  // const colorScheme = useColorScheme();
  const { wsTaxis } = useWSConnection();
  const [taxis, setTaxis] = useState<IMarker[]>([]);

  useEffect(() => {
    const fetchTaxi = async () => {
      const resp = await fetch(
        `http://192.168.1.255:6942/taxis?ids=${wsTaxis?.map((taxi) => taxi.userId).join(',')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch taxis');
      }
      const respJson = await resp.json();
      setTaxis(respJson);
      console.log('🚀 ~ file: TaxiMarkers.tsx:34 ~ fetchTaxi ~ respJson:', respJson);
    };
    fetchTaxi();
  }, [wsTaxis]);

  return (
    <>
      {wsTaxis?.map((wsTaxi) => {
        return (
          <TaxiMarker
            id={wsTaxi.userId}
            key={wsTaxi.userId}
            taxi={taxis.find((taxi) => taxi.id === wsTaxi.userId)!}
            onPress={() => {
              onPressTaxi(wsTaxi.userId);
            }}
            heading={wsTaxi.header}
            headingAnimated
            latitude={wsTaxi.latitude}
            longitude={wsTaxi.longitude}
          />
        );
      })}
    </>
  );
};

export default TaxisMarkers;
