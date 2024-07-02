import { MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    useColorScheme,
    useWindowDimensions,
    LayoutAnimation,
    Keyboard,
    Pressable,
    ScrollView,
} from 'react-native';
import type { Address, LatLng } from 'react-native-maps';

import { ConfortSVG } from '../svgs';
import { ScaleBtn } from '~/components/common';
import Colors from '~/constants/Colors';
import {
    GooglePlacesAutocomplete,
    GooglePlaceData,
    GooglePlaceDetail,
    GooglePlacesAutocompleteRef,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import type { TaxiProfile, TaxiType } from '~/constants/TaxiTypes';
import { polylineDecode } from '~/utils/directions';
import { ClientSteps } from '~/constants/RideFlow';
import { userMarkersAtom, useUser } from '~/context/UserContext';
import DashedLine from './DashedLine';
import { useAtom } from 'jotai/react';

interface InputHeaderContentProps {
    currentStep: ClientSteps;
    setCurrentStep: React.Dispatch<ClientSteps>;
    setActiveRoute: React.Dispatch<{ coords: LatLng[] } | null>;
    startPiningLocation: () => void;
    cancelPiningLocation: () => void;
    confirmPiningLocation: () => Promise<{ latitude: number; longitude: number; address?: Address }>;
    piningLocation: boolean;
    selectedTaxiType: string | null;
    setSelectedTaxiType: React.Dispatch<TaxiType | null>;
    confirmedTaxi: TaxiProfile | null;
}

export const InputHeaderContent = ({
    currentStep,
    setCurrentStep,
    setActiveRoute,
    startPiningLocation,
    cancelPiningLocation,
    confirmPiningLocation,
    piningLocation,
}: InputHeaderContentProps) => {
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    const { collapse, snapToIndex, snapToPosition } = useBottomSheet();

    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)
    const [viewPinOnMap, setViewPinOnMap] = useState(false);
    const [piningInput, setPiningInput] = useState<'origin' | 'destination'>('destination');
    const [piningInfo, setPiningInfo] = useState<{
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
        fetchOrigin();
    }, []);

    useEffect(() => {
        const tokio = async () => {
            if (piningInfo?.destination && piningInfo?.origin) {
                const resp = await fetch(
                    `http://172.20.10.12:6942/route?from=${piningInfo.origin.latitude},${piningInfo.origin.longitude}&to=${piningInfo.destination.latitude},${piningInfo.destination.longitude}`
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
                setCurrentStep(ClientSteps.TAXI)
            }
        }
        tokio()
    }, [piningInfo])

    const fetchOrigin = async () => {
        const currentPosition = await getCurrentPositionAsync();

        if (currentPosition) {
            originInputViewRef.current?.setAddressText(currentPosition.address);
            setPiningInfo({
                origin: currentPosition,
                destination: piningInfo?.destination ?? null,
            });
        } else {
            console.log('No street address found in the response.');
        }
    };

    const getCurrentPositionAsync = async () => {
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
                    setPiningInfo({
                        origin: { ...location, address: streetInfo },
                        destination: piningInfo?.destination ?? null,
                    });
                } else if (piningInput === 'destination') {
                    destinationInputViewRef.current?.setAddressText(streetInfo);
                    let originDestination = piningInfo?.origin;
                    if (!originDestination) {
                        originDestination = await getCurrentPositionAsync()
                    }
                    setPiningInfo({
                        origin: originDestination ?? null,
                        destination: { ...location, address: streetInfo },
                    });
                }
            } else {
                console.log('No street address found in the response.');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        }
    };

    const goBackToSearch = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrentStep(ClientSteps.SEARCH);
    };
    const goToPinnedRouteTaxi = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrentStep(ClientSteps.TAXI);
    };

    return (
        <BottomSheetView className="flex-1">

            <View className="h-10 flex-row justify-between items-center mx-1.5">
                <Text className="font-bold text-xl">A donde quieres ir?</Text>

                {viewPinOnMap && !piningLocation && (
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

                {!viewPinOnMap && !piningLocation && <>
                    {
                        currentStep === ClientSteps.TAXI &&
                        <ScaleBtn onPress={goBackToSearch}>
                            <View className="flex-row items-center justify-center p-1 border rounded-lg bg-[#FCCB6F]">
                                <MaterialCommunityIcons name={"chevron-left"} size={24} color="black" />
                                <MaterialCommunityIcons name="star" size={24} color="black" />
                            </View>
                        </ScaleBtn>
                    }

                    {
                        currentStep === ClientSteps.SEARCH && piningInfo?.origin && piningInfo.destination &&
                        <ScaleBtn onPress={goToPinnedRouteTaxi}>
                            <View className="flex-row items-center justify-center p-1 border rounded-lg bg-[#FCCB6F]">
                                <MaterialCommunityIcons name="car-multiple" size={24} color="black" />
                                <MaterialCommunityIcons name="chevron-right" size={24} color="black" />
                            </View>
                        </ScaleBtn>
                    }
                </>}

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
                            snapToPosition(750)
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
                            snapToPosition(750)
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
        </BottomSheetView>
    );
};
