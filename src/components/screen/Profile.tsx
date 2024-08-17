import { Image } from 'expo-image';
import React from 'react';
import {
    useWindowDimensions,
    View,
    useColorScheme,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageView from 'react-native-image-viewing';
import Animated, { useSharedValue, runOnJS, useAnimatedScrollHandler, ScrollEvent, useAnimatedProps, useAnimatedStyle, withTiming, interpolate, Extrapolation, useAnimatedRef, useScrollViewOffset } from 'react-native-reanimated'

import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import { getFirstName, getLastName } from '~/utils';


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
    const navStyles = useAnimatedStyle(() => ({
        height: width,
        width: width,

        justifyContent: "center",
        alignItems: "center",
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
            [0, (width / 2)],
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
            [12, (width / 2) - userIntroContainerHeight.value - 12],
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

    return (
        <View style={{ backgroundColor: Colors[colorScheme ?? "light"].background }} className='flex-1'>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                onScroll={scrollHandler}
                style={scrollStyles}
            >
                <Animated.View style={navStyles}>
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
                            className='font-bold text-xl text-[#C1C0C9]'
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
                        <Animated.Text className='text-xl text-[#C1C0C9]'>{profile.phone + " - " + profile.username}</Animated.Text>
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