import React from 'react';
import { View, ViewStyle, ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type PressBtnProps = {
  containerStyle?: ViewStyle;
  scaleReduction?: number;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
} & ViewProps;

const ScaleBtn: React.FC<PressBtnProps> = ({
  containerStyle,
  scaleReduction = 0.95,
  onPress,
  onPressIn,
  onPressOut,
  children,
  disabled = false,
  ...restProps
}) => {
  const animatedValue = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      onPressIn && runOnJS(onPressIn)();
      animatedValue.value = withTiming(scaleReduction, {
        duration: 120,
      });
    })
    .onEnd(() => {
      animatedValue.value = withTiming(1, {
        duration: 75,
      }, () => {
        onPress && runOnJS(onPress)();
      });
      onPressOut && runOnJS(onPressOut)();
    })
    .onTouchesCancelled(() => {
      animatedValue.value = withTiming(1, {
        duration: 75,
      });
      onPressOut && runOnJS(onPressOut)();
    })
    .maxDuration(20000)

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: animatedValue }],
          opacity: disabled ? 0.6 : 1,
        },
        containerStyle,
      ]}>
      <View {...restProps}>
        <GestureDetector gesture={tapGesture}>
          {children}
        </GestureDetector>
      </View>
    </Animated.View>
  );
};

export default ScaleBtn;