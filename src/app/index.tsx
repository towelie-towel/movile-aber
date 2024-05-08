import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, useColorScheme, Text, View, Platform, Keyboard, useWindowDimensions, LayoutAnimation } from 'react-native';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { type LatLng, PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import { MotiView } from 'moti';
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
import Ripple from '~/components/common/RippleBtn';
import { ScaleBtn } from '~/components/common/ScaleBtn';
import TaxisMarkers from '~/components/markers/TaxiMarkers';
// import UserMarker from '~/components/markers/UserMarker';
import { ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { useUser } from '~/context/UserContext';
import { BottomSheetContent } from '~/components/bottomsheet/BottomSheetContent';
import { CustomHandle } from '~/components/bottomsheet/CustomHandle';
import { getData } from '~/lib/storage';
import { useWSConnection } from '~/context/WSContext';

const drawerItems: {
  icon: string;
  label: string;
}[] = [
    {
      icon: 'map',
      label: 'Home',
    },
    {
      icon: 'wallet-giftcard',
      label: 'Wallet',
    },
    {
      icon: 'history',
      label: 'History',
    },
    {
      icon: 'notifications',
      label: 'Notifications',
    },
    {
      icon: 'settings',
      label: 'Settings',
    },
  ]

export default function Home() {
  useKeepAwake();

  const [userMarkers, setUserMarkers] = useState<UserMarkerIconType[]>([]);
  const { width, height } = useWindowDimensions()
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, isSignedIn, getSession, signOut } = useUser();
  const { position } = useWSConnection();

  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.setButtonStyleAsync('dark');
  }

  // map & markers
  const mapViewRef = useRef<MapView>(null);

  // search bar
  const [activeRoute, setActiveRoute] = useState<{ coords: LatLng[] } | null | undefined>(null);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // bottom sheet
  const animatedPosition = useSharedValue(0);
  const animatedIndex = useSharedValue(0);
  const [sheetCurrentSnap, setSheetCurrentSnap] = useState(1);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [195, 360, 550], []);
  const [piningLocation, setPiningLocation] = useState(false);

  const requestRideAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(animatedIndex.value, [0, 1, 2], [0, -165, -355], Extrapolation.CLAMP),
        },
      ],
    };
  });

  useEffect(() => {
    // const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
    //   bottomSheetModalRef.current?.snapToIndex(0);
    // });
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetModalRef.current?.snapToPosition(700)
    });
    getSession()
    return () => {
      // hideSubscription.remove();
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      bottomSheetModalRef.current?.present();
      mapViewRef.current?.animateToRegion({
        latitude: position?.coords.latitude ?? 23.118644,
        longitude: position?.coords.longitude ?? -82.3806211,
        latitudeDelta: 0.0322,
        longitudeDelta: 0.0221,
      })
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isSignedIn])

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

  const startPiningLocation = useCallback(() => {
    setPiningLocation(true);
  }, [])
  const cancelPiningLocation = useCallback(() => {
    setPiningLocation(false);
  }, [])
  const confirmPiningLocation = useCallback(async () => {
    setPiningLocation(false);
    const coords = await getMiddlePoint();
    return coords;
  }, [])

  const getMiddlePoint = useCallback(async () => {
    const pointCoords = await mapViewRef.current?.coordinateForPoint({
      x: (width / 2),
      y: (height / 2),
    })

    if (!pointCoords) {
      throw new Error('Trouble colecting the coordinates')
    }

    return { latitude: pointCoords.latitude, longitude: pointCoords.longitude }
  }, [])

  return (
    <GestureHandlerRootView
      onLayout={() => {
        getData('user_markers').then((data) => {
          setUserMarkers(data ?? []);
        });
      }}
      className='flex-1'
    >
      <Drawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        renderDrawerContent={() => {
          return (
            <View className='w-full h-full bg-[#F8F8F8] dark:bg-[#222222]'>

              <View className='h-[300px] w-full justify-center items-center bg-[#FCCB6F] dark:bg-[#947233]'>
                <View className='absolute top-[-170px] left-[-40px] w-[300px] h-[300px] rounded-full opacity-5 bg-black' />
                <View className='absolute w-[350px] h-[350px] top-[-50px] left-[-175px] rounded-full opacity-5 bg-black' />

                <View className='w-4/5 shadow' style={{ marginTop: insets.top }}>
                  <View className='' style={{ borderRadius: 1000, overflow: "hidden", width: 80, height: 80, borderWidth: 1, borderColor: "white" }}>
                    <Image
                      style={{ flex: 1 }}
                      source={{ uri: isSignedIn ? 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c' : 'https://avatars.githubusercontent.com/u/100803609?v=4' }}
                      alt="Profile Image"
                    />
                  </View>
                  <Text className='text-[#FFFFFF] text-xl font-semibold mt-2.5'>
                    {user?.username ?? 'Not signed'}
                  </Text>
                  {!isSignedIn ? <ScaleBtn className='mt-4' onPress={() => router.push("sign")}>
                    <View className='bg-[#F8F8F8] dark:bg-[#222222] rounded-lg p-3 chevron-right'>
                      <Text className='text-center font-semibold w-auto dark:text-[#fff]'>{"Sign In"}</Text>
                    </View>
                  </ScaleBtn> : <ScaleBtn className='mt-4 w-40 gap-3' onPress={() => router.push("profile")}>
                    <View className='flex-row items-center justify-center bg-[#F8F8F8] dark:bg-[#222222] rounded-lg p-3'>
                      <Text className='text-center font-semibold w-auto dark:text-[#fff]'>{"User Profile"}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="black" />
                    </View>
                  </ScaleBtn>}

                </View>
              </View>

              {user ? <View className='ml-[-4px] flex-1 bg-[#F8F8F8] dark:bg-[#222222]'>
                {drawerItems.map((item, index) => {
                  return (
                    <Ripple key={index} onTap={() => { console.log(item) }}>
                      <View className='w-full h-16 flex-row items-center justify-start px-[10%] gap-4'>
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
                <Ripple onTap={() => { signOut() }}>
                  <View className='w-full h-16 flex-row items-center justify-start px-[10%] gap-4'>
                    <MaterialIcons
                      name={"logout"}
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
              </View> : <View className='flex-1 bg-[#F8F8F8] dark:bg-[#222222] justify-center items-center'>
                <Text className='text-[#000] dark:text-[#fff] text-xl font-semibold'>Please Sign In</Text>
              </View>}

              {/* Social Links  */}
              <View className='w-4/5 self-center flex-row justify-between mt-auto' style={{ marginBottom: insets.bottom }}>
                <ScaleBtn className='items-center'>
                  <ColorInstagram />
                </ScaleBtn>
                <ScaleBtn className='items-center'>
                  <ColorFacebook />
                </ScaleBtn>
                <ScaleBtn className='items-center'>
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
            onPress={() => { Keyboard.dismiss() }}
            onLongPress={() => { }}
            initialRegion={{ latitude: 23.118644, longitude: -82.3806211, latitudeDelta: 0.0322, longitudeDelta: 0.0221 }}
            ref={mapViewRef}
            provider={PROVIDER_GOOGLE}
            customMapStyle={colorScheme === 'dark' ? NightMap : undefined}>
            <Polyline
              coordinates={activeRoute?.coords ?? []}
              strokeWidth={5}
              strokeColor="#000"
            />
            <TaxisMarkers onPressTaxi={() => { }} />
            <AnimatedRouteMarker key={2} />
            {/* <UserMarker title="User Marker" description="User Marker Description" userId="123" /> */}

            {userMarkers.map((marker) => (
              <Marker key={marker.id} coordinate={{ ...marker.coords }}>
                <MaterialIcons name="location-on" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Marker>
            ))}

            {activeRoute && activeRoute.coords.length > 0 && <>
              <Marker coordinate={activeRoute.coords[0]}>
                <MaterialCommunityIcons name="map-marker-account" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Marker>
              <Marker coordinate={activeRoute.coords[activeRoute.coords.length - 1]}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Marker>
            </>}
          </MapView>

          <ScaleBtn containerStyle={{ position: "absolute", left: 28, top: insets.top + 12 }} onPress={() => setDrawerOpen(true)}>
            <View className='bg-[#f8f8f8] dark:bg-[#000] p-1 rounded-xl border border-[#d8d8d8] dark:[#a3a3a3]' >
              <MaterialIcons name="menu" size={36} color={Colors[colorScheme ?? 'light'].text_dark} />
            </View>
          </ScaleBtn>

          {piningLocation && <View
            style={{
              position: 'absolute',
              right: width / 2 - 24,
              top: height / 2 - 48,
            }}>
            <MaterialIcons name="location-pin" size={48} color={Colors[colorScheme ?? 'light'].text} />
          </View>}

          {activeRoute && activeRoute.coords.length > 0 && <Animated.View style={requestRideAnimatedStyle} className='self-center justify-center items-center absolute bottom-60'>
            <ScaleBtn className='mt-4' onPress={() => router.push("sign")}>
              <View className='bg-[#FCCB6F] w-40 h-14 rounded-lg p-3 chevron-right'>
                {[...Array(3).keys()].map((index) => {
                  return (
                    <MotiView
                      from={{ opacity: 0.7, scale: 0.2, borderRadius: 8 }}
                      animate={{ opacity: 0, scale: 2, borderRadius: 1000 }}
                      transition={{
                        type: 'timing',
                        duration: 2000,
                        easing: Easing.out(Easing.ease),
                        delay: index * 400,
                        repeatReverse: false,
                        loop: true,
                      }}
                      key={index}
                      style={[{ backgroundColor: '#FCCB6F', borderRadius: 100, width: 160, height: 56, position: 'absolute', left: -10, top: -2 }]}
                    />
                  );
                })}
                <Text className='text-center text-lg font-bold w-auto text-[#fff]'>{"Request Ride"}</Text>
              </View>
            </ScaleBtn>
          </Animated.View>}

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
              if (e < sheetCurrentSnap) {
                Keyboard.dismiss();
              }
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSheetCurrentSnap(e);
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
            backdropComponent={renderBackdrop}
          >
            <BottomSheetContent
              startPiningLocation={startPiningLocation}
              cancelPiningLocation={cancelPiningLocation}
              confirmPiningLocation={confirmPiningLocation}
              piningLocation={piningLocation}
              userMarkers={userMarkers}
              activeRoute={activeRoute}
              setActiveRoute={setActiveRoute}
            />
          </BottomSheetModal>

          <StatusBar
            backgroundColor="transparent"
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          />
        </BottomSheetModalProvider>
      </Drawer>
    </GestureHandlerRootView >
  );
}