import React, { useMemo } from "react";
import { useColorScheme, View, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedRef, measure, withTiming, useAnimatedStyle } from "react-native-reanimated";

import { TaxiTypesInfo } from "~/constants/TaxiTypes";
import { BikeSVG, AutoSVG, ConfortSVG, ConfortPlusSVG, VipSVG } from "../svgs";


const TaxiTypeRideRowItem = React.memo(({ taxiType }: { taxiType: TaxiTypesInfo }) => {
    const { slug, name, pricePerKm, timePerKm, distance, duration } = taxiType;

    const getTypeRideIcon = useMemo(() => {
        return () => {
            switch (slug) {
                case "bike": return BikeSVG;
                case "auto": return AutoSVG;
                case "confort": return ConfortSVG;
                case "confort_plus": return ConfortPlusSVG;
                case "vip": return VipSVG;
                default: return null;
            }
        };
    }, [slug]);
    const IconComponent = getTypeRideIcon();

    const colorSheme = useColorScheme();
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
                // onTap && runOnJS(onTap)();
            });
        })
        .onTouchesCancelled(() => {
            rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
                scale.value = 0;
            });
        })
        .maxDuration(20000)
        .maxDistance(100000)
        .shouldCancelWhenOutside(false);

    const rStyle = useAnimatedStyle(() => {
        const circleRadius = Math.sqrt(width.value ** 2 + height.value ** 2);

        const translateX = centerX.value - circleRadius;
        const translateY = centerY.value - circleRadius;

        return {
            width: circleRadius * 2,
            height: circleRadius * 2,
            borderRadius: circleRadius,
            opacity: rippleOpacity.value,
            backgroundColor: colorSheme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
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
        <Animated.View key={slug} ref={aRef} collapsable={false}>
            <GestureDetector gesture={tapGesture}>
                <Animated.View className="overflow-hidden">

                    <View className="mx-[-10%] px-[10%] bg-[#FCCB6F]- flex-row gap-7 items-center py-3">
                        {IconComponent && <IconComponent />}

                        <View className="flex-row items-center justify-between flex-1 px-2">
                            <View>
                                <Text className="text-[#151010] text-xl font-medium">{name}</Text>
                                <Text className="text-[#1b1b1b] ">
                                    {Math.round(Math.random() * 100) / 100} Km
                                </Text>
                            </View>
                            <View>
                                <Text className="text-[#1b1b1b] text-lg font-medium text-right">
                                    ${(pricePerKm * (distance.value ?? 0 / 1000)).toFixed(2)}
                                </Text>
                                <Text className="text-[#1b1b1b]">
                                    {(timePerKm * (duration.value ?? 0 / 60)).toFixed(2)} min
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Animated.View style={rStyle} />
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    )
})

export default TaxiTypeRideRowItem;