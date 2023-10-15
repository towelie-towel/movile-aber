import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { type BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Accuracy, getCurrentPositionAsync } from 'expo-location';
import { useRouter } from 'expo-router';
import React, { memo, useRef, useState } from 'react';
import {
  Image,
  Animated,
  Dimensions,
  // FlatList,
  LayoutAnimation,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { LatLng } from 'react-native-maps';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import SearchBar from './SearchBar';
import { GooglePlacesAutocompleteRef } from '../lib/google-places-autocomplete/GooglePlacesAutocomplete';

import AbsoluteDropdown from '~/components/AbsoluteDropdown';
import AbsoluteLoading from '~/components/AbsoluteLoading';
import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import { polylineDecode } from '~/utils/directions';

void Image.prefetch(
  'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
);

const snapPoints = ['10%', '25%', '50%', '75%', '100%'];

const BottomSheet = ({
  bottomSheetModalRef,
  selectedTaxiId,
  userSelected,
  setIsVisible,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  selectedTaxiId: string | null;
  userSelected: boolean;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const colorScheme = useColorScheme();
  const { user, signOut, isLoading, isLoaded, isSignedIn } = useUser();
  const { width } = Dimensions.get('window');
  const router = useRouter();

  // const [isFirstTime, _] = useAtom(isFirstTimeAtom);
  const [sheetCurrentSnap, setSheetCurrentSnap] = useState(-1);
  const [tabsIndex, setTabsIndex] = useState(0);
  const [tabsRoutes] = useState([
    { key: 'discober', title: 'Descubre' },
    { key: 'markers', title: 'Marcadores' },
  ]);

  /* useEffect(() => {
    const fetchTaxi = async () => {
      const resp = await fetch(`http://192.168.1.103:6942/profile?id=${selectedTaxiId}`);
      const respJson = await resp.json();
      console.log(respJson);
    };
    void fetchTaxi();
  }, []); */

  return (
    <BottomSheetModal
      stackBehavior="replace"
      ref={bottomSheetModalRef}
      index={1}
      onChange={(e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSheetCurrentSnap(e);
      }}
      enableContentPanningGesture={false}
      enablePanDownToClose={false}
      snapPoints={snapPoints}
      backgroundStyle={{
        borderRadius: 15,
        backgroundColor: colorScheme === 'light' ? '#F7F7F6' : 'black',
      }}
      handleIndicatorStyle={{
        backgroundColor: colorScheme === 'light' ? '#BEBFC0' : 'black',
      }}
      onDismiss={() => {
        setIsVisible(false);
      }}>
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 10,
        }}
        onPress={() => {
          router.push('auth/sign');
        }}>
        <Text>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 10,
        }}
        onPress={() => {
          signOut();
        }}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 10,
        }}
        onPress={() => {
          console.log(user);
        }}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
};

export default memo(BottomSheet);
