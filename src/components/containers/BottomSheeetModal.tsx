import React, { memo, useEffect, useRef, useState } from 'react';
import {
    Image,
    Animated,
    Dimensions,
    FlatList,
    LayoutAnimation,
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
    useColorScheme
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAtom } from 'jotai';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { type BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import type { DrawerParamList } from '~/app';
import { useUser } from '~/context/UserContext';
import Colors from '~/constants/Colors';
import { userMarkersAtom } from '~/components/map/AddUserMarker';
import AbsoluteDropdown from '~/components/shared/AbsoluteDropdown';
import { isFirstTimeAtom } from '~/context/UserContext';
import AbsoluteLoading from '~/components/shared/AbsoluteLoading';
import SearchBar from './SearchBar';
import { GooglePlacesAutocompleteRef } from '../map/lib/GooglePlacesAutocomplete';
import { LatLng } from 'react-native-maps';
import { Accuracy, getCurrentPositionAsync } from 'expo-location';
import { polylineDecode } from '~/utils/helpers';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

const snapPoints = ["25%", "50%", "75%", "100%"];

const DiscoberTab = () => {
    return (
        (
            <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        )
    )
}

const MarkersProfileTab = () => {
    const colorScheme = useColorScheme();
    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)

    return (
        (
            <View style={{
                flex: 1,
            }} >
                <FlatList
                    style={{
                        width: '100%'
                    }}
                    data={userMarkers}
                    renderItem={({ item }) => (
                        <View className='w-full h-14 flex-row items-center justify-evenly bg-transparent'>
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
                                    void setUserMarkers(userMarkers.filter(marker => marker.id !== item.id))
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
                />
            </View>
        )
    )
}

const renderTabsScene = SceneMap({
    discober: DiscoberTab,
    markers: MarkersProfileTab,
});

const BottomSheet = ({ bottomSheetModalRef, selectedTaxiId, userSelected, setIsVisible, navigation }: {
    bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>,
    selectedTaxiId: string | null,
    userSelected: boolean,
    isVisible: boolean,
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
    navigation?: DrawerNavigationProp<DrawerParamList, "Map">,
}) => {

    const colorScheme = useColorScheme();
    const { user, signOut, session, isLoading, isLoaded, isSignedIn, error, isError } = useUser()
    const { width } = Dimensions.get('window');

    const [isFirstTime, _] = useAtom(isFirstTimeAtom);
    const [sheetCurrentSnap, setSheetCurrentSnap] = useState(-1);
    const [tabsIndex, setTabsIndex] = useState(0);
    const [tabsRoutes] = useState([
        { key: 'discober', title: 'Descubre' },
        { key: 'markers', title: 'Marcadores' },
    ]);

    // search bar
    const placesInputViewRef = useRef<GooglePlacesAutocompleteRef | null>(null);
    const [activeRoute, setActiveRoute] = useState<LatLng[] | null | undefined>(null)

    const onSearchBarFocus = () => {
        console.log("places input focus")
    }

    const onSearchBarBlur = () => {
        console.log("places input blur")
    }

    useEffect(() => {
        const fetchTaxi = async () => {
            const resp = await fetch(
                `http://192.168.1.103:6942/profile?id=${selectedTaxiId}`,
            );
            const respJson = await resp.json();
            console.log(respJson);
        }
        void fetchTaxi();
    }, [])

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            onChange={(e) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSheetCurrentSnap(e)
            }}
            detached
            enableContentPanningGesture={false}
            snapPoints={snapPoints}
            backgroundStyle={{
                borderRadius: 15,
                backgroundColor: colorScheme === "light" ? "#F7F7F6" : "black",
            }}
            handleIndicatorStyle={{
                backgroundColor: colorScheme === "light" ? "#BEBFC0" : "black",
            }}
            onDismiss={() => {
                setIsVisible(false)
            }}
        >
            <SearchBar
                refFor={(ref) => (placesInputViewRef.current = ref)}
                onFocus={onSearchBarFocus}
                onBlur={onSearchBarBlur}
                onPlacePress={async (data, details) => {
                    if (!details) {
                        return
                    }
                    const position = await getCurrentPositionAsync({
                        accuracy: Accuracy.Highest,
                    })
                    try {
                        const resp = await fetch(
                            `http://192.168.1.103:6942/route?from=${position.coords.latitude},${position.coords.longitude}&to=${details.geometry.location.lat},${details.geometry.location.lng}`,
                        );
                        const respJson = await resp.json();
                        const decodedCoords = polylineDecode(
                            respJson[0].overview_polyline.points,
                        ).map((point) => ({ latitude: point[0]!, longitude: point[1]! }));
                        setActiveRoute(decodedCoords)
                    } catch (error) {
                        if (error instanceof Error) {
                            console.error(error.message)
                        }
                    }
                }}
            />
            <View className={'w-full h-full rounded-t-3xl overflow-hidden'}>

                {selectedTaxiId !== null && !userSelected && (
                    <View className='w-full h-full'>

                        <Animated.Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                            }}
                            className={'w-full h-48 min-[768px]:h-72'}
                            resizeMode="cover"
                        />

                        <View className={'absolute left-5 top-40 min-[768px]:top-64 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                            <Animated.Image
                                source={{
                                    uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                }}
                                className={'w-16 h-16'}
                                resizeMode="cover"
                            />
                        </View>

                        <View className={'w-full h-20 justify-between flex-row bg-transparent'}>
                            <View className='bg-transparent h-full justify-end ml-5'>
                                <Text className='font-bold text-lg'>Julio López</Text>
                                <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@julydev</Text>
                            </View>
                            <View className='flex-row h-full justify-between items-center'>
                                <MaterialCommunityIcons
                                    name={colorScheme === 'dark' ? "message-text" : "message-text-outline"}
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        </View>

                    </View>
                )}


                {(userSelected && isSignedIn) && (
                    <View className='w-full h-full'>

                        <Animated.Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                            }}
                            className={'w-full h-48 min-[768px]:h-72'}
                            resizeMode="cover"
                        />

                        <AbsoluteDropdown actions={[
                            {
                                title: 'Opción 1',
                                icon: "radio",
                                onPress: () => {
                                    navigation?.openDrawer();
                                    console.log("Opción 1")
                                }
                            },
                            {
                                title: 'Opción 2',
                                icon: "opacity",
                                onPress: () => {
                                    console.log("Opción 2")
                                }
                            },
                            {
                                title: 'Cerrar sesión',
                                icon: "close",
                                onPress: () => {
                                    console.log("signin out")
                                    void signOut()
                                }
                            }
                        ]} />

                        <View className={'absolute left-5 top-40 min-[768px]:top-64 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                            <Animated.Image
                                source={{
                                    uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                }}
                                className={'w-16 h-16'}
                                resizeMode="cover"
                            />
                        </View>

                        <View className={'w-full h-20 justify-between flex-row bg-transparent'}>
                            <View className='bg-transparent h-full justify-end ml-5'>
                                <View className='bg-transparent'>
                                    <Text className='font-bold text-lg'>{`${user?.username}`}</Text>
                                </View>
                                <View className='bg-transparent'>
                                    <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@{`${user?.slug}`}</Text>
                                </View>
                            </View>
                        </View>

                        <TabView
                            navigationState={{ index: tabsIndex, routes: tabsRoutes }}
                            renderScene={renderTabsScene}
                            onIndexChange={setTabsIndex}

                            initialLayout={{ width }}
                            renderTabBar={(props) =>
                                <TabBar
                                    activeColor='#FCCB6F'
                                    inactiveColor={colorScheme === 'dark' ? 'white' : 'black'}
                                    pressColor={colorScheme === 'dark' ? 'white' : 'black'}
                                    style={{
                                        backgroundColor: 'transparent',
                                    }}
                                    {...props}
                                />
                            }
                            lazy
                        />

                    </View>
                )}

                {(!isSignedIn && selectedTaxiId === null) &&
                    <View
                        className='w-full bg-transparent justify-center items-center'
                        style={{
                            height: sheetCurrentSnap === 0 ? '30%' : sheetCurrentSnap === 1 ? '60%' : sheetCurrentSnap === 2 ? '90%' : 0,
                        }}
                    >
                        {
                            isLoaded
                                ? <>
                                    <MaterialCommunityIcons
                                        name={'login'}
                                        size={(sheetCurrentSnap === 0 && (width < 768)) ? 42 : 56}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text numberOfLines={2} className='w-64 text-center my-4 max-[768px]:my-2 max-[367px]:my-1 text-lg max-[768px]:text-base max-[367px]:text-sm font-bold text-slate-700 dark:text-slate-100'>
                                        Inicie sesión o seleccione un taxi para ver su información
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation?.navigate("Sign-In");
                                        }}
                                        className='pt-1 h-12 max-[367px]:h-8 max-[768px]:h-10 w-[200px] max-[367px]:w-[160px] max-[768px]:w-[180px] bg-[#FCCB6F] dark:bg-white rounded-3xl justify-center items-center text-center'
                                    >
                                        <Text className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base'}>
                                            {isFirstTime ? "Sign Up" : "Sign In"}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                                :
                                <ActivityIndicator
                                    size={'large'}
                                    animating
                                    color={colorScheme === 'light' ? 'black' : 'white'}
                                />
                        }
                    </View>
                }

                <AbsoluteLoading size={'large'} visible={isLoading} />

            </View>
        </BottomSheetModal>
    );
};

export default memo(BottomSheet)
