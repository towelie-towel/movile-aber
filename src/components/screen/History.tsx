import React, { useCallback } from 'react';
import { useColorScheme, View, Text, ScrollView, useWindowDimensions, Platform } from 'react-native';
import Animated, { useSharedValue, runOnJS, useAnimatedScrollHandler, ScrollEvent, useAnimatedProps, useAnimatedStyle, withTiming, interpolate, clamp, Extrapolation, useAnimatedRef, useScrollViewOffset } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { Path, Svg } from 'react-native-svg';
import { BlurView } from 'expo-blur';

import { ScaleBtn } from '~/components/common';
import DashedLine from '~/components/bottomsheet/DashedLine';
import { capitalizeString } from '~/utils';
import Colors from '~/constants/Colors';

import TestRidesData from '~/constants/TestRidesData.json'
import { router } from 'expo-router';

const HistoryScreen = () => {
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets()

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const offsetY = useSharedValue(0);
    const headerAnim = useSharedValue(0);

    const handlers = {
        onScroll: (event: ScrollEvent) => {
            'worklet';
            offsetY.value = event.contentOffset.y;

            if (offsetY.value === 0) {
                scrollRef.current?.scrollTo(0)
            }

            if (headerAnim.value === 0) {
                if (offsetY.value >= 25) {
                    headerAnim.value = withTiming(100, {
                        duration: 300
                    });
                } if (offsetY.value <= -75) {
                }
            } else if (headerAnim.value === 100) {
                if (offsetY.value <= 0) {
                    headerAnim.value = withTiming(0, {
                        duration: 300
                    });
                }
            }
        },
    };
    const scrollHandler = useAnimatedScrollHandler(handlers);

    const scrollStyles = useAnimatedStyle(() => ({
        overflow: "visible",
    }));

    const navTitleRef = useAnimatedRef<Animated.Text>();
    const navTitleWidth = useSharedValue(0);
    const navTitleHeight = useSharedValue(0);
    const navTitleStyles = useAnimatedStyle(() => ({
        position: "absolute",

        color: Colors[colorScheme ?? "light"].border_light_i,
        fontSize: interpolate(
            headerAnim.value,
            [0, 100],
            [42, 32],
            Extrapolation.CLAMP
        ),

        bottom: interpolate(
            headerAnim.value,
            [0, 100],
            [-navTitleHeight.value, 0],
            Extrapolation.CLAMP
        ),
        left: interpolate(
            headerAnim.value,
            [0, 100],
            [0, 36],
            Extrapolation.CLAMP
        ),
    }))

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
        <View className="flex-1" style={{ backgroundColor: Colors[colorScheme ?? 'light'].background_light }}>
            {Platform.OS === 'ios' && <BlurView style={{ position: 'absolute', zIndex: 1000, height: insets.top, width, top: 0 }} tint="light" intensity={20} />}
            <View className={"absolute top-0 pt-24 justify-end z-0"} style={{ backgroundColor: Colors[colorScheme ?? 'light'].primary, }}>
                <Svg width={width} height={(width * 258) / 375} viewBox="0 0 375 258" fill="none">
                    <Path
                        d="M222.435 21.1065V1H220.695V21.1065H213.003V41.7377L205.684 49.0059V61.749H188.514V83.2732H183.859V92.0633H174.838V77.8885L168.093 69.4338V61.749H164.864V59.3752H143.843V61.749H140.617V82.1646H133.465V48.9485H130.237V46.5747H109.216V48.9485H105.989V106.631H99.4183V61.749H96.1913V59.3752H75.1698V61.749H71.9436V83.2732H62.8828V36.9786H51.0981V27.9991H39.3119V18.1915H27.5271V64.3303H7.67825L8.33252 96.2041H-1.00018V257H10.8594H14.3641H27.5271H30.2387H39.3119H51.0981H62.8828H71.9436H93.8127H99.4183H105.989H118.164H121.29H133.465H140.617H145.641H159.508H168.093H183.859H188.514H205.684H213.003H230.126H240.229H260.039H277.342H287.89H304.072H305.193H314.914H316.908H334.294H338.31H357.689H373.5V99.3495H357.689V75.2539L338.31 88.5727V107.712H336.584L337.475 64.3303H335.042V59.6909H333.24L331.798 31.6357L330.356 59.6909H320.983V64.3303H311.732L312.065 80.5288H304.072V119.569H294.426V110.003H287.89V60.779L273.965 39.7993L260.039 60.779V75.2539H257.188L245.549 69.4338V75.2539H240.229V99.3495H230.126V21.1065H222.435Z"
                        fill={Colors[colorScheme ?? 'light'].text_i}
                        fillOpacity="0.2"
                        stroke={Colors[colorScheme ?? 'light'].text_i}
                        strokeOpacity="0.2"
                    />
                    <Path
                        d="M284.533 104.038V91H285.697V104.038H290.842V117.416L295.739 122.129V130.392H307.224V144.349H310.339V150.049H316.373V140.857L320.885 135.375V130.392H323.045V128.853H337.107V130.392H339.266V143.63H344.05V122.092H346.209V120.552H360.271V122.092H362.43V159.495H366.825V130.392H368.984V128.853H375V257H366.825H362.43H354.285H352.194H344.05H339.266H335.905H326.628H320.885H310.339H307.224H295.739H290.842H279.388H272.63H259.378H247.803H240.747H229.922H229.172H222.669H221.335H209.705H207.018H194.055H181.09H173.088H172.504H159.38H154.708H141V150.014L159.38 135.375V146.293L173.088 135.375V142.569H181.09V154.774H194.055V139.149L207.018 147.785V160.196H208.173L207.577 132.066H209.204V129.057H210.41L211.375 110.865L212.34 129.057H218.609V132.066H224.798L224.575 142.569H229.922V167.885H236.374V161.682H240.747V129.763L250.062 116.159L259.378 129.763V139.149H261.285L269.071 135.375V139.149H272.63V154.774H279.388V104.038H284.533Z"
                        fill={Colors[colorScheme ?? 'light'].text_i}
                        fillOpacity="0.2"
                    />
                    <Path
                        d="M26.103 91H25.2014V104.038H21.2153V154.774H15.9795V139.149H13.222V135.375L7.19015 139.149H5.71251V129.763L0.499771 114.33L0.5 256.5L141 257V152.734H136.163L136.502 132.066H126.215V102.148H120.108V108.507H113.999V114.33H107.892V144.349H103.196V130.392H101.524V128.853H90.6291V130.392H88.9566V159.495H85.5515V122.092H83.8787V120.552H72.9844V122.092H71.3116V143.63H67.6051V130.392H65.9326V128.853H55.0383V130.392H53.3651V135.375L49.8692 140.857V150.049H45.194V144.349H42.7813V130.392H33.883V122.129L30.0895 117.416V104.038H26.103V91Z"
                        fill={Colors[colorScheme ?? 'light'].text_i}
                        fillOpacity="0.2"
                    />
                </Svg>
            </View>
            <View className='flex-1 relative z-10 bg-transparent'>
                <View className='flex-row justify-between bg-transparent w-full px-[5%] relative z-40' style={{ marginTop: insets.top + 12, marginBottom: 24 }}>
                    <View className='flex-1 items-start border border-red-500'>
                        <ScaleBtn className='h-10 w-10 items-center rounded-lg overflow-hidden border border-blue-500' onPressIn={() => { router.back() }}>
                            <FontAwesome6 name="chevron-left" size={28} color={Colors[colorScheme ?? "light"].border_light_i} />
                        </ScaleBtn>
                        <Animated.Text onLayout={() => {
                            navTitleRef.current?.measure((_1, _2, wi, he) => {
                                navTitleWidth.value = wi;
                                navTitleHeight.value = he;
                            })
                        }} ref={navTitleRef} numberOfLines={1} style={navTitleStyles} className='font-bold border border-black'>{"History"}</Animated.Text>
                    </View>
                    <View className=''>
                    </View>
                </View>
                <Animated.ScrollView ref={scrollRef} style={scrollStyles} onScroll={scrollHandler} showsVerticalScrollIndicator={false} className="px-[5%]">
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
                </Animated.ScrollView>
            </View >
        </View>
    );
};

export default HistoryScreen;