import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { useWindowDimensions, View, useColorScheme, TextInput, Text, Keyboard } from 'react-native';
import Animated, { useAnimatedKeyboard, useSharedValue, runOnJS, useAnimatedScrollHandler, ScrollEvent, useAnimatedProps, useAnimatedStyle, withTiming, interpolate, clamp, Extrapolation, useAnimatedRef } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import ImageView from 'react-native-image-viewing';

import { useUser } from '~/context/UserContext';
import FloatingLabelInput from '~/lib/floating-label-input';
import { ScaleBtn } from '~/components/common';
import PopupMenu from '~/components/common/PopupMenu';
import { ColorLinkedin, ColorInstagram, ColorFacebook, ColorTwitter } from '~/components/svgs';
import Colors from '~/constants/Colors';
import { getFirstName, getLastName } from '~/utils';

const ProfileEdit = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const { profile, updateUserHandler } = useUser()

    if (!profile) {
        // go to sign-in screen
        return null
    }

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const offsetY = useSharedValue(0);
    const headerAnim = useSharedValue(0);

    const focusedInputOffsetY = useSharedValue(width);

    const keyboard = useAnimatedKeyboard();

    const [imageViewVisible, setImageViewVisible] = useState(false);

    const [userName, setUserName] = useState(profile.username);
    const [name, setName] = useState(profile.full_name);
    const [linkedin, setLinkedin] = useState(profile.linkedin);
    const [facebook, setFacebook] = useState(profile.facebook);
    const [instagram, setInstagram] = useState(profile.instagram);
    const [twitterX, setTwitterX] = useState(profile.twitter_x);
    const [web, setWeb] = useState(profile.web);

    const saveProfileHandler = useCallback(() => {
        console.log({ userName, name, linkedin, facebook, instagram, twitterX, web })
        updateUserHandler({
            username: userName,
            full_name: name,
            linkedin,
            facebook,
            instagram,
            twitter_x: twitterX,
            web,
        })
    }, [updateUserHandler, userName, name, linkedin, facebook, instagram, twitterX, web])

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
            text: `${keyboard.state.value}`,
            defaultValue: `${offsetY.value}`,
        };
    });

    const scrollStyles = useAnimatedStyle(() => {
        return ({
            overflow: "visible",
            /* transform: [{
                translateY: (keyboard.state.value === 0 || keyboard.state.value === 4)
                    ? 0
                    : -(keyboard.height.value)

                // : (
                //     (keyboard.height.value + focusedInputOffsetY.value) < (offsetY.value)
                //         ? 0
                //         : (-keyboard.height.value - focusedInputOffsetY.value) + (offsetY.value)
                // )

                // : -(keyboard.height.value) - focusedInputOffsetY.value
            }] */
        })
    });
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
            [12, (width / 2 - 50) - userIntroContainerHeight.value - 12],
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
                            colors={[`rgba(0, 0, 0, 0.3)`, 'transparent', 'transparent']}
                            style={{ flex: 1, }}
                        />

                        <LinearGradient
                            colors={['transparent', `rgba(0, 0, 0, 0.3)`]}
                            style={{ flex: 1, }}
                        />
                    </Animated.View>

                    <Animated.View className={"z-10"} style={imgContainerStyles}>
                        <Image
                            style={{ flex: 1 }}
                            alt="avatar"
                            source={{
                                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c',
                            }}
                        />
                    </Animated.View>

                    <Animated.View className={"z-20 items-start justify-end py-1"} ref={userIntroContainerRef} style={userIntroContainerStyles}>
                        <Animated.Text
                            className='font-bold text-xl text-[#A1A1A1]'
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
                        <Animated.Text className='text-xl text-[#A1A1A1]'>{profile.phone + " - @" + profile.username}</Animated.Text>
                    </Animated.View>

                    <Animated.View style={headerBtnsStyles} className={"w-full z-20 py-2 px-4 self-center flex-row items-center justify-between"}>
                        <ScaleBtn onPressIn={() => { router.back() }}>
                            <BlurView className='h-12 px-3 flex-row justify-center items-center gap-2 rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                <Text className="font-bold text-xl text-[#A1A1A1]">Cancel</Text>
                            </BlurView>
                        </ScaleBtn>

                        <View className='flex-row gap-5 justify-center items-center'>
                            <ScaleBtn onPressIn={saveProfileHandler}>
                                <BlurView className='h-12 px-3 flex-row justify-center items-center gap-2 rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                                    <Text className="font-bold text-xl text-[#A1A1A1]">Save</Text>
                                </BlurView>
                            </ScaleBtn>

                            {/* <PopupMenu optionItems={popupOptions} /> */}
                        </View>
                    </Animated.View>
                </Animated.View>

                <View className='relative z-10' style={{ height: insets.bottom + height + 104 }}>

                    <FloatingLabelInput
                        label={"Nombre de Usuario"}
                        // TODO: improve this
                        value={userName ?? undefined}
                        onChangeText={value => setUserName(value)}
                        // ref={userNameInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 70)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 1), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 1) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

                    <FloatingLabelInput
                        label={"Nombre"}
                        // TODO: improve this
                        value={name ?? undefined}
                        onChangeText={value => setName(value)}
                        // ref={nameInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 140)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 2), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 2) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

                    <FloatingLabelInput
                        label={"Linkedin"}
                        // TODO: improve this
                        value={linkedin ?? undefined}
                        onChangeText={value => setLinkedin(value)}
                        // ref={linkedinInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 210)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 3), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 3) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

                    <FloatingLabelInput
                        label={"Facebook"}
                        // TODO: improve this
                        value={facebook ?? undefined}
                        onChangeText={value => setFacebook(value)}
                        // ref={facebookInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 210)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 4), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 4) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

                    <FloatingLabelInput
                        label={"Instagram"}
                        // TODO: improve this
                        value={instagram ?? undefined}
                        onChangeText={value => setInstagram(value)}
                        // ref={instagramInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 210)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 4), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 4) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

                    <FloatingLabelInput
                        label={"Twitter/X"}
                        // TODO: improve this
                        value={twitterX ?? undefined}
                        onChangeText={value => setTwitterX(value)}
                        // ref={twitterXInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 210)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 5), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 5) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

                    <FloatingLabelInput
                        label={"Web"}
                        // TODO: improve this
                        value={web ?? undefined}
                        onChangeText={value => setWeb(value)}
                        // ref={webInputViewRef}
                        onFocus={async () => {
                            /* console.log({ height, topInset: insets.top, width, keyboard_height: keyboard.height.value, offsetY: offsetY.value })
                            if (((height - insets.top - width - (keyboard.height.value ?? 0)) + offsetY.value) < 210)
                                scrollRef.current?.scrollTo({ y: width }) */
                            //focusedInputOffsetY.value = withTiming((76 * 5), {
                            //    duration: 300
                            //})
                            scrollRef.current?.scrollTo({ y: (((width) / 2)) + (76 * 5) })
                        }}
                        onBlur={() => {
                            //focusedInputOffsetY.value = withTiming(0, {
                            //    duration: 300
                            //})
                        }}

                        containerStyles={{
                            height: 52,
                            marginHorizontal: 10,
                            marginTop: 24,
                            // borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
                            // borderColor: 'blue',
                            borderRadius: 8,
                        }}
                        customLabelStyles={{
                            colorFocused: Colors[colorScheme ?? "light"].border,
                            colorBlurred: Colors[colorScheme ?? "light"].border,
                            fontSizeFocused: 12,
                            fontSizeBlurred: 18,
                        }}
                        labelStyles={{
                            backgroundColor: "transparent",
                            paddingHorizontal: 5,
                        }}
                        inputStyles={{
                            marginTop: 8,
                            color: Colors[colorScheme ?? 'light'].text_dark,
                            paddingHorizontal: 10,

                            fontWeight: '400',
                            borderRadius: 10,
                            fontSize: 18,
                            textAlignVertical: 'bottom',
                        }}
                    />

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

export default ProfileEdit;