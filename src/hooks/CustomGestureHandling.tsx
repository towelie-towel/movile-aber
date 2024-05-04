import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { getCurrentPositionAsync, Accuracy } from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { View, Text, useColorScheme, useWindowDimensions } from 'react-native';
import { LatLng } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';

import { UserMarkerIconType } from '~/components/AddUserMarker';
import Colors from '~/constants/Colors';

import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { polylineDecode } from '~/utils/directions';
// import RippleCenter from '~/components/RippleCenterBtn';

export const BottomSheetContent = ({
  userMarkers,
  setActiveRoute,
}: {
  activeRoute: { coords: LatLng[] } | null | undefined;
  userMarkers: UserMarkerIconType[];
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
}) => {
  const colorScheme = useColorScheme();

  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    (async () => {
      const posSubscrition = await ExpoLocation.getCurrentPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.Highest,
        }
      );
      const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${posSubscrition.coords.latitude},${posSubscrition.coords.longitude}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`)
      const respJson = await resp.json();
      originInputViewRef.current?.setAddressText(respJson.results[0].formatted_address)
      console.log(respJson.results[0].formatted_address)
    })()
  }, [])

  const { width } = useWindowDimensions();

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

      <View style={{
        position: "relative",
        zIndex: 999,
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

      <View style={{
        marginTop: 28,
        gap: 18,
        position: 'relative',
        zIndex: 1,
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
