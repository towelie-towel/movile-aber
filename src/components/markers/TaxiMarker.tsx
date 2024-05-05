import { memo, useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform } from 'react-native';
import { AnimatedRegion, MapMarker, Marker } from 'react-native-maps';

import { IMarker } from '~/constants/Markers';

type AnimatedMarkerParams = {
  id: string;
  taxi?: IMarker;
  onPress: () => void;
  longitude: number;
  latitude: number;
  heading: number;
  headingAnimated?: boolean;
};

function TaxiMarker({
  id,
  taxi,
  onPress,
  latitude,
  longitude,
  heading,
  headingAnimated,
}: AnimatedMarkerParams) {
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.003;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const animatedHeading = useRef(new Animated.Value(heading)).current;

  const anim_marker_ref = useRef<MapMarker | null>(null);
  const anim_marker_coords_ref = useRef<AnimatedRegion>(
    new AnimatedRegion({
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    })
  );

  const animateTo = (toLatitude: number, toLongitude: number, toHeading: number) => {
    if (heading) {
      Animated.timing(animatedHeading, {
        toValue: toHeading ?? 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start(() => {
        if (Platform.OS === 'android') {
          if (anim_marker_ref) {
            anim_marker_ref.current?.animateMarkerToCoordinate(
              {
                latitude: toLatitude,
                longitude: toLongitude,
              },
              1000
            );
          }
          setTimeout(() => {
            anim_marker_coords_ref.current.setValue({
              latitude: toLatitude,
              longitude: toLongitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
          }, 1000);
        } else {
          anim_marker_coords_ref.current
            .timing({
              duration: 1000,
              easing: Easing.linear,
              toValue: 0,
              useNativeDriver: false,
              latitudeDelta: 0,
              longitudeDelta: 0,
              latitude: toLatitude,
              longitude: toLongitude,
            })
            .start();
        }
      });
    }
  };

  useEffect(() => {
    animateTo(latitude, longitude, heading);
  }, [latitude, longitude, heading]);
  /* useEffect(() => {
    console.log('Updated values:', latitude, longitude, heading);
  }, [latitude, longitude, heading]); */

  return (
    <Marker.Animated
      key={id}
      // @ts-ignore
      coordinate={anim_marker_coords_ref.current}
      // @ts-ignore
      ref={(_ref) => (anim_marker_ref.current = _ref)}
      renderToHardwareTextureAndroid
      shouldRasterizeIOS
      tracksViewChanges={false}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={headingAnimated ? animatedHeading : undefined}
      icon={require('../../../assets/images/Car_Black.png')}
    />
  );
}

export default memo(TaxiMarker);
