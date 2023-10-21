import { MaterialIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  useScrollEventsHandlersDefault,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import { Accuracy, getCurrentPositionAsync } from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StatusBar,
  LayoutAnimation,
  Keyboard,
  useColorScheme,
  Button,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import MapView, { type LatLng, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
// import NetInfo from '@react-native-community/netinfo';

import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import AnimatedRouteMarker from '~/components/AnimatedRouteMarker';
import { ScaleBtn } from '~/components/ScaleBtn';
import TaxisMarkers from '~/components/TaxiMarkers';
import Colors from '~/constants/Colors';
import { MarkerCloudSVG } from '~/constants/Icons';
import { NightMap } from '~/constants/NightMap';
import { useUser } from '~/context/UserContext';
import { useWSConnection } from '~/context/WSContext';
import { BottomSheetContent } from '~/hooks/CustomGestureHandling';
import { GestureTranslationProvider } from '~/hooks/GestureTranslationContext';
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { polylineDecode } from '~/utils/directions';

export default function Home() {
  useKeepAwake();
  console.log('Map re-rendered');
  const colorScheme = useColorScheme();
  // NavigationBar.setBackgroundColorAsync(Colors[colorScheme ?? 'light'].background);
  NavigationBar.setBackgroundColorAsync('transparent');
  NavigationBar.setButtonStyleAsync('dark');
  // const { width, height } = Dimensions.get('window');
  // const { isConnected, isInternetReachable } = NetInfo.useNetInfo();
  const { session, user, isSignedIn, isLoading, signOut } = useUser();
  // const { wsTaxis } = useWSConnection();

  // const [isAddingMarker, setIsAddingMarker] = useState(false);

  // map & markers
  const mapViewRef = useRef<MapView>(null);

  // bottom sheet
  const [userSelected, _setUserSelected] = useState(true);
  const [selectedTaxiId, _setSelectedTaxiId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // search bar
  const placesInputViewRef = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [activeRoute, setActiveRoute] = useState<LatLng[] | null | undefined>(null);

  // bottom sheet
  const [sheetCurrentSnap, setSheetCurrentSnap] = useState(1);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [backdropPressBehavior, setBackdropPressBehavior] = useState<'none' | 'close' | 'collapse'>(
    'collapse'
  );
  const [keyboardBehavior, setKeyboardBehavior] = useState<'extend' | 'fillParent' | 'interactive'>(
    'interactive'
  );
  const [keyboardBlurBehavior, setKeyboardBlurBehavior] = useState<'none' | 'restore'>('none');
  const snapPoints = useMemo(() => ['25%', '75%', '100%'], []);
  const gestureTranslationY = useSharedValue(0);

  // renders
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={2}
        disappearsOnIndex={1}
        opacity={1}
        pressBehavior={backdropPressBehavior}
        style={[
          {
            backgroundColor: 'white',
          },
          props.style,
        ]}
      />
    ),
    [backdropPressBehavior]
  );

  const onSearchBarFocus = () => {
    console.log('places input focus');
    // bottomSheetModalRef.current?.snapToIndex(2);
  };

  const onSearchBarBlur = () => {
    console.log('places input blur');
  };

  // Add marker functionality
  /* const addMarkerHandler = useCallback(() => {
            LayoutAnimation.linear()
            setIsMenuVisible(false)
            setIsAddingMarker(!isAddingMarker)
            if (isMenuOpen) {
                toggleNavMenu()
            }
        }, [isAddingMarker, isMenuOpen, toggleNavMenu])
    
        const openUserProfileHandler = useCallback(() => {
            bottomSheetModalRef.current?.present();
            console.log("aaa");
            setUserSelected(true)
            setIsModalVisible(true);
            setSelectedTaxiId(null);
            if (isMenuOpen) {
                toggleNavMenu()
            }
        }, [isMenuOpen, toggleNavMenu])
    
        const touchTaxiHandler = useCallback((userId: string) => {
            bottomSheetModalRef.current?.present();
            setUserSelected(false)
            setIsModalVisible(true);
            setSelectedTaxiId(userId);
            if (isMenuOpen) {
                toggleNavMenu()
            }
        }, [isMenuOpen, toggleNavMenu])
    
        const taxiBtnHandler = useCallback(async () => {
            console.log({ isConnected, isInternetReachable })
        }, [isConnected, isInternetReachable]) */

  const handleToggleKeyboardBehavior = useCallback(() => {
    setKeyboardBehavior((state) => {
      switch (state) {
        case 'interactive':
          return 'extend';
        case 'extend':
          return 'fillParent';
        case 'fillParent':
          return 'interactive';
      }
    });
  }, []);
  const handleToggleKeyboardBlurBehavior = useCallback(() => {
    setKeyboardBlurBehavior((state) => {
      switch (state) {
        case 'none':
          return 'restore';
        case 'restore':
          return 'none';
      }
    });
  }, []);

  const renderBottomSheetItem = useCallback(
    ({ item }) => (
      <View
        style={{
          padding: 6,
          margin: 6,
          backgroundColor: '#eee',
        }}>
        <Text>{item.userId}</Text>
      </View>
    ),
    []
  );

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      renderDrawerContent={() => {
        return (
          <View
            style={{
              backgroundColor: Colors[colorScheme ?? 'light'].secondary,
              height: '100%',
              width: '100%',
            }}>
            <View
              style={{
                height: 300,
                width: '100%',
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
              }}>
              <View
                style={{
                  position: 'absolute',
                  top: -170,
                  left: -40,
                  width: 300,
                  height: 300,
                  borderRadius: 1000,
                  opacity: 0.05,
                  backgroundColor: '#000000',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: -175,
                  top: -50,
                  width: 350,
                  height: 350,
                  borderRadius: 1000,
                  opacity: 0.05,
                  backgroundColor: '#000000',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 30,
                  top: 90,
                }}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                  }}
                  alt="Profile Image"
                  style={{
                    borderRadius: 1000,
                    width: 80,
                    height: 80,
                    borderColor: Colors[colorScheme ?? 'light'].secondary,
                    borderWidth: 2,
                  }}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_light2,
                    fontSize: 24,
                    fontWeight: '400',
                    marginTop: 10,
                  }}>
                  {user?.username}
                </Text>

                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    gap: 8,
                    flexDirection: 'row',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors[colorScheme ?? 'light'].secondary,
                    borderRadius: 30,
                  }}>
                  <Text
                    style={{
                      color: Colors[colorScheme ?? 'light'].text,
                      fontSize: 14,
                      fontWeight: '400',
                    }}>
                    {user?.phone}
                  </Text>
                  <MaterialIcons
                    color={Colors[colorScheme ?? 'light'].text_light}
                    name="arrow-forward-ios"
                    size={16}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors[colorScheme ?? 'light'].secondary,
                paddingTop: 20,
              }}>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 35,
                  paddingVertical: 10,
                  gap: 20,
                }}>
                <MaterialIcons
                  name="home"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_dark,
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 35,
                  paddingVertical: 10,
                  gap: 20,
                }}>
                <MaterialIcons
                  name="wallet-giftcard"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_dark,
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Créditos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 35,
                  paddingVertical: 10,
                  gap: 20,
                }}>
                <MaterialIcons
                  name="history"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_dark,
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Historia
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 35,
                  paddingVertical: 10,
                  gap: 20,
                }}>
                <MaterialIcons
                  name="notifications"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_dark,
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Notificaciones
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 35,
                  paddingVertical: 10,
                  gap: 20,
                }}>
                <MaterialIcons
                  name="settings"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_dark,
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Opciones
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  signOut();
                }}
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 35,
                  paddingVertical: 10,
                  gap: 20,
                }}>
                <MaterialIcons
                  name="logout"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
                <Text
                  style={{
                    color: Colors[colorScheme ?? 'light'].text_dark,
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Salir
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: 'transparent',
                width: '100%',
                height: 60,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingHorizontal: 35,
                paddingVertical: 10,
                gap: 20,
              }}>
              <ScaleBtn
                style={{
                  flex: 1,
                }}>
                <Svg x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
                  <Defs>
                    <RadialGradient
                      cx="19.38"
                      cy="42.035"
                      r="44.899"
                      gradientUnits="userSpaceOnUse"
                      id="color-1_Xy10Jcu1L2Su_gr1">
                      <Stop offset="0" stopColor="#ffdd55" />
                      <Stop offset="0.328" stopColor="#ff543f" />
                      <Stop offset="0.348" stopColor="#fc5245" />
                      <Stop offset="0.504" stopColor="#e64771" />
                      <Stop offset="0.643" stopColor="#d53e91" />
                      <Stop offset="0.761" stopColor="#cc39a4" />
                      <Stop offset="0.841" stopColor="#c837ab" />
                    </RadialGradient>
                    <RadialGradient
                      cx="11.786"
                      cy="5.5403"
                      r="29.813"
                      gradientUnits="userSpaceOnUse"
                      id="color-2_Xy10Jcu1L2Su_gr2">
                      <Stop offset="0" stopColor="#4168c9" />
                      <Stop offset="0.999" stopColor="#4168c9" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <G transform="translate(-38.4,-38.4) scale(1.3,1.3)">
                    <G
                      fillRule="nonzero"
                      strokeWidth="1"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeMiterlimit="10"
                      strokeDashoffset="0"
                      style="mix-blend-mode: normal">
                      <G transform="scale(5.33333,5.33333)">
                        <Path
                          d="M34.017,41.99l-20,0.019c-4.4,0.004 -8.003,-3.592 -8.008,-7.992l-0.019,-20c-0.004,-4.4 3.592,-8.003 7.992,-8.008l20,-0.019c4.4,-0.004 8.003,3.592 8.008,7.992l0.019,20c0.005,4.401 -3.592,8.004 -7.992,8.008z"
                          fill="url(#color-1_Xy10Jcu1L2Su_gr1)"
                        />
                        <Path
                          d="M34.017,41.99l-20,0.019c-4.4,0.004 -8.003,-3.592 -8.008,-7.992l-0.019,-20c-0.004,-4.4 3.592,-8.003 7.992,-8.008l20,-0.019c4.4,-0.004 8.003,3.592 8.008,7.992l0.019,20c0.005,4.401 -3.592,8.004 -7.992,8.008z"
                          fill="url(#color-2_Xy10Jcu1L2Su_gr2)"
                        />
                        <Path
                          d="M24,31c-3.859,0 -7,-3.14 -7,-7c0,-3.86 3.141,-7 7,-7c3.859,0 7,3.14 7,7c0,3.86 -3.141,7 -7,7zM24,19c-2.757,0 -5,2.243 -5,5c0,2.757 2.243,5 5,5c2.757,0 5,-2.243 5,-5c0,-2.757 -2.243,-5 -5,-5z"
                          fill="#ffffff"
                        />
                        <Circle cx="31.5" cy="16.5" r="1.5" fill="#ffffff" />
                        <Path
                          d="M30,37h-12c-3.859,0 -7,-3.14 -7,-7v-12c0,-3.86 3.141,-7 7,-7h12c3.859,0 7,3.14 7,7v12c0,3.86 -3.141,7 -7,7zM18,13c-2.757,0 -5,2.243 -5,5v12c0,2.757 2.243,5 5,5h12c2.757,0 5,-2.243 5,-5v-12c0,-2.757 -2.243,-5 -5,-5z"
                          fill="#ffffff"
                        />
                      </G>
                    </G>
                  </G>
                </Svg>
              </ScaleBtn>

              <ScaleBtn
                style={{
                  flex: 1,
                }}>
                <Svg x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
                  <G transform="translate(-38.4,-38.4) scale(1.3,1.3)">
                    <G
                      fillRule="nonzero"
                      strokeWidth="1"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeMiterlimit="10"
                      strokeDashoffset="0"
                      style="mix-blend-mode: normal">
                      <G transform="scale(5.33333,5.33333)">
                        <Path
                          d="M42,37c0,2.762 -2.238,5 -5,5h-26c-2.761,0 -5,-2.238 -5,-5v-26c0,-2.762 2.239,-5 5,-5h26c2.762,0 5,2.238 5,5z"
                          fill="#3f51b5"
                        />
                        <Path
                          d="M34.368,25h-3.368v13h-5v-13h-3v-4h3v-2.41c0.002,-3.508 1.459,-5.59 5.592,-5.59h3.408v4h-2.287c-1.609,0 -1.713,0.6 -1.713,1.723v2.277h4z"
                          fill="#ffffff"
                        />
                      </G>
                    </G>
                  </G>
                </Svg>
              </ScaleBtn>
              <ScaleBtn
                style={{
                  flex: 1,
                }}>
                <Svg x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
                  <G transform="translate(-19.2,-19.2) scale(1.15,1.15)">
                    <G
                      fill="#000000"
                      fillRule="nonzero"
                      strokeWidth="1"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeMiterlimit="10"
                      strokeDashoffset="0"
                      style="mix-blend-mode: normal">
                      <G transform="scale(5.12,5.12)">
                        <Path d="M11,4c-3.866,0 -7,3.134 -7,7v28c0,3.866 3.134,7 7,7h28c3.866,0 7,-3.134 7,-7v-28c0,-3.866 -3.134,-7 -7,-7zM13.08594,13h7.9375l5.63672,8.00977l6.83984,-8.00977h2.5l-8.21094,9.61328l10.125,14.38672h-7.93555l-6.54102,-9.29297l-7.9375,9.29297h-2.5l9.30859,-10.89648zM16.91406,15l14.10742,20h3.06445l-14.10742,-20z" />
                      </G>
                    </G>
                  </G>
                </Svg>
              </ScaleBtn>
            </View>
          </View>
        );
      }}>
      <BottomSheetModalProvider>
        <MapView
          style={{
            width: '100%',
            height: '100%',
          }}
          onTouchMove={() => {}}
          onTouchStart={() => {
            placesInputViewRef.current?.blur();
            bottomSheetModalRef.current?.present();
          }}
          onTouchEnd={() => {}}
          onPress={() => {}}
          initialRegion={{
            latitude: 23.118644,
            longitude: -82.3806211,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          }}
          ref={mapViewRef}
          provider={PROVIDER_GOOGLE}
          customMapStyle={colorScheme === 'dark' ? NightMap : undefined}>
          <Polyline
            coordinates={activeRoute ?? []}
            strokeColor="white"
            strokeWidth={5}
            // strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
            strokeColors={[
              '#7F0000',
              '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
              '#B24112',
              '#E5845C',
              '#238C23',
              '#7F0000',
            ]}
            // strokeWidth={6}
          />

          <TaxisMarkers onPressTaxi={() => {}} />
          <AnimatedRouteMarker key={2} />
        </MapView>

        <View
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex: 10,
          }}>
          <GooglePlacesAutocomplete
            ref={placesInputViewRef}
            renderLeftButton={() => (
              <ScaleBtn
                onPress={() => {
                  setDrawerOpen(true);
                }}
                style={{
                  zIndex: 100,

                  width: 50,
                  height: '100%',
                  // borderTopLeftRadius: 30,
                  // borderBottomLeftRadius: 30,

                  justifyContent: 'center',
                  alignItems: 'center',

                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                }}>
                <MaterialIcons
                  name="menu"
                  size={30}
                  color={Colors[colorScheme ?? 'light'].text_dark}
                />
              </ScaleBtn>
            )}
            renderRightButton={() => (
              <View
                style={{
                  zIndex: 100,

                  width: 60,
                  height: '100%',
                  // borderTopRightRadius: 30,
                  // borderBottomRightRadius: 30,

                  justifyContent: 'center',
                  alignItems: 'center',

                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                }}>
                <MarkerCloudSVG width={45} height={45} />
              </View>
            )}
            /* predefinedPlaces={userMarkers.map(marker => ({
                description: marker.name,
                geometry: {
                    location: {
                        lat: marker.coords.latitude,
                        lng: marker.coords.longitude
                    }
                }
            }))} */
            placeholder="Buscar Lugar"
            textInputProps={{
              onFocus: onSearchBarFocus,
              onBlur: onSearchBarBlur,
              placeholderTextColor: colorScheme === 'light' ? '#6C6C6C' : 'black',
            }}
            enablePoweredByContainer={false}
            onPress={(data, details) => {
              const tokio = async (data: GooglePlaceData, details: GooglePlaceDetail | null) => {
                if (!details) {
                  return;
                }
                const position = await getCurrentPositionAsync({
                  accuracy: Accuracy.Highest,
                });
                try {
                  const resp = await fetch(
                    `http://192.168.1.103:6942/route?from=${position.coords.latitude},${position.coords.longitude}&to=${details.geometry.location.lat},${details.geometry.location.lng}`
                  );
                  const respJson = await resp.json();
                  const decodedCoords = polylineDecode(respJson[0].overview_polyline.points).map(
                    (point) => ({ latitude: point[0]!, longitude: point[1]! })
                  );
                  setActiveRoute(decodedCoords);
                } catch (error) {
                  if (error instanceof Error) {
                    console.error(error.message);
                  }
                }
              };
              tokio(data, details);
            }}
            styles={{
              textInputContainer: {
                margin: 40,
                marginHorizontal: 30,
                marginBottom: 0,
                position: 'relative',
                overflow: 'hidden',
                height: 55,
                borderRadius: 10,
                shadowColor: Colors[colorScheme ?? 'light'].shadow,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 2, // required for Android
              },
              textInput: {
                height: '100%',
                paddingLeft: 5,
                fontWeight: '400',
                fontSize: 20,
                textAlignVertical: 'center',
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderRadius: 0,
                color: colorScheme === 'light' ? '#6C6C6C' : 'black',
              },
              container: {
                position: 'relative',
                borderRadius: 30,
              },
              listView: {
                padding: 12,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderRadius: 30,
                marginHorizontal: 30,
                marginTop: 12,
                overflow: 'hidden',

                shadowColor: Colors[colorScheme ?? 'light'].shadow,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 2, // required for Android
              },
              row: {
                backgroundColor: 'transparent',
              },
            }}
            fetchDetails
            query={{
              key: 'AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE',
              language: 'es',
              components: 'country:cu',
              location: '23.11848,-82.38052',
              radius: 100,
            }}
            // nearbyPlacesAPI='GooglePlacesSearch'
            currentLocation
            currentLocationLabel="My Location"
          />
        </View>

        <GestureTranslationProvider value={gestureTranslationY}></GestureTranslationProvider>
        <BottomSheetModal
          // stackBehavior="push"
          ref={bottomSheetModalRef}
          overDragResistanceFactor={2}
          index={1}
          onChange={(e) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
            console.log(e);
            setSheetCurrentSnap(e);
            // if (sheetCurrentSnap === 2) placesInputViewRef.current?.blur();
            console.log(sheetCurrentSnap);
          }}
          android_keyboardInputMode="adjustResize"
          keyboardBehavior={keyboardBehavior}
          keyboardBlurBehavior={keyboardBlurBehavior}
          // enableContentPanningGesture={false}
          // enableHandlePanningGesture={false}
          enablePanDownToClose={false}
          snapPoints={['10%', '50%', '75%']}
          backgroundStyle={{
            borderRadius: 15,
            backgroundColor: 'transparent',
          }}
          handleIndicatorStyle={{
            backgroundColor:
              /* sheetCurrentSnap === 2 ? 'transparent' :  */ Colors[colorScheme ?? 'light'].border,
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
            // backgroundColor: Colors[colorScheme ?? 'light'].background,
            backgroundColor: 'rgba(50, 50, 50, 0.5)',
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
          }}
          backdropComponent={renderBackdrop}
          onDismiss={() => {
            setIsModalVisible(false);
          }}>
          {/* {!isModalVisible && (
            <View
              style={{
                // borderTopRightRadius: 30,
                // borderTopLeftRadius: 30,
                position: 'absolute',
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                top: 0,
                width: '100%',
                height: 60,
                zIndex: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  overflow: 'hidden',
                  borderRadius: 8,
                  width: '50%',
                }}>
                <Button
                  color={Colors[colorScheme ?? 'light'].primary}
                  title="Pedir Taxi"
                  onPress={() => {}}
                />
              </View>
            </View>
          )} */}
          <BottomSheetContent />
        </BottomSheetModal>

        <StatusBar
          backgroundColor="transparent"
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      </BottomSheetModalProvider>
    </Drawer>
  );
}
