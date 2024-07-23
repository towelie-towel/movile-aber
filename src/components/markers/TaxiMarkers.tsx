import React, { useEffect, useState, memo, useCallback } from 'react';

import { useWSState } from '~/context/WSContext';
import { WSTaxi } from '~/context/WSContext';
import AnimatedPosHeadingMarker from '~/components/markers/AnimatedPosHeadingMarker';
import { TaxiSVG } from '~/components/svgs';

interface ITaxiMarkers {
  onPressTaxi: (taxiId: string) => Promise<void>;
  animateToRegion: (region: {
    latitudeDelta: number;
    longitudeDelta: number;
    latitude: number;
    longitude: number;
  }) => void;
  taxiConfirm: () => void;
  startRide: () => void;
}

const TaxisMarkers = ({ onPressTaxi, animateToRegion, taxiConfirm, startRide }: ITaxiMarkers) => {
  const [taxis, setTaxis] = useState<WSTaxi[]>([]);
  const { wsTaxis, confirmedTaxi } = useWSState();

  const onWsTaxisChangeHandler = useCallback(() => {
    setTaxis(wsTaxis ?? []);
  }, [wsTaxis])
  const onTaxisChangeHandler = useCallback(() => {
    if (confirmedTaxi) {
      if (confirmedTaxi.status === "confirmed") {
        animateToRegion({
          latitudeDelta: 0.00922, longitudeDelta: 0.009121,
          latitude: taxis[0].latitude,
          longitude: taxis[0].longitude,
        })
      }
    } else { }
  }, [taxis, confirmedTaxi, animateToRegion])
  const onConfirmedTaxiChangeHandler = useCallback(() => {
    if (confirmedTaxi) {
      if (confirmedTaxi.status === "confirmed") {
        taxiConfirm()
      } else if (confirmedTaxi.status === "ongoing") {
        startRide()
      }
    }
  }, [confirmedTaxi])

  useEffect(onWsTaxisChangeHandler, [wsTaxis]);
  useEffect(onTaxisChangeHandler, [taxis]);
  useEffect(onConfirmedTaxiChangeHandler, [confirmedTaxi]);

  return (
    <>
      {taxis?.map((taxi) => {
        return (
          <AnimatedPosHeadingMarker
            onPress={() => onPressTaxi(taxi.userId)}
            key={taxi.userId}
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
