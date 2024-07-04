import React, { useEffect, useMemo } from "react";
import { useColorScheme, View, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedRef, measure, withTiming, useAnimatedStyle, runOnJS } from "react-native-reanimated";

import { TaxiType, TaxiTypesInfo } from "~/constants/TaxiTypes";
import Colors from "~/constants/Colors";
import { BikeSVG, AutoSVG, ConfortSVG, ConfortPlusSVG, VipSVG } from "../svgs";


const TaxiTypeRideRowItem = React.memo(({ taxiType, selectedTaxiType, selectTaxiType }: { taxiType: TaxiTypesInfo, selectedTaxiType: string, selectTaxiType: (value: TaxiType) => void }) => {
    const { slug, name, pricePerKm, timePerKm, distance, duration } = taxiType;

    useEffect(() => {
        console.log("useEffect - [selectedTaxiType, slug]: ", selectedTaxiType, slug)
        if (selectedTaxiType !== slug) { rippleOpacity.value = withTiming(0, { duration: 500 }, () => { scale.value = 0; }); }
    }, [selectedTaxiType, slug])

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

    const colorScheme = useColorScheme();
    const centerX = useSharedValue(0);
    const centerY = useSharedValue(0);
    const scale = useSharedValue(0);

    const aRef = useAnimatedRef<View>();
    const width = useSharedValue(0);
    const height = useSharedValue(0);

    const rippleOpacity = useSharedValue(1);

    const tapGesture = Gesture.Tap()
        .onBegin((tapEvent) => {
            console.log("onBegin")

            const layout = measure(aRef);
            if (!layout) return;
            width.value = layout.width;
            height.value = layout.height;

            centerX.value = tapEvent.x;
            centerY.value = tapEvent.y;

            rippleOpacity.value = 1;
            scale.value = withTiming(1, { duration: 500 }, () => {
                console.log("onBegin - withTiming")
                runOnJS(selectTaxiType)(slug);
            });
        })
        .onEnd(() => {
            console.log("onEnd")

            /* rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
                if (scale.value !== 0) {
                    scale.value = 0;
                }
                // onTap && runOnJS(onTap)();
            }); */

            /*
            // selectTaxiType(slug)
            runOnJS(() => {
                selectTaxiType(slug)
            })()
            */
        })
        .onTouchesCancelled(() => {
            console.log("onTouchesCancelled")

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
            backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
            // backgroundColor: 'rgb(252, 203, 111, 0.8)',
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

                    <View className="px-3 mx-[-10%]- px-[10%]- bg-[#FCCB6F]- flex-row gap-7 items-center py-3">
                        {IconComponent && <IconComponent color={Colors[colorScheme ?? "light"].border} />}

                        <View className="flex-row items-center justify-between flex-1 px-2">
                            <View>
                                <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-xl font-medium">{name}</Text>
                                <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] ">
                                    {Math.round(Math.random() * 100) / 100} Km
                                </Text>
                            </View>
                            <View>
                                <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-lg font-medium text-right">
                                    ${(pricePerKm * (distance.value ?? 0 / 1000)).toFixed(2)}
                                </Text>
                                <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">
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


/* 
 return (
                        <Pressable
                          onPress={() => setSelectedTaxiType(slug as TaxiType)}
                          key={name}
                          className="mx-[-10%] px-[10%] bg-[#FCCB6F] flex-row gap-7 items-center py-3">
                          <Icon color={"black"} />
                          <View className="flex-row items-center justify-between flex-1 px-2">
                            <View>
                              <Text className="text-[#1b1b1b] text-xl font-medium">{name}</Text>
                              <Text className="text-[#1b1b1b] ">
                                {Math.round(Math.random() * 100) / 100} Km
                              </Text>
                            </View>
                            <View>
                              <Text className="text-[#1b1b1b] text-lg font-medium text-right">
                                ${(pricePerKm * (routeInfo?.distance.value ?? 0 / 1000)).toFixed(2)}
                              </Text>
                              <Text className="text-[#1b1b1b]">
                                {(timePerKm * (routeInfo?.duration.value ?? 0 / 60)).toFixed(2)} min
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    }
                    return (
                      <Pressable
                        onPress={() => setSelectedTaxiType(slug as TaxiType)}
                        key={name}
                        className="mx-[-10%] px-[10%] flex-row gap-7 items-center py-3">
                        <Icon color={Colors[colorScheme ?? "light"].border} />
                        <View className="flex-row items-center justify-between flex-1 px-2">
                          <View>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-xl font-medium">{name}</Text>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] ">{Math.round(Math.random() * 100) / 100} Km</Text>
                          </View>
                          <View>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-lg font-medium text-right">
                              ${(pricePerKm * (routeInfo?.distance.value ?? 0 / 1000)).toFixed(2)}
                            </Text>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] ">
                              {(timePerKm * (routeInfo?.duration.value ?? 0 / 60)).toFixed(2)} min
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          }

        </View>
      }
    </BottomSheetView>
  );
*/