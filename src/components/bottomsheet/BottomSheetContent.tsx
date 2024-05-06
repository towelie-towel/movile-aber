import React, { useEffect, useRef, useState } from 'react';
import { View, Text, useColorScheme, useWindowDimensions, LayoutAnimation, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet';
import { getCurrentPositionAsync, Accuracy } from 'expo-location';
import type { Address, LatLng } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';

import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import Colors from '~/constants/Colors';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocompleteRef } from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { getAddress, polylineDecode } from '~/utils/directions';
import { ScaleBtn } from '~/components/common/ScaleBtn';

interface BottomSheetContentProps {
  activeRoute: { coords: LatLng[] } | null | undefined;
  userMarkers: UserMarkerIconType[];
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
  placesInputViewRef: React.RefObject<GooglePlacesAutocompleteRef>;
  startPiningLocation: () => void;
  cancelPiningLocation: () => void;
  confirmPiningLocation: () => Promise<{ latitude: number; longitude: number; address?: Address }>;
  piningLocation: boolean;
}

export const BottomSheetContent = ({ userMarkers, setActiveRoute, placesInputViewRef, startPiningLocation, cancelPiningLocation, confirmPiningLocation, piningLocation }: BottomSheetContentProps) => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const { collapse } = useBottomSheet();
  const [viewPinOnMap, setViewPinOnMap] = useState<"none" | "origin" | "destination">("none");

  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    // fetchOrigin()
  }, [])

  const fetchOrigin = async () => {
    const posSubscrition = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Highest,
    });

    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${posSubscrition.coords.latitude},${posSubscrition.coords.longitude}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`)
    const respJson = await resp.json();
    originInputViewRef.current?.setAddressText(respJson.results[0].formatted_address)
  }

  const startPiningLocationHandler = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    startPiningLocation()
    Keyboard.dismiss()
    collapse()
    originInputViewRef.current?.blur()
    destinationInputViewRef.current?.blur()
  }

  const cancelPiningLocationHandler = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    cancelPiningLocation()
  }

  /* const confirmPiningLocationHandler = async () => {
    const location = await confirmPiningLocation()
    console.log(await getAddress(location.latitude, location.longitude))
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`)
    const respJson = await resp.json();
    const result = respJson.results.find((result: any) => result.types.includes('street_address'))
    originInputViewRef.current?.setAddressText(result.formatted_address)
  } */

  const confirmPiningLocationHandler = async () => {
    const location = await confirmPiningLocation();
    console.log(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&region=cu&language=es-419&result_type=street_address|route|intersection&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`)
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&region=cu&language=es-419&result_type=street_address|route|intersection&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`
    );
    const respJson = await resp.json();
    console.log(JSON.stringify(respJson, null, 2))

    // Find the result that contains the street address
    const streetAddressResult = respJson.results.find((result: any) =>
      result.types.includes('street_address')
    );

    if (streetAddressResult) {
      const { formatted_address, address_components } = streetAddressResult;

      // Extract the street information
      const streetNumber = address_components.find((component: any) =>
        component.types.includes('street_number')
      )?.long_name;
      const streetName = address_components.find((component: any) =>
        component.types.includes('route')
      )?.long_name;
      const crossStreets = address_components
        .filter((component: any) => component.types.includes('intersection'))
        .map((component: any) => component.long_name)
        .join(' and ');

      // Format the street information
      const streetInfo = `${streetNumber} ${streetName} between ${crossStreets}`;

      originInputViewRef.current?.setAddressText(formatted_address);
      console.log(streetInfo);
    } else {
      console.log('No street address found in the response.');
    }
  };

  return (
    <BottomSheetView className='flex-1 bg-[#F8F8F8] dark:bg-[#222222]'>
      <View className='w-[90%] h-full self-center'>

        <View className='h-10 flex-row justify-between items-center mx-1.5'>
          <Text className='font-bold text-xl'>A donde quieres ir?</Text>

          {viewPinOnMap !== "none" && <ScaleBtn onPress={startPiningLocationHandler}>
            <View className='flex-row items-center gap-2 p-1 px-2 border rounded-lg'>
              <Text className='h-full text-lg font-medium text-center'>Fijar en el Mapa</Text>
              <MaterialCommunityIcons name="map-search-outline" size={22} color="#000" />
            </View>
          </ScaleBtn>}

          {piningLocation && <View className='flex-row gap-4'>
            <ScaleBtn onPress={confirmPiningLocationHandler}>
              <View className='flex-row items-center gap-2 p-1 border rounded-lg'>
                <MaterialCommunityIcons name="check" size={28} color="#000" />
              </View>
            </ScaleBtn>
            <ScaleBtn onPress={cancelPiningLocationHandler}>
              <View className='flex-row items-center gap-2 p-1 border rounded-lg'>
                <MaterialCommunityIcons name="cancel" size={28} color="#000" />
              </View>
            </ScaleBtn>
          </View>}
        </View>

        <View className='relative z-[1000] w-full h-12 px-0 mt-3 items-center flex-row'>
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
                if (piningLocation) cancelPiningLocationHandler()
                setViewPinOnMap("origin")
              },
              onBlur: () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setViewPinOnMap("none")
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
                if (piningLocation) cancelPiningLocationHandler()
                setViewPinOnMap("destination")
              },
              onBlur: () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setViewPinOnMap("none")
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
            <View key={marker.id} className='flex-row items-center gap-5'>
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
