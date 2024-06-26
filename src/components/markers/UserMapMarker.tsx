import { useColorScheme, View } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MapMarkerSVG2 } from '../svgs';
import { AddMarker } from '../bottomsheet/BottomSheetContent';
import Colors from '~/constants/Colors';

export const UserMapMarker = ({ piningMarker }: { piningMarker: AddMarker }) => {
    const colorScheme = useColorScheme()
    return (
        <>
            <View className='absolute top-3 z-10 w-[2.6rem] h-[2.6rem] self-center justify-center items-center'>
                {/* <View 
                // style={{ backgroundColor: Colors[colorScheme === "light" ? "dark" : "light"].border_light }}
                style={{ backgroundColor: piningMarker?.color ?? Colors[colorScheme ?? 'light'].border_light_i }} 
                className='bg-[#D8D8D8]- dark:bg-[#444444]- bg-red-500- absolute w-full h-full top-0 rounded-full' 
                ></View> */}
                <MaterialCommunityIcons
                    className='relative self-center z-10'
                    // @ts-ignore
                    name={piningMarker.icon}
                    size={38}
                    color={piningMarker?.color ?? Colors[colorScheme ?? 'light'].border_light_i}
                />
            </View>
            <View className='relative z-0'>
                <MapMarkerSVG2
                    size={82}
                    color={/* piningMarker?.color ??  */Colors[colorScheme ?? 'light'].border_light_i}
                />
            </View>
        </>
    )
}