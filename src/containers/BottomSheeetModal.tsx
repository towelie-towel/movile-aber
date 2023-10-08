import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { type BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Accuracy, getCurrentPositionAsync } from 'expo-location';
import React, { memo, useEffect, useRef, useState } from 'react';
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
import { GooglePlacesAutocompleteRef } from '../lib/GooglePlacesAutocomplete';

import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import AbsoluteDropdown from '~/shared/AbsoluteDropdown';
import AbsoluteLoading from '~/shared/AbsoluteLoading';
import { polylineDecode } from '~/utils/helpers';
// import { MarkerData } from '~/constants/Markers';

void Image.prefetch(
  'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
);

const snapPoints = ['10%', '25%', '50%', '75%', '100%'];

const DiscoberTab = () => {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
};

const MarkersProfileTab = () => {
  // const colorScheme = useColorScheme();

  return (
    <View
      style={{
        flex: 1,
      }}>
      {/* <FlatList
                    style={{
                        width: '100%'
                    }}
                    data={userMarkers}
                    renderItem={({ item }) => (
                        <View>
                            <MaterialCommunityIcons
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                name={item.icon.name}
                                size={28}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                            <Text>
                                {item.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    // void setUserMarkers(userMarkers.filter(marker => marker.id !== item.id))
                                }}
                            >
                                <View>
                                    <MaterialCommunityIcons
                                        name={'trash-can'}
                                        size={28}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                /> */}
    </View>
  );
};

const renderTabsScene = SceneMap({
  discober: DiscoberTab,
  markers: MarkersProfileTab,
});

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

  // const [isFirstTime, _] = useAtom(isFirstTimeAtom);
  const [sheetCurrentSnap, setSheetCurrentSnap] = useState(-1);
  const [tabsIndex, setTabsIndex] = useState(0);
  const [tabsRoutes] = useState([
    { key: 'discober', title: 'Descubre' },
    { key: 'markers', title: 'Marcadores' },
  ]);

  // search bar
  const placesInputViewRef = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [_activeRoute, setActiveRoute] = useState<LatLng[] | null | undefined>(null);

  const onSearchBarFocus = () => {
    console.log('places input focus');
  };

  const onSearchBarBlur = () => {
    console.log('places input blur');
  };

  useEffect(() => {
    const fetchTaxi = async () => {
      const resp = await fetch(`http://192.168.1.103:6942/profile?id=${selectedTaxiId}`);
      const respJson = await resp.json();
      console.log(respJson);
    };
    void fetchTaxi();
  }, []);

  return (
    <BottomSheetModal
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
      <SearchBar
        refFor={(ref) => (placesInputViewRef.current = ref)}
        onFocus={onSearchBarFocus}
        onBlur={onSearchBarBlur}
        onPlacePress={async (_, details) => {
          if (!details) {
            return;
          }
          const position = await getCurrentPositionAsync({
            accuracy: Accuracy.Highest,
          });
          try {
            const resp = await fetch(
              `http://192.168.1.103:6942/route?from=${position.coords.latitude},${position.coords.longitude}&to=${details.geometry.location.lat},${details.geometry.location.lng}`
            );
            const respJson = await resp.json();
            const decodedCoords = polylineDecode(respJson[0].overview_polyline.points).map(
              (point) => ({ latitude: point[0]!, longitude: point[1]! })
            );
            setActiveRoute(decodedCoords);
          } catch (error) {
            if (error instanceof Error) {
              console.error(error.message);
            }
          }
        }}
      />
      <View>
        {selectedTaxiId !== null && !userSelected && (
          <View>
            <Animated.Image
              source={{
                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
              }}
              resizeMode="cover"
            />

            <View>
              <Animated.Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                }}
                resizeMode="cover"
              />
            </View>

            <View>
              <View>
                <Text>Julio López</Text>
                <Text>@julydev</Text>
              </View>
              <View>
                <MaterialCommunityIcons
                  name={colorScheme === 'dark' ? 'message-text' : 'message-text-outline'}
                  size={24}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              </View>
            </View>
          </View>
        )}

        {userSelected && isSignedIn && (
          <View>
            <Animated.Image
              source={{
                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
              }}
              resizeMode="cover"
            />

            <AbsoluteDropdown
              actions={[
                {
                  title: 'Opción 1',
                  icon: 'radio',
                  onPress: () => {
                    console.log('Opción 1');
                  },
                },
                {
                  title: 'Opción 2',
                  icon: 'opacity',
                  onPress: () => {
                    console.log('Opción 2');
                  },
                },
                {
                  title: 'Cerrar sesión',
                  icon: 'close',
                  onPress: () => {
                    console.log('signin out');
                    void signOut();
                  },
                },
              ]}
            />

            <View>
              <Animated.Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                }}
                resizeMode="cover"
              />
            </View>

            <View>
              <View>
                <View>
                  <Text>{`${user?.username}`}</Text>
                </View>
                <View>
                  <Text>@{`${user?.slug}`}</Text>
                </View>
              </View>
            </View>

            <TabView
              navigationState={{ index: tabsIndex, routes: tabsRoutes }}
              renderScene={renderTabsScene}
              onIndexChange={setTabsIndex}
              initialLayout={{ width }}
              renderTabBar={(props) => (
                <TabBar
                  activeColor="#FCCB6F"
                  inactiveColor={colorScheme === 'dark' ? 'white' : 'black'}
                  pressColor={colorScheme === 'dark' ? 'white' : 'black'}
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  {...props}
                />
              )}
              lazy
            />
          </View>
        )}

        {!isSignedIn && selectedTaxiId === null && (
          <View
            style={{
              height:
                sheetCurrentSnap === 0
                  ? '30%'
                  : sheetCurrentSnap === 1
                  ? '60%'
                  : sheetCurrentSnap === 2
                  ? '90%'
                  : 0,
            }}>
            {isLoaded ? (
              <>
                <MaterialCommunityIcons
                  name="login"
                  size={sheetCurrentSnap === 0 && width < 768 ? 42 : 56}
                  color={Colors[colorScheme ?? 'light'].text}
                />
                <Text numberOfLines={2}>
                  Inicie sesión o seleccione un taxi para ver su información
                </Text>
                <TouchableOpacity onPress={() => {}}>
                  <Text>Sign In</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ActivityIndicator
                size="large"
                animating
                color={colorScheme === 'light' ? 'black' : 'white'}
              />
            )}
          </View>
        )}

        <AbsoluteLoading size="large" visible={isLoading} />
      </View>
    </BottomSheetModal>
  );
};

export default memo(BottomSheet);
