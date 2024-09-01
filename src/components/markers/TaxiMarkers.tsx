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
  }, duration?: number) => void;
  followLocation: React.MutableRefObject<"user" | "taxi" | null>;
  taxiConfirm: () => void;
  startRide: () => void;
}

const TaxisMarkers = ({ onPressTaxi, animateToRegion, followLocation, taxiConfirm, startRide }: ITaxiMarkers) => {
  const [taxis, setTaxis] = useState<WSTaxi[]>([]);
  const { wsTaxis, confirmedTaxi } = useWSState();

  const onWsTaxisChangeHandler = useCallback(() => {
    setTaxis(wsTaxis ?? []);
  }, [wsTaxis])
  const onTaxisChangeHandler = useCallback(() => {
    if (followLocation.current === "taxi") {
      if (confirmedTaxi && (confirmedTaxi?.status === "confirmed" || confirmedTaxi?.status === "ongoing")) {
        animateToRegion({
          latitudeDelta: 0.00922, longitudeDelta: 0.009121,
          latitude: taxis[0].latitude,
          longitude: taxis[0].longitude,
        })
      }
    } else { }
  }, [taxis, confirmedTaxi, animateToRegion, followLocation])
  const onConfirmedTaxiChangeHandler = useCallback(() => {
    if (confirmedTaxi) {
      if (confirmedTaxi.status === "confirmed") {
        console.log("confirmedTaxi - confirmed: ", JSON.stringify(confirmedTaxi, null, 2))
        taxiConfirm()
      } else if (confirmedTaxi.status === "ongoing") {
        console.log("confirmedTaxi - ongoing: ", JSON.stringify(confirmedTaxi, null, 2))
        startRide()
      }
    }
  }, [confirmedTaxi, taxiConfirm, startRide])
  const onFollowLocationChangeHandler = useCallback(() => {
    if (followLocation.current === "taxi") {
      animateToRegion({
        latitudeDelta: 0.00922, longitudeDelta: 0.009121,
        latitude: taxis[0].latitude,
        longitude: taxis[0].longitude,
      })
    }
  }, [followLocation])

  useEffect(onWsTaxisChangeHandler, [wsTaxis]);
  useEffect(onTaxisChangeHandler, [taxis]);
  useEffect(onConfirmedTaxiChangeHandler, [confirmedTaxi]);
  useEffect(onFollowLocationChangeHandler, [followLocation]);

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
