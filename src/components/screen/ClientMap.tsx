import { StatusBar, useColorScheme, Text, View, Platform, Keyboard, useWindowDimensions, LayoutAnimation } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import * as ExpoLocation from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { type LatLng, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Polyline, Marker } from 'react-native-maps';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAtom } from 'jotai/react';
import * as Haptics from 'expo-haptics';

import { userMarkersAtom, useUser } from '~/context/UserContext';
import { BottomSheetContent } from '~/components/bottomsheet/BottomSheetContent';
import { CustomHandle } from '~/components/bottomsheet/hooks/CustomHandle';
import TopSheetButtonsAnimStyle from '~/components/bottomsheet/TopSheetButtonsAnimStyle';
import Ripple from '~/components/common/RippleBtn';
import ScaleBtn from '~/components/common/ScaleBtn';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
import TaxisMarkers from '~/components/markers/TaxiMarkers';
import UserMarker from '~/components/markers/UserMarker';
import { UserMapMarker } from '~/components/markers/UserMapMarker';
import FindRideBtn from '~/components/elements/FindRideBtn';
import { ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { drawerItems } from '~/constants/Drawer';
import { ClientSteps } from '~/constants/RideFlow';
import { calculateMiddlePointAndDelta, getLastUserRide, polylineDecode } from '~/utils/directions';
import type { TaxiType } from '~/types/Taxi';
import type { RideInfo } from '~/types/RideFlow';
import type { AddMarker } from '~/types/Marker';

const RIDE_FLOW_LOGS = true

export default function ClientMap() {
    useKeepAwake();
    console.log('ClientMap Rendered')
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { profile, isSignedIn, signOut/* , ridesHistory */ } = useUser();
    const [userMarkers] = useAtom(userMarkersAtom)

    if (Platform.OS === 'android') {
        NavigationBar.setBackgroundColorAsync('transparent');
        NavigationBar.setButtonStyleAsync('dark');
    }

    // map & markers
    const mapViewRef = useRef<MapView>(null);

    // bottom sheet
    const animatedPosition = useSharedValue(0);
    const animatedIndex = useSharedValue(0);
    const sheetCurrentSnapRef = useRef(1);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [snapPoints, setSnapPoints] = useState<number[]>([195, 360, 550]);

    // drawer
    const [drawerOpen, setDrawerOpen] = useState(false);

    // search bar & taxi flow
    const followLocation = useRef<"user" | "taxi" | null>(null);
    const [currentStep, setCurrentStep] = useState<ClientSteps>(ClientSteps.SEARCH);
    const [piningLocation, setPiningLocation] = useState(false);
    const [piningMarker, setPiningMarker] = useState<AddMarker | null>(null);
    const [selectedTaxiType, setSelectedTaxiType] = useState<TaxiType | null>(null);
    const [findingRide, setFindingRide] = useState(false);
    const [rideInfo, setRideInfo] = useState<RideInfo | null>(null);
    // const [confirmedTaxi, setConfirmedTaxi] = useState<TaxiProfile | null>(null);

    const activeRoute = rideInfo && polylineDecode(rideInfo.overview_polyline.points).map((point, _) => ({
        latitude: point[0]!,
        longitude: point[1]!,
    }));

    useEffect(() => {
        let unsubscribeInterval: NodeJS.Timeout;
        unsubscribeInterval = setInterval(() => {
            if (followLocation.current === "user") {
                animateToUserLocation()
            }
        }, 2000)
        return () => {
            if (unsubscribeInterval) {
                clearInterval(unsubscribeInterval)
            }
        }
    }, [followLocation])
    useEffect(() => {
        if (RIDE_FLOW_LOGS) console.log("currentStep: ", currentStep)
        if (RIDE_FLOW_LOGS) console.log("selectedTaxiType: ", selectedTaxiType)

        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        switch (currentStep) {
            case ClientSteps.SEARCH:
                setSnapPoints([210, 390, 700])
                bottomSheetModalRef.current?.collapse()
                break;
            case ClientSteps.PINNING:
                if (piningLocation) setSnapPoints([150, 420])
                else setSnapPoints([180, 370, 690])
                bottomSheetModalRef.current?.collapse()
                break;
            case ClientSteps.TAXI:
                setSnapPoints([210, 360])
                bottomSheetModalRef.current?.collapse();
                break;
            case ClientSteps.FINDING:
                setSnapPoints([120, 240])
                bottomSheetModalRef.current?.collapse()
                break;
            case ClientSteps.PICKUP:
                setSnapPoints([330, 400])
                bottomSheetModalRef.current?.expand();
                break;
            case ClientSteps.RIDE:
                setSnapPoints([330, 400])
                bottomSheetModalRef.current?.expand();
                break;
            case ClientSteps.FINISHED:
                setSnapPoints([380, 700])
                bottomSheetModalRef.current?.collapse()
                break;
            default:
                break;
        }
    }, [currentStep])
    useEffect(() => {
        if (activeRoute) {

            animateToRoute(
                { latitude: activeRoute[0].latitude, longitude: activeRoute[0].longitude },
                { latitude: activeRoute[activeRoute.length - 1].latitude, longitude: activeRoute[activeRoute.length - 1].longitude }
            )
        }
    }, [activeRoute])
    useEffect(() => {
        if (isSignedIn) {
            bottomSheetModalRef.current?.present();
            animateToUserLocation();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isSignedIn]);

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
    const animateToUserLocation = useCallback(async () => {
        // TODO: find a more performant way to fetch user coordinates
        const position = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Highest });
        animateToRegion({ latitude: position?.coords.latitude - 0.0025 * sheetCurrentSnapRef.current, longitude: position?.coords.longitude, latitudeDelta: 0.00922, longitudeDelta: 0.009121, });
    }, [sheetCurrentSnapRef, animateToRegion, followLocation]);
    const animateToActiveRoute = useCallback(() => {
        followLocation.current = null;
        if (!activeRoute) return
        animateToRegion(calculateMiddlePointAndDelta(
            { latitude: activeRoute[0].latitude, longitude: activeRoute[0].longitude },
            {
                latitude: activeRoute[activeRoute.length - 1].latitude,
                longitude: activeRoute[activeRoute.length - 1].longitude,
            }
        ));
    }, [activeRoute, animateToRegion]);
    const animateToRoute = useCallback(
        (
            origin: { latitude: number; longitude: number },
            destination: { latitude: number; longitude: number }
        ) => {
            followLocation.current = null;
            animateToRegion(calculateMiddlePointAndDelta(origin, destination));
        }, [animateToRegion]);

    // renders
    const renderCustomHandle = useCallback((props: BottomSheetHandleProps) => <CustomHandle title="Custom Handle Example" {...props} />, []);
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={2} disappearsOnIndex={1} opacity={1} pressBehavior="collapse" style={[{ backgroundColor: 'transparent', }, props.style]} />
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

    const startFindingRide = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFindingRide(true);
        setCurrentStep(ClientSteps.FINDING)
    }, []);
    const errorFindingRide = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFindingRide(false);
        setCurrentStep(ClientSteps.FINDING - 1)
    }, []);


    const taxiConfirm = useCallback(async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFindingRide(false);
        if (rideInfo) {
            setRideInfo({ ...rideInfo, status: "confirmed" })
            setCurrentStep(ClientSteps.PICKUP)
        } else {
            if (profile?.id) {
                console.log("fetching last user ride")
                try {
                    const resLastUserRide = await getLastUserRide(profile.id, "pending")
                    setRideInfo(resLastUserRide)
                    setCurrentStep(ClientSteps.PICKUP)
                    console.log("ride info not found, ride info fetched and setted with pickup step", JSON.stringify(resLastUserRide, null, 2))
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }, [rideInfo, profile]);
    const startRide = useCallback(async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (rideInfo) {
            setRideInfo({ ...rideInfo, status: "ongoing" })
            setCurrentStep(ClientSteps.RIDE)
        } else {
            if (profile?.id) {
                console.log("fetching last user ride")
                try {
                    const resLastUserRide = await getLastUserRide(profile.id, "confirmed")
                    setRideInfo(resLastUserRide)
                    setCurrentStep(ClientSteps.RIDE)
                    console.log("ride info not found, ride info fetched and setted with ride step", JSON.stringify(resLastUserRide, null, 2))
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }, [rideInfo, profile]);
    const completeRide = useCallback(async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (rideInfo) {
            setRideInfo({ ...rideInfo, status: "completed" })
            setCurrentStep(ClientSteps.FINISHED)
        } else {
            if (profile?.id) {
                console.log("fetching last user ride")
                try {
                    const resLastUserRide = await getLastUserRide(profile.id, "ongoing")
                    setRideInfo(resLastUserRide)
                    setCurrentStep(ClientSteps.FINISHED)
                    console.log("ride info not found, ride info fetched and setted with completed step", JSON.stringify(resLastUserRide, null, 2))
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }, [rideInfo, profile]);

    const onPressTaxi = useCallback(async () => {
        try {
        } catch (error) {
            console.error(error)
        } finally {
        }
    }, []);

    const getMiddlePoint = useCallback(async () => {
        const pointCoords = await mapViewRef.current?.coordinateForPoint({ x: width / 2, y: height / 2 });
        if (!pointCoords) throw new Error('Trouble colecting the coordinates');
        return { latitude: pointCoords.latitude, longitude: pointCoords.longitude };
    }, [mapViewRef]);

    return (
        <GestureHandlerRootView onLayout={() => { }} className="flex-1">
            <Drawer
                drawerType='slide'
                open={drawerOpen}
                onOpen={() => setDrawerOpen(true)}
                onClose={() => setDrawerOpen(false)}
                renderDrawerContent={() => {
                    return (
                        <View className="w-full h-full bg-[#F8F8F8] dark:bg-[#1b1b1b]">
                            <View className="h-[300px] w-full justify-center items-center bg-[#FCCB6F] dark:bg-[#fab526]">
                                <View className="absolute top-[-170px] left-[-40px] w-[300px] h-[300px] rounded-full opacity-5 bg-black" />
                                <View className="absolute w-[350px] h-[350px] top-[-50px] left-[-175px] rounded-full opacity-5 bg-black" />

                                <View className="w-4/5 shadow" style={{ marginTop: insets.top }}>
                                    <ScaleBtn scaleReduction={0.99} className="rounded-full overflow-hidden w-20 h-20 border border-white" ><Image style={{ flex: 1 }} source={{ uri: isSignedIn ? 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c' : 'https://avatars.githubusercontent.com/u/100803609?v=4', }} alt="Profile Image" /></ScaleBtn>
                                    <Text className="text-[#FFFFFF] text-xl font-semibold mt-2.5">{profile?.username ? "@" + profile?.username : "Not signed"}</Text>
                                    {!isSignedIn ? (
                                        <ScaleBtn className="mt-4" onPressIn={() => router.push('sign')}>
                                            <View className="bg-[#F8F8F8] dark:bg-[#1b1b1b] rounded-lg p-3 chevron-right-"><Text className="text-center font-semibold w-auto dark:text-[#fff]">Sign In</Text></View>
                                        </ScaleBtn>
                                    ) : (
                                        <ScaleBtn scaleReduction={0.98} className="mt-4 w-40 gap-3" onPressIn={() => router.push('profile')}>
                                            <View style={{ backgroundColor: Colors[colorScheme ?? "light"].background_light1 }} className="flex-row items-center justify-center bg-[#F8F8F8]- dark:bg-[#1b1b1b]- rounded-lg p-3">
                                                <Text className="text-center font-semibold w-auto dark:text-[#fff]">User Profile</Text>
                                                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                            </View>
                                        </ScaleBtn>
                                    )}
                                </View>
                            </View>

                            {isSignedIn ? (
                                <View className="ml-[-4px] flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">
                                    <Ripple key={0} onTap={() => { setDrawerOpen(false) }}>
                                        <View className="w-full h-16 flex-row items-center justify-between px-[10%]">
                                            <View className='h-full flex-row items-center justify-start gap-4'>
                                                <MaterialIcons name="map" size={30} color={Colors[colorScheme ?? 'light'].icons} />
                                                <Text style={{ color: Colors[colorScheme ?? 'light'].text_dark, fontSize: 18, fontWeight: '600' }}>Home</Text>
                                            </View>
                                            <View>
                                                <FontAwesome6 name="chevron-right" size={20} color={Colors[colorScheme ?? 'light'].text_dark} />
                                            </View>
                                        </View>
                                    </Ripple>
                                    {drawerItems.map((item, index) => {
                                        return (
                                            <Ripple key={index + 1} onTap={() => { router.push(item.route) }}>
                                                <View className="w-full h-16 flex-row items-center justify-between px-[10%]">
                                                    <View className='h-full flex-row items-center justify-start gap-4'>
                                                        <MaterialIcons
                                                            // @ts-ignore
                                                            name={item.icon}
                                                            size={30} color={Colors[colorScheme ?? 'light'].icons}
                                                        />
                                                        <Text style={{ color: Colors[colorScheme ?? 'light'].text_dark, fontSize: 18, fontWeight: '600' }}>{item.label}</Text>
                                                    </View>
                                                    <View>
                                                        <FontAwesome6 name="chevron-right" size={20} color={Colors[colorScheme ?? 'light'].text_dark} />
                                                    </View>
                                                </View>
                                            </Ripple>
                                        );
                                    })}
                                    <Ripple key={drawerItems.length + 1} onTap={signOut}>
                                        <View className="w-full h-16 flex-row items-center justify-between px-[10%]">
                                            <View className='h-full flex-row items-center justify-start gap-4'>
                                                <MaterialIcons name="map" size={30} color={Colors[colorScheme ?? 'light'].icons} />
                                                <Text style={{ color: Colors[colorScheme ?? 'light'].text_dark, fontSize: 18, fontWeight: '600' }}>Sign Out</Text>
                                            </View>
                                            <View>
                                                <FontAwesome6 name="chevron-right" size={20} color={Colors[colorScheme ?? 'light'].text_dark} />
                                            </View>
                                        </View>
                                    </Ripple>
                                </View>
                            ) : (
                                <View className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b] justify-center items-center">
                                    <Text className="text-[#000] dark:text-[#fff] text-xl font-semibold">
                                        Please Sign In to use our services{' '}
                                    </Text>
                                </View>
                            )}

                            {/* Social Links  */}
                            <View className="w-4/5 self-center flex-row justify-between mt-auto" style={{ marginBottom: insets.bottom }}>
                                <ScaleBtn className="items-center"><ColorInstagram /></ScaleBtn>
                                <ScaleBtn className="items-center"><ColorFacebook /></ScaleBtn>
                                <ScaleBtn className="items-center"><ColorTwitter /></ScaleBtn>
                            </View>
                        </View>
                    );
                }}>
                <BottomSheetModalProvider>
                    {Platform.OS === 'ios' && <BlurView style={{ position: 'absolute', zIndex: 1000, height: insets.top, width, top: 0 }} tint="light" intensity={20} />}
                    <MapView
                        // showsUserLocation
                        showsUserLocation={currentStep !== ClientSteps.RIDE}
                        style={{ flex: 1 }}
                        onTouchMove={() => {
                            followLocation.current = null;
                        }}
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
                        {activeRoute && <Polyline coordinates={activeRoute} strokeWidth={5} strokeColor="#000" />}
                        <TaxisMarkers taxiConfirm={taxiConfirm} startRide={startRide} animateToRegion={animateToRegion} followLocation={followLocation} onPressTaxi={onPressTaxi} />
                        <UserMarker findingRide={findingRide} completeRide={completeRide} />

                        <AnimatedRouteMarker key={2} />

                        {userMarkers.map((marker) => (
                            <Marker key={marker.id} coordinate={{ ...marker.coords }}>
                                <MaterialIcons name="location-on" size={24} color={Colors[colorScheme ?? 'light'].text} />
                            </Marker>
                        ))}

                        {activeRoute && activeRoute.length > 0 && (
                            <>
                                <Marker coordinate={activeRoute[0]}>
                                    <MaterialCommunityIcons name="map-marker-account" size={24} color={Colors[colorScheme ?? 'light'].text} />
                                </Marker>
                                <Marker coordinate={activeRoute[activeRoute.length - 1]}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={24} color={Colors[colorScheme ?? 'light'].text} />
                                </Marker>
                            </>
                        )}

                    </MapView>

                    {currentStep === ClientSteps.PINNING && (
                        <Animated.View
                            style={[{ position: 'absolute', top: 0, right: 0, flex: 1, zIndex: 1000 }, piningMarkerAnimStyle]}
                        >
                            {!piningLocation &&
                                <UserMapMarker style={{ position: 'absolute', right: width / 2 - 41, top: height / 2 - 82, zIndex: 1001, }} piningMarker={piningMarker} />
                            }
                            {piningLocation && (
                                <View style={{ position: 'absolute', right: width / 2 - 24, top: height / 2 - 48, zIndex: 1001 }}>
                                    <MaterialIcons name="location-pin" size={48} color={Colors[colorScheme ?? 'light'].text} />
                                </View>
                            )}
                        </Animated.View>
                    )}

                    <TopSheetButtonsAnimStyle animatedIndex={animatedIndex} snapPoints={snapPoints} >
                        {activeRoute && activeRoute.length > 0 && (
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
                                <View className='w-12' />

                                {currentStep <= ClientSteps.FINDING && currentStep !== ClientSteps.PINNING &&
                                    <FindRideBtn rideInfo={rideInfo} startFindingRide={startFindingRide} errorFindingRide={errorFindingRide} disabled={(findingRide || !selectedTaxiType)} >
                                        <View className="bg-[#FCCB6F] dark:bg-[#fab526] w-40 h-14 rounded-lg p-3">
                                            <Text className="text-center text-lg font-bold w-auto text-[#fff] dark:text-[#222]">
                                                {findingRide ? 'Finding Ride' : 'Request Ride'}
                                            </Text>
                                        </View>
                                    </FindRideBtn>
                                }
                            </>
                        )}
                        <View className='w-12' />
                        <View className="rounded-xl bg-[#f8f8f8] shadow dark:bg-[#1b1a1e] !self-end justify-center items-center absolute right-0">
                            <ScaleBtn containerStyle={{}} onPress={() => setDrawerOpen(true)} >
                                <View className="p-2 bg-transparent">
                                    <MaterialIcons name="menu" size={30} color={Colors[colorScheme ?? 'light'].text_dark} />
                                </View>
                            </ScaleBtn>

                            {activeRoute && activeRoute.length > 0 && (
                                <ScaleBtn onPress={animateToActiveRoute}>
                                    <View className="bg-transparent rounded-lg p-3 ">
                                        <FontAwesome6 name="route" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                    </View>
                                </ScaleBtn>
                            )}

                            {(currentStep === ClientSteps.PICKUP || currentStep === ClientSteps.RIDE) && (
                                <ScaleBtn onPress={() => { followLocation.current = "taxi" }}>
                                    <View className="bg-transparent rounded-lg p-3 ">
                                        <MaterialCommunityIcons name="taxi" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                    </View>
                                </ScaleBtn>
                            )}

                            {currentStep !== ClientSteps.RIDE && (
                                <ScaleBtn onPress={() => {
                                    followLocation.current = "user";
                                    animateToUserLocation()
                                }}>
                                    <View className="bg-transparent rounded-lg p-3 shadow">
                                        {/* <MagnometerArrow cardinalDirection={CardinalDirections.NORTH} /> */}
                                        <FontAwesome6 /* FontAwesome location-arrow-up */ name="location-arrow" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
                                    </View>
                                </ScaleBtn>
                            )}
                        </View>
                    </TopSheetButtonsAnimStyle>


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
                            // backgroundColor: Colors[colorScheme ?? 'light'].background,
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
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            startPiningLocation={startPiningLocation}
                            endPiningLocation={endPiningLocation}
                            getMiddlePoint={getMiddlePoint}
                            piningLocation={piningLocation}
                            piningMarker={piningMarker}
                            setPiningMarker={setPiningMarker}
                            rideInfo={rideInfo}
                            setRideInfo={setRideInfo}
                            selectedTaxiType={selectedTaxiType}
                            setSelectedTaxiType={setSelectedTaxiType}
                        />
                    </BottomSheetModal>

                    <StatusBar backgroundColor="transparent" barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                </BottomSheetModalProvider>
            </Drawer>
        </GestureHandlerRootView>
    );
}