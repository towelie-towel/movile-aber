import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Animated,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScaleBtn from '~/components/common/ScaleBtn';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const borderRadius = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 50, 100],
    extrapolate: 'clamp',
  });

  const animSize = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [dimensions.width, 100, 60],
    extrapolate: 'clamp',
  });

  const animPadding = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 3, 6],
    extrapolate: 'clamp',
  });

  const animPosX = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 24, 48],
    extrapolate: 'clamp',
  });

  const animOpacity = scrollY.interpolate({
    inputRange: [0, 25, 50],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const animMarginTop = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [dimensions.width, 100, 60],
    extrapolate: 'clamp',
  });
  const animHeightCover = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 100, 150],
    extrapolate: 'clamp',
  });

  const bgColorAnim = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: ['white', 'black'],
    extrapolate: 'clamp',
  });
  const textColorAnim = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: ['black', 'white'],
    extrapolate: 'clamp',
  });
  const btnColorAnim = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: ['white', 'transparent'],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-white">
      <View style={{ marginTop: insets.top }} className="bg-white flex-1">
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
        <Animated.View
          style={{
            width: 32,
            height: 32,
            position: 'absolute',
            top: Platform.OS === 'android' ? insets.top + 12 : 14,
            left: 18,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Platform.OS === 'ios' ? btnColorAnim : 'white',
            zIndex: 1001,
            borderRadius: 32 / 2,
          }}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              borderRadius: 32 / 2,
            }}
            onPress={() => {
              router.back();
            }}>
            <MaterialCommunityIcons name="chevron-left" size={22} color="black" />
          </TouchableOpacity>
        </Animated.View>
        {Platform.OS === 'ios' && (
          <>
            <Animated.View
              style={{
                width: dimensions.width,
                position: 'absolute',
                height: animSize,
                zIndex: 999,
                backgroundColor: 'transparent',
                // top: Platform.OS === "android" ? insets.top : 0,
              }}>
              <BlurView
                style={{
                  flex: 1,
                  position: 'relative',
                  zIndex: 1000,
                  width: dimensions.width,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                tint="light"
                intensity={100}>
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: animSize,
                    height: animSize,
                    top: 0,
                    left: animPosX,
                    padding: animPadding,
                  }}>
                  <Animated.View style={{ flex: 1, borderRadius, overflow: 'hidden' }}>
                    <Image
                      style={{ flex: 1 }}
                      alt="avatar"
                      source={{
                        uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                      }}
                    />
                  </Animated.View>
                </Animated.View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    position: 'absolute',
                    bottom: 18,
                    paddingHorizontal: 18,
                  }}>
                  <Animated.View style={{ opacity: animOpacity }}>
                    <Text className="text-[#e6e6e6] text-2xl font-medium">Julio Lopez</Text>
                  </Animated.View>
                  <ScaleBtn
                    style={{
                      justifyContent: 'center',
                      alignSelf: 'flex-end',
                      minWidth: 100,
                      top: 8,
                    }}
                    onPress={() => {
                      router.back();
                    }}>
                    <Animated.View
                      style={{
                        height: 40,
                        backgroundColor: bgColorAnim,
                        borderRadius: 25,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Animated.Text
                        style={{
                          fontWeight: '600',
                          fontSize: 18,
                          color: textColorAnim,
                          padding: 4,
                        }}>
                        Edit
                      </Animated.Text>
                    </Animated.View>
                  </ScaleBtn>
                </View>
              </BlurView>
            </Animated.View>
          </>
        )}
        <Animated.ScrollView
          style={{
            backgroundColor: '#fff',
            marginTop: Platform.OS === 'ios' ? animMarginTop : insets.top,
            overflow: 'visible',
          }}
          onScroll={
            Platform.OS === 'ios'
              ? Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: false,
              })
              : undefined
          }
          scrollEventThrottle={16}>
          {Platform.OS === 'ios' && <Animated.View style={{ height: animHeightCover }} />}
          {Platform.OS === 'android' && (
            <View
              style={{
                width: dimensions.width,
                height: dimensions.width,
                position: 'relative',
              }}>
              <View style={{ width: '100%', height: dimensions.width }}>
                <Image
                  source="https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c"
                  alt="avatar"
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  position: 'absolute',
                  bottom: 18,
                  paddingHorizontal: 18,
                }}>
                <View style={{}}>
                  <Text className="text-[#e6e6e6] text-2xl font-medium">Julio Lopez</Text>
                </View>
                <ScaleBtn
                  style={{ justifyContent: 'center', alignSelf: 'flex-end', minWidth: 100 }}
                  onPress={() => {
                    console.log('edit pressed');
                  }}>
                  <View className="flex-row items-center justify-center bg-white rounded-3xl">
                    <Text className="font-bold text-md text-black p-2">Edit</Text>
                  </View>
                </ScaleBtn>
              </View>
            </View>
          )}

          <View style={{ height: insets.bottom + dimensions.height }} />
        </Animated.ScrollView>
      </View>
    </View>
  );
};

export default ProfileScreen;
