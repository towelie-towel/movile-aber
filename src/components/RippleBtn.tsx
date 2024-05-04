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

interface RippleProps {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onTap?: () => void;
  children: React.ReactNode;
}

const Ripple: React.FC<RippleProps> = ({ style, onTap, children, contentContainerStyle }) => {
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const scale = useSharedValue(0);

  const aRef = useAnimatedRef<View>();
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const rippleOpacity = useSharedValue(1);

  const tapGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onStart: (tapEvent) => {
      if (RIPPLE_LOGS) console.log('onStart');
      const layout = measure(aRef);
      width.value = layout.width;
      height.value = layout.height;

      centerX.value = tapEvent.x;
      centerY.value = tapEvent.y;

      rippleOpacity.value = 1;
      scale.value = 0;
      scale.value = withTiming(1, { duration: 500 }, () => {
        /* rippleOpacity.value = 0;
        scale.value = 0; */
        if (RIPPLE_LOGS) console.log('start animation finished');
        // rippleOpacity.value = withTiming(0, { duration: 1000 });
        // scale.value = withTiming(0, { duration: 1000 });
      });
      // scale.value = withTiming(1, { duration: layout.width * 4 });
    },
    onActive: (event) => {
      if (RIPPLE_LOGS) console.log('onActive');
      if (onTap) runOnJS(onTap)();
    },
    onFinish: () => {
      if (RIPPLE_LOGS) console.log('onFinish');
      // rippleOpacity.value = withTiming(0);
      // scale.value = withTiming(0, { duration: 1000 });
    },
    onEnd: () => {
      if (RIPPLE_LOGS) console.log('onEnd');
      // rippleOpacity.value = withTiming(0, { duration: 1000 }, () => {
      //   scale.value = 0;
      // });
      // rippleOpacity.value = withTiming(0);
    },
    onCancel: () => {
      if (RIPPLE_LOGS) console.log('onCancel');
      // rippleOpacity.value = withTiming(0, { duration: 1000 }, () => {
      //   scale.value = 0;
      // });
    },
    onFail: (e) => {
      if (RIPPLE_LOGS) console.log('onFail', e);
      // rippleOpacity.value = withTiming(0, { duration: 1000 });
      // scale.value = withTiming(0, { duration: 1000 });
    },
  });

  const rStyle = useAnimatedStyle(() => {
    const circleRadius = Math.sqrt(width.value ** 2 + height.value ** 2);

    const translateX = centerX.value - circleRadius;
    const translateY = centerY.value - circleRadius;

    return {
      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
      opacity: rippleOpacity.value,
      backgroundColor: 'rgba(0,0,0,0.2)',
      position: 'absolute',
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
        if (RIPPLE_LOGS) console.log('touch end');
        rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
          if (RIPPLE_LOGS) console.log('touch end animation finished');
          scale.value = 0;
        });
      }}
      ref={aRef}
      collapsable={false}>
      <TapGestureHandler onGestureEvent={tapGestureEvent}>
        <Animated.View style={[style, { overflow: 'hidden' }]}>
          <View>{children}</View>
          <Animated.View style={rStyle} />
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
};

export default Ripple;
