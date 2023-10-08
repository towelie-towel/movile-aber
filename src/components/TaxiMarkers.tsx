import React from 'react';
// import { useColorScheme } from 'react-native';

import TaxiMarker from './TaxiMarker';

import { useWSConnection } from '~/context/WSContext';

interface props {
  onSelectTaxi: (taxiId: string) => void;
}

const TaxisMarkers = ({ onSelectTaxi }: props) => {
  // const colorScheme = useColorScheme();
  const { wsTaxis } = useWSConnection();

  return (
    <>
      {wsTaxis?.map((taxi) => {
        return (
          <TaxiMarker
            index={taxi.userId}
            onPress={() => {
              onSelectTaxi(taxi.userId);
            }}
            heading={0}
            headingAnimated={false}
            latitude={taxi.latitude}
            longitude={taxi.longitude}
          />
        );
      })}
    </>
  );
};

export default TaxisMarkers;
