import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    useColorScheme,
    useWindowDimensions,
    LayoutAnimation,
    Keyboard,
    StyleSheet,
    StyleProp,
    ViewStyle,
    Pressable,
    ScrollView,
} from 'react-native';
import type { LatLng } from 'react-native-maps';

import { ConfortSVG } from '../svgs';
import ScaleBtn from '~/components/common/ScaleBtn';
import Colors from '~/constants/Colors';
import { polylineDecode } from '~/utils/directions';
import type { TaxiType } from '~/constants/TaxiTypes';
import type { taxiTypesInfo } from '~/constants/TaxiTypes';
import { RideInfo, TaxiSteps } from '~/constants/Configs';

interface BottomSheetTaxiContentProps {
    currentStep: TaxiSteps;
    setCurrentStep: React.Dispatch<TaxiSteps>;
    rideInfo: RideInfo | null;
    activeRoute: { coords: LatLng[] } | null;
    setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
}

const BottomSheetTaxiContent = ({
    currentStep,
    setCurrentStep,
    rideInfo,
    activeRoute,
    setActiveRoute,
}: BottomSheetTaxiContentProps) => {
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    // const { collapse, snapToIndex, snapToPosition } = useBottomSheet();

    return (
        <BottomSheetView className="flex-1 bg-[#F8F8F8] dark:bg-[#222222]">

            <View className="w-[90%] h-full self-center overflow-visible">

                {currentStep === TaxiSteps.CONFIRM &&
                    <View className="w-[90%] h-full self-center">
                        <View className="h-20 flex-row justify-between items-center">
                            <View className="flex-row gap-3 items-center">
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('../../../assets/images/taxi_test.png')}
                                />
                                <View className="justify-center">
                                    <Text className="font-bold text-xl">{"aaaa"}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-[#FFCC00] text-lg">★ </Text>
                                        <Text className="text-[#C8C7CC]">4.9</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row gap-4">
                                <ScaleBtn>
                                    <View className="bg-[#25D366] p-2 rounded-full">
                                        <FontAwesome6 name="phone" size={25} color="white" />
                                    </View>
                                </ScaleBtn>
                                <ScaleBtn>
                                    <View className="bg-[#4252FF] p-2 rounded-full">
                                        <AntDesign name="message1" size={25} color="white" />
                                    </View>
                                </ScaleBtn>
                            </View>
                        </View>

                        <View className="flex-row gap-7 items-center py-2">
                            <ConfortSVG />
                            <View className="flex-row items-center justify-between flex-1 mx-1">
                                <View className="gap-2">
                                    <Text className="text-xl font-medium text-[#C8C7CC] text-center">Distance</Text>
                                    <Text className="text-xl font-bold">aaa Km</Text>
                                </View>
                                <View className="gap-2">
                                    <Text className="text-xl font-medium text-[#C8C7CC] text-center">Time</Text>
                                    <Text className="text-xl font-bold">aaa Km</Text>
                                </View>
                                <View className="gap-2">
                                    <Text className="text-lg font-medium text-[#C8C7CC] text-center">Price</Text>
                                    <Text className="text-xl font-bold">aa min</Text>
                                </View>
                            </View>
                        </View>

                        <View className="relative z-[1000] w-full h-12 px-0 mt-3 items-center flex-row py-1">
                            <MaterialCommunityIcons name="map-marker-account" size={32} color="#000" />
                            <Text className="font-medium text-[#242E42]">{"qaaaa"}</Text>
                        </View>
                        <View className="relative z-[999] w-full h-12 px-0 mt-3 items-center flex-row">
                            <DashedLine
                                axis="vertical"
                                style={{
                                    height: 24,
                                    left: 15,
                                    top: -25,
                                }}
                            />
                            <MaterialCommunityIcons
                                className="ml-[-1.5px]"
                                name="map-marker-radius"
                                size={32}
                                color="#000"
                            />
                            <Text className="font-medium text-[#242E42]">{"bbbbb"}</Text>
                        </View>

                        <ScaleBtn className="mt-4 w-full gap-3" onPress={() => { }}>
                            <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                                <Text className="text-white font-bold text-xl">Cancel</Text>
                            </View>
                        </ScaleBtn>
                    </View>
                }

            </View>
        </BottomSheetView>
    );
};

const DashedLine = ({
    axis = 'horizontal',
    dashGap = 2,
    dashLength = 4,
    dashThickness = 2,
    dashColor = '#000',
    dashStyle,
    style,
}: {
    axis?: 'horizontal' | 'vertical';
    dashGap?: number;
    dashLength?: number;
    dashThickness?: number;
    dashColor?: string;
    dashStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
}) => {
    const [lineLength, setLineLength] = useState(0);
    const isRow = axis === 'horizontal';
    const numOfDashes = Math.ceil(lineLength / (dashGap + dashLength));

    const dashStyles = useMemo(
        () => ({
            width: isRow ? dashLength : dashThickness,
            height: isRow ? dashThickness : dashLength,
            marginRight: isRow ? dashGap : 0,
            marginBottom: isRow ? 0 : dashGap,
            backgroundColor: dashColor,
        }),
        [dashColor, dashGap, dashLength, dashThickness, isRow]
    );

    return (
        <View
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setLineLength(isRow ? width : height);
            }}
            style={[style, isRow ? styles.row : styles.column]}>
            {[...Array(numOfDashes)].map((_, i) => {
                // eslint-disable-next-line react/no-array-index-key
                return <View key={i} style={[dashStyles, dashStyle]} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
});

export default BottomSheetTaxiContent;