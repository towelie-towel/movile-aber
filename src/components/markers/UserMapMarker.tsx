import { useColorScheme, View } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MapMarkerSVG } from '../svgs';
import { AddMarker } from '../bottomsheet/BottomSheetContent';
import Colors from '~/constants/Colors';

export const UserMapMarker = ({ piningMarker }: { piningMarker: AddMarker }) => {
    const colorScheme = useColorScheme()
    return (
        <>
            <View className='absolute top-0 z-10 w-[2.6rem] h-[2.6rem] self-center justify-center items-center'>
                <MaterialCommunityIcons
                    className='relative self-center z-10'
                    // @ts-ignore
                    name={piningMarker.icon}
                    size={26}
                    color={colorScheme === "light" ? "#D8D8D8" : "#444444"}
                />
                <View style={{ backgroundColor: piningMarker?.color ?? Colors[colorScheme ?? 'light'].border_light }} className='bg-[#D8D8D8]- dark:bg-[#444444]- bg-red-500- absolute w-full h-full top-0 rounded-full' /* style={{ backgroundColor: Colors[colorScheme === "light" ? "dark" : "light"].border_light }} */></View>
            </View>
            <View className='relative z-0'>
                <MapMarkerSVG
                    size={48}
                    color={piningMarker?.color ?? Colors[colorScheme ?? 'light'].border_light}
                />
            </View>
        </>
    )
}