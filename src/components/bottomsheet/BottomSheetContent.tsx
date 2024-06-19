import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ExpoLocation from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  useColorScheme,
  useWindowDimensions,
  LayoutAnimation,
  Keyboard,
  Pressable,
  ScrollView,
  ColorValue,
  Animated,
  Easing
} from 'react-native';
import type { Address, LatLng } from 'react-native-maps';
import { useAtom } from 'jotai/react';

import { ConfortSVG } from '../svgs';
import { ScaleBtn } from '~/components/common';
import Colors from '~/constants/Colors';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import type { TaxiType } from '~/constants/TaxiTypes';
import { polylineDecode } from '~/utils/directions';
import { taxiTypesInfo } from '~/constants/TaxiTypes';
import { ClientSteps, DBRide, RideInfo } from '~/constants/Configs';
import { useUser } from '~/context/UserContext';
import DashedLine from './DashedLine';
import { useWSActions, useWSState } from '~/context/WSContext';
import TestRidesData from '~/constants/TestRidesData.json'
import { userMarkersAtom } from '~/context/UserContext';
import { selectableMarkerIcons, UserMarkerIconType } from '../markers/AddUserMarker';

type AddMarker = {
  name: string;
  icon?: string;
} | {
  name?: string;
  icon: string;
}

interface BottomSheetContentProps {
  currentStep: ClientSteps;
  setCurrentStep: React.Dispatch<ClientSteps>;
  setRideInfo: React.Dispatch<RideInfo | null>;
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
  startPiningLocation: () => void;
  cancelPiningLocation: () => void;
  confirmPiningLocation: () => Promise<{ latitude: number; longitude: number; address?: Address }>;
  piningLocation: boolean;
  setFindingRide: React.Dispatch<boolean>;
  selectedTaxiType: string | null;
  setSelectedTaxiType: React.Dispatch<TaxiType | null>;
}

export const BottomSheetContent = ({
  currentStep,
  setCurrentStep,
  setRideInfo,
  setActiveRoute,
  startPiningLocation,
  cancelPiningLocation,
  confirmPiningLocation,
  piningLocation,
  selectedTaxiType,
  setSelectedTaxiType,
  setFindingRide,
}: BottomSheetContentProps) => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const { profile } = useUser()
  const { collapse, snapToIndex, expand } = useBottomSheet();
  const { confirmedTaxi } = useWSState()
  const { cancelTaxi } = useWSActions()
  const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)

  const [viewPinOnMap, setViewPinOnMap] = useState(false);
  const [piningInput, setPiningInput] = useState<'origin' | 'destination' | null>(null);
  const [piningMarker, setPiningMarker] = useState<AddMarker | null>(null);
  const [pinedInfo, setPinedInfo] = useState<{
    origin: { latitude: number, longitude: number, address: string } | null,
    destination: { latitude: number, longitude: number, address: string } | null,
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: { value: number; text: string };
    duration: { value: number; text: string };
  } | null>(null);

  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    if (confirmedTaxi) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentStep(ClientSteps.PICKUP)
      setFindingRide(false);
    }
  }, [confirmedTaxi]);

  useEffect(() => {
    fetchOrigin();
  }, []);

  useEffect(() => {
    const tokio = async () => {
      if (pinedInfo?.destination && pinedInfo?.origin) {
        const resp = await fetch(
          `http://192.168.1.103:6942/route?from=${pinedInfo.origin.latitude},${pinedInfo.origin.longitude}&to=${pinedInfo.destination.latitude},${pinedInfo.destination.longitude}`
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

        setRideInfo({
          status: "pending",
          name: "Undefiend",
          client: profile!,
          origin: pinedInfo.origin,
          destination: pinedInfo.destination,
          distance: respJson[0].legs[0].distance,
          duration: respJson[0].legs[0].duration,
          price: 3000,
          overview_polyline: respJson[0].overview_polyline,
          // navigationInfo: respJson[0].legs[0],
        })
        console.log('Ride Info:', {
          client: profile!,
          origin: pinedInfo.origin,
          destination: pinedInfo.destination,
          distance: respJson[0].legs[0].distance,
          duration: respJson[0].legs[0].duration,
          price: 3000,
          overview_polyline: respJson[0].overview_polyline,
          // navigationInfo: respJson[0].legs[0],
        })
        setCurrentStep(ClientSteps.TAXI)
      }
    }
    tokio()
  }, [pinedInfo])

  const getCurrentPositionAsync = useCallback(async () => {
    const currentPosition = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Highest,
    });
    const resp = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${currentPosition.coords.latitude},${currentPosition.coords.longitude}&types=street&limit=5&apiKey=mRASkFtnRqYimoHBzud5-kSsj0y_FvqR-1jwJHrfUvQ&showMapReferences=pointAddress&show=streetInfo`
    );
    const respJson = await resp.json();

    if (respJson.items.length > 0) {
      const streetInfo = `${respJson.items[0].address.street.replace('Calle ', '')} e/ ${respJson.items[1].address.street.replace('Calle ', '')} y ${respJson.items[2].address.street.replace('Calle ', '')}, ${respJson.items[2].address.district}, Habana, Cuba`;
      return { address: streetInfo, latitude: currentPosition.coords.latitude, longitude: currentPosition.coords.longitude }
    } else {
      console.log('No street address found in the response.');
      return null
    }
  }, []);

  const fetchOrigin = useCallback(async () => {
    const currentPosition = await getCurrentPositionAsync();

    if (currentPosition) {
      originInputViewRef.current?.setAddressText(currentPosition.address);
      setPinedInfo({
        origin: currentPosition,
        destination: pinedInfo?.destination ?? null,
      });
    } else {
      console.log('No street address found in the response.');
    }
  }, [getCurrentPositionAsync, originInputViewRef, pinedInfo]);

  const startPiningLocationHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    startPiningLocation();
    Keyboard.dismiss();
    collapse();
    originInputViewRef.current?.blur();
    destinationInputViewRef.current?.blur();
  }, [startPiningLocation, originInputViewRef, destinationInputViewRef]);
  const cancelPiningLocationHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    cancelPiningLocation();
    setPiningInput(null)
    setPiningMarker(null)
  }, [cancelPiningLocation]);
  const confirmPiningLocationHandler = useCallback(async () => {
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
          setPinedInfo({
            origin: { ...location, address: streetInfo },
            destination: pinedInfo?.destination ?? null,
          });
        } else if (piningInput === 'destination') {
          destinationInputViewRef.current?.setAddressText(streetInfo);
          let originDestination = pinedInfo?.origin;
          if (!originDestination) {
            originDestination = await getCurrentPositionAsync()
          }
          setPinedInfo({
            origin: originDestination ?? null,
            destination: { ...location, address: streetInfo },
          });
        } else {
          if (piningMarker?.icon === "house") {

          } else if (piningMarker?.icon === "work") {

          } else {
            /* setUserMarkers([...userMarkers, 
              { 
                id: userMarkers.length.toString(), 
                name: piningMarker ?? respJson.items[0].address.street, 
                coords: location,
                icon: {
                  name: piningMarker,
                  type: "FontAwesome6",
                } 
            }]) */
          }


        }
      } else {
        throw new Error('No street address found in the response.');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    } finally {
      setPiningInput(null)
      setPiningMarker(null)
    }
  }, [confirmPiningLocation, piningInput, pinedInfo, originInputViewRef, destinationInputViewRef, piningMarker]);
  const cancelRideInnerHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // setPinedInfo({
    //   origin: pinedInfo?.origin ?? null,
    //   destination: null,
    // })
    // setActiveRoute(null);
    setCurrentStep(ClientSteps.SEARCH);
    cancelTaxi()
    // setRouteInfo(null);
    // setSelectedTaxiType(null)
    // collapse();
  }, [cancelTaxi]);;

  const goBackToSearch = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentStep(ClientSteps.SEARCH);
  }, []);;
  const goToPinnedRouteTaxi = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentStep(ClientSteps.TAXI);
  }, []);

  const addDefaultMarkerHandler = useCallback((addingMarker: AddMarker) => {
    startPiningLocationHandler()

    setPiningMarker(addingMarker)
  }, [startPiningLocationHandler]);

  return (
    <BottomSheetView className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">

      {!piningLocation && !piningInput ?
        <View className="w-[95%] h-full self-center overflow-visible">

          {currentStep >= ClientSteps.PICKUP ?
            <View className="px-[5%]- h-full self-center">
              <View className="h-20 flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                  <Image
                    style={{ width: 50, height: 50 }}
                    source={require('../../../assets/images/taxi_test.png')}
                  />
                  <View className="justify-center">
                    <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{confirmedTaxi?.name ?? "Anonymous"}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-lg">★ </Text>
                      <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">4.9</Text>
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
                <ConfortSVG color={Colors[colorScheme ?? "light"].border} />
                <View className="flex-row items-center justify-between flex-1 mx-1">
                  <View className="gap-2">
                    <Text className="text-xl font-medium text-[#1b1b1b] dark:text-[#C1C0C9] text-center">Distance</Text>
                    <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-xl font-bold">{routeInfo?.distance.text}</Text>
                  </View>
                  <View className="gap-2">
                    <Text className="text-xl font-medium text-[#1b1b1b] dark:text-[#C1C0C9] text-center">Time</Text>
                    <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-xl font-bold">{routeInfo?.duration.text}</Text>
                  </View>
                  <View className="gap-2">
                    <Text className="text-lg font-medium text-[#1b1b1b] dark:text-[#C1C0C9] text-center">Price</Text>
                    <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-xl font-bold">3000 CUP</Text>
                  </View>
                </View>
              </View>

              <View className="relative z-[1000] w-full pr-[2.5%] items-center- flex-row py-1">
                <MaterialCommunityIcons className='mt-1' name="map-marker-account" size={32} color={Colors[colorScheme ?? "light"].border} />
                <Text className="ml-2 font-bold text-lg text-[#1b1b1b] dark:text-[#C1C0C9] ">{pinedInfo?.origin?.address}</Text>
              </View>
              <View className="relative z-[999] w-full pr-[2.5%] mb-3 items-end flex-row">
                <DashedLine
                  axis="vertical"
                  style={{
                    height: 35,
                    left: 15,
                    top: -32,
                  }}
                  dashColor={Colors[colorScheme ?? "light"].border}
                />
                <MaterialCommunityIcons
                  className="ml-[-1.5px] mb-1"
                  name="map-marker-radius"
                  size={32}
                  color={Colors[colorScheme ?? "light"].border}
                />
                <Text className="ml-2 font-bold text-lg text-[#1b1b1b] dark:text-[#C1C0C9]">{pinedInfo?.destination?.address}</Text>
              </View>

              <ScaleBtn className="mt-4 w-full gap-3" onPress={() => cancelRideInnerHandler()}>
                <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                  <Text className="text-white font-bold text-xl">Cancel</Text>
                </View>
              </ScaleBtn>
            </View>
            :
            <>
              <View className="h-10 flex-row justify-between items-center mx-1.5">
                <Text className="font-bold text-xl text-[#1b1b1b] dark:text-[#C1C0C9]">A donde quieres ir?</Text>

                {viewPinOnMap && !piningLocation && (
                  <ScaleBtn onPress={startPiningLocationHandler}>
                    <View className="flex-row items-center gap-2 p-1 px-2 border rounded-lg border-[#C1C0C9]">
                      <Text className="h-full text-lg font-medium text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Fijar en el Mapa</Text>
                      <MaterialCommunityIcons name="map-search-outline" size={22} color={Colors[colorScheme ?? "light"].border} />
                    </View>
                  </ScaleBtn>
                )}

                {piningLocation && (
                  <View className="flex-row gap-4">
                    <ScaleBtn onPress={confirmPiningLocationHandler}>
                      <View className="p-1 border border-[#25D366] bg-[#25D366] rounded-lg">
                        <MaterialCommunityIcons name="check" size={28} color={"white"} />
                      </View>
                    </ScaleBtn>
                    <ScaleBtn onPress={cancelPiningLocationHandler}>
                      <View className="p-1 border border-[#f82f00] bg-[#f82f00] rounded-lg">
                        <MaterialCommunityIcons name="cancel" size={28} color={"white"} />
                      </View>
                    </ScaleBtn>
                  </View>
                )}

                {!viewPinOnMap && !piningLocation && <>
                  {
                    currentStep === ClientSteps.TAXI &&
                    <ScaleBtn onPress={goBackToSearch}>
                      <View className="flex-row items-center justify-center p-1 border border-[#C1C0C9] rounded-lg bg-[#FCCB6F]">
                        <MaterialCommunityIcons name={"chevron-left"} size={24} color={Colors[colorScheme ?? "light"].border} />
                        <MaterialCommunityIcons name="star" size={24} color={Colors[colorScheme ?? "light"].border} />
                      </View>
                    </ScaleBtn>
                  }

                  {
                    currentStep === ClientSteps.SEARCH && pinedInfo?.origin && pinedInfo.destination &&
                    <ScaleBtn onPress={goToPinnedRouteTaxi}>
                      <View className="flex-row items-center justify-center p-1 border border-[#C1C0C9] rounded-lg bg-[#FCCB6F]">
                        <MaterialCommunityIcons name="car-multiple" size={24} color={Colors[colorScheme ?? "light"].border} />
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[colorScheme ?? "light"].border} />
                      </View>
                    </ScaleBtn>
                  }
                </>}

              </View>

              <View className="relative z-[1000] w-full h-12 px-0 mt-3 items-start flex-row">
                <MaterialCommunityIcons className='mt-1' name="map-marker-account" size={32}
                  color={Colors[colorScheme ?? "light"].border} />
                <GooglePlacesAutocomplete
                  ref={originInputViewRef}
                  /* predefinedPlaces={userMarkers.map((marker) => ({
                    description: marker.name,
                    geometry: {
                      location: {
                        lat: marker.coords.latitude,
                        lng: marker.coords.longitude,
                      },
                    },
                  }))} */
                  placeholder="Lugar de Origen"
                  textInputProps={{
                    placeholderTextColor: colorScheme === 'light' ? 'black' : '#6C6C6C',
                    onFocus: () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      if (piningLocation) cancelPiningLocationHandler();
                      setViewPinOnMap(true);
                      setPiningInput('origin');
                    },
                    onBlur: () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setViewPinOnMap(false);
                      setPiningInput(null);
                    },
                  }}
                  enablePoweredByContainer={false}
                  onPress={(data, details) => {
                    const tokio = async (
                      _data: GooglePlaceData,
                      _details: GooglePlaceDetail | null
                    ) => { };
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
                      width: width * 0.95 - 48,
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

              <View className="relative z-[999] w-full h-12 px-0 mt-5 items-end flex-row">
                <DashedLine
                  axis="vertical"
                  style={{
                    height: 30,
                    left: 15,
                    top: -38,
                    backgroundColor: Colors[colorScheme ?? "light"].border,
                  }}
                />
                <MaterialCommunityIcons
                  className="mb-1 ml-[-1.5px]"
                  name="map-marker-radius"
                  size={32}
                  color={Colors[colorScheme ?? "light"].border}
                />
                <GooglePlacesAutocomplete
                  ref={destinationInputViewRef}
                  /* predefinedPlaces={userMarkers.map((marker) => ({
                    description: marker.name,
                    geometry: {
                      location: {
                        lat: marker.coords.latitude,
                        lng: marker.coords.longitude,
                      },
                    },
                  }))} */
                  placeholder="Lugar Destino"
                  textInputProps={{
                    placeholderTextColor: colorScheme === 'light' ? 'black' : '#6C6C6C',
                    onFocus: () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      if (piningLocation) cancelPiningLocationHandler();
                      setViewPinOnMap(true);
                      setPiningInput('destination');
                    },
                    onBlur: () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setViewPinOnMap(false);
                      setPiningInput(null);
                    },
                  }}
                  enablePoweredByContainer={false}
                  onPress={(data, details) => {
                    const tokio = async (
                      _data: GooglePlaceData,
                      _details: GooglePlaceDetail | null
                    ) => { };
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
                      width: width * 0.95 - 48,
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
            </>
          }

          {currentStep === ClientSteps.SEARCH &&
            <>
              <View className="mx-1.5 mt-7 overflow-visible">
                <View className='flex-row justify-between'>
                  <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">Favoritos</Text>
                  {/* <Text className="text-[#21288a] dark:text-[#766acd] font-bold text-xl">mas</Text> */}
                </View>

                <View className='py-3 pl-[5%]- pr-[3%]- mt-3 rounded-lg bg-[#E9E9E9] dark:bg-[#333333] overflow-hidden shadow'>
                  <ScrollView keyboardShouldPersistTaps="always" horizontal className="w-100 overflow-visible">
                    {
                      [{ name: "Trabajo", icon: "suitcase" }, { name: "Casa", icon: "house" }].map((defaultMarker) => {
                        const userMarker = userMarkers.find(item => item.name === defaultMarker.name)

                        if (userMarkers.length === 0 || !userMarker) {
                          return (
                            <DefaultMarkerRowItem key={defaultMarker.icon} addHandler={addDefaultMarkerHandler} defaultMarker={defaultMarker} />
                          )
                        } else {
                          return (
                            <UserMarkerRowItem key={userMarker.id} userMarker={userMarker} />
                          )
                        }
                      })
                    }
                  </ScrollView>
                </View>

              </View>

              <View className="mx-1.5 mt-5 overflow-visible">
                <View className='flex-row justify-between'>
                  <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">Recent</Text>
                  {/* <Text className="text-[#21288a] dark:text-[#766acd] font-bold text-xl">mas</Text> */}
                </View>


                <View className='pl-[5%]- pr-[3%]- h-[18.5rem] mt-3 rounded-lg bg-[#E9E9E9] dark:bg-[#333333] overflow-hidden shadow'>
                  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" className="w-100">
                    {
                      TestRidesData.map((item, index) => (
                        <View className='bg-transparent' key={item.id}>
                          <RidesHistoryItem
                            // @ts-ignore
                            ride={item}
                          />
                          {index !== TestRidesData.length - 1 ? <View style={{ height: 1, backgroundColor: Colors[colorScheme ?? 'light'].border_light, width: "90%", alignSelf: "center", marginTop: 8, marginBottom: 5 }} /> : <View style={{ height: 1, width: "90%", alignSelf: "center", marginTop: 8, marginBottom: 5 }} />}
                        </View>
                      ))
                    }
                  </ScrollView>
                </View>

              </View>
            </>
          }

          {
            currentStep === ClientSteps.TAXI && <View className="w-full h-full self-center mt-5">
              <View className="">
                {taxiTypesInfo.map(({ slug, Icon, name, pricePerKm, timePerKm }) => {
                  if (selectedTaxiType === slug) {
                    return (
                      <Pressable
                        onPress={() => setSelectedTaxiType(slug as TaxiType)}
                        key={name}
                        className="mx-[-10%] px-[10%] bg-[#FCCB6F] flex-row gap-7 items-center py-3">
                        <Icon color={"black"} />
                        <View className="flex-row items-center justify-between flex-1 px-2">
                          <View>
                            <Text className="text-[#1b1b1b] text-xl font-medium">{name}</Text>
                            <Text className="text-[#1b1b1b] ">
                              {Math.round(Math.random() * 100) / 100} Km
                            </Text>
                          </View>
                          <View>
                            <Text className="text-[#1b1b1b] text-lg font-medium text-right">
                              ${(pricePerKm * (routeInfo?.distance.value ?? 0 / 1000)).toFixed(2)}
                            </Text>
                            <Text className="text-[#1b1b1b]">
                              {(timePerKm * (routeInfo?.duration.value ?? 0 / 60)).toFixed(2)} min
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
                      className="mx-[-10%] px-[10%] flex-row gap-7 items-center py-3">
                      <Icon color={Colors[colorScheme ?? "light"].border} />
                      <View className="flex-row items-center justify-between flex-1 px-2">
                        <View>
                          <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-xl font-medium">{name}</Text>
                          <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] ">{Math.round(Math.random() * 100) / 100} Km</Text>
                        </View>
                        <View>
                          <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-lg font-medium text-right">
                            ${(pricePerKm * (routeInfo?.distance.value ?? 0 / 1000)).toFixed(2)}
                          </Text>
                          <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] ">
                            {(timePerKm * (routeInfo?.duration.value ?? 0 / 60)).toFixed(2)} min
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          }

        </View>
        :
        <View className='w-[95%] h-full self-center overflow-visible'>
          {selectableMarkerIcons.map((markerIcon) => {
            return (
              <Pressable
                key={markerIcon.name}
                onPress={() => {
                }}
              >
                <MaterialCommunityIcons
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  name={markerIcon.name}
                  size={45}
                  color="black"
                />
              </Pressable>
            );
          })}
        </View>
      }
    </BottomSheetView>
  );
};

const RidesHistoryItem = ({ ride }: { ride: DBRide }) => {
  const getRideHistoryIcon = useMemo(() => {
    switch (ride.status) {
      case "calceled": return { icon: "map-marker-remove-variant", bgColor: "#242E42", color: "white" }
      case "completed": return { icon: "map-marker-check", bgColor: "#25D366", color: "white" }
      case "error": return { icon: "map-marker-alert", bgColor: "#f82f00", color: "white" }
      case "ongoing": return { icon: "map-marker-account", bgColor: "#FCCB6F", color: "white" }
      case "pending": return { icon: "map-marker-up", bgColor: "#FCCB6F", color: "white" }

      default:
        return null
    }
  }, [ride])

  return (
    <View className="flex-row items-center mt-3">
      <ScrollView contentContainerClassName='items-center' showsHorizontalScrollIndicator={false} horizontal>
        <View style={{ backgroundColor: getRideHistoryIcon?.bgColor, width: 40, height: 40 }} className="rounded-full items-center justify-center p-1 ml-3">
          <MaterialCommunityIcons
            // @ts-ignore
            name={getRideHistoryIcon?.icon}
            size={32} color={getRideHistoryIcon?.color} />
        </View>
        <View className='justify-between ml-2 mr-3'>
          <Text numberOfLines={1} className="text-[#1b1b1b] dark:text-[#d6d6d6] text-xl font-bold">
            {ride.destination_address.split(",")[0]}
          </Text>
          <Text numberOfLines={1} className="text-[#1b1b1b] dark:text-[#d6d6d6] text-md font-medium">
            {ride.destination_address}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const UserMarkerRowItem = ({ userMarker, color, bgColor }: { userMarker: UserMarkerIconType, color?: string, bgColor?: string }) => {

  const colorScheme = useColorScheme();

  // 1c1818
  return (
    <View className='ml-5 items-center justify-center' key={userMarker.id}>
      <ScaleBtn
        style={{ backgroundColor: bgColor ?? Colors[colorScheme ?? 'light'].border_light }}
        className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8] dark:bg-[#444444]- items-center justify-center"
        onPress={() => { }}>
        <FontAwesome6
          name={userMarker.icon.name}
          size={24}
          color={color ?? Colors[colorScheme ?? 'light'].icons}
        />
      </ScaleBtn>
      <View className='h-12 w-full'>
        <Text className="text-lg font-semibold text-center text-[#1b1b1b] dark:text-[#C1C0C9]">{userMarker.name}</Text>
      </View>
    </View>
  )
}

const DefaultMarkerRowItem = ({ defaultMarker, color, bgColor, addHandler }: { defaultMarker: { name: string, icon: string }, addHandler: (addingMarker: AddMarker) => void, color?: string, bgColor?: string }) => {

  const colorScheme = useColorScheme();
  const shakeAnimatedValue = React.useRef(new Animated.Value(0)).current;

  const startShake = () => {
    shakeAnimatedValue.setValue(0);
    Animated.timing(shakeAnimatedValue,
      {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start()
  }
  // 1c1818
  return (
    <View className='ml-5 items-center justify-center' key={defaultMarker.icon}>
      <ScaleBtn
        style={{ backgroundColor: bgColor ?? Colors[colorScheme ?? 'light'].border_light }}
        className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8]- dark:bg-[#444444]- items-center justify-center"
        onPress={() => {
          startShake()
        }}>
        <FontAwesome6
          name={defaultMarker.icon}
          size={24}
          color={color ?? Colors[colorScheme ?? 'light'].icons}
        />
      </ScaleBtn>
      <View className='h-12 w-full'>
        <Text className="text-lg font-semibold text-center text-[#1b1b1b] dark:text-[#C1C0C9]">{defaultMarker.name}</Text>
        <Animated.View className={""} style={{
          transform: [{
            translateX: shakeAnimatedValue.interpolate({
              inputRange: [0, 0.25, 0.50, 0.75, 1],
              outputRange: [0, 5, -5, 5, 0]
            })
          }]
        }}>
          <ScaleBtn
            className=""
            onPress={() => addHandler(defaultMarker)}>
            <Text className="text-sm text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Add</Text>
          </ScaleBtn>
        </Animated.View>
      </View>
    </View>
  )
}