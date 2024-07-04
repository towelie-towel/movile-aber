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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import * as ExpoLocation from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
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

import { AddMarker, BottomSheetContent } from '~/components/bottomsheet/BottomSheetContent';
import { CustomHandle } from '~/components/bottomsheet/hooks/CustomHandle';
import Ripple from '~/components/common/RippleBtn';
import ScaleBtn from '~/components/common/ScaleBtn';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
import TaxisMarkers from '~/components/markers/TaxiMarkers';
// import UserMarker from '~/components/markers/UserMarker';
import { ColorInstagram, ColorFacebook, ColorTwitter, MapMarkerSVG } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { drawerItems } from '~/constants/Configs';
import { ClientSteps, RideInfo } from '~/constants/RideFlow';
import { userMarkersAtom, useUser } from '~/context/UserContext';
import { useWSActions } from '~/context/WSContext';
import { calculateMiddlePointAndDelta } from '~/utils/directions';
import type { TaxiType } from '~/constants/TaxiTypes';
import UserWavesMarker from '../markers/UserWavesMarker';
import MagnometerArrow from '../common/MagnometerArrow';
import { CardinalDirections } from '~/utils/directions';
import { UserMapMarker } from '../markers/UserMapMarker';
import { useAtom } from 'jotai/react';

export default function ClientMap() {
    useKeepAwake();
    console.log('ClientMap Rendered')
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { profile, isSignedIn, signOut, toggleUserRole/* , ridesHistory */ } = useUser();
    const { findTaxi } = useWSActions();
    const [userMarkers] = useAtom(userMarkersAtom)

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
    const [piningMarker, setPiningMarker] = useState<AddMarker | null>(null);
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
    const [sheetCurrentSnap, setSheetCurrentSnap] = useState(1);
    const sheetCurrentSnapRef = useRef(1);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useEffect(() => {
        console.log(currentStep)
        console.log(selectedTaxiType)
        switch (currentStep) {
            case ClientSteps.SEARCH:
                setSnapPoints([210, 390, 700])
                break;
            case ClientSteps.PINNING:
                if (piningLocation) setSnapPoints([150, 420])
                else setSnapPoints([180, 370, 690])
                bottomSheetModalRef.current?.collapse()
                break;
            case ClientSteps.TAXI:
                setSnapPoints([210, 450])
                //bottomSheetModalRef.current?.expand();
                break;
            case ClientSteps.PICKUP:
                setSnapPoints([300, 370])
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
    }),
        // [snapPoints, animatedIndex, /* sheetCurrentSnapRef, animatedPosition, sheetCurrentSnap */]
    );
    const piningMarkerAnimStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            animatedIndex.value,
            snapPoints.map((_, i) => i),
            snapPoints.map((_, i) => (i === (snapPoints.length - 1) ? 0 : 1)),
            Extrapolation.CLAMP
        )
    }),
        // [width, height, snapPoints, animatedIndex, /* sheetCurrentSnapRef, animatedPosition, sheetCurrentSnap */]
    );

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
    }, [sheetCurrentSnapRef]);
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
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPiningLocation(true);
    }, []);
    const endPiningLocation = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPiningLocation(false);
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
                    {Platform.OS === 'ios' && <BlurView
                        style={{
                            position: 'absolute',
                            zIndex: 1000,
                            height: insets.top,
                            width,
                            top: 0,
                        }}
                        tint="light"
                        intensity={20}
                    />}
                    <MapView
                        showsUserLocation
                        style={{ flex: 1 }}
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

                        {[{ latitude: 23.127778, longitude: -82.361833 }, { latitude: 23.127778, longitude: -82.423028 }, { latitude: 23.088667, longitude: -82.361833 }, { latitude: 23.088667, longitude: -82.423028 }].map((item, i) => (
                            <Marker key={i} coordinate={{ latitude: item.latitude, longitude: item.longitude }}>
                                <MaterialIcons
                                    name="location-on"
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </Marker>
                        ))}

                    </MapView>

                    {currentStep === ClientSteps.PINNING && sheetCurrentSnap !== 2 && (
                        <Animated.View
                            style={[{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                flex: 1,
                                zIndex: 1000,
                            }, piningMarkerAnimStyle]}
                        >
                            {!piningLocation && piningMarker &&
                                <UserMapMarker style={{
                                    position: 'absolute',
                                    right: width / 2 - 41,
                                    top: height / 2 - 82,
                                    zIndex: 1001,
                                }} piningMarker={piningMarker} />
                            }
                            {piningLocation && (
                                <View style={{
                                    position: 'absolute',
                                    right: width / 2 - 24,
                                    top: height / 2 - 48,
                                    zIndex: 1001,
                                }}>
                                    <MaterialIcons
                                        name="location-pin"
                                        size={48}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </View>
                            )}
                        </Animated.View>
                    )}

                    <Animated.View
                        pointerEvents={"box-none"}
                        style={topSheetBtnsAnimStyle}
                        className="absolute bottom-[750px] w-[95%] self-center flex-row items-end justify-between border-">
                        {activeRoute && activeRoute.coords.length > 0 && (
                            <>
                                {/* <ScaleBtn
                                    containerStyle={{}}
                                    onPress={() => {
                                        animateToActiveRoute();
                                    }}>
                                    <View className="bg-[#f8f8f8] dark:bg-[#1b1a1e] rounded-lg p-3 shadow">
                                        <FontAwesome6 name="route" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                    </View>
                                </ScaleBtn> */}
                                <View className='w-12'></View>

                                {currentStep <= ClientSteps.FINDING && currentStep !== ClientSteps.PINNING &&
                                    <ScaleBtn
                                        containerStyle={{}}
                                        disabled={(findingRide || !selectedTaxiType)}
                                        onPress={findRideHandler}
                                    >
                                        <View className="bg-[#FCCB6F] w-40 h-14 rounded-lg p-3">
                                            <Text className="text-center text-lg font-bold w-auto text-[#fff]">
                                                {findingRide ? 'Finding Ride' : 'Request Ride'}
                                            </Text>
                                        </View>
                                    </ScaleBtn>
                                }
                            </>
                        )}
                        <View className='w-12'></View>
                        <View
                            className="rounded-xl bg-[#f8f8f8] shadow dark:bg-[#1b1a1e] !self-end justify-center items-center absolute right-0">
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
                                }}>
                                <View className="bg-transparent rounded-lg p-3 shadow">
                                    {/* <MagnometerArrow cardinalDirection={CardinalDirections.NORTH} /> */}
                                    <FontAwesome6 /* FontAwesome location-arrow-up */ name="location-arrow" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                </View>
                            </ScaleBtn>
                        </View>
                    </Animated.View>


                    <BottomSheetModal
                        animatedPosition={animatedPosition}
                        animatedIndex={animatedIndex}
                        ref={bottomSheetModalRef}
                        // overDragResistanceFactor={6}
                        stackBehavior='push'
                        keyboardBehavior="extend"
                        // keyboardBlurBehavior="restore"
                        handleComponent={renderCustomHandle}
                        index={0}
                        onChange={(e) => {
                            if (e < sheetCurrentSnapRef.current) {
                                Keyboard.dismiss();
                            }
                            sheetCurrentSnapRef.current = e;
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setSheetCurrentSnap(e)
                        }}
                        // enableDynamicSizing
                        android_keyboardInputMode="adjustResize"
                        // enableContentPanningGesture={!piningLocation && currentStep !== ClientSteps.TAXI}
                        // enableHandlePanningGesture={!piningLocation && currentStep !== ClientSteps.TAXI}
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
                            // backgroundColor: Colors[colorScheme ?? 'light'].background_bsheet,
                            // backgroundColor: 'black',
                            borderTopRightRadius: 30,
                            borderTopLeftRadius: 30,
                        }}

                        containerStyle={{
                            backgroundColor: 'transparent',
                        }}
                        backgroundComponent={() => <View style={{ backgroundColor: Colors[colorScheme ?? 'light'].background_light }} className='absolute top-[24px] right-0 w-full h-full flex-1'></View>}

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
                            sheetCurrentSnap={sheetCurrentSnap}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            startPiningLocation={startPiningLocation}
                            endPiningLocation={endPiningLocation}
                            getMiddlePoint={getMiddlePoint}
                            piningLocation={piningLocation}
                            piningMarker={piningMarker}
                            setPiningMarker={setPiningMarker}
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
