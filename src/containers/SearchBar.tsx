import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Keyboard /* , useWindowDimensions */,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import { View } from '../components/Themed';
import {
  type GooglePlacesAutocompleteRef,
  GooglePlacesAutocomplete,
  type GooglePlaceData,
  type GooglePlaceDetail,
} from '../lib/google-places-autocomplete/GooglePlacesAutocomplete';
import Colors from '~/constants/Colors';
// import Colors from '~/constants/Colors';

/* 
https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&input=23%20y%2025&inputtype=textquery&locationbias=circle%3A2000%4023.1383300%2C-82.3641700&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=23%20y%2026&location=23.1383300%2C-82.3641700&radius=5000&types=geocode&language=es&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
https://maps.googleapis.com/maps/api/place/textsearch/json?query=23%20y%2025&location=23.1383300%2C-82.3641700&radius=500&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
*/

interface Params {
  onPlacePress: (data: GooglePlaceData, details: GooglePlaceDetail | null) => void | Promise<void>;
  onProfilePicPress: () => void | Promise<void>;
  onFocus: () => void;
  onBlur: () => void;
  refFor?: (r: GooglePlacesAutocompleteRef | null) => void;
}

const SearchBar = ({ onProfilePicPress, onPlacePress, onFocus, onBlur, refFor }: Params) => {
  const colorScheme = useColorScheme();
  // const { colorScheme } = useColorScheme()

  const ref = useRef<GooglePlacesAutocompleteRef | null>(null);
  const keyboardDidHide = () => ref.current?.blur();

  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => Keyboard.removeAllListeners('keyboardDidHide');
  }, []);

  return (
    <GooglePlacesAutocomplete
      ref={(instance) => {
        ref.current = instance;
        refFor && refFor(instance);
      }}
      renderLeftButton={() => (
        <View
          style={{
            position: 'absolute',
            left: 0,
            zIndex: 100,

            width: 55,
            height: '100%',

            justifyContent: 'center',
            alignItems: 'center',

            backgroundColor: 'transparent',
          }}>
          <MaterialCommunityIcons
            onPress={onProfilePicPress}
            name="magnify"
            size={32}
            color={colorScheme === 'light' ? '#6C6C6C' : 'black'}
          />
        </View>
      )}
      /* predefinedPlaces={userMarkers.map(marker => ({
                description: marker.name,
                geometry: {
                    location: {
                        lat: marker.coords.latitude,
                        lng: marker.coords.longitude
                    }
                }
            }))} */
      placeholder="Buscar Lugar"
      textInputProps={{
        onFocus,
        onBlur,
        placeholderTextColor: colorScheme === 'light' ? '#6C6C6C' : 'black',
      }}
      onPress={(data, details) => void onPlacePress(data, details)}
      styles={{
        textInputContainer: {},
        textInput: {
          height: 50,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderRadius: 30,
          paddingLeft: 60,
          fontWeight: '400',
          fontSize: 20,
          color: colorScheme === 'light' ? '#6C6C6C' : 'black',
          textAlignVertical: 'center',
          shadowColor: Colors[colorScheme ?? 'light'].shadow,
          shadowOffset: {
            width: 0,
            height: -5,
          },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 2, // required for Android
        },
        container: {
          paddingHorizontal: 20,
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
      // nearbyPlacesAPI='GooglePlacesSearch'
      currentLocation
      currentLocationLabel="My Location"
    />
  );
};
export default SearchBar;
