import { Image } from 'expo-image';
import React from 'react';
import { useWindowDimensions, View, useColorScheme, TextInput, Text } from 'react-native';
import Animated, { useSharedValue, runOnJS, useAnimatedScrollHandler, ScrollEvent, useAnimatedProps, useAnimatedStyle, withTiming, interpolate, clamp, Extrapolation, useAnimatedRef, useScrollViewOffset } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageView from 'react-native-image-viewing';
import { BlurView } from 'expo-blur';
import { FontAwesome6 } from '@expo/vector-icons';

import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import { ColorLinkedin, ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import { getFirstName, getLastName } from '~/utils';
import { ScaleBtn } from '../common';
import { router } from 'expo-router';


const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const { profile } = useUser()

    if (!profile) {
        // go to sign-in screen
        return null
    }

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const offsetY = useSharedValue(0);
    const headerAnim = useSharedValue(0);

    const [imageViewVisible, setImageViewVisible] = React.useState(false);

    const handlers = {
        onScroll: (event: ScrollEvent) => {
            'worklet';
            offsetY.value = event.contentOffset.y;

            if (offsetY.value === 0) {
                scrollRef.current?.scrollTo(0)
            }

            if (headerAnim.value === 0) {
                if (offsetY.value >= 25) {
                    headerAnim.value = withTiming(100, {
                        duration: 300
                    });
                } if (offsetY.value <= -75) {
                    runOnJS(setImageViewVisible)(true)
                }
            } else if (headerAnim.value === 100) {
                if (offsetY.value <= 0) {
                    headerAnim.value = withTiming(0, {
                        duration: 300
                    });
                }
            }
        },
    };
    const scrollHandler = useAnimatedScrollHandler(handlers);

    const scrollYTextProps = useAnimatedProps(() => {
        return {
            text: `Outer Scroll offset: ${Math.round(offsetY.value)}px`,
            defaultValue: `Outer Scroll offset: ${offsetY.value}px`,
        };
    });

    const scrollStyles = useAnimatedStyle(() => ({
        overflow: "visible",
    }));
    const imgContainerStyles = useAnimatedStyle(() => ({
        width: interpolate(
            headerAnim.value,
            [0, 100],
            [width, 100],
            Extrapolation.CLAMP
        ),
        height: interpolate(
            headerAnim.value,
            [0, 100],
            [width, 100],
            Extrapolation.CLAMP
        ),

        position: "absolute",
        bottom: interpolate(
            headerAnim.value,
            [0, 100],
            [0, (width / 2 - 50)],
            Extrapolation.CLAMP
        ),
        transform: [
            {
                scale: interpolate(
                    offsetY.value,
                    [-height, 0],
                    [5, 1],
                    Extrapolation.CLAMP
                )
            },
            {
                translateY: interpolate(
                    offsetY.value,
                    [-height, 0],
                    [-height / 2, 0],
                    Extrapolation.CLAMP
                )
            }
        ],

        overflow: "hidden",
        borderRadius: headerAnim.value,

    }));

    const userIntroContainerRef = useAnimatedRef<Animated.Text>();
    const userIntroNameRef = useAnimatedRef<Animated.Text>();

    const userIntroContainerWidth = useSharedValue(0);
    const userIntroContainerHeight = useSharedValue(0);
    const userIntroNameWidth = useSharedValue(0);
    const userIntroNameHeight = useSharedValue(0);

    const userIntroContainerStyles = useAnimatedStyle(() => ({
        position: "absolute",
        height: userIntroNameHeight.value * 2,
        bottom: interpolate(
            headerAnim.value,
            [0, 100],
            [56, (width / 2 - 50) - userIntroContainerHeight.value - 12],
            Extrapolation.CLAMP
        ),
        left: interpolate(
            headerAnim.value,
            [0, 100],
            [12, (width / 2) - (userIntroContainerWidth.value / 2)],
            Extrapolation.CLAMP
        ),

    }));
    const userIntroNameStyles = useAnimatedStyle(() => ({
        position: "absolute",
        top: 0,
        left: interpolate(
            headerAnim.value,
            [0, 100],
            [0, (userIntroContainerWidth.value / 2) - (userIntroNameWidth.value / 2)],
            Extrapolation.CLAMP
        ),

    }));


    const headerBtnsStyles = useAnimatedStyle(() => ({
        position: "absolute",
        top: clamp(offsetY.value, 0, width - insets.top - 120) + insets.top,
    }));

    return (
        <View style={{ backgroundColor: Colors[colorScheme ?? "light"].background }} className='flex-1'>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                onScroll={scrollHandler}
                style={scrollStyles}
            >
                <View style={{
                    height: width,
                    width: width,

                    justifyContent: "center",
                    alignItems: "center",

                    position: "relative",
                }}>
                    <Animated.View style={imgContainerStyles}>
                        <Image
                            style={{ flex: 1 }}
                            alt="avatar"
                            source={{
                                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                            }}
                        />
                    </Animated.View>

                    <Animated.View className={"items-start justify-end py-1"} ref={userIntroContainerRef} style={userIntroContainerStyles}>
                        <Animated.Text
                            className='font-bold text-xl text-[#777] dark:text-[#C1C0C9]'
                            ref={userIntroNameRef}
                            style={userIntroNameStyles}
                            onLayout={() => {
                                userIntroContainerRef.current?.measure((_1, _2, wi, he) => {
                                    userIntroContainerWidth.value = wi;
                                    userIntroContainerHeight.value = he;
                                })
                                userIntroNameRef.current?.measure((_1, _2, wi, he) => {
                                    userIntroNameWidth.value = wi;
                                    userIntroNameHeight.value = he;
                                })
                            }}
                        >
                            {profile.full_name ? (getFirstName(profile.full_name) + " " + getLastName(profile.full_name)) : profile.username}
                        </Animated.Text>
                        <Animated.Text className='text-xl text-[#777] dark:text-[#C1C0C9]'>{profile.phone + " - @" + profile.username}</Animated.Text>
                    </Animated.View>

                    <View className={"w-full absolute bottom-1 py-2 px-4 self-center flex-row items-center justify-between"}>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorLinkedin />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorInstagram />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorFacebook />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorTwitter />
                            </BlurView>
                        </ScaleBtn>
                    </View>

                    <Animated.View style={headerBtnsStyles} className={"w-full py-2 px-4 self-center flex-row items-center justify-between"}>
                        <ScaleBtn onPressIn={() => { router.back() }}>
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <FontAwesome6 name="chevron-left" size={24} color={Colors[colorScheme ?? "light"].text_dark} />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 px-3 flex-row justify-center items-center gap-2 rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <Text className="font-bold text-xl text-[#777] dark:text-[#C1C0C9]'">Editar</Text>
                                <FontAwesome6 name="edit" size={18} color={Colors[colorScheme ?? "light"].text_dark} />
                            </BlurView>
                        </ScaleBtn>
                    </Animated.View>
                </View>

                <View
                    style={{
                        position: "relative",
                        zIndex: 10,
                    }}
                >
                    <View className='p-5' style={{ height: insets.bottom + height + 104 }} >
                        <AnimatedTextInput
                            animatedProps={scrollYTextProps}
                            editable={false}
                            style={{ backgroundColor: Colors[colorScheme ?? "light"].background_2, color: Colors[colorScheme ?? "light"].text }}
                            className={"text-center p-5 mb-2 rounded-md"}
                        />
                    </View>
                </View>
            </Animated.ScrollView>
            <ImageView
                images={[{
                    uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                }]}
                imageIndex={0}
                visible={imageViewVisible}
                animationType={'slide'}
                onRequestClose={() => {
                    setImageViewVisible(false);
                }}
                presentationStyle={'fullScreen'}
            />

        </View>
    );
};

export default ProfileScreen;