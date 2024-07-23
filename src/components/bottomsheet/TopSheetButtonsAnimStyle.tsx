import { memo } from "react";
import Animated, { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated";


const TopSheetButtonsAnimStyle = ({ animatedIndex, snapPoints, children }: {
    animatedIndex: SharedValue<number>,
    snapPoints: number[],
    children: React.ReactNode
}) => {
    const topSheetBtnsAnimStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    animatedIndex.value,
                    snapPoints.map((_, i) => i),
                    snapPoints.map((item) => (item * -1) + 740),
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));

    return (
        <Animated.View
            style={[
                topSheetBtnsAnimStyle,
                {
                    position: 'absolute',
                    bottom: 750,
                    width: '95%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                }
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default memo(TopSheetButtonsAnimStyle)