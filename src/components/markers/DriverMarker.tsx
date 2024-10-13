import React, { memo } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Circle } from 'react-native-maps';

import AnimatedMarker from './AnimatedMarker';
import { useWSState } from '~/context/WSContext';
import { MotiView } from '@motify/components';
import { Easing } from 'react-native-reanimated';
import { TaxiSVG } from '~/components/svgs';

type UserMarkerProps = {
  activeCircle?: boolean;
  activeWaves?: boolean;
}

const UserMarker = ({ activeCircle = false, activeWaves = false }: UserMarkerProps) => {
  const { position } = useWSState();

  if (!position) {
    return;
  }

  return (
    <>
      <AnimatedMarker
        heading={/* heading?.trueHeading ??  */position.coords.heading ?? 0}
        headingAnimated={true}
        latitude={position.coords.latitude}
        longitude={position.coords.longitude}
        anchor={{ x: 0.5, y: 0.6 }}
        flat
      >
        <TaxiSVG />
        {activeWaves &&
          [...Array(3).keys()].map((index) => (
            <View key={index} className='flex-1 absolute top-[-13px] left-[-13px]'>
              <MotiView
                from={{ opacity: 0.7, scale: 0.2 }}
                animate={{ opacity: 0, scale: 2 }}
                // @ts-ignore
                transition={{
                  type: "timing",
                  duration: 2000,
                  easing: Easing.out(Easing.ease),
                  delay: 1000 * index,
                  repeatReverse: false,
                  repeat: Infinity,
                }}
                style={[
                  {
                    backgroundColor: '#FCCB6F',
                    borderRadius: 1000,
                    height: 50,
                    width: 50,
                  },
                ]}
              />
            </View>
          ))
        }
      </AnimatedMarker>
      {activeCircle && <Circle
        center={{
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }}
        radius={position.coords.accuracy ?? 0}
        strokeColor="rgba(0, 150, 255, 0.5)"
        fillColor="rgba(0, 150, 255, 0.5)"
      />}
    </>
  );
};

export default memo(UserMarker);

