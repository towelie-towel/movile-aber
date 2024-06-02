import React, { useEffect, useState, useRef } from 'react';
// import { useColorScheme } from 'react-native';

import TaxiMarker from './TaxiMarker';
import { View } from 'react-native';
import { MotiView } from '@motify/components';
import { LatLng } from 'react-native-maps';

import { IMarker } from '~/constants/Markers';
import { useWSConnection } from '~/context/WSContext';
import { TaxiSVG } from '../svgs';
import AnimatedMarker from './AnimatedMarker';
import { WSTaxi } from '~/context/WSContext';
import { calculateBearing } from '~/utils/directions';

/* 
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
*/

interface props {
  onPressTaxi: (taxiId: string) => void;
}

const TaxisMarkers = ({ onPressTaxi }: props) => {
  // const colorScheme = useColorScheme();
  const [taxis, setTaxis] = useState<WSTaxi[]>([]);
  const { wsTaxis } = useWSConnection();

  useEffect(() => {
    setTaxis(wsTaxis ?? []);
  }, [wsTaxis]);

  return (
    <>
      {taxis?.map((taxi) => {
        return (
          <AnimatedMarker
            key={`${taxi.userId}`}
            heading={0}
            headingAnimated={true}
            latitude={taxi.latitude}
            longitude={taxi.longitude}
            anchor={{ x: 0.5, y: 0.6 }}
            flat
          >
            <TaxiSVG />
          </AnimatedMarker>
        );
      })}
    </>
  );
};

export default TaxisMarkers;
