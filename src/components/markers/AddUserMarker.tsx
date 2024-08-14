import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useRef, memo, useEffect } from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Pressable,
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native';

import ScaleBtn from '~/components/common/ScaleBtn';
import { View, Text } from '~/components/common/Themed';
import Colors from '~/constants/Colors';
import { IMarker } from '~/types/Marker';
import { getData } from '~/lib/storage';

export const selectableMarkerIcons = [
  {
    type: 'MCI',
    name: 'folder-marker',
    icon: 'folder-marker',
  },
  {
    type: 'MCI',
    name: 'home-map-marker',
    icon: 'home-map-marker',
  },
  {
    type: 'MCI',
    name: 'airplane-marker',
    icon: 'airplane-marker',
  },
  {
    type: 'MCI',
    name: 'archive-marker',
    icon: 'archive-marker',
  },
  {
    type: 'MCI',
    name: 'book-marker',
    icon: 'book-marker',
  },
  {
    type: 'MCI',
    name: 'bus-marker',
    icon: 'bus-marker',
  },
  {
    type: 'MCI',
    name: 'camera-marker',
    icon: 'camera-marker',
  },
  {
    type: 'MCI',
    name: 'cash-marker',
    icon: 'cash-marker',
  },
  {
    type: 'MCI',
    name: 'cellphone-marker',
    icon: 'cellphone-marker',
  },
  {
    type: 'MCI',
    name: 'credit-card-marker',
    icon: 'credit-card-marker',
  },
];

export interface UserMarkerIconType {
  id: string;
  name: string;
  description?: string;
  icon: {
    type: string;
    name: string;
    color?: string;
    size?: number;
  };
  coords: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface PlaceMarkerIconType {
  id: string;
  name: string;
  description?: string;
  icon: {
    type: string;
    name: string;
    color?: string;
    size?: number;
  };
  coords: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const AddUserMarker: React.FC<{
  onConfirmFn: (newMarker: UserMarkerIconType) => void;
}> = ({ onConfirmFn }) => {
  const { width, height } = Dimensions.get('window');
  const colorScheme = useColorScheme();

  const [userMarkers, setUserMarkers] = useState<IMarker[]>([]);

  const [isAddUserMarkerOpen, setIsAddUserMarkerOpen] = useState(false);
  const [selectMarkerWidth, setSelectMarkerWidth] = useState(96);
  const [selectMarkerHeight, setSelectMarkerHeight] = useState(40);
  const addingMarkerDataRef = useRef<UserMarkerIconType>({
    // Fix this later, add a new method for creating ids
    id: Date.now().toString(),
    coords: {
      latitude: 69.42,
      longitude: 69.42,
      address: "69 420",
    },
    icon: selectableMarkerIcons.find(
      (markerIcon) => !userMarkers.some((marker) => marker.icon === markerIcon.name)
    ) ?? {
      type: 'MCI',
      name: 'airplane-marker',
    },
    name: 'airplane-marker',
  });

  useEffect(() => {
    getData('user_markers').then((data) => {
      setUserMarkers(data ?? []);
    });
  }, []);

  const toggleAddUserMarker = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: 'easeInEaseOut',
        property: 'scaleXY',
      },
      create: {
        type: 'easeInEaseOut',
        property: 'scaleXY',
      },
      delete: {
        type: 'easeInEaseOut',
        property: 'scaleXY',
      },
    });
    const newWidth = isAddUserMarkerOpen ? 96 : 216;
    const newHeight = isAddUserMarkerOpen ? 40 : 136;

    setIsAddUserMarkerOpen(!isAddUserMarkerOpen);
    setSelectMarkerWidth(newWidth);
    setSelectMarkerHeight(newHeight);
  };

  const onMarkerIconPress = (markerIcon: { type: string; name: string }) => {
    addingMarkerDataRef.current = {
      ...addingMarkerDataRef.current,
      icon: markerIcon,
      name: markerIcon.name,
      coords: {
        latitude: 69.42,
        longitude: 69.42,
        address: "69 420",
      },
    };
    toggleAddUserMarker();
  };

  const onConfirmInternal = () => {
    onConfirmFn(addingMarkerDataRef.current);
  };

  return (
    <>
      <View
        style={{
          right: width / 2 - 24,
          top: height / 2 - 48,
        }}>
        <MaterialIcons name="location-pin" size={48} color={Colors[colorScheme ?? 'light'].text} />
      </View>
      {isAddUserMarkerOpen && <Pressable onPress={toggleAddUserMarker} />}
      <TouchableWithoutFeedback>
        <Pressable
          onPress={!isAddUserMarkerOpen ? toggleAddUserMarker : undefined}
          style={{
            height: selectMarkerHeight,
            width: selectMarkerWidth,
            justifyContent: isAddUserMarkerOpen ? 'center' : 'space-evenly',
            flexWrap: isAddUserMarkerOpen ? 'wrap' : 'nowrap',
            flexDirection: isAddUserMarkerOpen ? 'column' : 'row',
            gap: isAddUserMarkerOpen ? 6 : 0,
            padding: isAddUserMarkerOpen ? 8 : 0,
            left: width / 2 - selectMarkerWidth / 2,
          }}>
          {!isAddUserMarkerOpen && (
            <>
              <MaterialCommunityIcons
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                name={addingMarkerDataRef.current.icon.name}
                size={28}
                color="black"
              />
              <MaterialIcons name="arrow-drop-up" size={24} color="black" />
            </>
          )}
          {isAddUserMarkerOpen && (
            <>
              {selectableMarkerIcons.map((markerIcon) => {
                return (
                  <Pressable
                    key={markerIcon.name}
                    onPress={() => {
                      onMarkerIconPress(markerIcon);
                    }}
                    style={{
                      display: isAddUserMarkerOpen ? 'flex' : 'none',
                    }}>
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
            </>
          )}
        </Pressable>
      </TouchableWithoutFeedback>

      <ScaleBtn
        onPress={onConfirmInternal}
        style={{
          position: 'absolute',
          zIndex: 20,
          left: width > 367 ? width / 2 - 100 : width / 2 - 90,
          bottom: 20,
        }}>
        <Text darkColor="black">Confirmar</Text>
      </ScaleBtn>
    </>
  );
};

export default memo(AddUserMarker);
