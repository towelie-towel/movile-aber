import React, { useRef, useCallback, useEffect, memo } from 'react';
import { Animated, Dimensions, Easing, Platform } from 'react-native';
import { MapMarkerProps, AnimatedRegion, MarkerAnimated, type MapMarker, LatLng } from 'react-native-maps';
import { calculateBearing } from '~/utils/directions';

type AnimatedMarkerParams = {
  longitude: number;
  latitude: number;
  heading: number;
  headingAnimated?: boolean;
} & Omit<MapMarkerProps, 'coordinate'>;

const AnimatedMarker: React.FC<AnimatedMarkerParams> = ({
  latitude,
  longitude,
  heading,
  headingAnimated,
  children,
  ...restProps
}) => {
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.003;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const animatedHeading = useRef(new Animated.Value(0)).current;

  const anim_marker_ref = useRef<MapMarker | null>(null);
  const anim_marker_coords_ref = useRef<AnimatedRegion>(
    new AnimatedRegion({
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    })
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      anim_marker_ref?.current?.animateMarkerToCoordinate(
        {
          latitude: latitude,
          longitude: longitude,
        },
      );
    } else {
      anim_marker_coords_ref.current
        .timing({
          easing: Easing.linear,
          toValue: 0,
          useNativeDriver: false,
          latitudeDelta: 0,
          longitudeDelta: 0,
          latitude: latitude,
          longitude: longitude,
        })
        .start();
    }
  }, [latitude, longitude]);
  useEffect(() => {
    Animated.timing(animatedHeading, {
      toValue: heading,
      useNativeDriver: true,
    }).start();
  }, [heading]);

  return (
    <MarkerAnimated
      p
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      coordinate={anim_marker_coords_ref.current} ref={(_ref) => (anim_marker_ref.current = _ref)}
      tracksViewChanges={false}
      // rotation={!headingAnimated ? heading : undefined}
      {...restProps}
    >
      <Animated.View
        style={
          headingAnimated
            ? {
              transform: [
                {
                  rotate: animatedHeading.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }
            : {}
        }>
        {children}
      </Animated.View>
    </MarkerAnimated>
  );
};

export default memo(AnimatedMarker);