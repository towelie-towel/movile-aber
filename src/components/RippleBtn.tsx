import React, { useState } from 'react';
import { View, useColorScheme, ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { measure, useAnimatedRef, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type RippleProps = {
  onTap?: () => void;
  children: React.ReactNode;
} & ViewProps;

const Ripple: React.FC<RippleProps> = ({ onTap, children, ...restProps }) => {
  const colorSheme = useColorScheme()
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const scale = useSharedValue(0);

  const aRef = useAnimatedRef<View>();
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const rippleOpacity = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin((tapEvent) => {
      const layout = measure(aRef);
      if (!layout) return;
      width.value = layout.width;
      height.value = layout.height;

      centerX.value = tapEvent.x;
      centerY.value = tapEvent.y;

      rippleOpacity.value = 1;
      scale.value = withTiming(1, { duration: 500 });
    })
    .onEnd(() => {
      rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
        if (scale.value !== 0) {
          scale.value = 0;
        }
        onTap && onTap();
      });
    })
    .onTouchesCancelled(() => {
      rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
        scale.value = 0;
      });
    })
    .maxDuration(20000)
    .maxDistance(100000)
    .shouldCancelWhenOutside(false)

  const rStyle = useAnimatedStyle(() => {
    const circleRadius = Math.sqrt(width.value ** 2 + height.value ** 2);

    const translateX = centerX.value - circleRadius;
    const translateY = centerY.value - circleRadius;

    return {
      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
      opacity: rippleOpacity.value,
      backgroundColor: colorSheme === "light" ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
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
    <View ref={aRef} collapsable={false}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View className={"overflow-hidden"}>
          <View {...restProps}>{children}</View>
          <Animated.View style={rStyle} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default Ripple;
