import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { View, Text } from 'react-native';

import { ConfortSVG } from '../svgs';
import ScaleBtn from '~/components/common/ScaleBtn';
import { NavigationInfo, RideInfo, TaxiSteps } from '~/constants/Configs';
import DashedLine from './DashedLine';
import { useWSConnection } from '~/context/WSContext';

interface BottomSheetTaxiContentProps {
    currentStep: TaxiSteps;
    rideInfo: RideInfo | null;
    startPickUpHandler: () => Promise<void>;
    // navigationInfo: NavigationInfo | null;
    // navigationCurrentStep: number;
}

const BottomSheetTaxiContent = ({
    currentStep,
    rideInfo,
    startPickUpHandler,
    // navigationInfo,
    // navigationCurrentStep,
}: BottomSheetTaxiContentProps) => {

    const startPickUpInnerHandler = useCallback(() => {
        startPickUpHandler()
    }, [startPickUpHandler])

    return (
        <BottomSheetView className="flex-1 bg-[#F8F8F8] dark:bg-[#222222]">

            <View className="w-[90%] h-full self-center overflow-visible">

                {currentStep === TaxiSteps.CONFIRM &&
                    <View className="w-full h-full self-center">
                        <View className="h-20 flex-row justify-between items-center">
                            <View className="flex-row gap-3 items-center">
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('../../../assets/images/taxi_test.png')}
                                />
                                <View className="justify-center">
                                    <Text className="font-bold text-xl">{rideInfo?.client.name}</Text>
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
                                    <Text className="text-xl font-bold">{rideInfo?.distance.text}</Text>
                                </View>
                                <View className="gap-2">
                                    <Text className="text-xl font-medium text-[#C8C7CC] text-center">Time</Text>
                                    <Text className="text-xl font-bold">{rideInfo?.duration.text}</Text>
                                </View>
                                <View className="gap-2">
                                    <Text className="text-lg font-medium text-[#C8C7CC] text-center">Price</Text>
                                    <Text className="text-xl font-bold">{rideInfo?.price}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="relative z-[1000] w-full h-12 px-0 mt-3 items-center flex-row py-1">
                            <MaterialCommunityIcons name="map-marker-account" size={32} color="#000" />
                            <Text className="font-medium text-[#242E42]">{rideInfo?.origin.address}</Text>
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
                            <Text className="font-medium text-[#242E42]">{rideInfo?.destination.address}</Text>
                        </View>

                        <View className='flex-row mt-4 w-full h-18 gap-3 justify-between'>
                            <ScaleBtn containerStyle={{ flex: 1 }} className="" onPress={startPickUpInnerHandler}>
                                <View className="flex-row items-center justify-center bg-[#389938] rounded-xl p-3">
                                    <Text className="text-white font-bold text-xl">Accept</Text>
                                </View>
                            </ScaleBtn>

                            <ScaleBtn containerStyle={{ flex: 1 }} className="" onPress={() => { }}>
                                <View className="flex-row items-center justify-center bg-[#c14236] rounded-xl p-3">
                                    <Text className="text-white font-bold text-xl">Reject</Text>
                                </View>
                            </ScaleBtn>
                        </View>

                    </View>
                }

            </View>
        </BottomSheetView>
    );
};

export default BottomSheetTaxiContent;