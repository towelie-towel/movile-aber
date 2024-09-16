import { View, Text, useColorScheme } from 'react-native';
import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';

import { useWSState } from '~/context/WSContext';
import { ScaleBtn } from '~/components/common';
import { ConfortSVG } from '~/components/svgs';
import DashedLine from '~/components/bottomsheet/DashedLine';
import Colors from '~/constants/Colors';
import { ClientSteps } from '~/constants/RideFlow';

interface IRideFlowInfo {
    currentStep: ClientSteps;
    routeInfo: {
        origin: { latitude: number, longitude: number, address: string } | null,
        destination: { latitude: number, longitude: number, address: string } | null,
        distance: { value: number; text: string };
        duration: { value: number; text: string };
        price: number;
    } | null,
    cancelRide: () => void,
}

const RideFlowInfo: React.FC<IRideFlowInfo> = ({ currentStep, routeInfo, cancelRide }) => {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { confirmedTaxi } = useWSState()

    const cancelRideHandler = useCallback(() => {
        cancelRide()
    }, [cancelRide])

    return (
        <View className='w-full'>
            <View className="h-20 flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                    <ScaleBtn onPress={() => router.push(`profile/${confirmedTaxi?.id}`)}>
                        <Image
                            style={{ width: 50, height: 50, borderRadius: 50 }}
                            // TODO: find a placeholder image
                            source={confirmedTaxi?.avatar_url ? { uri: confirmedTaxi?.avatar_url } : ""}
                        />
                    </ScaleBtn>
                    <View className="justify-center">
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{confirmedTaxi?.username}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-[#FED141] text-[#1b1b1b]- dark:text-[#C1C0C9]- text-lg">★ </Text>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">{confirmedTaxi?.stars}</Text>
                        </View>
                    </View>
                </View>

                {currentStep !== ClientSteps.RIDE && <View className="flex-row gap-4">
                    <ScaleBtn onPress={() => { }}>
                        <View className="bg-[#25D366] p-2 rounded-full">
                            <FontAwesome6 name="phone" size={25} color="white" />
                        </View>
                    </ScaleBtn>
                    <ScaleBtn onPress={() => router.push(`chat/${confirmedTaxi?.id}`)}>
                        <View className="bg-[#4252FF] p-2 rounded-full">
                            <AntDesign name="message1" size={25} color="white" />
                        </View>
                    </ScaleBtn>
                </View>}
            </View>

            <View
                className='flex-row items-center bg-[#E9E9E9] dark:bg-[#333333] py-3 px-3 mt-3 rounded-lg overflow-hidden shadow'
            >
                <ConfortSVG color={Colors[colorScheme ?? "light"].border} />
                <View className="flex-row items-center justify-around flex-1 ml-1">
                    <View className="gap-1">
                        <Text className="text-lg font-medium text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Distance</Text>
                        <Text className="text-xl font-bold text-[#1b1b1b] dark:text-[#C1C0C9]">{routeInfo?.distance.text}</Text>
                    </View>
                    <View className="gap-1">
                        <Text className="text-lg font-medium text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Time</Text>
                        <Text className="text-xl font-bold text-[#1b1b1b] dark:text-[#C1C0C9]">{routeInfo?.duration.text}</Text>
                    </View>
                    <View className="gap-1">
                        <Text className="text-lg font-medium text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Price</Text>
                        <Text className="text-xl font-bold text-[#1b1b1b] dark:text-[#C1C0C9]">{routeInfo?.price}</Text>
                    </View>
                </View>
            </View>

            <View className="relative z-[1000] w-full mt-4 py-1 pr-[2.5%] flex-row items-center-">
                <MaterialCommunityIcons className='mt-1' name="map-marker-account" size={32} color={Colors[colorScheme ?? "light"].border} />
                <Text className="ml-2 font-bold text-lg text-[#1b1b1b] dark:text-[#C1C0C9] ">{routeInfo?.origin?.address}</Text>
            </View>
            <View className="relative z-[999] w-full pr-[2.5%] mb-3 items-end flex-row">
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
                <Text className="ml-2 font-bold text-lg text-[#1b1b1b] dark:text-[#C1C0C9]">{routeInfo?.destination?.address}</Text>
            </View>

            <ScaleBtn className="mt-4 w-full gap-3" onPress={cancelRideHandler}>
                <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                    <Text className="text-white font-bold text-xl">Cancel</Text>
                </View>
            </ScaleBtn>
        </View>
    );
};

export default RideFlowInfo;