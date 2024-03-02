import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useBottomSheetInternal,
  BottomSheetFlatList,
  BottomSheetView,
  BottomSheetTextInput,
  TouchableOpacity,
  BottomSheetScrollView,
  ANIMATION_SOURCE,
} from '@gorhom/bottom-sheet';
import { getCurrentPositionAsync, Accuracy } from 'expo-location';
import React, { Ref, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, useColorScheme, Keyboard, Platform } from 'react-native';
import { LatLng } from 'react-native-maps';
import { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { UserMarkerIconType } from '~/components/AddUserMarker';
import RippleBtn from '~/components/RippleBtn';
import { ScaleBtn } from '~/components/ScaleBtn';
import Colors from '~/constants/Colors';
// import { ScrollView } from 'react-native-gesture-handler';

import { MarkerCloudSVG } from '~/constants/Icons';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { polylineDecode } from '~/utils/directions';
// import RippleCenter from '~/components/RippleCenterBtn';

export const BottomSheetContent = ({
  activeRoute,
  userMarkers,
  setActiveRoute,
}: {
  activeRoute: { coords: LatLng[] } | null | undefined;
  userMarkers: UserMarkerIconType[];
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
}) => {
  const colorScheme = useColorScheme();

  const placesInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

  const { animatedIndex, animateToPosition } = useBottomSheetInternal();

  const listContentContainerStyle = useAnimatedStyle(() => ({
    // [-1, 1, 2] this first array defines the [-1, disapearPoint, aperPoint]
    opacity: interpolate(animatedIndex.value, [-1, 0, 1], [0, -1, 1], Extrapolate.CLAMP),
  }));
  const listContentStyle = useMemo(() => [listContentContainerStyle], [listContentContainerStyle]);

  const startBtnContainerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, 0, 1], [1, 1, -1], Extrapolate.CLAMP),
  }));
  const startBtnStyle = useMemo(() => [startBtnContainerStyle], [startBtnContainerStyle]);

  useEffect(() => {
    // only needed for Android because
    // keyboardBehavior="extend" is not working properly
    // on Android, it leaves a gap between the keyboard and the bottom sheet
    // when the keyboard is visible
    /* const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (Platform.OS === 'android') {
        console.log('keyboardDidShow-BS-to-1');
        bottomSheetModalRef.current?.snapToIndex(1);
      }
    }); */
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') {
        placesInputViewRef.current?.clear();
        placesInputViewRef.current?.blur();
      }
    });
    return () => {
      // showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const renderBottomSheetItem = useCallback(
    ({ item }: { item: { userId: string } }) => (
      <View
        key={item.userId}
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

  const renderMarkerBtnItems = useCallback(
    ({ item }: { item: UserMarkerIconType }) => (
      <View
        key={item.id}
        style={{
          padding: 6,
          margin: 6,
          backgroundColor: Colors[colorScheme ?? 'light'].btn_light_bg,
          width: 60,
          height: 60,
          marginLeft: 12,
          justifyContent: 'center',
          alignItems: 'center',

          borderRadius: 100,

          // borderColor: Colors[colorScheme ?? 'light'].primary,
          // borderWidth: 2,
          // borderStyle: 'dotted',
        }}>
        <TouchableOpacity
          onPress={() => {
            console.log('aaa');
          }}
          style={{}}>
          <MaterialCommunityIcons
            // @ts-ignore
            name={item.icon.name}
            size={35}
            color="black"
          />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  return (
    <BottomSheetView
      style={{
        width: '90%',
        alignSelf: 'center',
        height: '100%',
        paddingTop: 10,

        // borderColor: 'orange',
        // borderWidth: 2,
        // borderStyle: 'dotted',
      }}>
      <GooglePlacesAutocomplete
        ref={placesInputViewRef}
        renderLeftButton={() => (
          <ScaleBtn
            style={{
              width: 36,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'flex-end',
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
            }}
            onPress={() => { }}>
            <MaterialCommunityIcons
              name="magnify"
              size={28}
              color={Colors[colorScheme ?? 'light'].text_light}
            />
          </ScaleBtn>
        )}
        renderRightButton={() => (
          <ScaleBtn
            style={{
              width: 52,
              height: '100%',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => { }}>
            <MaterialIcons name="supervised-user-circle" size={42} color="#C7C7CB" />
          </ScaleBtn>
        )}
        /* renderRow={(data) => (
          <RippleBtn
            style={{
              height: 42,
              width: '100%',
              // borderRadius: 12,

              borderColor: 'black',
              borderWidth: 2,
              borderStyle: 'dotted',
            }}
            onTap={() => {}}>
            <BottomSheetView
              style={{
                height: '100%',
                width: '100%',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                alignContent: 'center',
                gap: 18,
                paddingHorizontal: 12,
              }}>
              <MaterialIcons name="supervised-user-circle" size={42} color="#0C79FE" />
              <BottomSheetView style={{}}>
                <Text>{data.reference}</Text>
                <Text>{data.description} A 5.2km de distancia.</Text>
              </BottomSheetView>
            </BottomSheetView>
          </RippleBtn>
        )} */
        /* renderHeaderComponent={() => (
          <Text
            style={{
              fontWeight: '500',
              fontSize: 18,
              textAlignVertical: 'center',
              color: colorScheme === 'light' ? '#6C6C6C' : 'black',
            }}>
            Siri Suggestions
          </Text>
        )} */
        predefinedPlaces={userMarkers.map((marker) => ({
          description: marker.name,
          geometry: {
            location: {
              lat: marker.coords.latitude,
              lng: marker.coords.longitude,
            },
          },
        }))}
        placeholder="Buscar Lugar"
        textInputProps={{
          placeholderTextColor: colorScheme === 'light' ? '#6C6C6C' : 'black',
        }}
        enablePoweredByContainer={false}
        onPress={(data, details) => {
          const tokio = async (_data: GooglePlaceData, details: GooglePlaceDetail | null) => {
            if (!details) {
              return;
            }
            const position = await getCurrentPositionAsync({
              accuracy: Accuracy.Highest,
            });
            try {
              const resp = await fetch(
                `http://192.168.133.191:4200/route?from=${position.coords.latitude},${position.coords.longitude}&to=${details.geometry.location.lat},${details.geometry.location.lng}`
              );
              const respJson = await resp.json();
              const decodedCoords = polylineDecode(respJson[0].overview_polyline.points).map(
                (point) => ({ latitude: point[0]!, longitude: point[1]! })
              );
              setActiveRoute({
                coords: decodedCoords,
              });
              console.log(JSON.stringify(decodedCoords, null, 2));
            } catch (error) {
              if (error instanceof Error) {
                console.error(error.message);
              }
            }
          };
          tokio(data, details);
        }}
        debounce={400}
        styles={{
          textInputContainer: {
            // position: 'relative',
            // overflow: 'hidden',
            height: 42,
            borderRadius: 10,
          },
          textInput: {
            height: '100%',
            fontWeight: '400',
            borderRadius: 0,
            fontSize: 18,
            textAlignVertical: 'center',
            color: colorScheme === 'light' ? '#6C6C6C' : 'black',
            backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
          },
          container: {
            position: 'relative',
            // borderRadius: 10,
            // paddingTop: 2,
            // height: 400,
            overflow: 'visible',

            // borderColor: 'green',
            // borderWidth: 2,
            // borderStyle: 'dotted',
          },
          listView: {
            position: 'absolute',
            backgroundColor: 'white',
            borderRadius: 5,
            flex: 1,
            elevation: 3,
            zIndex: 10,
            marginTop: 12,

            // borderColor: 'black',
            // borderWidth: 2,
            // borderStyle: 'dotted',
          },
          /* row: {
            height: 30,
            backgroundColor: 'transparent',
          }, */
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
      // currentLocation
      // currentLocationLabel="My Location"
      />
      {/* <BottomSheetView
        style={
          {
            // borderColor: 'brown',
            // borderStyle: 'dotted',
            // borderWidth: 1,
          }
        }>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 18,
            textAlignVertical: 'center',
            color: colorScheme === 'light' ? '#6C6C6C' : 'black',
          }}>
          Siri Suggestions
        </Text>
        <RippleBtn
          style={{
            height: 60,
            width: '100%',
            borderRadius: 12,

            // borderColor: 'black',
            // borderWidth: 2,
            // borderStyle: 'dotted',
          }}
          onTap={() => {}}>
          <BottomSheetView
            style={{
              height: '100%',
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              alignContent: 'center',
              gap: 18,
              paddingHorizontal: 12,
            }}>
            <MaterialIcons name="supervised-user-circle" size={42} color="#0C79FE" />
            <BottomSheetView style={{}}>
              <Text>Parked Car</Text>
              <Text>A 5.2km de distancia.</Text>
            </BottomSheetView>
          </BottomSheetView>
        </RippleBtn>
      </BottomSheetView> */}
    </BottomSheetView>
  );
};
