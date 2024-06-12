import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import * as ExpoLocation from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { MotiView } from '@motify/components';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    StatusBar,
    useColorScheme,
    Text,
    View,
    Platform,
    Keyboard,
    useWindowDimensions,
    LayoutAnimation,
    Switch
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { type LatLng, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Polyline, Marker } from 'react-native-maps';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetContent } from '~/components/bottomsheet/BottomSheetContent';
import { CustomHandle } from '~/components/bottomsheet/hooks/CustomHandle';
import Ripple from '~/components/common/RippleBtn';
import ScaleBtn from '~/components/common/ScaleBtn';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
import TaxisMarkers from '~/components/markers/TaxiMarkers';
// import UserMarker from '~/components/markers/UserMarker';
import { ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { drawerItems, ClientSteps, RideInfo } from '~/constants/Configs';
import { useUser } from '~/context/UserContext';
import { useWSActions } from '~/context/WSContext';
import { calculateMiddlePointAndDelta } from '~/utils/directions';
import type { TaxiType } from '~/constants/TaxiTypes';
import UserWavesMarker from '../markers/UserWavesMarker';
import MagnometerArrow from '../common/MagnometerArrow';
import { CardinalDirections } from '~/utils/directions';

export default function ClientMap() {
    useKeepAwake();
    console.log('ClientMap Rendered')
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { profile, userMarkers, isSignedIn, signOut, toggleUserRole } = useUser();
    const { findTaxi } = useWSActions();

    if (Platform.OS === 'android') {
        NavigationBar.setBackgroundColorAsync('transparent');
        NavigationBar.setButtonStyleAsync('dark');
    }

    // map & markers
    const mapViewRef = useRef<MapView>(null);

    // search bar & taxi flow
    const [currentStep, setCurrentStep] = useState<ClientSteps>(ClientSteps.SEARCH);
    const [activeRoute, setActiveRoute] = useState<{ coords: LatLng[] } | null>(null);
    const [piningLocation, setPiningLocation] = useState(false);
    const [selectedTaxiType, setSelectedTaxiType] = useState<TaxiType | null>(null);
    const [findingRide, setFindingRide] = useState(false);
    const [rideInfo, setRideInfo] = useState<RideInfo | null>(null);
    // const [confirmedTaxi, setConfirmedTaxi] = useState<TaxiProfile | null>(null);

    // drawer
    const [drawerOpen, setDrawerOpen] = useState(false);

    // bottom sheet
    const [snapPoints, setSnapPoints] = useState<number[]>([195, 360, 550]);
    const animatedPosition = useSharedValue(0);
    const animatedIndex = useSharedValue(0);
    const sheetCurrentSnapRef = useRef(1);
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
        switch (currentStep) {
            case ClientSteps.SEARCH:
                setSnapPoints([195, 360, 550])
                break;
            case ClientSteps.TAXI:
                setSnapPoints([250, 400])
                break;
            case ClientSteps.RIDE:
                setSnapPoints([360, 500])
                break;

            default:
                break;
        }
    }, [currentStep])
    useEffect(() => {
        if (activeRoute) (
            animateToRoute(
                { latitude: activeRoute.coords[0].latitude, longitude: activeRoute.coords[0].longitude },
                { latitude: activeRoute.coords[activeRoute.coords.length - 1].latitude, longitude: activeRoute.coords[activeRoute.coords.length - 1].longitude }
            )
        )
    }, [activeRoute])
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
    }, []);
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
    }, [activeRoute]);
    const animateToRoute = useCallback(
        (
            origin: { latitude: number; longitude: number },
            destination: { latitude: number; longitude: number }
        ) => {
            animateToRegion(calculateMiddlePointAndDelta(origin, destination));
        }, []);

    // renders
    const renderCustomHandle = useCallback((props: BottomSheetHandleProps) => <CustomHandle title="Custom Handle Example" {...props} />, []);
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
        ), []);

    // TODO: see if LayoutAnimation works here
    const startPiningLocation = useCallback(() => {
        setPiningLocation(true);
    }, []);
    const cancelPiningLocation = useCallback(() => {
        setPiningLocation(false);
    }, []);
    const confirmPiningLocation = useCallback(async () => {
        setPiningLocation(false);
        const coords = await getMiddlePoint();
        return coords;
    }, []);
    const animateToRegion = useCallback(
        (region: {
            latitudeDelta: number;
            longitudeDelta: number;
            latitude: number;
            longitude: number;
        }) => {
            mapViewRef.current?.animateToRegion(region);
        },
        [mapViewRef]
    );
    const findRideHandler = useCallback(async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFindingRide(true);
        setCurrentStep(ClientSteps.FINDING)
        console.log(rideInfo)
        try {
            if (rideInfo) {
                await findTaxi(rideInfo, "eff41f96-178e-4e97-9f43-35d4de7b7a18")
                setCurrentStep(ClientSteps.PICKUP)
            } else {
                throw new Error('Ride Info is not set')
            }
        } catch (error) {
            console.error(error)
            setCurrentStep(ClientSteps.FINDING - 1)
        } finally {
            setFindingRide(false);
        }
    }, [rideInfo, findTaxi]);

    const getMiddlePoint = useCallback(async () => {
        const pointCoords = await mapViewRef.current?.coordinateForPoint({
            x: width / 2,
            y: height / 2,
        });

        if (!pointCoords) {
            throw new Error('Trouble colecting the coordinates');
        }

        return { latitude: pointCoords.latitude, longitude: pointCoords.longitude };
    }, [mapViewRef]);

    return (
        <GestureHandlerRootView
            onLayout={() => { }}
            className="flex-1">
            <Drawer
                drawerType='slide'
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
                                            <View className="bg-[#F8F8F8] dark:bg-[#222222] rounded-lg p-3 chevron-right">
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
                        showsUserLocation
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
                        customMapStyle={colorScheme === 'dark' ? NightMap : undefined}>
                        {activeRoute && <Polyline coordinates={activeRoute.coords} strokeWidth={5} strokeColor="#000" />}
                        <TaxisMarkers onPressTaxi={() => { }} />
                        <UserWavesMarker findingRide={findingRide} />

                        <AnimatedRouteMarker key={2} />

                        {userMarkers.map((marker) => (
                            <Marker key={marker.id} coordinate={{ ...marker.coords }}>
                                <MaterialIcons
                                    name="location-on"
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </Marker>
                        ))}

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
                        {/* 
                            const north = 23.127778;
                        const south = 23.127778;
                        const east = -82.361833;
                        const west = -82.423028;

                        */}
                        <Marker coordinate={{ latitude: 23.127778, longitude: -82.361833 }}>
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </Marker>
                        <Marker coordinate={{ latitude: 23.127778, longitude: -82.423028 }}>
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </Marker>
                        <Marker coordinate={{ latitude: 23.088667, longitude: -82.361833 }}>
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </Marker>
                        <Marker coordinate={{ latitude: 23.088667, longitude: -82.423028 }}>
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </Marker>
                    </MapView>

                    {/* <ScaleBtn
                        containerStyle={{ position: 'absolute', left: 28, top: insets.top + 12 }}
                        onPress={() => setDrawerOpen(true)}>
                        <View className="bg-[#f8f8f8] dark:bg-[#000] p-1 rounded-xl border border-[#d8d8d8] dark:[#a3a3a3]">
                            <MaterialIcons
                                name="menu"
                                size={36}
                                color={Colors[colorScheme ?? 'light'].text_dark}
                            />
                        </View>
                    </ScaleBtn> */}

                    {piningLocation && (
                        <View
                            style={{
                                position: 'absolute',
                                right: width / 2 - 24,
                                top: height / 2 - 48,
                            }}>
                            <MaterialIcons
                                name="location-pin"
                                size={48}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </View>
                    )}

                    {activeRoute && activeRoute.coords.length > 0 && currentStep !== ClientSteps.RIDE && (
                        <Animated.View
                            style={topSheetBtnsAnimStyle}
                            className="self-center justify-center items-center absolute top-0">
                            <ScaleBtn
                                disabled={findingRide || !selectedTaxiType}
                                className=""
                                onPress={findRideHandler}>
                                <View className="bg-[#FCCB6F] w-40 h-14 rounded-lg p-3">
                                    <Text className="text-center text-lg font-bold w-auto text-[#fff]">
                                        {findingRide ? 'Finding Ride' : 'Request Ride'}
                                    </Text>
                                </View>
                            </ScaleBtn>
                        </Animated.View>
                    )}

                    {/*  <Animated.View
                        style={topSheetBtnsAnimStyle}
                        className="self-end justify-center items-center absolute top-0">
                        <ScaleBtn
                            className="mt-4"
                            onPress={() => {
                                animateToUserLocation();
                            }}>
                            <View className="bg-[#fff] rounded-lg p-3 shadow mr-5">
                                <FontAwesome6 name="location-arrow" size={24} color="black" />
                            </View>
                        </ScaleBtn>
                    </Animated.View>

                    {activeRoute && activeRoute.coords.length > 0 && (
                        <Animated.View
                            style={topSheetBtnsAnimStyle}
                            className="self-start justify-center items-center absolute top-0">
                            <ScaleBtn
                                className="mt-4"
                                onPress={() => {
                                    animateToActiveRoute();
                                }}>
                                <View className="bg-[#fff] rounded-lg p-3 shadow ml-5">
                                    <FontAwesome6 name="route" size={24} color="black" />
                                </View>
                            </ScaleBtn>
                        </Animated.View>
                    )} */}

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
                        // enableContentPanningGesture={false}
                        enableDismissOnClose={false}
                        // enableHandlePanningGesture={false}
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
                            backgroundColor: Colors[colorScheme ?? 'light'].background_bsheet,
                            // backgroundColor: 'black',
                            borderTopRightRadius: 30,
                            borderTopLeftRadius: 30,
                        }}
                        containerStyle={{
                            backgroundColor: 'transparent',
                        }}
                        style={{
                            // backgroundColor: Colors[colorScheme ?? 'light'].background_light,
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
                        backdropComponent={renderBackdrop}>
                        <BottomSheetContent
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            startPiningLocation={startPiningLocation}
                            cancelPiningLocation={cancelPiningLocation}
                            confirmPiningLocation={confirmPiningLocation}
                            piningLocation={piningLocation}
                            setRideInfo={setRideInfo}
                            setActiveRoute={setActiveRoute}
                            selectedTaxiType={selectedTaxiType}
                            setSelectedTaxiType={setSelectedTaxiType}
                            setFindingRide={setFindingRide} />
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
