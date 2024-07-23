import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';

export type PressBtnProps = {
  containerStyle?: ViewStyle;
  scaleReduction?: number;
  onPress?: () => void;
  callback?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
} & PressableProps;

const ScaleBtn: React.FC<PressBtnProps> = ({
  containerStyle,
  scaleReduction = 0.95,
  onPress,
  children,
  callback,
  disabled = false,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: scaleReduction,
      duration: 75,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start(() => {
      onPress && onPress();
    });
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: animatedValue }],
          opacity: disabled ? 0.6 : 1,
        },
        containerStyle,
      ]}>
      <Pressable
        disabled={disabled}
        onPress={callback}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default ScaleBtn;