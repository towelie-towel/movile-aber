import React, { useCallback } from 'react';
import { useColorScheme, View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';

import ThemeBg from '~/components/layout/MainLayout';
import { ScaleBtn } from '~/components/common';
import DashedLine from '~/components/bottomsheet/DashedLine';
import { capitalizeString } from '~/utils';
import Colors from '~/constants/Colors';

import TestRidesData from '~/constants/TestRidesData.json'

const HistoryScreen = () => {
    const colorScheme = useColorScheme();

    const getStatusColor = useCallback((status?: string | null) => {
        switch (status) {
            case "calceled": return "#242E42"
            case "completed": return "#25D366"
            case "error": return "#f82f00"
            case "ongoing": return "#FCCB6F"
            case "pending": return "#FCCB6F"

            default:
                return undefined
        }
    }, [])

    return (
        <ThemeBg title='History'>
            <ScrollView showsVerticalScrollIndicator={false} className="px-[5%] overflow-visible">
                {
                    TestRidesData.map((item) => {
                        return (
                            <View key={item.id} className='mb-5 rounded-lg shadow-sm' style={{ backgroundColor: Colors[colorScheme ?? 'light'].background_light }} >
                                <View className='px-2'>
                                    <View className="relative z-30 h-12 w-full mt-4 pr-[2.5%] flex-row items-center-">
                                        <MaterialCommunityIcons className='mt-1' name="map-marker-account" size={32} color={Colors[colorScheme ?? "light"].border} />

                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-2'>
                                            <Text numberOfLines={1} className="ml-2 font-bold- text-lg text-[#1b1b1b] dark:text-[#C1C0C9] ">{item?.origin_address}</Text>
                                        </ScrollView>
                                    </View>
                                    <View className="relative z-20 h-12 w-full mb-3 pr-[2.5%] flex-row items-end">
                                        <DashedLine
                                            axis="vertical"
                                            style={{
                                                height: 24,
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
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-2'>
                                            <Text numberOfLines={1} className="ml-2 font-bold- text-lg text-[#1b1b1b] dark:text-[#C1C0C9]">{item?.destination_address}</Text>
                                        </ScrollView>
                                    </View>
                                </View>
                                <View className='h-12 border-t border-t-gray-300 dark:border-t-gray-500 flex-row items-center justify-between px-4'>
                                    <View className='flex-row items-center'>
                                        <FontAwesome6 className='' name="money-bill" size={22} color={Colors[colorScheme ?? "light"].border} />
                                        <Text numberOfLines={1} className="ml-2 font-medium text-lg text-[#1b1b1b] dark:text-[#C1C0C9]">${item?.price}</Text>
                                    </View>
                                    <ScaleBtn className='px-2 -mr-2 h-full justify-center'>
                                        <View className='flex-row items-center'>
                                            <Text style={{ color: getStatusColor(item?.status) }} numberOfLines={1} className="font-medium text-lg mr-2">{capitalizeString(item?.status)}</Text>
                                            <FontAwesome6 name="chevron-right" size={18} color={getStatusColor(item?.status)} />
                                        </View>
                                    </ScaleBtn>
                                </View>
                            </View>
                        )
                    })
                }
                <View className='h-52'></View>
            </ScrollView>
        </ThemeBg>
    );
};

export default HistoryScreen;