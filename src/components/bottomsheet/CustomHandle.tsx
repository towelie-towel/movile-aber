import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import React, { memo, useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

const toRad = (deg: number) => {
  'worklet';
  return deg * (Math.PI / 180);
};

// @ts-ignore
export const transformOrigin = ({ x, y }, ...transformations) => {
  'worklet';
  return [
    { translateX: x },
    { translateY: y },
    ...transformations,
    { translateX: x * -1 },
    { translateY: y * -1 },
  ];
};

interface CustomHandleProps extends BottomSheetHandleProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

const CustomHandleComponent: React.FC<CustomHandleProps> = ({ style, animatedIndex }) => {
  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], Extrapolation.CLAMP)
  );

  const containerStyle = useMemo(() => [styles.container, style], [style]);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(animatedIndex.value, [1, 2], [20, 0], Extrapolation.CLAMP);
    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
    };
  });
  const leftIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.leftIndicator,
    }),
    []
  );
  const leftIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const leftIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(-30), 0, toRad(30)],
      Extrapolation.CLAMP
    );
    return {
      transform: transformOrigin(
        { x: 0, y: indicatorTransformOriginY.value },
        {
          rotate: `${leftIndicatorRotate}rad`,
        },
        {
          translateX: -5,
        }
      ),
    };
  });
  const rightIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.rightIndicator,
    }),
    []
  );
  const rightIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const rightIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(30), 0, toRad(-30)],
      Extrapolation.CLAMP
    );
    return {
      transform: transformOrigin(
        { x: 0, y: indicatorTransformOriginY.value },
        {
          rotate: `${rightIndicatorRotate}rad`,
        },
        {
          translateX: 5,
        }
      ),
    };
  });
  //#endregion

  // render
  return (
    <Animated.View style={[containerStyle, containerAnimatedStyle]} renderToHardwareTextureAndroid>
      <Animated.View style={[leftIndicatorStyle, leftIndicatorAnimatedStyle]} />
      <Animated.View style={[rightIndicatorStyle, rightIndicatorAnimatedStyle]} />
    </Animated.View>
  );
};

export const CustomHandle = memo(CustomHandleComponent);

const styles = StyleSheet.create({
  container: {
    height: 24,
    alignContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(0,0,0,0.125)',
    zIndex: 99999,
  },
  indicator: {
    marginTop: 10,
    position: 'absolute',
    width: 10,
    backgroundColor: '#BEBFC0',
    height: 4,
  },
  leftIndicator: {
    borderTopStartRadius: 2,
    borderBottomStartRadius: 2,
  },
  rightIndicator: {
    borderTopEndRadius: 2,
    borderBottomEndRadius: 2,
  },
  title: {
    marginTop: 26,
    fontSize: 20,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
