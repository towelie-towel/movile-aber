import React, { useEffect, useState, memo, useCallback } from 'react';
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

interface ITaxiMarkers {
  onPressTaxi: (taxiId: string) => Promise<void>;
  animateToRegion: (region: {
    latitudeDelta: number;
    longitudeDelta: number;
    latitude: number;
    longitude: number;
  }) => void;
}

const TaxisMarkers = ({ onPressTaxi, animateToRegion }: ITaxiMarkers) => {
  // const colorScheme = useColorScheme();
  const [taxis, setTaxis] = useState<WSTaxi[]>([]);
  const { wsTaxis, confirmedTaxi } = useWSState();

  const onWsTaxisChangeHandler = useCallback(() => {
    if (confirmedTaxi) {
      const confirmedTaxiLocation = wsTaxis?.find(taxi => taxi.userId === confirmedTaxi.userId)
      if (!confirmedTaxiLocation) {
        console.error("confirmed taxi not found")
        return
      }
      setTaxis([confirmedTaxiLocation]);
      animateToRegion({
        latitudeDelta: 0.00922, longitudeDelta: 0.009121,
        latitude: confirmedTaxiLocation.latitude,
        longitude: confirmedTaxiLocation.longitude,
      })
    } else {
      setTaxis(wsTaxis ?? []);
    }
  }, [wsTaxis, confirmedTaxi, animateToRegion])

  useEffect(onWsTaxisChangeHandler, [wsTaxis]);

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

export default memo(TaxisMarkers);
