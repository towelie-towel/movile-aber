import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  State,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const RIPPLE_LOGS = false;

interface RippleCenterProps {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onTap?: () => void;
  children: React.ReactNode;
  radius?: number;
}

const RippleCenter: React.FC<RippleCenterProps> = ({
  style,
  onTap,
  children,
  contentContainerStyle,
  radius,
}) => {
  const scale = useSharedValue(0);
  const aRef = useAnimatedRef<View>();
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const rippleOpacity = useSharedValue(1);

  const tapGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onStart: (tapEvent) => {
      const layout = measure(aRef);
      width.value = layout.width;
      height.value = layout.height;

      rippleOpacity.value = 1;
      scale.value = 0;
      scale.value = withTiming(1, { duration: 500 }, () => {
        if (RIPPLE_LOGS) console.log('start animation finished');
      });
    },
    onActive: (event) => {
      if (onTap) runOnJS(onTap)();
    },
    onFinish: () => {
      if (RIPPLE_LOGS) console.log('onFinish');
    },
    onEnd: () => {
      if (RIPPLE_LOGS) console.log('onEnd');
    },
    onCancel: () => {
      if (RIPPLE_LOGS) console.log('onCancel');
    },
    onFail: () => {
      if (RIPPLE_LOGS) console.log('onFail');
    },
  });

  const rStyle = useAnimatedStyle(() => {
    const circleRadius = radius ?? Math.sqrt(width.value ** 2 + height.value ** 2) / 2;

    const translateX = width.value / 2 - circleRadius;
    const translateY = height.value / 2 - circleRadius;

    return {
      /* borderColor: 'blue',
      borderWidth: 2,
      borderStyle: 'dotted', */

      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
      opacity: rippleOpacity.value,
      backgroundColor: 'rgba(0,0,0,0.2)',
      position: 'absolute',
      overflow: 'visible',
      top: 0,
      left: 0,
      transform: [
        { translateX },
        { translateY },
        {
          scale: scale.value,
        },
      ],
    };
  });

  return (
    <View
      onTouchEnd={() => {
        rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
          scale.value = 0;
        });
      }}
      ref={aRef}
      collapsable={false}>
      <TapGestureHandler onGestureEvent={tapGestureEvent}>
        <Animated.View
          style={[
            {
              overflow: 'visible',
              borderRadius: 50,
              height: 100,

              /* borderColor: 'red',
              borderWidth: 2,
              borderStyle: 'dotted', */
            },
            style,
          ]}>
          {children}
          <Animated.View style={rStyle} />
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
};

export default RippleCenter;
