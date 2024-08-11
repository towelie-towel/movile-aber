import React, { useEffect } from 'react';
import {
    Keyboard,
    Platform,
    StyleSheet,
    TextInput,
    useColorScheme,
    View,
    Text,
    LayoutAnimation,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from '~/constants/Colors';
import { ScaleBtn } from '../common';

interface GiftedChatScreenProps {
    messageGetter: string;
    messageSetter: React.Dispatch<React.SetStateAction<string>>;
    sendMessageCallback?: () => void | null | undefined;
    cameraPressCallback?: () => void | null | undefined;
    attachPressCallback?: () => void | null | undefined;
    userUID?: string;
}

const GiftedChatScreen = (props: GiftedChatScreenProps) => {
    const colorScheme = useColorScheme();
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    const height = useSharedValue(70);
    const maxWidth = useSharedValue('100%');

    const [recordingStep, setRecordingStep] = React.useState<'recording' | 'recorded' | null>(null);
    const [lastLength, setLastLength] = React.useState(0);
    const recording = React.useRef<Audio.Recording | null>(null);
    const [recordingCounter, setRecordingCounter] = React.useState(0);



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

    async function startRecording() {
        try {

            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording: aVRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecordingStep("recording");
            recording.current = aVRecording
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        await recording.current?.stopAndUnloadAsync();
        setRecordingStep("recorded");
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        const uri = recording.current?.getURI();
        console.log('Recording stopped and stored at', uri);
    }

    useEffect(() => {
        let recordingInterval: NodeJS.Timeout
        if (recordingStep === "recording") {
            recordingInterval = setInterval(() => {
                setRecordingCounter(prev => prev + 1)
            }, 1000)

        } else if (!recordingStep) {
            setRecordingCounter(0)
        }
        return () => {
            recordingInterval && clearInterval(recordingInterval)
        }
    }, [recordingStep])

    return (
        <Animated.View
            style={[
                styles.container,
                heightAnimatedStyle,
            ]}>
            <View style={styles.innerContainer}>
                <Animated.View
                    style={[styles.inputAndMicrophone, widthAnimatedStyle]}
                >
                    {
                        !recordingStep ?
                            <>
                                <TextInput
                                    multiline
                                    numberOfLines={3}
                                    placeholder={'Send a text'}
                                    onBlur={() => Keyboard.dismiss()}
                                    onFocus={() => { }}
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
                                <ScaleBtn
                                    style={styles.rightIconButtonStyle}
                                    onPress={props.attachPressCallback}>
                                    <MaterialCommunityIcons
                                        name="paperclip"
                                        size={23}
                                        color={Colors[colorScheme ?? "light"].border}
                                    />
                                </ScaleBtn>
                                <ScaleBtn
                                    style={styles.rightIconButtonStyle}
                                    onPress={props.cameraPressCallback}>
                                    <MaterialCommunityIcons
                                        name="camera"
                                        size={23}
                                        color={Colors[colorScheme ?? "light"].border}
                                    />
                                </ScaleBtn>
                            </>
                            :
                            <>
                                <View style={{ height: 32 }} className='flex-1 justify-center pl-3'>
                                    <Text className='text-lg text-gray-400 font-semibold'>
                                        {recordingStep === "recording" ? `${recordingCounter} Recording Audio` : `${recordingCounter} Recording Audio`}
                                    </Text>
                                </View>
                            </>
                    }
                </Animated.View>
                <ScaleBtn
                    style={styles.sendButton}
                    onPress={() => {
                        if (
                            props?.messageGetter?.trim()?.length > 0 &&
                            props.sendMessageCallback
                        ) {
                            props?.sendMessageCallback();
                        }
                    }}
                    onPressIn={() => {
                        if (
                            props?.messageGetter?.trim()?.length === 0
                        ) {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            startRecording()
                        }
                    }}
                    onPressOut={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        stopRecording()
                    }}
                >
                    <MaterialCommunityIcons
                        adjustsFontSizeToFit
                        allowFontScaling
                        name={props.messageGetter?.trim()?.length || recordingStep === "recorded" ? 'send' : 'microphone'}
                        size={23}
                        color={Colors[colorScheme ?? "light"].background_light}
                    />
                </ScaleBtn>
            </View>
        </Animated.View>
    );
};

export default GiftedChatScreen;