import React, { useState, useEffect, useCallback } from 'react';
import { useWindowDimensions, View, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedScrollHandler, ScrollEvent, useAnimatedProps, useAnimatedStyle, withTiming, interpolate, clamp, Extrapolation, useAnimatedRef } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai/react';

import { Placeholder, PlaceholderLine, Fade } from "~/lib/rn-placeholder";
import { publicProfilesAtom, storeProfile } from '~/lib/storage';
import { ColorLinkedin, ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import { ScaleBtn } from '~/components/common';
import PopupMenu from '~/components/common/PopupMenu';
import Colors from '~/constants/Colors';
import { getFirstName, getLastName } from '~/utils';
import { fetchProfile } from '~/utils/auth';
import { Profile } from '~/types/User';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const PublicProfileScreen = ({ profileId }: { profileId: string }) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const offsetY = useSharedValue(0);
    const headerAnim = useSharedValue(0);

    const userIntroContainerRef = useAnimatedRef<Animated.Text | Animated.View>();
    const userIntroNameRef = useAnimatedRef<Animated.Text | Animated.View>();
    const userIntroContainerWidth = useSharedValue(0);
    const userIntroContainerHeight = useSharedValue(0);
    const userIntroNameWidth = useSharedValue(0);
    const userIntroNameHeight = useSharedValue(0);

    const [profile, setProfile] = useState<Profile | null>();
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [avatarLoaded, setAvatarLoaded] = useState(false);

    useEffect(() => {
        getProfile();
    }, [profileId])

    const measureUserIntroRefs = useCallback(() => {
        userIntroContainerRef.current?.measure((_1, _2, wi, he) => {
            userIntroContainerWidth.value = wi;
            userIntroContainerHeight.value = he;
        })
        userIntroNameRef.current?.measure((_1, _2, wi, he) => {
            userIntroNameWidth.value = wi;
            userIntroNameHeight.value = he;
        })
    }, [userIntroContainerRef, userIntroNameRef])

    const getProfile = useCallback(async () => {
        try {
            const resProfile = await fetchProfile(profileId as string);

            await storeProfile(resProfile);

            scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
            setProfile(resProfile);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoadingProfile(false)
        }
    }, [setProfile, scrollRef]);

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
                    // runOnJS(setImageViewVisible)(true)
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
    const navStyles = useAnimatedStyle(() => ({
        height: width,
        width: width,

        justifyContent: "center",
        alignItems: "center",

        position: "relative",
    }))
    const navShadowStyles = useAnimatedStyle(() => ({
        position: "absolute",
        zIndex: 12,

        opacity: interpolate(
            headerAnim.value,
            [0, 100],
            [1, 0],
            Extrapolation.CLAMP
        ),
    }))
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
        // top: clamp(offsetY.value, 0, width - insets.top - 120) + insets.top,
        // top: insets.top,
        top: 12,

        transform: [
            {
                translateY: clamp(offsetY.value, 0, width - 160)
            }
        ],
    }));

    const popupOptions = [
        {
            title: "Report",
            icon: "block-helper",
            onPress: () => {
                alert(`You clicked Report`)
            }
        },
        {
            title: "Delete",
            icon: "delete",
            onPress: async () => {
                alert(`You clicked Delete`)
            },
            color: Colors[colorScheme ?? 'light'].delete
        },
    ]

    return (
        <View style={{ backgroundColor: Colors[colorScheme ?? "light"].background }} className='flex-1'>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                onScroll={scrollHandler}
                style={scrollStyles}
            >
                <Animated.View style={navStyles}>
                    <Animated.View style={[imgContainerStyles, navShadowStyles]}>
                        <LinearGradient
                            colors={[Colors[colorScheme ?? "light"].gradient_bg_1, 'transparent', 'transparent']}
                            style={{ flex: 1, }}
                        />

                        <LinearGradient
                            colors={['transparent', Colors[colorScheme ?? "light"].gradient_bg_1]}
                            style={{ flex: 1, }}
                        />
                    </Animated.View>

                    {
                        profile?.avatar_url && <Animated.View className={"z-10"} style={imgContainerStyles}>
                            <Image
                                style={{ flex: 1 }}
                                alt="avatar"
                                source={{
                                    uri: profile?.avatar_url,
                                }}
                                onLoadEnd={() => setAvatarLoaded(true)}
                            />
                        </Animated.View>
                    }

                    {
                        !avatarLoaded && <View className='w-[100vw] h-[100vw] absolute top-0 justify-center items-center z-20'>
                            {/* <BlurView className='h-24 w-24 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ActivityIndicator color={Colors[colorScheme ?? "light"].text} size={"large"} />
                            </BlurView> */}
                            <ActivityIndicator color={Colors[colorScheme ?? "light"].text} size={"large"} />
                        </View>
                    }

                    {
                        (loadingProfile) ? (
                            <Animated.View className={"z-20 items-start justify-end py-1 "} ref={userIntroContainerRef} style={userIntroContainerStyles}>
                                <Animated.View
                                    ref={userIntroNameRef}
                                    style={[{
                                        width: 100,
                                        height: 24,
                                        overflow: "hidden",
                                    }, userIntroNameStyles]}
                                >
                                    <Placeholder
                                        Animation={Fade}
                                    >
                                        <PlaceholderLine color={Colors[colorScheme ?? 'light'].card_placeholder} style={{ borderRadius: 4, marginBottom: 0 }} height={18} width={100} />
                                    </Placeholder>
                                </Animated.View>

                                <View onLayout={measureUserIntroRefs} />

                                <Animated.View
                                    style={[{
                                        width: 200,
                                        height: 20,
                                        overflow: "hidden",
                                    }]}
                                >
                                    <Placeholder
                                        className=''
                                        Animation={Fade}
                                    >
                                        <PlaceholderLine color={Colors[colorScheme ?? 'light'].card_placeholder} style={{ borderRadius: 4, marginBottom: 0 }} height={16} width={100} />
                                    </Placeholder>
                                </Animated.View>
                            </Animated.View>
                        ) : (
                            profile ? (
                                <Animated.View className={"z-20 items-start justify-end py-1 "} ref={userIntroContainerRef} style={userIntroContainerStyles}>
                                    <Animated.Text
                                        className='font-bold text-xl text-[#000] dark:text-[#fff]'
                                        ref={userIntroNameRef}
                                        style={userIntroNameStyles}
                                    >
                                        {profile.full_name ? (getFirstName(profile.full_name) + " " + getLastName(profile.full_name)) : profile.username}
                                    </Animated.Text>

                                    <View onLayout={measureUserIntroRefs} />

                                    <Animated.Text className='text-xl text-[#000] dark:text-[#fff]'>{profile.phone + " - @" + profile.username}</Animated.Text>
                                </Animated.View>
                            ) : (
                                <>
                                </>
                            )
                        )
                    }

                    <View className={"w-full absolute z-20 bottom-1 py-2 px-4 self-center flex-row items-center justify-between"}>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorLinkedin dark />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorInstagram dark />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorFacebook dark />
                            </BlurView>
                        </ScaleBtn>
                        <ScaleBtn className="">
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <ColorTwitter dark />
                            </BlurView>
                        </ScaleBtn>
                    </View>

                    <Animated.View style={headerBtnsStyles} className={"w-full z-20 py-2 px-4 self-center flex-row items-center justify-between"}>
                        <ScaleBtn onPressIn={() => { router.back() }}>
                            <BlurView className='h-12 w-12 justify-center items-center rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <FontAwesome6 name="chevron-left" size={24} color={"#fff"} />
                            </BlurView>
                        </ScaleBtn>

                        <View className='flex-row gap-5 justify-center items-center'>
                            <ScaleBtn className="" onPressIn={() => { }}>
                                <BlurView className='h-12 px-3 flex-row justify-center items-center gap-2 rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                    <MaterialCommunityIcons name="message" size={24} color={"#fff"} />
                                </BlurView>
                            </ScaleBtn>

                            <PopupMenu optionItems={popupOptions} />
                        </View>
                    </Animated.View>
                </Animated.View>

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

                <View style={{ height: height }} />
            </Animated.ScrollView>

        </View>
    );
};

export default PublicProfileScreen;