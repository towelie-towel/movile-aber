import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import * as ExpoLocation from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, useColorScheme, Text, View, Platform, Keyboard, LayoutAnimation, Switch } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { type LatLng, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Polyline, Marker, Camera } from 'react-native-maps';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUser } from '~/context/UserContext';
import BottomSheetTaxiContent from '~/components/bottomsheet/BottomSheetTaxiContent';
import { CustomHandle } from '~/components/bottomsheet/hooks/CustomHandle';
import { Ripple, ScaleBtn } from '~/components/common';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
import DriverMarker from '~/components/markers/DriverMarker';
import MagnometerArrow from '~/components/common/MagnometerArrow';
import { ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { drawerItems } from '~/constants/Drawer';
import { TaxiSteps } from '~/constants/RideFlow';
import TestRideData from '~/constants/TestRideData.json'
import { calculateBearing, calculateMiddlePointAndDelta, polylineDecode, CardinalDirections } from '~/utils/directions';
import TaxiStepsCarousel from '~/components/elements/TaxiSteps';
import { NavigationInfo, RideInfo } from '~/types/RideFlow';

const DEV_SIMULATING = true

export default function ClientMap() {
    useKeepAwake();
    console.log("Map Rendered")

    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { profile, isSignedIn, signOut, toggleUserRole } = useUser();

    if (Platform.OS === 'android') {
        NavigationBar.setBackgroundColorAsync('transparent');
        NavigationBar.setButtonStyleAsync('dark');
    }

    // map & markers
    const mapViewRef = useRef<MapView>(null);

    // taxi flow
    const [currentStep, setCurrentStep] = useState<TaxiSteps>(TaxiSteps.WAITING);
    const [rideInfo, setRideInfo] = useState<RideInfo | null>(null);
    const [activeRoute, setActiveRoute] = useState<{ coords: LatLng[] } | null>(null);
    const [findingRide, setFindingRide] = useState(false);
    const [navigationInfo, setNavigationInfo] = useState<NavigationInfo | null>(null);
    const [navigationCurrentStep, setNavigationCurrentStep] = useState(-1);

    // drawer
    const [drawerOpen, setDrawerOpen] = useState(false);

    // bottom sheet
    const [snapPoints, setSnapPoints] = useState<number[]>([195, 360, 550]);
    const animatedPosition = useSharedValue(0);
    const animatedIndex = useSharedValue(0);
    const sheetCurrentSnapRef = useRef(0);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const topSheetBtnsAnimStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    animatedIndex.value,
                    snapPoints.map((_, i) => i),
                    snapPoints.map((item) => (item * -1) + 740),
                    Extrapolation.CLAMP
                ),
            },
        ],
    }), [snapPoints]);

    useEffect(() => {
        if (activeRoute) (
            animateToRoute(
                { latitude: activeRoute.coords[0].latitude, longitude: activeRoute.coords[0].longitude },
                { latitude: activeRoute.coords[activeRoute.coords.length - 1].latitude, longitude: activeRoute.coords[activeRoute.coords.length - 1].longitude }
            )
        )
    }, [activeRoute])

    useEffect(() => {
        switch (currentStep) {
            case TaxiSteps.WAITING:
                setSnapPoints([195, 400])
                // bottomSheetModalRef.current?.close()
                break;
            case TaxiSteps.CONFIRM:
                setSnapPoints([380, 400])
                break;
            case TaxiSteps.RIDE:
                setSnapPoints([180, 400])
                break;

            default:
                break;
        }
    }, [currentStep])

    useEffect(() => {
        if (isSignedIn) {
            bottomSheetModalRef.current?.present();
            animateToUserLocation();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isSignedIn]);

    const animateToUserLocation = useCallback(async () => {
        const position = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.Highest,
        });
        mapViewRef.current?.animateToRegion({
            latitude: position?.coords.latitude - 0.0025 * sheetCurrentSnapRef.current,
            longitude: position?.coords.longitude,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.009121,
        });
    }, [sheetCurrentSnapRef, mapViewRef]);
    const animateToRegion = useCallback(
        (region: {
            latitudeDelta: number;
            longitudeDelta: number;
            latitude: number;
            longitude: number;
        }, duration?: number) => {
            mapViewRef.current?.animateToRegion(region, duration);
        },
        [mapViewRef]
    );
    const animateCamera = useCallback(
        (camera: Partial<Camera>, opts?: {
            duration?: number;
        }) => {
            mapViewRef.current?.animateCamera(camera, opts);
        },
        [mapViewRef]
    );
    const animateToActiveRoute = useCallback(() => {
        activeRoute &&
            animateToRegion(
                calculateMiddlePointAndDelta(
                    { latitude: activeRoute.coords[0].latitude, longitude: activeRoute.coords[0].longitude },
                    {
                        latitude: activeRoute.coords[activeRoute.coords.length - 1].latitude,
                        longitude: activeRoute.coords[activeRoute.coords.length - 1].longitude,
                    }
                )
            );
    }, [activeRoute, sheetCurrentSnapRef, animateToRegion]);
    const animateToRoute = useCallback(
        (
            origin: { latitude: number; longitude: number },
            destination: { latitude: number; longitude: number }
        ) => {
            animateToRegion(calculateMiddlePointAndDelta(origin, destination));
        },
        [animateToRegion]
    );

    const findRideHandler = useCallback(() => {
        setFindingRide(true);
        setTimeout(() => {
            setFindingRide(false);
            setRideInfo(TestRideData as unknown as RideInfo)

            const decodedCoords = polylineDecode(TestRideData.overview_polyline.points).map(
                (point) => ({ latitude: point[0]!, longitude: point[1]! })
            );
            setActiveRoute({
                coords: decodedCoords,
            });

            setCurrentStep(TaxiSteps.CONFIRM);
        }, 5000);
    }, [])
    const startNavigationHandler = useCallback(async (
        destination: { latitude: number; longitude: number },
        timeoutCallback?: () => void,
    ) => {
        setNavigationInfo(null)

        const currentLocation = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.Highest
        })
        let startLatitude = currentLocation.coords.latitude
        let startLongitude = currentLocation.coords.longitude
        if (DEV_SIMULATING && navigationInfo) {
            startLatitude = navigationInfo?.coords[navigationInfo.coords.length - 1].latitude
            startLongitude = navigationInfo?.coords[navigationInfo.coords.length - 1].longitude
        }

        try {
            console.log(`fetching route from ${startLatitude},${startLongitude} to ${destination.latitude},${destination.longitude}`)
            const resp = await fetch(
                `http://172.20.10.12:6942/route?from=${startLatitude},${startLongitude}&to=${destination.latitude},${destination.longitude}`
            );
            const respJson = await resp.json();
            const decodedCoords = polylineDecode(respJson[0].overview_polyline.points).map(
                (point) => ({ latitude: point[0]!, longitude: point[1]! })
            );
            setNavigationCurrentStep(-1);
            setActiveRoute({
                coords: decodedCoords,
            })
            setNavigationInfo({
                coords: decodedCoords,
                ...respJson[0].legs[0],
            })
            setTimeout(() => {
                mapViewRef.current?.animateCamera({
                    pitch: 70,
                    heading: calculateBearing(decodedCoords[0].latitude, decodedCoords[0].longitude, decodedCoords[1].latitude, decodedCoords[1].longitude),
                    center: {
                        latitude: decodedCoords[0].latitude,
                        longitude: decodedCoords[0].longitude,
                    },
                    zoom: 16,
                    altitude: 100,
                })
                timeoutCallback && timeoutCallback()
            })
        } catch (error) {
            console.error(error);
            throw error;

        }


    }, [mapViewRef, navigationInfo])
    const commonNavigationHandler = useCallback(async () => {
        switch (currentStep) {
            case TaxiSteps.CONFIRM:
                await startNavigationHandler(rideInfo?.origin!, () => setCurrentStep(TaxiSteps.PICKUP));
                break;

            case TaxiSteps.PICKUP:
                await startNavigationHandler(rideInfo?.destination!, () => setCurrentStep(TaxiSteps.RIDE));
                break;

            case TaxiSteps.RIDE:
                setCurrentStep(TaxiSteps.FINISHED);
                break;

            case TaxiSteps.FINISHED:
                finishRideHandler()
                break;

            default:
                break;
        }
    }, [startNavigationHandler, rideInfo, currentStep])
    const cancelRideHandler = useCallback(async () => {
        setCurrentStep(TaxiSteps.WAITING)
        setNavigationInfo(null)
        setActiveRoute(null)
    }, [])
    const finishRideHandler = useCallback(async () => {
        setCurrentStep(TaxiSteps.WAITING)
        setRideInfo(null)
        setNavigationInfo(null)
        setActiveRoute(null)
        setFindingRide(false)
        setNavigationCurrentStep(-1)
    }, [])

    // renders
    const renderCustomHandle = useCallback(
        (props: BottomSheetHandleProps) => <CustomHandle title="Custom Handle Example" {...props} />,
        []
    );
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={2}
                disappearsOnIndex={1}
                opacity={1}
                pressBehavior="collapse"
                style={[
                    {
                        backgroundColor: 'transparent',
                    },
                    props.style,
                ]}
            />
        ),
        []
    );

    return (
        <GestureHandlerRootView
            onLayout={() => { }}
            className="flex-1">
            <Drawer
                open={drawerOpen}
                onOpen={() => setDrawerOpen(true)}
                onClose={() => setDrawerOpen(false)}
                renderDrawerContent={() => {
                    return (
                        <View className="w-full h-full bg-[#F8F8F8] dark:bg-[#222222]">
                            <View className="h-[300px] w-full justify-center items-center bg-[#FCCB6F] dark:bg-[#947233]">
                                <View className="absolute top-[-170px] left-[-40px] w-[300px] h-[300px] rounded-full opacity-5 bg-black" />
                                <View className="absolute w-[350px] h-[350px] top-[-50px] left-[-175px] rounded-full opacity-5 bg-black" />

                                <View className="w-4/5 shadow" style={{ marginTop: insets.top }}>
                                    <View>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={profile?.role === "taxi" ? '#f5dd4b' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={() => {
                                                toggleUserRole();
                                            }}
                                            value={profile?.role === "taxi"}
                                        />
                                    </View>
                                    <View
                                        className=""
                                        style={{
                                            borderRadius: 1000,
                                            overflow: 'hidden',
                                            width: 80,
                                            height: 80,
                                            borderWidth: 1,
                                            borderColor: 'white',
                                        }}>
                                        <Image
                                            style={{ flex: 1 }}
                                            source={{
                                                uri: isSignedIn
                                                    ? 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                                    : 'https://avatars.githubusercontent.com/u/100803609?v=4',
                                            }}
                                            alt="Profile Image"
                                        />
                                    </View>
                                    <Text className="text-[#FFFFFF] text-xl font-semibold mt-2.5">
                                        {profile?.username ?? 'Not signed'}
                                    </Text>
                                    {!isSignedIn ? (
                                        <ScaleBtn className="mt-4" onPress={() => router.push('sign')}>
                                            <View className="bg-[#F8F8F8] dark:bg-[#222222] rounded-lg p-3 chevron-right-">
                                                <Text className="text-center font-semibold w-auto dark:text-[#fff]">
                                                    Sign In
                                                </Text>
                                            </View>
                                        </ScaleBtn>
                                    ) : (
                                        <ScaleBtn className="mt-4 w-40 gap-3" onPress={() => router.push('profile')}>
                                            <View className="flex-row items-center justify-center bg-[#F8F8F8] dark:bg-[#222222] rounded-lg p-3">
                                                <Text className="text-center font-semibold w-auto dark:text-[#fff]">
                                                    User Profile
                                                </Text>
                                                <MaterialCommunityIcons name="chevron-right" size={24} color="black" />
                                            </View>
                                        </ScaleBtn>
                                    )}
                                </View>
                            </View>

                            {isSignedIn ? (
                                <View className="ml-[-4px] flex-1 bg-[#F8F8F8] dark:bg-[#222222]">
                                    {drawerItems.map((item, index) => {
                                        return (
                                            <Ripple
                                                key={index}
                                                onTap={() => {
                                                    console.log(item);
                                                }}>
                                                <View className="w-full h-16 flex-row items-center justify-start px-[10%] gap-4">
                                                    <MaterialIcons
                                                        // @ts-ignore
                                                        name={item.icon}
                                                        size={30}
                                                        color={Colors[colorScheme ?? 'light'].icons}
                                                    />
                                                    <Text
                                                        style={{
                                                            color: Colors[colorScheme ?? 'light'].text_dark,
                                                            fontSize: 18,
                                                            fontWeight: '600',
                                                        }}>
                                                        {item.label}
                                                    </Text>
                                                </View>
                                            </Ripple>
                                        );
                                    })}
                                    <Ripple
                                        onTap={() => {
                                            signOut();
                                        }}>
                                        <View className="w-full h-16 flex-row items-center justify-start px-[10%] gap-4">
                                            <MaterialIcons
                                                name="logout"
                                                size={30}
                                                color={Colors[colorScheme ?? 'light'].icons}
                                            />
                                            <Text
                                                style={{
                                                    color: Colors[colorScheme ?? 'light'].text_dark,
                                                    fontSize: 18,
                                                    fontWeight: '600',
                                                }}>
                                                Sign Out
                                            </Text>
                                        </View>
                                    </Ripple>
                                </View>
                            ) : (
                                <View className="flex-1 bg-[#F8F8F8] dark:bg-[#222222] justify-center items-center">
                                    <Text className="text-[#000] dark:text-[#fff] text-xl font-semibold">
                                        Please Sign In to use our services{' '}
                                    </Text>
                                </View>
                            )}

                            {/* Social Links  */}
                            <View
                                className="w-4/5 self-center flex-row justify-between mt-auto"
                                style={{ marginBottom: insets.bottom }}>
                                <ScaleBtn className="items-center">
                                    <ColorInstagram />
                                </ScaleBtn>
                                <ScaleBtn className="items-center">
                                    <ColorFacebook />
                                </ScaleBtn>
                                <ScaleBtn className="items-center">
                                    <ColorTwitter />
                                </ScaleBtn>
                            </View>
                        </View>
                    );
                }}>
                <BottomSheetModalProvider>
                    <MapView
                        showsCompass={false}
                        // showsUserLocation
                        style={{ width: '100%', height: '100%' }}
                        onTouchMove={() => { }}
                        onTouchStart={() => { }}
                        onTouchEnd={() => { }}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                        onLongPress={() => { }}
                        initialRegion={{
                            latitude: 23.118644,
                            longitude: -82.3806211,
                            latitudeDelta: 0.0322,
                            longitudeDelta: 0.0221,
                        }}
                        ref={mapViewRef}
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        customMapStyle={colorScheme === 'dark' ? NightMap : undefined}
                    >

                        {activeRoute && <Polyline
                            coordinates={activeRoute.coords}
                            strokeWidth={5}
                            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                            strokeColors={[
                                '#7F0000',
                                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                                '#B24112',
                                '#E5845C',
                                '#238C23',
                                '#7F0000'
                            ]}
                        />}
                        <Polyline
                            coordinates={[
                                {
                                    "latitude": 23.118586,
                                    "longitude": -82.38061
                                },
                                {
                                    "latitude": 23.118626,
                                    "longitude": -82.380703
                                },
                                {
                                    "latitude": 23.118874,
                                    "longitude": -82.381251
                                },
                                {
                                    "latitude": 23.11912,
                                    "longitude": -82.381752
                                },
                                {
                                    "latitude": 23.119396,
                                    "longitude": -82.38231
                                },
                                {
                                    "latitude": 23.119723,
                                    "longitude": -82.383095
                                },
                                {
                                    "latitude": 23.119735,
                                    "longitude": -82.383125
                                },
                                {
                                    "latitude": 23.120799,
                                    "longitude": -82.382567
                                },
                                {
                                    "latitude": 23.12089,
                                    "longitude": -82.382516
                                },
                                {
                                    "latitude": 23.121777,
                                    "longitude": -82.38204
                                },
                                {
                                    "latitude": 23.121947,
                                    "longitude": -82.38195
                                },
                                {
                                    "latitude": 23.122828,
                                    "longitude": -82.38148
                                },
                                {
                                    "latitude": 23.123105,
                                    "longitude": -82.38182
                                },
                                {
                                    "latitude": 23.123224,
                                    "longitude": -82.382036
                                },
                                {
                                    "latitude": 23.123267,
                                    "longitude": -82.382194
                                },
                                {
                                    "latitude": 23.123258,
                                    "longitude": -82.382421
                                },
                                {
                                    "latitude": 23.123222,
                                    "longitude": -82.382636
                                },
                                {
                                    "latitude": 23.123187,
                                    "longitude": -82.382838
                                },
                                {
                                    "latitude": 23.123184,
                                    "longitude": -82.383071
                                },
                                {
                                    "latitude": 23.12321,
                                    "longitude": -82.383356
                                },
                                {
                                    "latitude": 23.123307,
                                    "longitude": -82.384032
                                },
                                {
                                    "latitude": 23.123366,
                                    "longitude": -82.384304
                                },
                                {
                                    "latitude": 23.1234,
                                    "longitude": -82.38445
                                },
                                {
                                    "latitude": 23.123498,
                                    "longitude": -82.3848
                                },
                                {
                                    "latitude": 23.123583,
                                    "longitude": -82.385059
                                },
                                {
                                    "latitude": 23.124107,
                                    "longitude": -82.386674
                                },
                                {
                                    "latitude": 23.124266,
                                    "longitude": -82.387142
                                },
                                {
                                    "latitude": 23.124337,
                                    "longitude": -82.387364
                                },
                                {
                                    "latitude": 23.124526,
                                    "longitude": -82.387891
                                },
                                {
                                    "latitude": 23.124659,
                                    "longitude": -82.388111
                                },
                                {
                                    "latitude": 23.12494,
                                    "longitude": -82.388416
                                },
                                {
                                    "latitude": 23.125029,
                                    "longitude": -82.388484
                                },
                                {
                                    "latitude": 23.12516,
                                    "longitude": -82.388581
                                },
                                {
                                    "latitude": 23.125729,
                                    "longitude": -82.389108
                                },
                                {
                                    "latitude": 23.12583,
                                    "longitude": -82.389197
                                },
                                {
                                    "latitude": 23.125974,
                                    "longitude": -82.38932
                                },
                                {
                                    "latitude": 23.126536,
                                    "longitude": -82.389816
                                },
                                {
                                    "latitude": 23.126664,
                                    "longitude": -82.389932
                                },
                                {
                                    "latitude": 23.12678,
                                    "longitude": -82.390032
                                },
                                {
                                    "latitude": 23.12732,
                                    "longitude": -82.390498
                                },
                                {
                                    "latitude": 23.127451,
                                    "longitude": -82.390621
                                },
                                {
                                    "latitude": 23.127583,
                                    "longitude": -82.390733
                                },
                                {
                                    "latitude": 23.128118,
                                    "longitude": -82.391217
                                },
                                {
                                    "latitude": 23.128496,
                                    "longitude": -82.391559
                                },
                                {
                                    "latitude": 23.128803,
                                    "longitude": -82.391803
                                },
                                {
                                    "latitude": 23.129126,
                                    "longitude": -82.392078
                                },
                                {
                                    "latitude": 23.129597,
                                    "longitude": -82.392481
                                },
                                {
                                    "latitude": 23.129734,
                                    "longitude": -82.392613
                                },
                                {
                                    "latitude": 23.129831,
                                    "longitude": -82.392702
                                },
                                {
                                    "latitude": 23.130449,
                                    "longitude": -82.39326
                                },
                                {
                                    "latitude": 23.130564,
                                    "longitude": -82.393376
                                },
                                {
                                    "latitude": 23.130696,
                                    "longitude": -82.393495
                                },
                                {
                                    "latitude": 23.131069,
                                    "longitude": -82.393824
                                },
                                {
                                    "latitude": 23.131373,
                                    "longitude": -82.394108
                                },
                                {
                                    "latitude": 23.131679,
                                    "longitude": -82.394376
                                },
                                {
                                    "latitude": 23.132298,
                                    "longitude": -82.394934
                                },
                                {
                                    "latitude": 23.132464,
                                    "longitude": -82.395094
                                },
                                {
                                    "latitude": 23.133126,
                                    "longitude": -82.394209
                                },
                                {
                                    "latitude": 23.13337,
                                    "longitude": -82.393894
                                }
                            ]}
                            strokeWidth={5}
                            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                            strokeColors={[
                                '#7F0000',
                                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                                '#B24112',
                                '#E5845C',
                                '#238C23',
                                '#7F0000'
                            ]}
                        />
                        <DriverMarker activeWaves={findingRide} />
                        <AnimatedRouteMarker key={2} />

                        {/* {userMarkers.map((marker) => (
                            <Marker key={marker.id} coordinate={{ ...marker.coords }}>
                                <MaterialIcons
                                    name="location-on"
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </Marker>
                        ))} */}

                        {activeRoute && activeRoute.coords.length > 0 && (
                            <>
                                <Marker coordinate={activeRoute.coords[0]}>
                                    <MaterialCommunityIcons
                                        name="map-marker-account"
                                        size={24}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </Marker>
                                <Marker coordinate={activeRoute.coords[activeRoute.coords.length - 1]}>
                                    <MaterialCommunityIcons
                                        name="map-marker-radius"
                                        size={24}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </Marker>
                            </>
                        )}
                    </MapView>

                    {(currentStep === TaxiSteps.RIDE || currentStep === TaxiSteps.PICKUP) &&
                        navigationInfo && <TaxiStepsCarousel navigationInfo={navigationInfo} navigationCurrentStep={navigationCurrentStep} setNavigationCurrentStep={setNavigationCurrentStep} animateCamera={animateCamera} startRideHandler={commonNavigationHandler} />
                    }

                    {currentStep === TaxiSteps.WAITING && (
                        <Animated.View
                            style={topSheetBtnsAnimStyle}
                            className="self-center justify-center items-center absolute top-0">
                            <ScaleBtn
                                disabled={findingRide}
                                className=""
                                onPress={findRideHandler}>
                                <View className="bg-[#FCCB6F] dark:bg-[#d5900f] w-40 h-14 rounded-lg p-3">
                                    <Text className="dark:text-[#C8C7CC] text-center text-lg font-bold w-auto text-[#fff]">
                                        {findingRide ? 'Finding Ride' : 'Recieve Ride'}
                                    </Text>
                                </View>
                            </ScaleBtn>
                        </Animated.View>
                    )}

                    <Animated.View
                        style={topSheetBtnsAnimStyle}
                        className="rounded-xl bg-[#f8f8f8] shadow 1b1a1e dark:bg-[#1b1a1e] self-end justify-center items-center absolute -top-20 right-[5%]">
                        <ScaleBtn
                            containerStyle={{}}
                            onPress={() => setDrawerOpen(true)}>
                            <View className="p-2 bg-transparent">
                                <MaterialIcons
                                    name="menu"
                                    size={30}
                                    color={Colors[colorScheme ?? 'light'].text_dark}
                                />
                            </View>
                        </ScaleBtn>

                        {activeRoute && activeRoute.coords.length > 0 && (
                            <ScaleBtn
                                onPress={() => {
                                    animateToActiveRoute();
                                }}>
                                <View className="bg-transparent rounded-lg p-3 ">
                                    <FontAwesome6 name="route" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                </View>
                            </ScaleBtn>
                        )}

                        <ScaleBtn
                            onPress={() => {
                                animateToUserLocation();

                                /* mapViewRef.current?.fitToElements({
                                    edgePadding: {
                                        top: 100,
                                        right: 100,
                                        bottom: 100,
                                        left: 100,
                                    },
                                    animated: true,
                                }) */
                            }}>
                            <View className="bg-transparent rounded-lg p-3 shadow">
                                <MagnometerArrow cardinalDirection={CardinalDirections.NORTH} />
                            </View>
                        </ScaleBtn>

                        {/* <ScaleBtn>
                            <View className="bg-transparent rounded-lg p-3 shadow">
                                <FontAwesome6 name="location-arrow" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                            </View>
                        </ScaleBtn> */}
                    </Animated.View>

                    <BottomSheetModal
                        // enableContentPanningGesture={false}
                        // enableHandlePanningGesture={false}
                        animatedPosition={animatedPosition}
                        animatedIndex={animatedIndex}
                        ref={bottomSheetModalRef}
                        // overDragResistanceFactor={6}
                        keyboardBehavior="extend"
                        // keyboardBlurBehavior="restore"
                        handleComponent={renderCustomHandle}
                        index={0}
                        onChange={(e) => {
                            if (e < sheetCurrentSnapRef.current) {
                                Keyboard.dismiss();
                            }
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            sheetCurrentSnapRef.current = e;
                        }}
                        // enableDynamicSizing
                        android_keyboardInputMode="adjustResize"
                        enableDismissOnClose={false}
                        enablePanDownToClose={false}
                        snapPoints={snapPoints}
                        backgroundStyle={{
                            borderRadius: 15,
                            // backgroundColor: Colors[colorScheme ?? 'light'].background,
                            backgroundColor: 'transparent',
                        }}
                        handleIndicatorStyle={{
                            backgroundColor: Colors[colorScheme ?? 'light'].border,
                        }}
                        handleStyle={{
                            backgroundColor: Colors[colorScheme ?? 'light'].background,
                            // backgroundColor: 'black',
                            borderTopRightRadius: 30,
                            borderTopLeftRadius: 30,
                        }}
                        containerStyle={{
                            backgroundColor: 'transparent',
                        }}
                        style={{
                            backgroundColor: Colors[colorScheme ?? 'light'].background_light,
                            // backgroundColor: 'rgba(50, 50, 50, 0.5)',
                            borderTopRightRadius: 12,
                            borderTopLeftRadius: 12,

                            shadowColor: Colors[colorScheme ?? 'light'].shadow,
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.6,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                        backdropComponent={renderBackdrop}
                    >
                        <BottomSheetTaxiContent
                            currentStep={currentStep}
                            rideInfo={rideInfo}
                            startPickUpHandler={commonNavigationHandler}
                            cancelRideHandler={cancelRideHandler}
                        // navigationInfo={navigationInfo}
                        // navigationCurrentStep={navigationCurrentStep}
                        />
                    </BottomSheetModal>

                    <StatusBar
                        backgroundColor="transparent"
                        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                    />
                </BottomSheetModalProvider>
            </Drawer>
        </GestureHandlerRootView>
    );
}
