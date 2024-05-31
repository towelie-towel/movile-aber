import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { View, Text, ScrollView, useColorScheme } from 'react-native';

import { ConfortSVG } from '../svgs';
import ScaleBtn from '~/components/common/ScaleBtn';
import { NavigationInfo, RideInfo, TaxiSteps } from '~/constants/Configs';
import DashedLine from './DashedLine';
import { useWSConnection } from '~/context/WSContext';
import TaximeterRide from './TaximeterRide';
import ProfileScreen from '~/app/(taxi)/profile';
import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';

interface BottomSheetTaxiContentProps {
    currentStep: TaxiSteps;
    rideInfo: RideInfo | null;
    startPickUpHandler: () => Promise<void>;
    cancelRideHandler: () => Promise<void>;
    // navigationInfo: NavigationInfo | null;
    // navigationCurrentStep: number;
}

const BottomSheetTaxiContent = ({
    currentStep,
    rideInfo,
    startPickUpHandler,
    cancelRideHandler,
    // navigationInfo,
    // navigationCurrentStep,
}: BottomSheetTaxiContentProps) => {
    const colorScheme = useColorScheme();
    const { profile } = useUser()

    const startPickUpInnerHandler = useCallback(async () => {
        await startPickUpHandler()
    }, [startPickUpHandler])

    const cancelRideInnerHandler = useCallback(async () => {
        await cancelRideHandler()
    }, [cancelRideHandler])

    return (
        <BottomSheetView className="flex-1 bg-[#F8F8F8] -dark:bg-[#222222] dark:bg-[#1b1b1b]">

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

                {
                    (currentStep === TaxiSteps.WAITING) &&
                    <>
                        <View className="h-20 flex-row justify-between items-center">
                            <View className="flex-row gap-3 items-center">
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('../../../assets/images/taxi_test.png')}
                                />
                                <View className="justify-center">
                                    <Text className="font-bold text-xl text-[#C8C7CC]">{profile?.username}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-[#FFCC00] text-lg">★ </Text>
                                        <Text className="text-[#C8C7CC]">4.9</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row gap-4">
                                <ScaleBtn>
                                    <View className="bg-[#25D366] p-2 rounded-full">
                                        <FontAwesome6 name="phone" size={25} color="#fff" />
                                    </View>
                                </ScaleBtn>
                                <ScaleBtn>
                                    <View className="bg-[#4252FF] p-2 rounded-full">
                                        <AntDesign name="message1" size={25} color="#fff" />
                                    </View>
                                </ScaleBtn>
                            </View>
                        </View>

                        <View className='w-full border-[0.5px] border-[#d8d8d8] dark:border-[#C8C7CC] self-center mt-1'></View>


                        <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false} className="w-100 -overflow-visible">
                            {
                                [1, 2, 3].map((e) => (
                                    <View key={e} className="border rounded border-[#d8d8d8] dark:border-[#C8C7CC] mt-3 px-5 h-40 flex-row justify-between items-center">
                                        <View className="flex-row gap-3 items-center">
                                            <Image
                                                style={{ width: 50, height: 50 }}
                                                source={require('../../../assets/images/taxi_test.png')}
                                            />
                                            <View className="justify-center">
                                                <Text className="font-bold text-xl text-[#C8C7CC]">{profile?.username}</Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-[#FFCC00] text-lg">★ </Text>
                                                    <Text className="text-[#C8C7CC]">4.9</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            }

                        </ScrollView>


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
                                    <Text className="text-[#242E42] dark:text-[#C8C7CC] items-center font-bold text-xl">{rideInfo?.client.name}</Text>
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

                        <View className="flex-row gap-7 items-center py-2 px-[5%]">
                            <View className="flex-row items-center justify-between flex-1 mx-1">
                                <View className="gap-2">
                                    <Text className="text-xl font-medium text-[#242E42] dark:text-[#C8C7CC] text-center">Distance</Text>
                                    <Text className="text-xl font-bold text-[#242E42] dark:text-[#C8C7CC]">{rideInfo?.distance.text}</Text>
                                </View>
                                <View className="gap-2">
                                    <Text className="text-xl font-medium text-[#242E42] dark:text-[#C8C7CC] text-center">Time</Text>
                                    <Text className="text-xl font-bold text-[#242E42] dark:text-[#C8C7CC]">{rideInfo?.duration.text}</Text>
                                </View>
                                <View className="gap-2">
                                    <Text className="text-lg font-medium text-[#242E42] dark:text-[#C8C7CC] text-center">Price</Text>
                                    <Text className="text-xl font-bold text-[#242E42] dark:text-[#C8C7CC]">650 CUP</Text>
                                </View>
                            </View>
                        </View>

                        <View className="relative z-[1000] w-full pr-[5%] items-center- flex-row py-1">
                            <MaterialCommunityIcons className='mt-1' name="map-marker-account" size={32} color={Colors[colorScheme ?? "light"].border} />
                            <Text className="ml-2 font-bold text-lg text-[#242E42] dark:text-[#C8C7CC]">{rideInfo?.origin.address}</Text>
                        </View>
                        <View className="relative z-[999] w-full pr-[5%] mb-3 items-end flex-row">
                            <DashedLine
                                axis="vertical"
                                style={{
                                    height: 35,
                                    left: 15,
                                    top: -32,
                                }}
                                dashColor={Colors[colorScheme ?? "light"].border}
                            />
                            <MaterialCommunityIcons
                                className="ml-[-1.5px] mb-1"
                                name="map-marker-radius"
                                size={32}
                                color={Colors[colorScheme ?? "light"].border}
                            />
                            <Text className="ml-2 font-bold text-lg text-[#242E42] dark:text-[#C8C7CC]">{rideInfo?.destination.address}</Text>
                        </View>

                        {currentStep === TaxiSteps.CONFIRM && <View className='flex-row mt-5 w-full h-18 gap-3 justify-between'>
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
                        }
                        {currentStep === TaxiSteps.PICKUP &&
                            <ScaleBtn className="mt-5 w-full gap-3" onPress={() => cancelRideInnerHandler()}>
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