import { MaterialIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
// import { Accuracy, getCurrentPositionAsync } from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { Link } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StatusBar,
  LayoutAnimation,
  useColorScheme,
  Text,
  View,
  Platform,
  Keyboard,
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { TouchableOpacity, GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { type LatLng, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
// import NetInfo from '@react-native-community/netinfo';

import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { UserMarkerIconType } from '~/components/AddUserMarker';
import AnimatedRouteMarker from '~/components/AnimatedRouteMarker';
import Ripple from '~/components/RippleBtn';
import { ScaleBtn } from '~/components/ScaleBtn';
import TaxisMarkers from '~/components/TaxiMarkers';
import UserMarker from '~/components/UserMarker';
import Colors from '~/constants/Colors';
import { MarkerCloudSVG } from '~/constants/Icons';
import { NightMap } from '~/constants/NightMap';
// import { useUser } from '~/context/UserContext';
// import { useWSConnection } from '~/context/WSContext';
import { BottomSheetContent } from '~/hooks/CustomGestureHandling';
import { CustomHandle } from '~/hooks/CustomHandle';
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { getData } from '~/lib/storage';
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

  // const { session, user, isSignedIn, isLoading, signOut } = useUser();
  // const { wsTaxis } = useWSConnection();

  const [userMarkers, setUserMarkers] = useState<UserMarkerIconType[]>([]);

  // const [isAddingMarker, setIsAddingMarker] = useState(false);

  // map & markers
  const mapViewRef = useRef<MapView>(null);

  // search bar
  const placesInputViewRef = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [activeRoute, setActiveRoute] = useState<{ coords: LatLng[] } | null | undefined>(null);

  // bottom sheet
  const [sheetCurrentSnap, setSheetCurrentSnap] = useState(1);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [120, '75%', '90%'], []);

  // const [selectedTaxiId, _setSelectedTaxiId] = useState<string | null>(null);
  // const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    getData('user_markers').then((data) => {
      setUserMarkers(data ?? []);
    });
    // only needed for Android because
    // keyboardBehavior="extend" is not working properly
    // on Android, it leaves a gap between the keyboard and the bottom sheet
    // when the keyboard is visible
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (Platform.OS === 'android') {
        console.log('keyboardDidShow-BS-to-1');
        bottomSheetModalRef.current?.snapToIndex(1);
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') {
        console.log('keyboardDidHide-BS-to-0');
        bottomSheetModalRef.current?.snapToIndex(0);
      }
    });
    return () => {
      showSubscription.remove();
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

  console.log('aa');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            coordinates={activeRoute?.coords ?? []}
            strokeColor={Colors[colorScheme ?? 'light'].text_dark}
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
          <UserMarker title="User Marker" description="User Marker Description" userId="123" />
        </MapView>

        <BottomSheetModal
          // stackBehavior="push"
          ref={bottomSheetModalRef}
          overDragResistanceFactor={6}
          // keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'fillParent'}
          // keyboardBlurBehavior={keyboardBlurBehavior}
          handleComponent={renderCustomHandle}
          index={0}
          onChange={(e) => {
            console.log('BottomSheetModal-onChange', e);
            // setSheetCurrentSnap(e);
            // if (sheetCurrentSnap === 2) placesInputViewRef.current?.blur();
          }}
          enableDynamicSizing
          android_keyboardInputMode="adjustResize"
          enableContentPanningGesture={false}
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
          <BottomSheetContent userMarkers={userMarkers} activeRoute={activeRoute} />
        </BottomSheetModal>

        <StatusBar
          backgroundColor="transparent"
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
