import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { type LatLng } from 'react-native-maps';
// import { useColorScheme } from 'react-native';

import TaxiMarker from './TaxiMarker';

import { getDirections } from '~/utils/directions';

const AnimatedRouteMarker = () => {
  // const colorScheme = useColorScheme();

  const anim_route_ref = useRef<LatLng[]>([]);
  const route_count_ref = useRef(0);
  const [current_coords, set_current_coords] = useState<{ latitude: number; longitude: number }>({
    latitude: 23.1218644,
    longitude: -82.32806211,
  });

  const _getLiveLocation = useCallback(() => {
    if (anim_route_ref.current.length !== route_count_ref.current) {
      const latitude = anim_route_ref.current[route_count_ref.current + 1]?.latitude;
      const longitude = anim_route_ref.current[route_count_ref.current + 1]?.longitude;
      route_count_ref.current = route_count_ref.current + 1;

      if (!latitude || !longitude) {
        return;
      }

      set_current_coords({ latitude, longitude });
    } else {
      route_count_ref.current = 0;
    }
  }, [anim_route_ref, route_count_ref]);

  useEffect(() => {
    getDirections('23.1218644,-82.32806211', '23.1118644,-82.31806211')
      .then((new_direction) => {
        anim_route_ref.current = new_direction ?? [];
      })
      .catch((err) => {
        console.log('🚀 ~ file: AnimatedRouteMarker.tsx:36 ~ useEffect ~ err:', err);
      });

    const interbal_sub = setInterval(() => {
      _getLiveLocation();
    }, 3000);
    console.log(
      '🚀 ~ file: AnimatedRouteMarker.tsx:52 ~ constinterbal_sub=setInterval ~ interbal_sub:',
      interbal_sub
    );

    return () => {
      clearInterval(interbal_sub);
      console.log('🚀 ~ file: AnimatedRouteMarker.tsx:56 ~ return ~ clearInterval:', clearInterval);
    };
  }, [_getLiveLocation]);

  return (
    <>
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        anim_route_ref.current.length > 0 && (
          <TaxiMarker
            id="1345678"
            taxi={{
              coordinate: {
                latitude: current_coords.latitude,
                longitude: current_coords.longitude,
              },
            }}
            onPress={() => {
              console.log('🚀 ~ file: AnimatedRouteMarker.tsx:69 ~ onPress ~ onPress');
            }}
            latitude={current_coords.latitude}
            longitude={current_coords.longitude}
            heading={0}
          />
        )
      }
    </>
  );
};

export default memo(AnimatedRouteMarker);
