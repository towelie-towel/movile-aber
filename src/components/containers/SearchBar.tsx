import React, { useEffect, useRef } from 'react'
import { Keyboard, useWindowDimensions } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useColorScheme } from 'nativewind';
import { useAtomValue } from 'jotai';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { View } from '../shared/Themed'
import type { GooglePlacesAutocompleteRef } from '../map/lib/GooglePlacesAutocomplete';
import { GooglePlacesAutocomplete, type GooglePlaceData, type GooglePlaceDetail } from '../map/lib/GooglePlacesAutocomplete';
// import Colors from '~/constants/Colors';
import type { DrawerParamList } from '~/app';
import { userMarkersAtom } from '~/components/map/AddUserMarker';
import { useColorScheme } from 'react-native';

/* 
https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&input=23%20y%2025&inputtype=textquery&locationbias=circle%3A2000%4023.1383300%2C-82.3641700&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=23%20y%2026&location=23.1383300%2C-82.3641700&radius=5000&types=geocode&language=es&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
https://maps.googleapis.com/maps/api/place/textsearch/json?query=23%20y%2025&location=23.1383300%2C-82.3641700&radius=500&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
*/

interface Params {
    onPlacePress: (data: GooglePlaceData, details: GooglePlaceDetail | null) => void | Promise<void>
    onFocus: () => void
    onBlur: () => void
    refFor?: (r: GooglePlacesAutocompleteRef | null) => void
}

const SearchBar = ({ onPlacePress, onFocus, onBlur, refFor }: Params) => {
    const { width } = useWindowDimensions()
    const userMarkers = useAtomValue(userMarkersAtom)
    const colorScheme = useColorScheme();
    // const { colorScheme } = useColorScheme()

    const ref = useRef<GooglePlacesAutocompleteRef | null>(null);
    const keyboardDidHide = () => ref.current?.blur();

    useEffect(() => {
        Keyboard.addListener("keyboardDidHide", keyboardDidHide);

        return () => Keyboard.removeAllListeners("keyboardDidHide");
    }, []);

    return (
        <GooglePlacesAutocomplete
            ref={instance => {
                ref.current = instance;
                refFor && refFor(instance);
            }}
            renderLeftButton={() => (
                <View
                    style={{
                        position: "absolute",
                        left: 0,
                        zIndex: 100,

                        width: 55,
                        height: "100%",

                        justifyContent: "center",
                        alignItems: "center",

                        backgroundColor: "transparent",

                        /* borderColor: "red",
                        borderWidth: 1,
                        borderStyle: "solid", */
                    }}
                >
                    <MaterialCommunityIcons
                        name="magnify"
                        size={26}
                        color={colorScheme === "light" ? "#6C6C6C" : "black"}
                    />
                </View>
            )}
            predefinedPlaces={userMarkers.map(marker => ({
                description: marker.name,
                geometry: {
                    location: {
                        lat: marker.coords.latitude,
                        lng: marker.coords.longitude
                    }
                }
            }))}
            placeholder="Buscar Lugar"
            textInputProps={{
                onFocus: onFocus,
                onBlur: onBlur,
                placeholderTextColor: colorScheme === "light" ? "#6C6C6C" : "black",
            }}
            onPress={(data, details,) => void onPlacePress(data, details)}
            renderRightButton={() => (
                <View
                    style={{
                        width: 45,

                        justifyContent: "center",
                        alignItems: "flex-end",

                        backgroundColor: "transparent",

                        /*  borderColor: "red",
                         borderWidth: 1,
                         borderStyle: "solid", */
                    }}
                >
                    <MaterialCommunityIcons
                        name="account-circle"
                        size={38}
                        color={colorScheme === "light" ? "#BEBFC0" : "black"}
                        style={{
                            /*  borderColor: "red",
                             borderWidth: 1,
                             borderStyle: "solid", */
                        }}
                    />
                </View>
            )}
            styles={{
                textInputContainer: {
                    /* borderColor: "yellow",
                    borderWidth: 1,
                    borderStyle: "solid", */
                },
                textInput: {
                    height: "100%",
                    backgroundColor: colorScheme === "light" ? "#E9E9E9" : "black",
                    borderRadius: 30,
                    paddingHorizontal: 50,
                    fontWeight: "500",
                    fontSize: 16,
                    color: colorScheme === "light" ? "#6C6C6C" : "black",
                    textAlignVertical: "center",
                },
                container: {
                    paddingHorizontal: 10,
                },
            }}
            fetchDetails
            query={{
                key: 'AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE',
                language: 'es',
                components: 'country:cu',
                location: "23.11848,-82.38052",
                radius: 100,
            }}
            /* nearbyPlacesAPI='GooglePlacesSearch' */
            currentLocation
            currentLocationLabel='My Location'

        />
    )
}
export default SearchBar
