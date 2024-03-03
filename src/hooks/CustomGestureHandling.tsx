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
import { View, Text, useColorScheme, Keyboard, Platform, useWindowDimensions } from 'react-native';
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

  const { width } = useWindowDimensions();

  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

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

  /* useEffect(() => {
    // only needed for Android because
    // keyboardBehavior="extend" is not working properly
    // on Android, it leaves a gap between the keyboard and the bottom sheet
    // when the keyboard is visible

    // const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
    //   if (Platform.OS === 'android') {
    //     console.log('keyboardDidShow-BS-to-1');
    //     bottomSheetModalRef.current?.snapToIndex(1);
    //   }
    // });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') {
        originInputViewRef.current?.clear();
        originInputViewRef.current?.blur();
      }
    });
    return () => {
      // showSubscription.remove();
      hideSubscription.remove();
    };
  }, []); */

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
      <Text style={{
        fontWeight: "700",
        fontSize: 20,
      }}>A donde quieres ir?</Text>

      <View style={{
        position: "relative",
        zIndex: 1000,
        width: '100%',
        height: 50,
        marginTop: 20,
        paddingHorizontal: 0,

        alignItems: 'center',
        flexDirection: 'row',
      }}>
        <MaterialCommunityIcons name="map-marker-account" size={32} color="#000" />
        <GooglePlacesAutocomplete
          ref={originInputViewRef}
          predefinedPlaces={userMarkers.map((marker) => ({
            description: marker.name,
            geometry: {
              location: {
                lat: marker.coords.latitude,
                lng: marker.coords.longitude,
              },
            },
          }))}
          placeholder="Lugar de Origen"
          textInputProps={{
            placeholderTextColor: colorScheme === 'light' ? '#6C6C6C' : 'black',
            onFocus: () => {

            }
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
            container: {
              position: 'relative',
              zIndex: 1000,
              overflow: 'visible',
            },
            textInputContainer: {
              position: 'relative',
              zIndex: 1000,
              overflow: 'hidden',
              marginLeft: 12,
              height: 46,
              borderRadius: 10,
              width: (width * 0.9) - 48,
            },
            textInput: {
              position: 'relative',
              zIndex: 1000,

              height: '100%',
              fontWeight: '400',
              borderRadius: 10,
              fontSize: 16,
              textAlignVertical: 'center',
              color: colorScheme === 'light' ? '#6C6C6C' : 'black',
              backgroundColor: Colors[colorScheme ?? 'light'].background_light1,

              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            },
            listView: {
              position: 'absolute',
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: 5,
              flex: 1,
              elevation: 3,
              marginTop: 12,
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
        />

      </View>

      <View style={{
        position: "relative",
        zIndex: -1,
        width: '100%',
        height: 50,
        marginTop: 10,
        paddingHorizontal: 0,

        alignItems: 'center',
        flexDirection: 'row',
      }}>
        <MaterialCommunityIcons name="map-marker-radius" size={32} color="#000" />
        <GooglePlacesAutocomplete
          ref={destinationInputViewRef}
          predefinedPlaces={userMarkers.map((marker) => ({
            description: marker.name,
            geometry: {
              location: {
                lat: marker.coords.latitude,
                lng: marker.coords.longitude,
              },
            },
          }))}
          placeholder="Lugar Destino"
          textInputProps={{
            placeholderTextColor: colorScheme === 'light' ? '#6C6C6C' : 'black',
            onFocus: () => {

            },

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
            container: {
              position: 'relative',
              zIndex: -1,
              overflow: 'visible',
            },
            textInputContainer: {
              position: 'relative',
              zIndex: -1,
              overflow: 'hidden',
              marginLeft: 12,
              height: 46,
              borderRadius: 10,
              width: (width * 0.9) - 48,
            },
            textInput: {
              position: "relative",
              zIndex: -1,

              height: '100%',
              fontWeight: '400',
              borderRadius: 10,
              fontSize: 16,
              textAlignVertical: 'center',
              color: colorScheme === 'light' ? '#6C6C6C' : 'black',
              backgroundColor: Colors[colorScheme ?? 'light'].background_light1,

              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            },
            listView: {
              position: 'absolute',
              zIndex: -1,
              backgroundColor: 'white',
              borderRadius: 5,
              flex: 1,
              elevation: 3,
              marginTop: 12,
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
        />

      </View>

      <View style={{
        marginTop: 28,
        gap: 18
      }}>

        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 18
        }}>
          <MaterialCommunityIcons name="bookmark-outline" size={32} color="#000" />
          <View style={{}}>
            <Text style={{
              fontSize: 18,
              fontWeight: "600"
            }}>Casa</Text>
            <Text style={{
            }}>Pedro P / Clavel y Mariano No.561</Text>
          </View>
        </View>

        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 18
        }}>
          <MaterialCommunityIcons name="bookmark-outline" size={32} color="#000" />
          <View style={{}}>
            <Text style={{
              fontSize: 18,
              fontWeight: "600"
            }}>Trabajo</Text>
            <Text style={{
            }}>8 / 11 y 13 No.256 apto 10</Text>
          </View>
        </View>

      </View>

    </BottomSheetView>
  );
};
