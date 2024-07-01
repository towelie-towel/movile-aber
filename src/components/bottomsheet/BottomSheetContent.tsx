import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ExpoLocation from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState, ComponentRef } from 'react';
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
  Easing,
  Alert,
  ActivityIndicator
} from 'react-native';
import type { Address, LatLng } from 'react-native-maps';
import { measure, runOnJS, useAnimatedRef, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAtom } from 'jotai/react';
import * as ImagePicker from 'expo-image-picker';

import FloatingLabelInput from '~/lib/floating-label-input';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { ScaleBtn } from '~/components/common';
import Colors from '~/constants/Colors';
import { TaxiTypesInfo, type TaxiType } from '~/constants/TaxiTypes';
import { ClientSteps, DBRide, RideInfo } from '~/constants/RideFlow';
import { generateUniqueId } from '~/utils';
import { getCoordinateAddress, getDirections, polylineDecode } from '~/utils/directions';
import { useUser } from '~/context/UserContext';
import DashedLine from './DashedLine';
import { useWSActions, useWSState } from '~/context/WSContext';
import { userMarkersAtom } from '~/context/UserContext';
import { selectableMarkerIcons, UserMarkerIconType } from '~/components/markers/AddUserMarker';
import { BikeSVG, AutoSVG, ConfortSVG, ConfortPlusSVG, VipSVG } from '~/components/svgs/index';
import TestRidesData from '~/constants/TestRidesData.json'
import TestTaxiTypesInfo from '~/constants/TestTaxiTypesInfo.json'
// import ColorsPalettes from '~/constants/ColorsPalettes.json'

const DEFAULT_MARKERS = [{ name: "Trabajo", icon: "folder-marker" }, { name: "Casa", icon: "home-map-marker" }]

export type AddMarker = {
  name?: string;
  icon?: string;
  color?: string;
}

/* 
  endPiningLocation={endPiningLocation}
  getMiddlePoint={getMiddlePoint}
*/

interface BottomSheetContentProps {
  sheetCurrentSnap: number;
  currentStep: ClientSteps;
  setCurrentStep: React.Dispatch<ClientSteps>;
  setRideInfo: React.Dispatch<RideInfo | null>;
  setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
  startPiningLocation: () => void;
  endPiningLocation: () => void;
  getMiddlePoint: () => Promise<{ latitude: number; longitude: number }>;
  piningLocation: boolean;
  piningMarker: AddMarker | null;
  setPiningMarker: React.Dispatch<AddMarker | null>;
  setFindingRide: React.Dispatch<boolean>;
  selectedTaxiType: string | null;
  setSelectedTaxiType: React.Dispatch<TaxiType | null>;
}

export const BottomSheetContent = ({
  sheetCurrentSnap,
  currentStep,
  piningMarker,
  setPiningMarker,
  setCurrentStep,
  setRideInfo,
  setFindingRide,
  setActiveRoute,
  piningLocation,
  startPiningLocation,
  endPiningLocation,
  getMiddlePoint,
  selectedTaxiType,
  setSelectedTaxiType,
}: BottomSheetContentProps) => {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const { profile } = useUser()
  const { snapToPosition, snapToIndex, collapse, expand } = useBottomSheet();
  const { confirmedTaxi } = useWSState()
  const { cancelTaxi } = useWSActions()
  const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)

  const [viewPinOnMap, setViewPinOnMap] = useState(false);
  const [editingMarkers, setEditingMarkers] = useState(false);
  const [piningInput, setPiningInput] = useState<'origin' | 'destination' | null>(null);
  const [pinedInfo, setPinedInfo] = useState<{
    origin: { latitude: number, longitude: number, address: string } | null,
    destination: { latitude: number, longitude: number, address: string } | null,
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: { value: number; text: string };
    duration: { value: number; text: string };
  } | null>(null);
  const [markerImage, setMarkerImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [markerName, setMarkerName] = useState<string | null>(null);

  const [routeLoading, setRouteLoading] = useState(false);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  const markerNameInputViewRef = useRef<ComponentRef<typeof FloatingLabelInput>>(null);
  const originInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationInputViewRef = useRef<GooglePlacesAutocompleteRef>(null);
  const markerShakeAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const originShakeAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const destinationShakeAnimatedValue = React.useRef(new Animated.Value(0)).current;

  const emptyMarkerShake = useCallback(() => {
    markerShakeAnimatedValue.setValue(0);
    Animated.timing(markerShakeAnimatedValue, {
      toValue: 1,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true
    }).start()
  }, [markerShakeAnimatedValue])
  const inputsShake = useCallback(() => {
    if (piningInput === "destination") {
      destinationShakeAnimatedValue.setValue(0);
      Animated.timing(destinationShakeAnimatedValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true
      }).start()
    } else if (piningInput === "origin") {
      originShakeAnimatedValue.setValue(0);
      Animated.timing(originShakeAnimatedValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true
      }).start()
    }
  }, [piningInput, originShakeAnimatedValue, destinationShakeAnimatedValue])

  useEffect(() => {
    if (sheetCurrentSnap === 2) {
      markerNameInputViewRef.current?.focus()
    }
    if (editingMarkers) endEditingMarkers()
  }, [sheetCurrentSnap]);
  useEffect(() => {
    if (confirmedTaxi) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentStep(ClientSteps.PICKUP)
      setFindingRide(false);
    }
  }, [confirmedTaxi]);
  useEffect(() => {
    if (currentStep === ClientSteps.SEARCH) {
      fetchOrigin();
      if (pinedInfo?.destination) {
        destinationInputViewRef.current?.setAddressText(pinedInfo.destination.address);
      }
    }
    setOriginLoading(false)
    setDestinationLoading(false)
    setRouteLoading(false)
  }, [currentStep]);
  useEffect(() => {
    handleActiveRouteTokio()
  }, [pinedInfo])

  const handleActiveRouteTokio = useCallback(async () => {
    if (pinedInfo?.destination && pinedInfo?.origin) {
      try {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRouteLoading(true)
        const { overview_polyline, decodedCoords, distance, duration } = await getDirections(`${pinedInfo.origin.latitude},${pinedInfo.origin.longitude}`, `${pinedInfo.destination.latitude},${pinedInfo.destination.longitude}`)
        // snapToIndex(1);
        setActiveRoute({ coords: decodedCoords });
        setRouteInfo({ distance: distance, duration: duration });
        setRideInfo({
          status: "pending",
          name: "Undefiend",
          client: profile!,
          origin: pinedInfo.origin,
          destination: pinedInfo.destination,
          distance: distance,
          duration: duration,
          price: 3000,
          overview_polyline: overview_polyline,
          // navigationInfo: respJson[0].legs[0],
        })
        // setCurrentStep(ClientSteps.TAXI)
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRouteLoading(false)
      }
    }
  }, [pinedInfo, profile])

  const pickMarkerImage = useCallback(async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) setMarkerImage(result);
  }, []);

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
    try {
      setOriginLoading(true)
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    } finally {
      setOriginLoading(false)
    }
  }, [getCurrentPositionAsync, originInputViewRef, pinedInfo]);

  const startPiningLocationHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // collapse();
    startPiningLocation();
    setCurrentStep(ClientSteps.PINNING);
    setViewPinOnMap(false);
    // setPiningInput(null);
    Keyboard.dismiss();
    // originInputViewRef.current?.blur();
    // destinationInputViewRef.current?.blur();
  }, [startPiningLocation, originInputViewRef, destinationInputViewRef]);
  const cancelPiningLocationHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    endPiningLocation();
    setSelectedTaxiType(null)
    setPiningInput(null)
    setPiningMarker(null)
    setMarkerName(null)
    setCurrentStep(ClientSteps.SEARCH);
  }, [endPiningLocation]);
  const confirmPiningLocationHandler = useCallback(async () => {
    if (piningInput === "origin") {
      setOriginLoading(true)
    } else {
      setDestinationLoading(true)
    }
    setCurrentStep(ClientSteps.PINNING - 1)
    try {
      const location = await getMiddlePoint();
      const streetInfo = await getCoordinateAddress(location.latitude, location.longitude);

      if (streetInfo) {
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
            originDestination && originInputViewRef.current?.setAddressText(originDestination.address);
          }
          setPinedInfo({
            origin: originDestination ?? null,
            destination: { ...location, address: streetInfo },
          });
        } else {
          if (piningMarker?.icon === "house") {

          } else if (piningMarker?.icon === "work") {

          } else {

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
      if (piningInput === "origin") {
        setOriginLoading(false)
      } else {
        setDestinationLoading(false)
      }
      if (piningInput !== 'origin' || !pinedInfo?.destination) {
        setCurrentStep(ClientSteps.PINNING + 1)
      } else {
        setCurrentStep(ClientSteps.PINNING - 1)
      }
      endPiningLocation()
      setPiningInput(null)
      setPiningMarker(null)
    }
  }, [getMiddlePoint, endPiningLocation, piningInput, pinedInfo, piningMarker, originInputViewRef, destinationInputViewRef]);
  const cancelRideInnerHandler = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // setPinedInfo({
    //   origin: pinedInfo?.origin ?? null,
    //   destination: null,
    // })
    // setActiveRoute(null);
    setPiningInput(null)
    setCurrentStep(ClientSteps.SEARCH);
    cancelTaxi()
    // setRouteInfo(null);
    // setSelectedTaxiType(null)
    // collapse();
  }, [cancelTaxi]);

  const goBackToSearch = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // expand()
    // setSelectedTaxiType(null)
    setPiningInput(null)
    setPiningMarker(null)
    setMarkerName(null)
    endPiningLocation()
    setCurrentStep(ClientSteps.SEARCH);
    /* if (pinedInfo?.origin) {
      originInputViewRef.current?.setAddressText(pinedInfo.origin.address);
    }
    if (pinedInfo?.destination) {
      destinationInputViewRef.current?.setAddressText(pinedInfo.destination.address);
    } */
    // fetchOrigin()
  }, [/* fetchOrigin, originInputViewRef, destinationInputViewRef, pinedInfo */]);;
  const goToPinnedRouteTaxi = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // snapToIndex(1)
    setCurrentStep(ClientSteps.TAXI);
  }, []);

  const startEditingMarkers = useCallback(() => {
    if (piningInput) {
      inputsShake()
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEditingMarkers(true)
    }
  }, [inputsShake])
  const endEditingMarkers = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingMarkers(false)
  }, [])

  const startAddingMarkerHandler = useCallback((addingMarker?: AddMarker) => {
    // snapToIndex(1)
    if (piningInput) {
      inputsShake()
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPiningMarker(addingMarker ?? null);
      setCurrentStep(ClientSteps.PINNING);
    }
  }, [piningInput, inputsShake]);
  const selectMarkerHandler = useCallback((selectedMarker?: UserMarkerIconType) => {
    // snapToIndex(1)
    if (piningInput === "origin") {
      selectedMarker?.coords.address && originInputViewRef.current?.setAddressText(selectedMarker.coords.address);
      setPinedInfo({
        origin: selectedMarker?.coords ?? null,
        destination: pinedInfo?.destination ?? null,
      });
    } else {
      selectedMarker?.coords.address && destinationInputViewRef.current?.setAddressText(selectedMarker.coords.address);
      setPinedInfo({
        origin: pinedInfo?.origin ?? null,
        destination: selectedMarker?.coords ?? null,
      });
    }
  }, [piningInput, pinedInfo, destinationInputViewRef, originInputViewRef]);
  const addMarkerHandler = useCallback(async () => {
    if (piningMarker) {
      const iconDefaultMarker = selectableMarkerIcons.find(marker => marker.icon === piningMarker.icon)
      const existentMarker = userMarkers.find(marker => (/* (marker.icon.name === piningMarker.icon) &&  */(marker.name === piningMarker.name || !piningMarker.name)));
      if (existentMarker) {
        Alert.alert("Marcador Repetido", "Ya tienes un markador con el ícono y nombre seleccionado")
        return;
      }
      const location = await getMiddlePoint();
      const streetInfo = await getCoordinateAddress(location.latitude, location.longitude);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      streetInfo && await setUserMarkers([...userMarkers, {
        id: generateUniqueId(),
        name: markerName ?? piningMarker.name ?? iconDefaultMarker?.name ?? "Anonymous",
        coords: {
          ...location,
          address: streetInfo,
        },
        icon: {
          name: piningMarker.icon ?? "anonymous",
          type: "MCI",
        }
      }])
      goBackToSearch();
    } else {
      emptyMarkerShake()
    }
  }, [getMiddlePoint, markerName, piningMarker, userMarkers, goBackToSearch, emptyMarkerShake]);
  const deleteMarkerHandler = useCallback(async (deletingMarker: UserMarkerIconType) => {
    const newUserMarkers = userMarkers.filter(marker => marker.id !== deletingMarker.id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await setUserMarkers(newUserMarkers)
    if (newUserMarkers.length === 0) {
      console.log("ended editing marker bc lack of user markers")
      endEditingMarkers()
    }
  }, [userMarkers, endEditingMarkers]);

  const handleOriginMarkerTarget = useCallback(async (
    data: GooglePlaceData,
    _details: GooglePlaceDetail | null
  ) => {
    const targetMarker = userMarkers.find(marker => marker.name === data.description)
    if (targetMarker) {
      originInputViewRef.current?.setAddressText(targetMarker?.coords.address);
      setPinedInfo({
        origin: targetMarker.coords,
        destination: pinedInfo?.destination ?? null,
      });
    }
  }, [userMarkers, originInputViewRef, pinedInfo]);
  const handleDestinationMarkerTarget = useCallback(async (
    data: GooglePlaceData,
    _details: GooglePlaceDetail | null
  ) => {
    const targetMarker = userMarkers.find(marker => marker.name === data.description)
    if (targetMarker) {
      destinationInputViewRef.current?.setAddressText(targetMarker?.coords.address);
      setPinedInfo({
        origin: pinedInfo?.origin ?? null,
        destination: targetMarker.coords,
      });
    }
  }, [userMarkers, destinationInputViewRef, pinedInfo]);

  return (
    <BottomSheetView className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">

      {!piningLocation && !piningInput/*  && piningMarker */ && currentStep === ClientSteps.PINNING ?
        <View className="w-[95%] h-full self-center overflow-visible">
          <View className='flex-row justify-between mt-3'>
            <View className='h-10 flex-row gap-3- justify-center items-center'>
              <ScaleBtn className='h-full pr-3 justify-center items-center' onPress={cancelPiningLocationHandler}>
                <FontAwesome6 name="chevron-left" size={18} color={Colors[colorScheme ?? "light"].icons_link} />
              </ScaleBtn>
              <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">Añadiendo Marcador</Text>
            </View>
            {/* <ScaleBtn onPress={pickMarkerImage}>
              <MaterialCommunityIcons name="file-image-marker" size={28} color={Colors[colorScheme ?? "light"].icons_link} />
            </ScaleBtn> */}
            {/* <Text className="text-[#21288a] dark:text-[#766acd] font-bold text-xl">mas</Text> */}
          </View>
          {/* <View className='pl-[5%]- pr-[3%]- h-[5rem] mt-3 rounded-lg bg-[#E9E9E9] dark:bg-[#333333] overflow-hidden shadow'>
            <ScrollView contentContainerClassName='flex-row p-3 gap-5 self-center' horizontal showsHorizontalScrollIndicator={false}>

              {Object.entries(ColorsPalettes).map(([colorName, colorShades]) => {
                return (
                  <ScaleBtn
                    key={colorName}
                    style={{ backgroundColor: Colors[colorScheme ?? "light"].border_light }}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setPiningMarker({ ...piningMarker, color: colorName })
                    }}
                    className='rounded-full w-12 h-12 items-center justify-center'
                  >
                    {piningMarker?.color === colorName && <View className='bg-[#D8D8D8]- dark:bg-[#444444]- bg-red-500 absolute w-full h-full top-0 rounded-full' style={{ backgroundColor: Colors[colorScheme === "light" ? "dark" : "light"].border_light }}></View>}
                    <View className='w-10 h-10 rounded-full' style={{ backgroundColor: colorName }} />
                  </ScaleBtn>
                );
              })}

            </ScrollView>
          </View> */}

          <View className='pl-[5%]- pr-[3%]- h-[3rem]- mt-3 rounded-lg bg-[#E9E9E9]- dark:bg-[#333333]- overflow-hidden shadow'>
            <FloatingLabelInput
              label={"Nombre del Marcador"}
              value={markerName ?? undefined}
              onChangeText={value => setMarkerName(value)}
              onFocus={() => {
                snapToIndex(2);
              }}
              onBlur={() => {
                snapToIndex(1);
              }}
              ref={markerNameInputViewRef}

              containerStyles={{
                height: 52,
                // borderWidth: 2,
                paddingHorizontal: 10,
                backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                // borderColor: 'blue',
                borderRadius: 8,
              }}
              customLabelStyles={{
                colorFocused: Colors[colorScheme ?? "light"].border,
                colorBlurred: Colors[colorScheme ?? "light"].border,
                fontSizeFocused: 12,
                fontSizeBlurred: 18,
              }}
              labelStyles={{
                backgroundColor: "transparent",
                paddingHorizontal: 5,
              }}
              inputStyles={{
                marginTop: 8,
                color: Colors[colorScheme ?? 'light'].text_dark,
                paddingHorizontal: 10,

                fontWeight: '400',
                borderRadius: 10,
                fontSize: 18,
                textAlignVertical: 'bottom',
              }}
            />
          </View>

          <Animated.View style={{
            transform: [{
              translateX: markerShakeAnimatedValue.interpolate({
                inputRange: [0, 0.25, 0.50, 0.75, 1],
                outputRange: [0, 5, -5, 5, 0]
              })
            }]
          }} className='pl-[5%]- pr-[3%]- h-[10rem] mt-3 rounded-lg bg-[#E9E9E9] dark:bg-[#333333] overflow-hidden shadow'>
            <ScrollView contentContainerClassName='flex-wrap p-3 gap-5 flex-row self-center' showsHorizontalScrollIndicator={false}>
              {selectableMarkerIcons.map((markerIcon) => {
                return (
                  <ScaleBtn
                    key={markerIcon.icon}
                    style={{ backgroundColor: Colors[colorScheme ?? "light"].border_light }}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setPiningMarker({ ...piningMarker, icon: markerIcon.icon })
                    }}
                    className='rounded-full w-14 h-14 items-center justify-center'
                  >
                    {piningMarker?.icon === markerIcon.name && <View className='bg-[#D8D8D8]- dark:bg-[#444444]- bg-red-500 absolute w-full h-full top-0 rounded-full' style={{ backgroundColor: Colors[colorScheme === "light" ? "dark" : "light"].border_light }}></View>}
                    <MaterialCommunityIcons
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      name={markerIcon.icon}
                      size={34}
                      color={piningMarker?.icon === markerIcon.name ? (colorScheme === "light" ? "#D8D8D8" : "#444444") : (colorScheme === "light" ? "#444444" : "#D8D8D8")}
                    />
                  </ScaleBtn>
                );
              })}
            </ScrollView>
          </Animated.View>

          <ScaleBtn className="mt-5 w-full gap-3" onPress={addMarkerHandler}>
            <View className="h-18 flex-row items-center justify-center bg-[#25D366] dark:bg-[#137136] rounded-xl p-3">
              <Text className="text-white font-bold text-xl">Guardar</Text>
            </View>
          </ScaleBtn>
        </View>
        :
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

              <ScaleBtn className="mt-4 w-full gap-3" onPress={cancelRideInnerHandler}>
                <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                  <Text className="text-white font-bold text-xl">Cancel</Text>
                </View>
              </ScaleBtn>
            </View>
            :
            <>
              <View className="h-10 flex-row justify-between items-center mx-1.5 mt-3">
                <View className='flex-row gap-3- justify-center items-center'>
                  {
                    currentStep === ClientSteps.TAXI &&
                    <>
                      <ScaleBtn className='h-full pr-3 justify-center items-center' onPress={goBackToSearch}>
                        <FontAwesome6 name="chevron-left" size={18} color={Colors[colorScheme ?? "light"].icons_link} />
                      </ScaleBtn>
                      <Text className="font-bold text-xl text-[#1b1b1b] dark:text-[#C1C0C9]">Cómo quieres ir?</Text>
                    </>
                  }
                  {
                    currentStep === ClientSteps.SEARCH &&
                    <Text className="font-bold text-xl text-[#1b1b1b] dark:text-[#C1C0C9]">A dónde quieres ir?</Text>
                  }

                  {currentStep === ClientSteps.PINNING && piningLocation &&
                    <>
                      <ScaleBtn className='h-full pr-3 justify-center items-center' onPress={goBackToSearch}>
                        <FontAwesome6 name="chevron-left" size={18} color={Colors[colorScheme ?? "light"].icons_link} />
                      </ScaleBtn>
                      <Text className="font-bold text-xl text-[#1b1b1b] dark:text-[#C1C0C9]">Seleccione el lugar {piningInput === "destination" ? "destino" : "origen"}</Text>
                    </>
                  }
                </View>

                {viewPinOnMap && (
                  <ScaleBtn onPress={startPiningLocationHandler}>
                    <View style={{ borderColor: Colors[colorScheme ?? "light"].icons_link }} className="flex-row items-center gap-2 p-1 px-2 border rounded-lg border-[#C1C0C9]-">
                      {/* <Text className="h-full text-lg font-medium text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Fijar en el Mapa</Text> */}
                      <FontAwesome6 name="chevron-up" size={18} color={Colors[colorScheme ?? "light"].icons_link} />
                      <MaterialCommunityIcons name="map-search-outline" size={22} color={Colors[colorScheme ?? "light"].icons_link} />
                    </View>
                  </ScaleBtn>
                )}

                {!viewPinOnMap && !piningLocation && <>
                  {
                    currentStep === ClientSteps.SEARCH && (pinedInfo?.origin && pinedInfo.destination || routeLoading) &&
                    <ScaleBtn onPress={goToPinnedRouteTaxi} disabled={routeLoading} >
                      <View style={{ borderColor: Colors[colorScheme ?? "light"].icons_link }} className="flex-row items-center justify-center p-1 border rounded-lg">
                        {
                          routeLoading ? <ActivityIndicator color={Colors[colorScheme ?? "light"].icons_link} size={24} /> : <MaterialCommunityIcons name="car-multiple" size={24} color={Colors[colorScheme ?? "light"].icons_link} />
                        }

                        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[colorScheme ?? "light"].icons_link} />
                      </View>
                    </ScaleBtn>
                  }
                </>}
              </View>

              {currentStep === ClientSteps.SEARCH && <View className='relative z-[1000]'>
                <View className="relative z-[1000] w-full h-12 px-0 mt-3 items-start flex-row">
                  {
                    originLoading ? <ActivityIndicator color={Colors[colorScheme ?? "light"].border} size={32} /> : <MaterialCommunityIcons className='mt-1' name="map-marker-account" size={32} color={Colors[colorScheme ?? "light"].border} />
                  }
                  <Animated.View style={{
                    transform: [{
                      translateX: originShakeAnimatedValue.interpolate({
                        inputRange: [0, 0.25, 0.50, 0.75, 1],
                        outputRange: [0, 5, -5, 5, 0]
                      })
                    }]
                  }}>
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
                        id: "originInput",
                        placeholderTextColor: colorScheme === 'light' ? 'black' : '#6C6C6C',
                        onFocus: (e) => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          if (piningLocation) cancelPiningLocationHandler();
                          if (editingMarkers) endEditingMarkers();
                          setViewPinOnMap(true);
                          setPiningInput('origin');
                          console.log(JSON.stringify(e.nativeEvent, null, 2))
                        },
                        onBlur: () => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setViewPinOnMap(false);
                          setPiningInput(null);
                          // if (currentStep !== ClientSteps.PICKUP) setPiningInput(null);
                        },
                      }}
                      enablePoweredByContainer={false}
                      onPress={handleOriginMarkerTarget}
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
                          maxHeight: 150,
                          minHeight: 100,
                          width: "100%",
                          zIndex: 10000,
                          backgroundColor: Colors[colorScheme ?? 'light'].background_light,
                          borderRadius: 5,
                          flex: 1,
                          elevation: 3,
                          marginTop: 8,
                          borderColor: Colors[colorScheme ?? 'light'].icons,
                          borderWidth: 1
                        },
                        row: {
                          backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                        },
                        description: {
                          color: Colors[colorScheme ?? 'light'].text_dark
                        },
                        separator: {
                          backgroundColor: Colors[colorScheme ?? 'light'].icons
                        }
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
                  </Animated.View>
                </View>

                <View className="relative z-[999] w-full h-12 px-0 mt-5 items-end flex-row">
                  <DashedLine axis="vertical" style={{ height: 30, left: 15, top: -38, backgroundColor: Colors[colorScheme ?? "light"].border, }} />
                  {
                    destinationLoading ? <ActivityIndicator color={Colors[colorScheme ?? "light"].border} size={32} /> : <MaterialCommunityIcons className="mb-1 ml-[-1.5px]" name="map-marker-radius" size={32} color={Colors[colorScheme ?? "light"].border} />
                  }
                  <Animated.View style={{
                    transform: [{
                      translateX: destinationShakeAnimatedValue.interpolate({
                        inputRange: [0, 0.25, 0.50, 0.75, 1],
                        outputRange: [0, 5, -5, 5, 0]
                      })
                    }]
                  }}>
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
                        id: "destinationInput",
                        placeholderTextColor: colorScheme === 'light' ? 'black' : '#6C6C6C',
                        onFocus: (e) => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          if (piningLocation) cancelPiningLocationHandler();
                          if (editingMarkers) endEditingMarkers();
                          setViewPinOnMap(true);
                          setPiningInput('destination');
                          console.log(JSON.stringify(e.nativeEvent, null, 2))
                        },
                        onBlur: () => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setViewPinOnMap(false);
                          setPiningInput(null);
                          // if (currentStep !== ClientSteps.PICKUP) setPiningInput(null);
                        },
                      }}
                      enablePoweredByContainer={false}
                      onPress={handleDestinationMarkerTarget}
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
                          maxHeight: 150,
                          minHeight: 100,
                          width: "100%",
                          zIndex: 10000,
                          backgroundColor: Colors[colorScheme ?? 'light'].background_light,
                          borderRadius: 5,
                          flex: 1,
                          elevation: 3,
                          marginTop: 8,
                          borderColor: Colors[colorScheme ?? 'light'].icons,
                          borderWidth: 1
                        },
                        row: {
                          backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                        },
                        description: {
                          color: Colors[colorScheme ?? 'light'].text_dark
                        },
                        separator: {
                          backgroundColor: Colors[colorScheme ?? 'light'].icons
                        }
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
                  </Animated.View>
                </View>
              </View>}
            </>
          }

          {/* {currentStep === ClientSteps.PINNING && piningLocation &&
            <View className="mx-1.5 flex-row justify-between mt-5 gap-5">
              <ScaleBtn containerStyle={{ flex: 1 }} className="h-18" onPress={confirmPiningLocationHandler}>
                <View className="w-full flex-row items-center justify-center bg-[#25D366] dark:bg-[#137136] rounded-xl p-3">
                  <Text className="text-white font-bold text-xl">Guardar</Text>
                </View>
              </ScaleBtn>
              <ScaleBtn containerStyle={{ flex: 1 }} className="h-18" onPress={cancelPiningLocationHandler}>
                <View className="w-full flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                  <Text className="text-white font-bold text-xl">Cancel</Text>
                </View>
              </ScaleBtn>
            </View>
          } */}

          {currentStep === ClientSteps.PINNING && piningLocation &&
            <ScaleBtn containerStyle={{ flex: 1 }} className="mx-1.5 mt-3" onPress={confirmPiningLocationHandler}>
              <View className="h-18 flex-row items-center justify-center bg-[#25D366] dark:bg-[#137136] rounded-xl p-3">
                <Text className="text-white font-bold text-xl">Guardar</Text>
              </View>
            </ScaleBtn>
          }

          {currentStep === ClientSteps.SEARCH &&
            <>
              <View className="mx-1.5 mt-7 overflow-visible">
                <View className='flex-row justify-between'>
                  <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">Favoritos</Text>
                  {userMarkers.length > 0 && <ScaleBtn onPress={editingMarkers ? endEditingMarkers : startEditingMarkers}>
                    <Text className="text-[#21288a] dark:text-[#766acd] font-bold text-xl">{editingMarkers ? "done" : "editar"}</Text>
                  </ScaleBtn>}
                </View>

                <View className='py-3 pl-[5%]- pr-[3%]- mt-3 rounded-lg bg-[#E9E9E9] dark:bg-[#333333] overflow-hidden shadow'>
                  <ScrollView keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false} horizontal className="w-100 overflow-visible">
                    {
                      DEFAULT_MARKERS.map((defaultMarker) => {
                        const userMarker = userMarkers.find(item => item.name === defaultMarker.name)

                        if (userMarkers.length === 0 || !userMarker) {
                          if (editingMarkers) {
                            return null
                          }
                          return (
                            <DefaultMarkerRowItem key={defaultMarker.icon} addHandler={startAddingMarkerHandler} defaultMarker={defaultMarker} />
                          )
                        } else {
                          return (
                            <UserMarkerRowItem key={userMarker.id} userMarker={userMarker} pressHandler={selectMarkerHandler} editingMarkers={editingMarkers} deleteHandler={deleteMarkerHandler} />
                          )
                        }
                      })
                    }
                    {
                      userMarkers.filter(marker => !DEFAULT_MARKERS.find(m => m.icon === marker.icon.name)).map((userMarker) => {
                        return (
                          <UserMarkerRowItem key={userMarker.id} userMarker={userMarker} pressHandler={selectMarkerHandler} editingMarkers={editingMarkers} deleteHandler={deleteMarkerHandler} />
                        )
                      })
                    }
                    {
                      !editingMarkers && <View className='relative ml-5 items-center justify-center' key={"add-marker"}>
                        <View className={""}>
                          <ScaleBtn
                            style={{ backgroundColor: Colors[colorScheme ?? 'light'].border_light }}
                            className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8] dark:bg-[#444444]- items-center justify-center"
                            onPress={startAddingMarkerHandler}
                          >
                            <MaterialCommunityIcons
                              // @ts-ignore
                              name={"plus-circle"}
                              size={38}
                              color={Colors[colorScheme ?? 'light'].icons}
                            />
                          </ScaleBtn>
                        </View>
                        <View className='h-12 w-full'>
                          <Text className="text-lg font-semibold text-center text-[#1b1b1b] dark:text-[#C1C0C9]">{"Add"}</Text>
                        </View>
                      </View>
                    }
                    <View className='w-3'></View>
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

          {currentStep === ClientSteps.TAXI &&
            <View className="mx-1.5 mt-7- overflow-visible">
              {/* <View className='flex-row justify-between'>
                <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">Taxis</Text>
                {
                  // <Text className="text-[#21288a] dark:text-[#766acd] font-bold text-xl">mas</Text>
                }
              </View> */}

              <View className='pl-[5%]- pr-[3%]- h-[24rem] mt-3 rounded-lg bg-[#E9E9E9] dark:bg-[#333333] overflow-hidden shadow'>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" className="w-100 px-3">
                  {
                    TestTaxiTypesInfo.map((taxiType: TaxiTypesInfo) => <TaxiTypeRideRowItem taxiType={taxiType} />)
                  }
                </ScrollView>
              </View>
            </View>
          }

        </View>
      }
    </BottomSheetView>
  );
};

const TaxiTypeRideRowItem = ({ taxiType }: { taxiType: TaxiTypesInfo }) => {
  const { slug, name, pricePerKm, timePerKm, distance, duration } = taxiType;

  const colorSheme = useColorScheme();
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const scale = useSharedValue(0);

  const aRef = useAnimatedRef<View>();
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const rippleOpacity = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin((tapEvent) => {
      const layout = measure(aRef);
      if (!layout) return;
      width.value = layout.width;
      height.value = layout.height;

      centerX.value = tapEvent.x;
      centerY.value = tapEvent.y;

      rippleOpacity.value = 1;
      scale.value = withTiming(1, { duration: 500 });
    })
    .onEnd(() => {
      rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
        if (scale.value !== 0) {
          scale.value = 0;
        }
        // onTap && runOnJS(onTap)();
      });
    })
    .onTouchesCancelled(() => {
      rippleOpacity.value = withTiming(0, { duration: 500 }, () => {
        scale.value = 0;
      });
    })
    .maxDuration(20000)
    .maxDistance(100000)
    .shouldCancelWhenOutside(false);

  const rStyle = useAnimatedStyle(() => {
    const circleRadius = Math.sqrt(width.value ** 2 + height.value ** 2);

    const translateX = centerX.value - circleRadius;
    const translateY = centerY.value - circleRadius;

    return {
      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
      opacity: rippleOpacity.value,
      backgroundColor: colorSheme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
      position: 'absolute',
      top: 0,
      left: 0,
      transform: [
        { translateX },
        { translateY },
        {
          scale: scale.value,
        },
      ],
    };
  });

  const getTypeRideIcon = useMemo(() => {
    return () => {
      switch (slug) {
        case "bike": return BikeSVG;
        case "auto": return AutoSVG;
        case "confort": return ConfortSVG;
        case "confort_plus": return ConfortPlusSVG;
        case "vip": return VipSVG;
        default: return null;
      }
    };
  }, [slug]);

  const IconComponent = getTypeRideIcon();

  return (
    <View key={slug} ref={aRef} collapsable={false}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View className="overflow-hidden">

          <View className="mx-[-10%] px-[10%] bg-[#FCCB6F]- flex-row gap-7 items-center py-3">
            {IconComponent && <IconComponent />}

            <View className="flex-row items-center justify-between flex-1 px-2">
              <View>
                <Text className="text-[#151010] text-xl font-medium">{name}</Text>
                <Text className="text-[#1b1b1b] ">
                  {Math.round(Math.random() * 100) / 100} Km
                </Text>
              </View>
              <View>
                <Text className="text-[#1b1b1b] text-lg font-medium text-right">
                  ${(pricePerKm * (distance.value ?? 0 / 1000)).toFixed(2)}
                </Text>
                <Text className="text-[#1b1b1b]">
                  {(timePerKm * (duration.value ?? 0 / 60)).toFixed(2)} min
                </Text>
              </View>
            </View>
          </View>

          <Animated.View style={rStyle} />
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

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

const UserMarkerRowItem = ({ userMarker, color, bgColor, pressHandler, editingMarkers, deleteHandler }: { userMarker: UserMarkerIconType, pressHandler: (addingMarker: UserMarkerIconType) => void, color?: string, bgColor?: string, editingMarkers: boolean, deleteHandler: (deletingMarker: UserMarkerIconType) => void }) => {

  const shakeAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();

  const pressInnerHandler = useCallback(() => {
    if (editingMarkers) {
      console.warn("case not handled yet")
    } else {
      pressHandler(userMarker)
    }
  }, [editingMarkers, userMarker, pressHandler])
  const deleteInnerHandler = useCallback(() => {
    if (editingMarkers) {
      deleteHandler(userMarker)
    } else {
      console.warn("case not handled yet")
    }
  }, [editingMarkers, userMarker, deleteHandler])

  const startShaking = () => {
    Animated.loop(
      Animated.timing(shakeAnimatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  const stopShaking = () => {
    shakeAnimatedValue.stopAnimation();
    shakeAnimatedValue.setValue(0);
  };
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (editingMarkers) {
      startShaking();
    } else {
      stopShaking();
    }
  }, [editingMarkers]);


  return (
    <View className='relative ml-5 items-center justify-center' key={userMarker.id}>
      <Animated.View className={""}
        style={{
          transform: [
            {
              rotate: shakeAnimatedValue.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: ["0deg", "5deg", "-5deg", "5deg", "0deg"],
              }),
            },
          ],
        }}>
        <ScaleBtn
          style={{ backgroundColor: bgColor ?? Colors[colorScheme ?? 'light'].border_light }}
          className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8] dark:bg-[#444444]- items-center justify-center"
          onPress={pressInnerHandler}>
          <MaterialCommunityIcons
            // @ts-ignore
            name={userMarker.icon.name}
            size={38}
            color={color ?? Colors[colorScheme ?? 'light'].icons}
          />
        </ScaleBtn>
      </Animated.View>
      {editingMarkers && <ScaleBtn onPress={deleteInnerHandler} containerStyle={{ position: "absolute", right: 0 }}>
        <FontAwesome6 name="circle-minus" size={24} color={Colors[colorScheme ?? 'light'].delete} />
      </ScaleBtn>}
      <View className='h-12 w-full'>
        <Text className="text-lg font-semibold text-center text-[#1b1b1b] dark:text-[#C1C0C9]">{userMarker.name}</Text>
      </View>
    </View>
  )
}

const DefaultMarkerRowItem = ({ defaultMarker, color, bgColor, addHandler }: { defaultMarker: { name: string, icon: string }, addHandler: (addingMarker?: AddMarker) => void, color?: string, bgColor?: string }) => {

  const colorScheme = useColorScheme();
  const shakeAnimatedValue = React.useRef(new Animated.Value(0)).current;

  const shortShake = () => {
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
  const addInnerHandler = useCallback(() => {
    addHandler(defaultMarker)
  }, [addHandler, defaultMarker])
  // 1c1818
  return (
    <View className='ml-5 items-center justify-center' key={defaultMarker.icon}>
      <ScaleBtn
        style={{ backgroundColor: bgColor ?? Colors[colorScheme ?? 'light'].border_light }}
        className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8]- dark:bg-[#444444]- items-center justify-center"
        onPress={() => {
          shortShake()
        }}>
        <MaterialCommunityIcons
          // @ts-ignore
          name={defaultMarker.icon}
          size={38}
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
            onPress={addInnerHandler}>
            <Text className="text-sm text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Add</Text>
          </ScaleBtn>
        </Animated.View>
      </View>
    </View>
  )
}