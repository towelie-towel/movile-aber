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
import { MotiView } from 'moti';
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
import { ScaleBtn } from '~/components/common/ScaleBtn';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
// import TaxisMarkers from '~/components/markers/TaxiMarkers';
// import UserMarker from '~/components/markers/UserMarker';
import { ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { drawerItems, Steps } from '~/constants/Configs';
import { useUser } from '~/context/UserContext';
import { calculateMiddlePointAndDelta } from '~/utils/directions';
import type { TaxiProfile, TaxiType } from '~/constants/TaxiTypes';

export default function Home() {
  useKeepAwake();

  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, userMarkers, isSignedIn, signOut } = useUser();
  // const { position } = useWSConnection();

  if (Platform.OS === 'android') {
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.setButtonStyleAsync('dark');
  }

  // map & markers
  const mapViewRef = useRef<MapView>(null);

  // search bar & taxi flow
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.SEARCH);
  const [activeRoute, setActiveRoute] = useState<{ coords: LatLng[] } | null | undefined>(null);
  const [piningLocation, setPiningLocation] = useState(false);
  const [selectedTaxiType, setSelectedTaxiType] = useState<TaxiType | null>(null);
  const [findingRide, setFindingRide] = useState(false);
  const [confirmedTaxi, setConfirmedTaxi] = useState<TaxiProfile | null>(null);

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
    if (isSignedIn || true) {
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
  }, [activeRoute, sheetCurrentSnapRef, calculateMiddlePointAndDelta]);
  const animateToRoute = useCallback(
    (
      origin: { latitude: number; longitude: number },
      destination: { latitude: number; longitude: number }
    ) => {
      animateToRegion(calculateMiddlePointAndDelta(origin, destination));
    },
    [sheetCurrentSnapRef, calculateMiddlePointAndDelta]
  );

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
    []
  );
  const confirmTaxiHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFindingRide(true);
    setTimeout(() => {
      setConfirmedTaxi({
        type: 'confort',
        userId: '123',
        name: 'Gregory Smith',
        phone: '+535 123 4567',
        car: 'Toyota Corolla',
        plate: 'HAB 123',
        stars: 4.9,
      });
      setCurrentStep(Steps.RIDE)
      setFindingRide(true);
    }, 4000);
  }, []);

  const getMiddlePoint = useCallback(async () => {
    const pointCoords = await mapViewRef.current?.coordinateForPoint({
      x: width / 2,
      y: height / 2,
    });

    if (!pointCoords) {
      throw new Error('Trouble colecting the coordinates');
    }

    return { latitude: pointCoords.latitude, longitude: pointCoords.longitude };
  }, []);

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
                    {user?.username ?? 'Not signed'}
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

              {user ? (
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
            {/* <TaxisMarkers onPressTaxi={() => { }} /> */}
            {/* <UserMarker title="User Marker" description="User Marker Description" userId="123" /> */}
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
          </MapView>

          <ScaleBtn
            containerStyle={{ position: 'absolute', left: 28, top: insets.top + 12 }}
            onPress={() => setDrawerOpen(true)}>
            <View className="bg-[#f8f8f8] dark:bg-[#000] p-1 rounded-xl border border-[#d8d8d8] dark:[#a3a3a3]">
              <MaterialIcons
                name="menu"
                size={36}
                color={Colors[colorScheme ?? 'light'].text_dark}
              />
            </View>
          </ScaleBtn>

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

          {activeRoute && activeRoute.coords.length > 0 && currentStep !== Steps.RIDE && (
            <Animated.View
              style={topSheetBtnsAnimStyle}
              className="self-center justify-center items-center absolute top-0">
              <ScaleBtn
                disabled={findingRide || !selectedTaxiType}
                className=""
                onPress={() => {
                  confirmTaxiHandler();
                }}>
                <View className="bg-[#FCCB6F] w-40 h-14 rounded-lg p-3">
                  {findingRide &&
                    [...Array(3).keys()].map((index) => {
                      return (
                        <MotiView
                          from={{ opacity: 0.7, scale: 0.2, borderRadius: 8 }}
                          animate={{ opacity: 0, scale: 2, borderRadius: 1000 }}
                          transition={{
                            // type: 'timing',
                            duration: 2000,
                            easing: Easing.out(Easing.ease),
                            delay: 1000,
                            repeatReverse: false,
                            repeat: Infinity,
                          }}
                          key={index}
                          style={[
                            {
                              backgroundColor: '#FCCB6F',
                              borderRadius: 100,
                              width: 160,
                              height: 56,
                              position: 'absolute',
                              left: -10,
                              top: -2,
                            },
                          ]}
                        />
                      );
                    })}
                  <Text className="text-center text-lg font-bold w-auto text-[#fff]">
                    {findingRide ? 'Finding Ride' : 'Request Ride'}
                  </Text>
                </View>
              </ScaleBtn>
            </Animated.View>
          )}

          <Animated.View
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
          )}

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
              backgroundColor:
                /* sheetCurrentSnap === 2 ? 'transparent' :  */ Colors[colorScheme ?? 'light']
                  .border,
            }}
            handleStyle={{
              backgroundColor: 'transparent',
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
            backdropComponent={renderBackdrop}>
            <BottomSheetContent
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              startPiningLocation={startPiningLocation}
              cancelPiningLocation={cancelPiningLocation}
              confirmPiningLocation={confirmPiningLocation}
              piningLocation={piningLocation}
              userMarkers={userMarkers}
              activeRoute={activeRoute}
              setActiveRoute={setActiveRoute}
              animateToRoute={animateToRoute}
              selectedTaxiType={selectedTaxiType}
              setSelectedTaxiType={setSelectedTaxiType}
              confirmedTaxi={confirmedTaxi}
              setSnapPoints={setSnapPoints}
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
