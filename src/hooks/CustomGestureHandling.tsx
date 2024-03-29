import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useBottomSheetInternal,
  BottomSheetFlatList,
  BottomSheetView,
  BottomSheetTextInput,
  TouchableOpacity,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { getCurrentPositionAsync, Accuracy } from 'expo-location';
import React, { useCallback, useMemo } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { LatLng } from 'react-native-maps';
import { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';

import { UserMarkerIconType } from '~/components/AddUserMarker';
import { ScaleBtn } from '~/components/ScaleBtn';
import { MarkerCloudSVG } from '~/constants/Icons';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
} from '~/lib/google-places-autocomplete/GooglePlacesAutocomplete';
import { polylineDecode } from '~/utils/directions';

export const BottomSheetContent = ({
  activeRoute,
  userMarkers,
}: {
  activeRoute: { coords: LatLng[] } | null | undefined;
  userMarkers: UserMarkerIconType[];
}) => {
  const colorScheme = useColorScheme();

  const { animatedIndex } = useBottomSheetInternal();

  const listContentContainerStyle = useAnimatedStyle(() => ({
    // [-1, 1, 2] this first array defines the [-1, disapearPoint, aperPoint]
    opacity: interpolate(animatedIndex.value, [-1, 0, 1], [0, -1, 1], Extrapolate.CLAMP),
  }));
  const listContentStyle = useMemo(() => [listContentContainerStyle], [listContentContainerStyle]);

  const startBtnContainerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, 0, 1], [1, 1, -1], Extrapolate.CLAMP),
  }));
  const startBtnStyle = useMemo(() => [startBtnContainerStyle], [startBtnContainerStyle]);

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
          // borderStyle: 'dashed',
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
    <BottomSheetScrollView
      style={[
        {
          flex: 1,
          // height: '100%',
          // width: '100%',
          position: 'relative',
        },
        // listContentStyle,
      ]}>
      <BottomSheetTextInput
        style={{
          borderColor: 'black',
          borderWidth: 1,
          borderStyle: 'dashed',
          marginTop: 8,
          marginBottom: 10,
          borderRadius: 10,
          fontSize: 16,
          lineHeight: 20,
          padding: 8,
          backgroundColor: 'rgba(151, 151, 151, 0.25)',
        }}
      />
      {/* <BottomSheetView
        style={[
          {
            height: 100,
            width: '100%',
            position: 'absolute',
            top: 0,
          },
          startBtnStyle,
        ]}>
        {!activeRoute ? (
          <BottomSheetFlatList
            style={[
              {
                borderTopRightRadius: 8,
                borderTopLeftRadius: 8,
                width: '100%',
                padding: 10,
              },
            ]}
            keyExtractor={(i) => i.id}
            horizontal
            renderItem={renderMarkerBtnItems}
            data={[
              {
                id: '1',
                name: 'house',
                icon: {
                  type: 'MCI',
                  name: 'airplane-marker',
                },
                coords: {
                  latitude: 23.118439331498397,
                  longitude: -82.38065080644563,
                },
              },
              {
                id: '2',
                name: 'house',
                icon: {
                  type: 'MCI',
                  name: 'archive-marker',
                },
                coords: {
                  latitude: 23.121832663066453,
                  longitude: -82.40442767880837,
                },
              },
              {
                id: '3',
                name: 'house',
                icon: {
                  type: 'MCI',
                  // name: 'map-marker-plus',
                  name: 'plus-circle-outline',
                },
                coords: {
                  latitude: 23.121832663066453,
                  longitude: -82.40442767880837,
                },
              },
            ]}
          />
        ) : (
          <BottomSheetView
            style={[
              {
                overflow: 'hidden',
                borderRadius: 8,
                width: '50%',
                height: 50,
                marginTop: 18,
                alignSelf: 'center',
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors[colorScheme ?? 'light'].btn_light_bg,
              }}>
              Pedir Taxi
            </Text>
          </BottomSheetView>
        )}
      </BottomSheetView> */}
      {[
        {
          userId: '1',
        },
        {
          userId: '2',
        },
        {
          userId: '3',
        },
        {
          userId: '4',
        },
        {
          userId: '5',
        },
        {
          userId: '6',
        },
        {
          userId: '7',
        },
        {
          userId: '8',
        },
        {
          userId: '9',
        },
        {
          userId: '10',
        },
        {
          userId: '11',
        },
        {
          userId: '12',
        },
        {
          userId: '13',
        },
        {
          userId: '14',
        },
        {
          userId: '15',
        },
        {
          userId: '16',
        },
        {
          userId: '17',
        },
        {
          userId: '18',
        },
        {
          userId: '19',
        },
        {
          userId: '20',
        },
        {
          userId: '21',
        },
        {
          userId: '22',
        },
        {
          userId: '23',
        },
        {
          userId: '24',
        },
      ].map((item) => renderBottomSheetItem({ item }))}
    </BottomSheetScrollView>
  );
};
