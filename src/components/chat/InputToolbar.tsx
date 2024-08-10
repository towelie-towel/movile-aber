import React, { useEffect } from 'react';
import {
    GestureResponderEvent,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from '~/constants/Colors';
import { ScaleBtn } from '../common';

interface GiftedChatScreenProps {
    messageGetter: string;
    messageSetter: React.Dispatch<React.SetStateAction<string>>;
    // emojiGetter: boolean;
    // emojiSetter: React.Dispatch<React.SetStateAction<boolean>>;
    sendMessageCallback?: () => void | null | undefined;
    cameraPressCallback?: (
        event: GestureResponderEvent,
    ) => void | null | undefined;
    attachPressCallback?: (
        event: GestureResponderEvent,
    ) => void | null | undefined;
    userUID?: string;
}

const GiftedChatScreen = (props: GiftedChatScreenProps) => {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();

    const height = useSharedValue(70);
    const maxWidth = useSharedValue('100%');
    // const opacity = useSharedValue(0);
    const opacity = useSharedValue(1);

    const heightAnimatedStyle = useAnimatedStyle(() => {
        return {
            height: withSpring(height?.value),
        };
    });

    const widthAnimatedStyle = useAnimatedStyle(() => {
        return {
            maxWidth: parseFloat(
                `${withTiming(maxWidth?.value, {
                    duration: 250,
                    easing: Easing.linear,
                })}`,
            ),
        };
    });

    const opacityAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(opacity?.value, {
                duration: 250,
                easing: Easing.circle,
            }),
        };
    });

    /**
       const keyboard = useAnimatedKeyboard();
  
       const messageInputTranslate = useAnimatedStyle(() => {
       return {
       transform: [{translateY: -keyboard?.height?.value}],
       };
       });
       */

    const [lastLength, setLastLength] = React.useState(0);

    /* useEffect(() => {
        if (props.messageGetter?.trim()?.length > 0) {
            maxWidth.value = '85%';
            opacity.value = 1;
        } else {
            maxWidth.value = '100%';
            opacity.value = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.messageGetter]); */

    /**
     * Some styles are tested and not shipped, we will use them soon.
     */
    const styles = StyleSheet.create({
        container: {
            // height: 220,
            // paddingBottom: insets.bottom,
            justifyContent: 'center',
            backgroundColor: Colors[colorScheme ?? "light"].background_light,
        },
        replyContainer: {
            paddingHorizontal: 10,
            marginHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        title: {
            marginTop: 5,
            fontWeight: 'bold',
        },
        closeReply: {
            position: 'absolute',
            right: 10,
            top: 5,
        },
        reply: {
            marginTop: 5,
        },
        innerContainer: {
            paddingHorizontal: 10 - 0.1 * 10,
            marginHorizontal: 10 - 0.1 * 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginVertical: 10 - 0.1 * 10,
        },
        inputAndMicrophone: {
            flexDirection: 'row',
            backgroundColor: Colors[colorScheme ?? "light"].background_light1,
            flex: 3,
            marginRight: 10 - 0.1 * 10,
            paddingVertical: Platform.OS === 'ios' ? 10 : 0,
            borderRadius: 30 - 0.1 * 30,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 8,
        },
        input: {
            backgroundColor: 'transparent',
            marginLeft: 12.5 - 0.1 * 12.5,
            color: Colors[colorScheme ?? "light"].text_dark,
            flex: 3,
            fontSize: 16,
            // height: 55 - 0.1 * 55,
            height: 32,
            alignSelf: 'center',
        },
        rightIconButtonStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15 - 0.1 * 15,
            marginLeft: 5 - 0.1 * 5,
            borderLeftWidth: 0,
            borderLeftColor: Colors[colorScheme ?? "light"].icons_bg, // #fff
        },
        swipeToCancelView: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 30,
        },
        swipeText: {
            color: Colors[colorScheme ?? "light"].border,
            fontSize: 15,
        },
        emoticonButton: {
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 15 - 0.1 * 15,
        },
        recordingActive: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 10,
        },
        recordingTime: {
            color: Colors[colorScheme ?? "light"].border_light,
            fontSize: 20,
            marginLeft: 5,
        },
        microphoneAndLock: {
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        lockView: {
            backgroundColor: '#eee',
            width: 60,
            alignItems: 'center',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 130,
            paddingTop: 20,
        },
        sendButton: {
            borderRadius: 55 - 0.1 * 55,
            backgroundColor: Colors[colorScheme ?? "light"].icons_bg,
            height: 55 - 0.1 * 55,
            width: 55 - 0.1 * 55,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <Animated.View
            style={[
                styles.container,
                heightAnimatedStyle /*messageInputTranslate*/,
            ]}>
            <View style={styles.innerContainer}>
                <Animated.View
                    style={[styles.inputAndMicrophone, widthAnimatedStyle]}>
                    {/* <Pressable
                        android_ripple={{
                            color: Colors[colorScheme ?? "light"].btn_light_bg,
                            borderless: true,
                            foreground: true,
                            radius: 30 - 0.1 * 30,
                        }}
                        style={styles.emoticonButton}
                        onPress={() => {
                            if (props.emojiGetter) {
                                props?.emojiSetter(false);
                            } else {
                                props?.emojiSetter(true);
                                Keyboard.dismiss();
                            }
                        }}
                    >
                        <MaterialCommunityIcons
                            name={props.emojiGetter ? 'close' : 'emoticon-outline'}
                            size={23}
                            color={Colors[colorScheme ?? "light"].border}
                        />
                    </Pressable> */}
                    <TextInput
                        multiline
                        numberOfLines={3}
                        placeholder={'Send a text'}
                        onBlur={() => Keyboard.dismiss()}
                        onFocus={() => {
                            /* if (props?.emojiGetter) {
                                props?.emojiSetter(false);
                            } */
                        }}
                        style={styles.input}
                        value={props.messageGetter}
                        onChangeText={async text => {
                            props.messageSetter(text);
                            if (text?.trim()?.length === 0) {
                                // set not typing
                            } else {
                                if (text?.trim()?.length - lastLength > lastLength) {
                                    // set typing
                                }
                            }
                            setLastLength(text?.length);
                        }}
                    />
                    <Pressable
                        android_ripple={{
                            color: Colors[colorScheme ?? "light"].btn_light_bg,
                            borderless: true,
                            radius: 30 - 0.1 * 30,
                        }}
                        style={styles.rightIconButtonStyle}
                        onPress={props.attachPressCallback}>
                        <MaterialCommunityIcons
                            name="paperclip"
                            size={23}
                            color={Colors[colorScheme ?? "light"].border}
                        />
                    </Pressable>
                    <Pressable
                        hitSlop={10}
                        android_ripple={{
                            color: Colors[colorScheme ?? "light"].btn_light_bg,
                            borderless: true,
                            radius: 30 - 0.1 * 30,
                        }}
                        style={styles.rightIconButtonStyle}
                        onPress={props.cameraPressCallback}>
                        <MaterialCommunityIcons
                            name="camera"
                            size={23}
                            color={Colors[colorScheme ?? "light"].border}
                        />
                    </Pressable>
                </Animated.View>
                <ScaleBtn
                    hitSlop={10}
                    android_ripple={{
                        color: Colors[colorScheme ?? "light"].border_light,
                        borderless: true,
                        radius: 30 - 0.1 * 30,
                    }}
                    style={styles.sendButton}
                    onPress={() => {
                        if (
                            props?.messageGetter?.trim()?.length > 0 &&
                            props.sendMessageCallback
                        ) {
                            props?.sendMessageCallback();
                        } else {
                            // TODO: implement send voice message.
                        }
                    }}>
                    {/* <Animated.View style={[opacityAnimatedStyle]}>
                        <MaterialCommunityIcons
                            adjustsFontSizeToFit
                            allowFontScaling
                            // name={props.messageGetter?.trim()?.length ? 'send' : 'microphone'}
                            name={"send"}
                            size={23}
                            color={Colors[colorScheme ?? "light"].background_light}
                        />
                    </Animated.View> */}
                    <MaterialCommunityIcons
                        adjustsFontSizeToFit
                        allowFontScaling
                        // name={props.messageGetter?.trim()?.length ? 'send' : 'microphone'}
                        name={"send"}
                        size={23}
                        color={Colors[colorScheme ?? "light"].background_light}
                    />
                </ScaleBtn>
            </View>
        </Animated.View>
    );
};

export default GiftedChatScreen;