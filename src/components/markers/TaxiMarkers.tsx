import React, { useEffect, useState } from 'react';
// import { useColorScheme } from 'react-native';

import { useWSState } from '~/context/WSContext';
import { WSTaxi } from '~/context/WSContext';
import AnimatedPosHeadingMarker from '~/components/markers/AnimatedPosHeadingMarker';
import { TaxiSVG } from '~/components/svgs';

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

/* interface props {
  onPressTaxi: (taxiId: string) => void;
} */

const TaxisMarkers = (/* { onPressTaxi }: props */) => {
  // const colorScheme = useColorScheme();
  const [taxis, setTaxis] = useState<WSTaxi[]>([]);
  const { wsTaxis, confirmedTaxi } = useWSState();

  useEffect(() => {
    setTaxis(wsTaxis ?? []);
  }, [wsTaxis]);

  return (
    <>
      {taxis?.map((taxi) => {
        return (
          <AnimatedPosHeadingMarker
            key={taxi.userId}
            heading={0}
            headingAnimated={true}
            latitude={taxi.latitude}
            longitude={taxi.longitude}
            anchor={{ x: 0.5, y: 0.6 }}
            flat
          >
            <TaxiSVG isOnRide={!!confirmedTaxi} />
          </AnimatedPosHeadingMarker>
        );
      })}
    </>
  );
};

export default TaxisMarkers;
