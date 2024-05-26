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
import TaximeterRide from './TaximeterRide';

interface BottomSheetTaxiContentProps {
    currentStep: TaxiSteps;
    rideInfo: RideInfo | null;
    startPickUpHandler: () => Promise<void>;
    startRideHandler: () => Promise<void>;
    cancelRideHandler: () => Promise<void>;
    // navigationInfo: NavigationInfo | null;
    // navigationCurrentStep: number;
}

const BottomSheetTaxiContent = ({
    currentStep,
    rideInfo,
    startPickUpHandler,
    startRideHandler,
    cancelRideHandler,
    // navigationInfo,
    // navigationCurrentStep,
}: BottomSheetTaxiContentProps) => {

    const startPickUpInnerHandler = useCallback(() => {
        startPickUpHandler()
    }, [startPickUpHandler])

    const startRideInnerHandler = useCallback(() => {
        startRideHandler()
    }, [startRideHandler])

    const cancelRideInnerHandler = useCallback(() => {
        cancelRideHandler()
    }, [startRideHandler])

    return (
        <BottomSheetView className="flex-1 bg-[#F8F8F8] dark:bg-[#222222]">

            <View className="w-[90%] h-full self-center overflow-visible">

                {
                    (currentStep === TaxiSteps.RIDE) &&
                    <>
                        <TaximeterRide />
                        <ScaleBtn className="mt-4 w-full gap-3" onPress={cancelRideHandler}>
                            <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                                <Text className="text-white font-bold text-xl">Cancel</Text>
                            </View>
                        </ScaleBtn>
                    </>
                }

                {(currentStep === TaxiSteps.CONFIRM || currentStep === TaxiSteps.PICKUP) &&
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

                        {currentStep === TaxiSteps.CONFIRM ? <View className='flex-row mt-4 w-full h-18 gap-3 justify-between'>
                            <ScaleBtn containerStyle={{ flex: 1 }} className="" onPress={startPickUpInnerHandler}>
                                <View className="flex-row items-center justify-center bg-[#389938] rounded-xl p-3">
                                    <Text className="text-white font-bold text-xl">Accept</Text>
                                </View>
                            </ScaleBtn>

                            <ScaleBtn containerStyle={{ flex: 1 }} className="" onPress={cancelRideHandler}>
                                <View className="flex-row items-center justify-center bg-[#c14236] rounded-xl p-3">
                                    <Text className="text-white font-bold text-xl">Reject</Text>
                                </View>
                            </ScaleBtn>
                        </View>
                            :
                            <ScaleBtn className="mt-4 w-full gap-3" onPress={() => cancelRideInnerHandler()}>
                                <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                                    <Text className="text-white font-bold text-xl">Cancel</Text>
                                </View>
                            </ScaleBtn>
                        }

                    </View>
                }

            </View>
        </BottomSheetView>
    );
};

export default BottomSheetTaxiContent;