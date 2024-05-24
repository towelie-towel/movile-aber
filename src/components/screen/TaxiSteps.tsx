import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Text,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavigationInfo } from '~/constants/Configs';
import { useWSConnection } from '~/context/WSContext';
import { calculateBearing, calculateDistance, CardinalDirections, formatDistance } from '~/utils/directions';
import MagnometerArrow from '../common/MagnometerArrow';
import { Camera } from 'react-native-maps';

interface NavigationStepsProps {
    navigationInfo: NavigationInfo;
    navigationCurrentStep: number;
    setNavigationCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    animateCamera: (camera: Partial<Camera>, opts?: {
        duration?: number;
    }) => void
}

export default function TaxiSteps({
    navigationInfo,
    navigationCurrentStep,
    setNavigationCurrentStep,
    animateCamera
}: NavigationStepsProps) {
    const insets = useSafeAreaInsets();
    const { position, simulateRoutePosition } = useWSConnection();
    const stepView = useRef<PagerView>(null);
    //  const { simulateRoutePosition } = useWSConnection();

    useEffect(() => {
        simulateRoutePosition(navigationInfo.coords)
    }, [])

    useEffect(() => {
        if (position && navigationInfo) {
            if (navigationCurrentStep === -1) {
                if (calculateDistance(position.coords.latitude, position.coords.longitude, navigationInfo.start_location.lat as unknown as number, navigationInfo.start_location.lng as unknown as number) > 0.025) {
                    setNavigationCurrentStep(0);
                    stepView.current?.setPage(1)
                }
            } else if (navigationCurrentStep === navigationInfo.steps.length - 1) {
                console.log('Arrived at destination');
            } else {
                const end_lat = navigationInfo.steps[navigationCurrentStep].end_location.lat as unknown as number;
                const end_lng = navigationInfo.steps[navigationCurrentStep].end_location.lng as unknown as number;
                if (calculateDistance(position.coords.latitude, position.coords.longitude, end_lat, end_lng) < 0.015)
                    setNavigationCurrentStep((prev) => {
                        stepView.current?.setPage(prev + 2)
                        return prev + 1
                    });
                animateCamera({
                    pitch: 70,
                    heading: position.coords.heading ?? 0,
                    center: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    zoom: 16,
                    altitude: 100,
                })

            }
        }
    }, [position]);

    return (
        <View className='bg-[#FCCB6F] absolute self-center w-[90%] h-24 rounded-xl shadow' style={{ top: insets.top + 72 }}>
            <PagerView ref={stepView} style={{ flex: 1 }} initialPage={0} scrollEnabled={false}>
                <View className='flex-1 flex-row items-center' key={0}>
                    <View className='flex-row items-center justify-around w-28 gap-2 px-1'>
                        <MagnometerArrow cardinalDirection={CardinalDirections.EAST} />
                        <Text className='text-center text-lg font-bold text-[#000] dark:text-[#fff]'>
                            {formatDistance(calculateDistance(position?.coords.latitude!, position?.coords.longitude!, navigationInfo?.steps[0].end_location?.lat as unknown as number, navigationInfo?.steps[0].end_location?.lng as unknown as number))}
                        </Text>
                    </View>
                    <WebView
                        originWhitelist={['*']}
                        style={{ flex: 1, backgroundColor: 'transparent', alignItems: "center" }}
                        // @ts-ignore
                        source={{ html: `<div style=\"display:flex;width:100%;height:100%;align-items:center;justify-content:center\"><div style=\"font-size:70px;width:100%;text-align:center;\">${navigationInfo?.steps[0].html_instructions}</div></div></div>` }}
                    />
                </View>
                {
                    navigationInfo.steps.slice(1).map((step, i) => (
                        <View className='flex-1 flex-row items-center' key={i + 1}>
                            <View className='flex-row items-center justify-around w-28 gap-2 px-1'>
                                <MaterialIcons
                                    // @ts-ignore
                                    name={step.maneuver} size={38} color="black" />
                                <Text className='text-center text-lg font-bold text-[#000] dark:text-[#fff]'>
                                    {formatDistance(calculateDistance(position?.coords.latitude!, position?.coords.longitude!, step.start_location?.lat as unknown as number, step.start_location?.lng as unknown as number))}
                                </Text>
                            </View>
                            <WebView
                                originWhitelist={['*']}
                                style={{ flex: 1, backgroundColor: 'transparent', alignItems: "center" }}
                                // @ts-ignore
                                source={{ html: `<div style=\"display:flex;width:100%;height:100%;align-items:center;justify-content:center\"><div style=\"font-size:70px;width:100%;text-align:center;\">${step.html_instructions}</div></div></div>` }}
                            />
                        </View>
                    ))
                }
            </PagerView>
        </View>
    );
}
