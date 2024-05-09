import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  useColorScheme,
  useWindowDimensions,
  LayoutAnimation,
  Keyboard,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollView,
  Pressable,
} from 'react-native';
import type { Address, LatLng } from 'react-native-maps';

import { BikeSVG, AutoSVG, ConfortSVG, ConfortPlusSVG, VipSVG } from '../svgs';

import { ScaleBtn } from '~/components/common/ScaleBtn';
import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import Colors from '~/constants/Colors';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { TaxiProfile, TaxiType } from '~/types';
import { polylineDecode } from '~/utils/directions';

const taxisInfo = [
  {
    slug: 'bike',
    name: 'Bike',
    Icon: BikeSVG,
    pricePerKm: 0.5,
    timePerKm: 0.5,
  },
  {
    slug: 'auto',
    name: 'Auto',
    Icon: AutoSVG,
    pricePerKm: 1,
    timePerKm: 0.45,
  },
  {
    slug: 'confort',
    name: 'Confort',
    Icon: ConfortSVG,
    pricePerKm: 1.5,
    timePerKm: 0.4,
  },
  {
    slug: 'confort_plus',
    name: 'Confort Plus',
    Icon: ConfortPlusSVG,
    pricePerKm: 2,
    timePerKm: 0.42,
  },
  {
    slug: 'vip',
    name: 'Vip',
    Icon: VipSVG,
    pricePerKm: 3,
    timePerKm: 0.38,
  },
];

interface BottomSheetContentProps {
  activeRoute: { coords: LatLng[] } | null | undefined;
  userMarkers: UserMarkerIconType[];
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
  startPiningLocation: () => void;
  cancelPiningLocation: () => void;
  confirmPiningLocation: () => Promise<{ latitude: number; longitude: number; address?: Address }>;
  piningLocation: boolean;
  animateToRoute: (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ) => void;
  selectedTaxiType: string | null;
  setSelectedTaxiType: React.Dispatch<TaxiType | null>;
  confirmedTaxi: TaxiProfile | null;
}

export const BottomSheetContent = ({
  userMarkers,
  setActiveRoute,
  startPiningLocation,
  cancelPiningLocation,
  confirmPiningLocation,
  piningLocation,
  animateToRoute,
  selectedTaxiType,
  setSelectedTaxiType,
  confirmedTaxi,
}: BottomSheetContentProps) => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const { collapse, snapToIndex } = useBottomSheet();
  const [viewPinOnMap, setViewPinOnMap] = useState(false);
  const [piningInput, setPiningInput] = useState<'origin' | 'destination'>('destination');
  const [piningInfo, setPiningInfo] = useState({
    origin: { latitude: 0, longitude: 0, address: '' },
    destination: { latitude: 0, longitude: 0, address: '' },
  });
  const [routeInfo, setRouteInfo] = useState<{
    distance: { value: number; text: string };
    duration: { value: number; text: string };
  } | null>(null);

  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    fetchOrigin();
  }, []);

  const fetchOrigin = async () => {
    const currentPosition = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Highest,
    });
    const resp = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${currentPosition.coords.latitude},${currentPosition.coords.longitude}&types=street&limit=5&apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&showMapReferences=pointAddress&show=streetInfo`
    );
    const respJson = await resp.json();

    if (respJson.items.length > 0) {
      const streetInfo = `${respJson.items[0].address.street.replace('Calle ', '')} e/ ${respJson.items[1].address.street.replace('Calle ', '')} y ${respJson.items[2].address.street.replace('Calle ', '')}, ${respJson.items[2].address.district}, ${respJson.items[2].address.district}, Habana, Cuba`;
      originInputViewRef.current?.setAddressText(streetInfo);
      setPiningInfo({
        ...piningInfo,
        origin: { address: streetInfo, ...currentPosition.coords },
      });
    } else {
      console.log('No street address found in the response.');
    }
  };

  const startPiningLocationHandler = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    startPiningLocation();
    Keyboard.dismiss();
    collapse();
    originInputViewRef.current?.blur();
    destinationInputViewRef.current?.blur();
  };

  const cancelPiningLocationHandler = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    cancelPiningLocation();
  };
  const cancelRideHandler = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveRoute(null);
    setRouteInfo(null);
    collapse();
  };

  const confirmPiningLocationHandler = async () => {
    try {
      const location = await confirmPiningLocation();
      const resp = await fetch(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${location.latitude},${location.longitude}&types=street&limit=5&apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&showMapReferences=pointAddress&show=streetInfo`
      );
      const respJson = await resp.json();

      if (respJson.items.length > 0) {
        const streetInfo = `${respJson.items[0].address.street.replace('Calle ', '')} e/ ${respJson.items[1].address.street.replace('Calle ', '')} y ${respJson.items[2].address.street.replace('Calle ', '')}, ${respJson.items[2].address.district}, Habana, Cuba`;

        if (piningInput === 'origin') {
          originInputViewRef.current?.setAddressText(streetInfo);
        } else if (piningInput === 'destination') {
          destinationInputViewRef.current?.setAddressText(streetInfo);
          if (piningInfo.origin.address === '') fetchOrigin();
          else if (piningInfo.origin.latitude && piningInfo.origin.longitude) {
            const resp = await fetch(
              `http://192.168.1.255:6942/route?from=${piningInfo.origin.latitude},${piningInfo.origin.longitude}&to=${location.latitude},${location.longitude}`
            );
            const respJson = await resp.json();
            const decodedCoords = polylineDecode(respJson[0].overview_polyline.points).map(
              (point) => ({ latitude: point[0]!, longitude: point[1]! })
            );

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            snapToIndex(1);
            setActiveRoute({
              coords: decodedCoords,
            });
            setRouteInfo({
              distance: respJson[0].legs[0].distance,
              duration: respJson[0].legs[0].duration,
            });
            animateToRoute(
              { latitude: piningInfo.origin.latitude, longitude: piningInfo.origin.longitude },
              { latitude: location.latitude, longitude: location.longitude }
            );
            console.log(JSON.stringify(respJson, null, 2));
          }
        }
        setPiningInfo({
          ...piningInfo,
          [piningInput]: { ...location, address: streetInfo },
        });
      } else {
        console.log('No street address found in the response.');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  return (
    <BottomSheetView className="flex-1 bg-[#F8F8F8] dark:bg-[#222222]">
      {!routeInfo ? (
        <View className="w-[90%] h-full self-center overflow-visible">
          <View className="h-10 flex-row justify-between items-center mx-1.5">
            <Text className="font-bold text-xl">A donde quieres ir?</Text>

            {viewPinOnMap && (
              <ScaleBtn onPress={startPiningLocationHandler}>
                <View className="flex-row items-center gap-2 p-1 px-2 border rounded-lg">
                  <Text className="h-full text-lg font-medium text-center">Fijar en el Mapa</Text>
                  <MaterialCommunityIcons name="map-search-outline" size={22} color="#000" />
                </View>
              </ScaleBtn>
            )}

            {piningLocation && (
              <View className="flex-row gap-4">
                <ScaleBtn onPress={confirmPiningLocationHandler}>
                  <View className="p-1 border rounded-lg">
                    <MaterialCommunityIcons name="check" size={28} color="#000" />
                  </View>
                </ScaleBtn>
                <ScaleBtn onPress={cancelPiningLocationHandler}>
                  <View className="p-1 border rounded-lg">
                    <MaterialCommunityIcons name="cancel" size={28} color="#000" />
                  </View>
                </ScaleBtn>
              </View>
            )}
          </View>

          <View className="relative z-[1000] w-full h-12 px-0 mt-3 items-center flex-row">
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
                  if (piningLocation) cancelPiningLocationHandler();
                  setViewPinOnMap(true);
                  setPiningInput('origin');
                },
                onBlur: () => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setViewPinOnMap(false);
                },
              }}
              enablePoweredByContainer={false}
              onPress={(data, details) => {
                const tokio = async (
                  _data: GooglePlaceData,
                  _details: GooglePlaceDetail | null
                ) => {};
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
                  width: width * 0.9 - 48,
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

          <View className="relative z-[999] w-full h-12 px-0 mt-5 items-center flex-row">
            <DashedLine
              axis="vertical"
              style={{
                height: 30,
                left: 15,
                top: -29,
              }}
            />
            <MaterialCommunityIcons
              className="ml-[-1.5px]"
              name="map-marker-radius"
              size={32}
              color="#000"
            />
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
                  if (piningLocation) cancelPiningLocationHandler();
                  setViewPinOnMap(true);
                  setPiningInput('destination');
                },
                onBlur: () => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setViewPinOnMap(false);
                },
              }}
              enablePoweredByContainer={false}
              onPress={(data, details) => {
                const tokio = async (
                  _data: GooglePlaceData,
                  _details: GooglePlaceDetail | null
                ) => {};
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
                  width: width * 0.9 - 48,
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

          <View className="mx-1.5 mt-7 overflow-visible">
            <Text className="font-bold text-xl">Favoritos</Text>

            <ScrollView horizontal className="w-100 overflow-visible">
              <View>
                <ScaleBtn
                  className="mt-3 w-20 h-20 rounded-full border-2 border-[#C1C0C9] items-center justify-center"
                  onPress={() => {}}>
                  <FontAwesome6
                    name="suitcase"
                    size={32}
                    color={Colors[colorScheme ?? 'light'].icons}
                  />
                </ScaleBtn>
                <Text className="text-lg font-semibold text-center text-[#333]">Trabajo</Text>
                <Text className="text-sm text-center text-[#555]">Add</Text>
              </View>

              <View className="ml-5">
                <ScaleBtn
                  className="mt-3 w-20 h-20 rounded-full border-2 border-[#C1C0C9] items-center justify-center"
                  onPress={() => {}}>
                  <FontAwesome6
                    name="house"
                    size={32}
                    color={Colors[colorScheme ?? 'light'].icons}
                  />
                </ScaleBtn>
                <Text className="text-lg font-semibold text-center text-[#333]">Casa</Text>
                <Text className="text-sm text-center text-[#555]">Add</Text>
              </View>

              <View className="ml-5">
                <ScaleBtn
                  className="mt-3 w-20 h-20 rounded-full border-2 border-[#C1C0C9] items-center justify-center"
                  onPress={() => {}}>
                  <FontAwesome6
                    name="plus"
                    size={32}
                    color={Colors[colorScheme ?? 'light'].icons}
                  />
                </ScaleBtn>
                <Text className="text-lg font-semibold text-center text-[#333]">Add</Text>
              </View>
            </ScrollView>
          </View>

          <View className="mx-1.5 mt-5 overflow-visible">
            <Text className="font-bold text-xl">Recent</Text>

            <View className="flex-row items-center gap-2 mt-3">
              <View className="bg-[#C1C0C9] rounded-full items-center justify-center p-1 text-center">
                <MaterialCommunityIcons name="history" size={32} color="white" />
              </View>
              <View>
                <Text numberOfLines={1} className="font-lg font-medium">
                  23 y 12, Plaza de la Revolucion, La Habana
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mt-3">
              <View className="bg-[#C1C0C9] rounded-full items-center justify-center p-1 text-center">
                <MaterialCommunityIcons name="history" size={32} color="white" />
              </View>
              <View>
                <Text numberOfLines={1} className="font-lg font-medium">
                  Pedro Perez e/ Clavel y Mariano, Cerro, La...
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <>
          {!confirmedTaxi ? (
            <View className="w-full h-full self-center">
              <View className="h-10 flex-row justify-between items-center mx-[10%] mb-2">
                <Text className="font-bold text-xl">Como quieres ir?</Text>

                <ScaleBtn onPress={cancelRideHandler}>
                  <View className="gap-2 p-1 border rounded-lg">
                    <MaterialCommunityIcons name="close" size={28} color="#000" />
                  </View>
                </ScaleBtn>
              </View>

              <View className="">
                {taxisInfo.map(({ slug, Icon, name, pricePerKm, timePerKm }) => {
                  if (selectedTaxiType === slug) {
                    return (
                      <Pressable
                        onPress={() => setSelectedTaxiType(slug as TaxiType)}
                        key={name}
                        className="px-[10%] bg-[#FCCB6F] flex-row gap-7 items-center py-3">
                        <Icon />
                        <View className="flex-row items-center justify-between flex-1">
                          <View>
                            <Text className="text-white text-xl font-medium">{name}</Text>
                            <Text className="text-white ">
                              {Math.round(Math.random() * 100) / 100} Km
                            </Text>
                          </View>
                          <View>
                            <Text className="text-white text-lg font-medium text-right">
                              ${(pricePerKm * (routeInfo.distance.value / 1000)).toFixed(2)}
                            </Text>
                            <Text className="text-white">
                              {(timePerKm * (routeInfo.duration.value / 60)).toFixed(2)} min
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable
                      onPress={() => setSelectedTaxiType(slug as TaxiType)}
                      key={name}
                      className="px-[10%] flex-row gap-7 items-center py-3">
                      <Icon />
                      <View className="flex-row items-center justify-between flex-1">
                        <View>
                          <Text className="text-xl font-medium">{name}</Text>
                          <Text className="">{Math.round(Math.random() * 100) / 100} Km</Text>
                        </View>
                        <View>
                          <Text className="text-lg font-medium text-right">
                            ${(pricePerKm * (routeInfo.distance.value / 1000)).toFixed(2)}
                          </Text>
                          <Text className="">
                            {(timePerKm * (routeInfo.duration.value / 60)).toFixed(2)} min
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="w-[90%] h-full self-center">
              <View className="h-20 flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                  <Image
                    style={{ width: 50, height: 50 }}
                    source={require('../../../assets/images/taxi_test.png')}
                  />
                  <View className="justify-center">
                    <Text className="font-bold text-xl">{confirmedTaxi.name}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-[#FFCC00] text-lg">★ </Text>
                      <Text className="text-[#C8C7CC]">4.9</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <ScaleBtn>
                    <View className="bg-[#25D366] p-2 rounded-full">
                      <FontAwesome6 name="phone" size={25} color="white" />
                    </View>
                  </ScaleBtn>
                  <ScaleBtn>
                    <View className="bg-[#4252FF] p-2 rounded-full">
                      <AntDesign name="message1" size={25} color="white" />
                    </View>
                  </ScaleBtn>
                </View>
              </View>

              <View className="flex-row gap-7 items-center py-2">
                <ConfortSVG />
                <View className="flex-row items-center justify-between flex-1 mx-1">
                  <View className="gap-2">
                    <Text className="text-xl font-medium text-[#C8C7CC] text-center">Distance</Text>
                    <Text className="text-xl font-bold">aaa Km</Text>
                  </View>
                  <View className="gap-2">
                    <Text className="text-xl font-medium text-[#C8C7CC] text-center">Time</Text>
                    <Text className="text-xl font-bold">aaa Km</Text>
                  </View>
                  <View className="gap-2">
                    <Text className="text-lg font-medium text-[#C8C7CC] text-center">Price</Text>
                    <Text className="text-xl font-bold">aa min</Text>
                  </View>
                </View>
              </View>

              <View className="relative z-[1000] w-full h-12 px-0 mt-3 items-center flex-row py-1">
                <MaterialCommunityIcons name="map-marker-account" size={32} color="#000" />
                <Text className="font-medium text-[#242E42]">{piningInfo.origin.address}</Text>
              </View>
              <View className="relative z-[999] w-full h-12 px-0 mt-3 items-center flex-row">
                <DashedLine
                  axis="vertical"
                  style={{
                    height: 24,
                    left: 15,
                    top: -25,
                  }}
                />
                <MaterialCommunityIcons
                  className="ml-[-1.5px]"
                  name="map-marker-radius"
                  size={32}
                  color="#000"
                />
                <Text className="font-medium text-[#242E42]">{piningInfo.destination.address}</Text>
              </View>

              <ScaleBtn className="mt-4 w-full gap-3" onPress={() => cancelRideHandler()}>
                <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                  <Text className="text-white font-bold text-xl">Cancel</Text>
                </View>
              </ScaleBtn>
            </View>
          )}
        </>
      )}
    </BottomSheetView>
  );
};

const DashedLine = ({
  axis = 'horizontal',
  dashGap = 2,
  dashLength = 4,
  dashThickness = 2,
  dashColor = '#000',
  dashStyle,
  style,
}: {
  axis?: 'horizontal' | 'vertical';
  dashGap?: number;
  dashLength?: number;
  dashThickness?: number;
  dashColor?: string;
  dashStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}) => {
  const [lineLength, setLineLength] = useState(0);
  const isRow = axis === 'horizontal';
  const numOfDashes = Math.ceil(lineLength / (dashGap + dashLength));

  const dashStyles = useMemo(
    () => ({
      width: isRow ? dashLength : dashThickness,
      height: isRow ? dashThickness : dashLength,
      marginRight: isRow ? dashGap : 0,
      marginBottom: isRow ? 0 : dashGap,
      backgroundColor: dashColor,
    }),
    [dashColor, dashGap, dashLength, dashThickness, isRow]
  );

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLineLength(isRow ? width : height);
      }}
      style={[style, isRow ? styles.row : styles.column]}>
      {[...Array(numOfDashes)].map((_, i) => {
        // eslint-disable-next-line react/no-array-index-key
        return <View key={i} style={[dashStyles, dashStyle]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});
