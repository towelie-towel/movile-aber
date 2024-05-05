import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, useColorScheme, Text, View, Platform, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { type LatLng, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import AnimatedRouteMarker from '~/components/markers/AnimatedRouteMarker';
import Ripple from '~/components/common/RippleBtn';
import { ScaleBtn } from '~/components/common/ScaleBtn';
import TaxisMarkers from '~/components/markers/TaxiMarkers';
import UserMarker from '~/components/markers/UserMarker';
// import { ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { NightMap } from '~/constants/NightMap';
import { useUser } from '~/context/UserContext';
import { BottomSheetContent } from '~/components/bottomsheet/BottomSheetContent';
import { CustomHandle } from '~/components/bottomsheet/CustomHandle';
import { GooglePlacesAutocompleteRef } from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { getData } from '~/lib/storage';

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
      label: 'Créditos',
    },
    {
      icon: 'history',
      label: 'Historia',
    },
    {
      icon: 'notifications',
      label: 'Notificaciones',
    },
    {
      icon: 'settings',
      label: 'Opciones',
    },
    {
      icon: 'logout',
      label: 'Salir',
    },
  ]

export default function Home() {
  useKeepAwake();

  const [userMarkers, setUserMarkers] = useState<UserMarkerIconType[]>([]);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, isSignedIn } = useUser();

  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.setButtonStyleAsync('dark');
  }

  // map & markers
  const mapViewRef = useRef<MapView>(null);

  // search bar
  const placesInputViewRef = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [activeRoute, setActiveRoute] = useState<{ coords: LatLng[] } | null | undefined>(null);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // bottom sheet
  const [_sheetCurrentSnap, setSheetCurrentSnap] = useState(1);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [220, '50%', '95%'], []);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') {
        bottomSheetModalRef.current?.snapToIndex(0);
      }
    });
    return () => {
      hideSubscription.remove();
    };
  }, []);

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

                <View className='w-4/5' style={{ marginTop: insets.top }}>
                  <Image
                    style={{ borderRadius: 1000, width: 80, height: 80 }}
                    source={{ uri: isSignedIn ? 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c' : 'https://avatars.githubusercontent.com/u/100803609?v=4' }}
                    alt="Profile Image"
                  />
                  <Text className='text-[#FFFFFF] text-xl font-semibold mt-2.5'>
                    {user?.username ?? 'Not signed'}
                  </Text>
                  <ScaleBtn className='mt-4' onPress={() => router.push("sign")}>
                    <View className='bg-[#F8F8F8] dark:bg-[#222222] rounded-lg p-3'>
                      <Text className='text-center font-semibold w-auto dark:text-[#fff]'>{!isSignedIn ? "Sign In" : user?.phone}</Text>
                    </View>
                  </ScaleBtn>
                </View>
              </View>

              <View className='ml-[-4px] flex-1 bg-[#F8F8F8] dark:bg-[#222222]'>
                {drawerItems.map((item, index) => {
                  return (
                    <Ripple key={index} onTap={() => { console.log(item) }}>
                      <View className='w-full h-16 flex-row items-center justify-start px-[10%] gap-4'>
                        <MaterialIcons
                          // @ts-ignore
                          name={item.icon}
                          size={30}
                          color={Colors[colorScheme ?? 'light'].text_dark}
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
              </View>

              {/* Social Links  */}
              {/* <View className='w-full h-20 flex-row items-center justify-around' style={{ marginBottom: insets.bottom }}>
                <ScaleBtn className='items-center'>
                  <ColorInstagram />
                </ScaleBtn>
                <ScaleBtn className='items-center'>
                  <ColorFacebook />
                </ScaleBtn>
                <ScaleBtn className='items-center'>
                  <ColorTwitter />
                </ScaleBtn>
              </View> */}

            </View>
          );
        }}>

        <BottomSheetModalProvider>
          <MapView
            style={{ width: '100%', height: '100%' }}
            onTouchMove={() => { }}
            onTouchStart={() => {
              placesInputViewRef.current?.blur();
              bottomSheetModalRef.current?.present();
            }}
            onTouchEnd={() => { }}
            onPress={() => { }}
            initialRegion={{ latitude: 23.118644, longitude: -82.3806211, latitudeDelta: 0.0322, longitudeDelta: 0.0221 }}
            ref={mapViewRef}
            provider={PROVIDER_GOOGLE}
            customMapStyle={colorScheme === 'dark' ? NightMap : undefined}>
            <Polyline
              coordinates={activeRoute?.coords ?? []}
              // strokeColor={Colors[colorScheme ?? 'light'].text_dark}
              strokeWidth={5}
              strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
            /* strokeColors={[
              '#7F0000',
              '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
              '#B24112',
              '#E5845C',
              '#238C23',
              '#7F0000',
            ]} */
            // strokeWidth={6}
            />
            <TaxisMarkers onPressTaxi={() => { }} />
            <AnimatedRouteMarker key={2} />
            <UserMarker title="User Marker" description="User Marker Description" userId="123" />
          </MapView>

          <ScaleBtn className='absolute left-7' style={{ top: insets.top + 12 }} onPress={() => setDrawerOpen(true)}>
            <View className='bg-[#f8f8f8] dark:bg-[#000] p-1 rounded-xl border border-[#d8d8d8] dark:[#a3a3a3]' >
              <MaterialIcons name="menu" size={36} color={Colors[colorScheme ?? 'light'].text_dark} />
            </View>
          </ScaleBtn>

          <BottomSheetModal
            // stackBehavior="push"
            ref={bottomSheetModalRef}
            // overDragResistanceFactor={6}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            handleComponent={renderCustomHandle}
            index={1}
            onChange={(e) => {
              console.log('BottomSheetModal-onChange', e);
              setSheetCurrentSnap(e);
              // if (sheetCurrentSnap === 2) placesInputViewRef.current?.blur();
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
