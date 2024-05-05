import React, { useEffect, useRef, useState } from 'react';
import { View, Text, useColorScheme, useWindowDimensions, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { getCurrentPositionAsync, Accuracy } from 'expo-location';
import { LatLng } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';

import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import Colors from '~/constants/Colors';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocompleteRef } from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { polylineDecode } from '~/utils/directions';
import { ScaleBtn } from '~/components/common/ScaleBtn';

interface BottomSheetContentProps {
  activeRoute: { coords: LatLng[] } | null | undefined;
  userMarkers: UserMarkerIconType[];
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
}

export const BottomSheetContent = ({ userMarkers, setActiveRoute }: BottomSheetContentProps) => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [viewPinOnMap, setViewPinOnMap] = useState(false);

  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

  const fetchOrigin = async () => {
    const posSubscrition = await ExpoLocation.getCurrentPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.Highest,
      }
    );
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${posSubscrition.coords.latitude},${posSubscrition.coords.longitude}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`)
    const respJson = await resp.json();
    originInputViewRef.current?.setAddressText(respJson.results[0].formatted_address)
  }

  useEffect(() => {
    fetchOrigin()
  }, [])

  return (
    <BottomSheetView className='flex-1 bg-[#F8F8F8] dark:bg-[#222222]'>
      <View className='w-[90%] h-full self-center pt-2.5'>

        <View className='h-10 flex-row justify-between items-center mx-1.5'>
          <Text className='font-bold text-xl'>A donde quieres ir?</Text>

          {viewPinOnMap && <ScaleBtn>
            <View className='flex-row items-center gap-2 p-1 border rounded-lg'>
              <Text className='text-lg font-medium text-center h-full'>Fijar en el Mapa</Text>
              <MaterialCommunityIcons name="map-search-outline" size={22} color="#000" />
            </View>
          </ScaleBtn>}
        </View>

        <View className='relative z-[1000] w-full h-12 px-0 mt-5 items-center flex-row'>
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
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setViewPinOnMap(true)
              },
              onBlur: () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setViewPinOnMap(false)
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
                color: Colors[colorScheme ?? 'light'].text_dark,
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

        <View className='relative z-[999] w-full h-12 px-0 mt-5 items-center flex-row'>
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
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setViewPinOnMap(true)
              },
              onBlur: () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setViewPinOnMap(false)
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
                zIndex: 999,
                overflow: 'visible',
              },
              textInputContainer: {
                position: 'relative',
                zIndex: 999,
                overflow: 'hidden',
                marginLeft: 12,
                height: 46,
                borderRadius: 10,
                width: (width * 0.9) - 48,
              },
              textInput: {
                position: 'relative',
                zIndex: 999,

                height: '100%',
                fontWeight: '400',
                borderRadius: 10,
                fontSize: 16,
                textAlignVertical: 'center',
                color: Colors[colorScheme ?? 'light'].text_dark,
                backgroundColor: Colors[colorScheme ?? 'light'].background_light1,

                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
              },
              listView: {
                position: 'absolute',
                zIndex: 999,
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

        <View className='mt-7 gap-5 relative z-1'>
          {userMarkers.map((marker) => (
            <View className='flex-row items-center gap-5'>
              <MaterialCommunityIcons name="bookmark-outline" size={32} color="#000" />
              <View>
                <Text className='font-lg font-medium'>{marker.name}</Text>
                <Text>{marker.description}</Text>
              </View>
            </View>
          ))}
        </View>

      </View>
    </BottomSheetView>
  );
};
