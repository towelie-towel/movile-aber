import { type BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useKeepAwake } from 'expo-keep-awake';
import { Accuracy, getCurrentPositionAsync } from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  StatusBar,
  LayoutAnimation,
  Keyboard,
  useColorScheme,
  Button,
  Text,
  View,
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import MapView, { type LatLng, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
// import NetInfo from '@react-native-community/netinfo';

import AnimatedRouteMarker from '~/components/AnimatedRouteMarker';
import TaxisMarkers from '~/components/TaxiMarkers';
import { NightMap } from '~/constants/NightMap';
import BottomSheet from '~/containers/BottomSheeetModal';
import SearchBar from '~/containers/SearchBar';
import { GooglePlacesAutocompleteRef } from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { polylineDecode } from '~/utils/directions';

export default function Home() {
  useKeepAwake();
  console.log('Map re-rendered');
  const colorScheme = useColorScheme();
  // const { width, height } = Dimensions.get('window');
  // const { isConnected, isInternetReachable } = NetInfo.useNetInfo();

  // navigator bubbles
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isMenuVisible, setIsMenuVisible] = useState(true)
  const navigationAnimValue = useRef(new Animated.Value(0)).current;

  // const [isAddingMarker, setIsAddingMarker] = useState(false);

  // map & markers
  const mapViewRef = useRef<MapView>(null);

  // bottom sheet
  const [userSelected, _setUserSelected] = useState(true);
  const [selectedTaxiId, _setSelectedTaxiId] = useState<string | null>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // search bar
  const placesInputViewRef = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [activeRoute, setActiveRoute] = useState<LatLng[] | null | undefined>(null);

  const [open, setOpen] = React.useState(true);

  const onSearchBarFocus = () => {
    console.log('places input focus');
    LayoutAnimation.linear();
    // setIsMenuVisible(false)
    if (isMenuOpen) {
      Animated.spring(navigationAnimValue, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  const onSearchBarBlur = () => {
    console.log('places input blur');
    LayoutAnimation.linear();
    // setIsMenuVisible(true)
  };

  const toggleNavMenu = useCallback(() => {
    const toValue = isMenuOpen ? 0 : 1;
    setIsMenuOpen(!isMenuOpen);
    Keyboard.dismiss();

    Animated.spring(navigationAnimValue, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen, navigationAnimValue]);

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

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderDrawerContent={() => {
        return <Text>Drawer content</Text>;
      }}>
      <BottomSheetModalProvider>
        <MapView
          style={{
            height: '100%',
            width: '100%',
          }}
          onTouchMove={() => {
            // _fadeOutNav()
          }}
          onTouchStart={() => {
            placesInputViewRef.current?.blur();
            bottomSheetModalRef.current?.present();
          }}
          onTouchEnd={() => {
            // _fadeInNav()
          }}
          onPress={() => {
            if (isMenuOpen) {
              toggleNavMenu();
            }
          }}
          initialRegion={{
            latitude: 23.118644,
            longitude: -82.3806211,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          }}
          showsMyLocationButton
          showsUserLocation
          showsCompass={false}
          toolbarEnabled={false}
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
            top: 60,
            width: '100%',
            zIndex: 10,
          }}>
          <SearchBar
            refFor={(ref) => (placesInputViewRef.current = ref)}
            onFocus={onSearchBarFocus}
            onBlur={onSearchBarBlur}
            onProfilePicPress={() => {}}
            onPlacePress={async (_, details) => {
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
            }}
          />
        </View>

        <BottomSheet
          bottomSheetModalRef={bottomSheetModalRef}
          userSelected={userSelected}
          selectedTaxiId={selectedTaxiId}
          isVisible={isModalVisible}
          setIsVisible={setIsModalVisible}
        />

        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      </BottomSheetModalProvider>
    </Drawer>
  );
}
