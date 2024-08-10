// import Clipboard from '@react-native-clipboard/clipboard';
// import NetInfo from '@react-native-community/netinfo';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';
import React, { useCallback, useEffect } from 'react';
import {
    BackHandler,
    Linking,
    PermissionsAndroid,
    Pressable,
    StatusBar,
    Text,
    ToastAndroid,
    useColorScheme,
    View,
    useWindowDimensions
} from 'react-native';
import {
    Bubble,
    GiftedChat,
    IMessage,
    MessageImage,
    MessageText,
    SystemMessage,
    Time,
} from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import ImageView from 'react-native-image-viewing';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { filter, isEmpty, isNull, reverse, sortBy } from 'lodash';

import { useUser } from '~/context/UserContext';
import MoonInputToolbar from '~/components/chat/InputToolbar';
import BaseView from '~/components/chat/BaseView';
import Colors from '~/constants/Colors';
import { generateUniqueId, getFirstName, getLastName } from '~/utils';
import { ScaleBtn } from '~/components/common';
import Animated from 'react-native-reanimated';
import ChatTitle from '~/components/chat/ChatTitle';
import { useAppInactive } from '~/hooks/useAppInactive';

const ChatScreen = () => {
    /* V A R I A B L E S */
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions()
    const router = useRouter();
    const { profile } = useUser()
    /* const navigation = useNavigation();
    const stackRoute = useRoute();
    const destinedUser = useMemo(() => stackRoute?.params?.item, []); */

    const [camStatus, requestCamPermission] = ImagePicker.useCameraPermissions();
    const [mediaStatus, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();

    const [statusBarColor, setStatusBarColor] = React.useState('light');
    const [isTyping, setIsTyping] = React.useState<boolean>();
    const [imageViewVisible, setImageViewVisible] = React.useState(false);

    /**
     * Message Variables
     */
    const [mMessageText, setMessageText] = React.useState('');
    const [mChatData, setChatData] = React.useState<IMessage[]>([]);
    const [isLoading, setLoading] = React.useState(true);

    let _id = profile?.id ?? generateUniqueId();
    let userName = profile?.username ?? "Anonymous";
    let userFirstName = profile?.full_name && getFirstName(profile?.full_name);
    let userLastName = profile?.full_name && getLastName(profile?.full_name);
    let userAvatar = profile?.avatar_url;
    let userPlayerID = generateUniqueId();

    /* F U N C T I O N S */

    /**
     * Called when new message from `destinedUser` in the database are avaialable
     * but not marked as sent.
     */
    const updateUserMessageSentStatus = useCallback(async () => {
    }, [/* destinedUser */]);

    /**
     * Called when new message from `Me` in the database are available
     * but not marked as sent.
     */
    const updateMySentStatus = useCallback(async () => {
    }, [/* destinedUser */]);

    /**
     * Called when `Me` enter `destinedUser` conversation
     * And we will need to mark messages as seen by `Me`
     */
    const updateSeenForHisMessages = useCallback(async () => {
    }, [/* destinedUser */]);

    /**
     * If you are in a conversation, we must mark it as it have readed.
     */
    const updateMyLastChatsRead = useCallback(async () => {
    }, [/* destinedUser */]);

    /**
     * Delete `typing` status from database.
     */
    const deleteMyTypingRef = useCallback(async () => {
    }, [/* destinedUser */]);
    /**
     * Fetch `typing` status from database..
     */
    const fetchUserIsTyping = useCallback(async () => {
    }, [/* destinedUser */]);

    /**
     * Delete message from database using param `id`
     * @param {string} messageData
     * @param {boolean} forEveryone
     */
    async function deleteMessage(messageData: string, forEveryone: boolean) {
    }

    function onLongPress(context: any, message: IMessage) {
        const options =
            message?.user?._id === _id
                ? ['Copy Message', 'Delete For Everyone', 'Delete For Me', 'Cancel']
                : ['Copy Message', 'Delete For Me', 'Cancel'];
        const cancelButtonIndex = options?.length - 1;
        context?.actionSheet()?.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            (buttonIndex: number) => {
                if (options?.length === 4) {
                    switch (buttonIndex) {
                        case 0:
                            try {
                                Clipboard?.setStringAsync(message?.text);
                            } catch (e) {
                                console.error("error during copying message")
                            }
                            break;
                        case 1:
                            try {
                                deleteMessage(message._id.toString(), true);
                            } catch (e) {
                                console.error("error during deleting message")
                            }
                            break;
                        case 2:
                            try {
                                deleteMessage(message._id.toString(), false);
                            } catch (e) {
                                console.error("error during deleting message")
                            }
                            break;
                    }
                } else {
                    switch (buttonIndex) {
                        case 0:
                            try {
                                Clipboard?.setStringAsync(message?.text);
                            } catch (e) {
                                console.error("error during deleting message")
                            }
                            break;
                        case 1:
                            try {
                                deleteMessage(message._id.toString(), false);
                            } catch (e) {
                                console.error("error during deleting message")
                            }
                            break;
                    }
                }
            },
        );
    }

    const sendMessage = useCallback(
        async (mChatData: IMessage[] = [], image: string | null) => {
            setChatData(previousMessages =>
                GiftedChat.append(previousMessages, mChatData),
            );
            setMessageText(mMessageText?.trim());
            let connectionStatus = await NetInfo?.fetch();
            if (connectionStatus?.isConnected) {
                if (!image) {
                    if (mMessageText?.trim()?.length < 1) {
                        // simply don't send an empty message to database, 'cause that's how mafia works :sunglasses:
                    } else {
                        try {
                            // Send message to user logic goes here.
                            // setMessageText(mMessageText?.trim()); // Message text already trimmed here!
                        } catch (e) {
                            console.error("a problem occured when sending a message")
                        }
                    }
                } else {
                    setChatData(previousMessage =>
                        GiftedChat.append(previousMessage, [{
                            _id: generateUniqueId(),
                            image: image,
                            user: {
                                _id,
                            },
                            text: "",
                            createdAt: new Date()
                        }]),
                    );
                }
            } else {
                console.error("Please enable Wi-Fi or Mobile data to send messages")
            }
        },
        [
            _id,
            mMessageText,
            userAvatar,
            userFirstName,
            userLastName,
        ],
    );

    const mAttachPressCallback = async () => {
        try {
            await requestMediaPermission()

            if (!mediaStatus?.granted) {
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            const image = result?.assets && result?.assets[0];

            if (image)
                sendMessage([], image.uri).finally(() => {
                    updateMySentStatus();
                    updateUserMessageSentStatus();
                    updateMyLastChatsRead();
                    const toSendNotification = {
                        contents: {
                            en: `${profile?.username}: You have a new message from ${userFirstName} ${userLastName}.`,
                        },
                        include_player_ids: [userPlayerID],
                        data: {
                            type: 'chat',
                            senderName: `${profile?.username}`,
                            senderUID: `${_id}`,
                            senderPhoto: `${profile?.avatar_url}`,
                            receiverName: `${userFirstName} ${userLastName}`,
                            receiverUID: `${"undefined"}`,
                            receiverPhoto: `${userAvatar}`,
                            imageDelivered: 'Sent a photo.',
                            messageTime: Date.now(),
                        }, // some values ain't unsed, yet, but they will be used soon.
                    };
                    const stringifiedJSON = JSON.stringify(toSendNotification);
                });
        } catch (err) {
            // Maybe something weird or the app running on iOS.
            if (__DEV__) {
                console.warn(err);
            }
        }
    };

    const mCameraPressCallback = async () => {
        try {
            await requestCamPermission()

            if (!camStatus?.granted) {
                return;
            }

            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            const image = result?.assets && result?.assets[0];

            if (image)
                sendMessage([], image.uri).finally(() => {
                    updateMySentStatus();
                    updateUserMessageSentStatus();
                    updateMyLastChatsRead();
                    const toSendNotification = {
                        contents: {
                            en: `${profile?.username}: You have a new message from ${userFirstName} ${userLastName}.`,
                        },
                        include_player_ids: [userPlayerID],
                        data: {
                            type: 'chat',
                            senderName: `${profile?.username}`,
                            senderUID: `${_id}`,
                            senderPhoto: `${profile?.avatar_url}`,
                            receiverName: `${userFirstName} ${userLastName}`,
                            receiverUID: `${"undefined"}`,
                            receiverPhoto: `${userAvatar}`,
                            imageDelivered: 'Sent a photo.',
                            messageTime: Date.now(),
                        }, // some values ain't unsed, yet, but they will be used soon.
                    };
                    const stringifiedJSON = JSON.stringify(toSendNotification);
                });
        } catch (err) {
            // Maybe something weird or the app running on iOS.
            if (__DEV__) {
                console.warn(err);
            }
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000)
        return () => {
            setLoading(true);
        }
    }, [])

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                deleteMyTypingRef();
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, []),
    );

    useAppInactive(() => {
        deleteMyTypingRef();
    });

    useEffect(() => {
        fetchUserIsTyping();
        return () => void fetchUserIsTyping();
    }, [fetchUserIsTyping]);

    useEffect(() => {
        updateMySentStatus();
        return () => void updateMySentStatus();
    }, [updateMySentStatus]);

    useEffect(() => {
        updateMyLastChatsRead();
        return () => void updateMyLastChatsRead();
    }, [updateMyLastChatsRead]);

    useEffect(() => {
        updateSeenForHisMessages();
        return () => void updateSeenForHisMessages();
    }, [updateSeenForHisMessages]);

    useEffect(() => {
        updateUserMessageSentStatus();
        return () => void updateUserMessageSentStatus();
    }, [updateUserMessageSentStatus]);

    return (
        <View style={{ paddingBottom: insets.bottom + 48 }} className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">
            <View className="w-[90%] self-center mt-5 h-20- flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                    <Image
                        style={{ width: 50, height: 50 }}
                        source={require('../../../assets/images/taxi_test.png')}
                    />
                    <View className="justify-center">
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{"Anonymous"}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">last seen recently</Text>
                        </View>
                    </View>
                </View>

                <ScaleBtn onPress={() => router.back()}>
                    <MaterialCommunityIcons name="close" size={28} color={Colors[colorScheme ?? "light"].border} />
                </ScaleBtn>
            </View>
            <BaseView>
                <GiftedChat
                    isLoadingEarlier={isLoading}
                    messageIdGenerator={() => generateUniqueId()}
                    renderLoading={() => (
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text
                                style={{
                                    fontSize: 14,
                                    textAlign: 'center',
                                    color: Colors[colorScheme ?? "light"].text_dark,
                                    opacity: 0.4,

                                }}>
                                Getting Messages, Hang on.
                            </Text>
                        </View>
                    )}
                    showAvatarForEveryMessage={false}
                    showUserAvatar={false}
                    messages={mChatData}
                    onLongPress={onLongPress}
                    /* renderTicks={(message: any) => {
                        if (message?.user?._id === _id) {
                            return (
                                <MaterialCommunityIcons
                                    name={message?.seen ? 'check-all' : 'check'}
                                    size={16}
                                    style={{
                                        paddingRight: 12,
                                    }}
                                    color={"white"}
                                />
                            );
                        } else {
                            return null
                        }
                    }} */
                    renderMessageImage={props => {
                        return (
                            <MessageImage
                                {...props}
                                containerStyle={props.containerStyle}
                                imageStyle={{
                                    width: width * 0.5,
                                    height: height * 0.2,
                                    borderRadius: 13,
                                    margin: 3,
                                    resizeMode: 'cover',
                                }}
                            />
                        );
                    }}
                    renderMessageText={props => {
                        return (
                            <MessageText
                                {...props}
                                textStyle={{
                                    left: [props?.textStyle?.left, {
                                        color: Colors[colorScheme ?? "light"].text_light,
                                        textAlign: 'right',
                                    }],
                                    right: [props?.textStyle?.right, {
                                        color: Colors[colorScheme ?? "light"].text_light,
                                        textAlign: 'left',
                                    }],
                                }}
                            />
                        );
                    }}
                    timeTextStyle={{
                        left: {
                            color: Colors[colorScheme ?? 'light'].text_dark
                        },
                        right: {
                            color: Colors[colorScheme ?? 'light'].text_dark
                        },
                    }}
                    renderBubble={props => {
                        return (
                            <Bubble
                                {...props}
                                textStyle={{
                                    right: {
                                        color: Colors[colorScheme ?? 'light'].text_light,
                                    },
                                    left: {
                                        color: Colors[colorScheme ?? 'light'].text_light,
                                    }
                                }}
                                wrapperStyle={{
                                    right: [props?.wrapperStyle?.right, {
                                        backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                                        padding: 2,
                                    }],
                                    left: [props?.wrapperStyle?.left, {
                                        backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                                        padding: 2,
                                    }],
                                }}
                            />
                        );
                    }}
                    minInputToolbarHeight={0}
                    renderInputToolbar={_ => (
                        <MoonInputToolbar
                            messageGetter={mMessageText}
                            messageSetter={setMessageText}
                            attachPressCallback={() => void mAttachPressCallback()}
                            cameraPressCallback={() => void mCameraPressCallback()}
                            sendMessageCallback={() => {
                                sendMessage([
                                    {
                                        _id: generateUniqueId(),
                                        text: mMessageText?.trim(),
                                        createdAt: Date.now(),
                                        user: {
                                            _id: _id
                                        }
                                    }
                                ], null).finally(() => {
                                    updateMySentStatus();
                                    updateUserMessageSentStatus();
                                    updateMyLastChatsRead();
                                    const toSendNotification = {
                                        contents: {
                                            en: `${profile?.username}: You have a new message from ${userFirstName} ${userLastName}.`,
                                        },
                                        include_player_ids: [userPlayerID],
                                        data: {
                                            type: 'chat',
                                            senderName: `${profile?.username}`,
                                            senderUID: `${_id}`,
                                            senderPhoto: `${profile?.avatar_url}`,
                                            receiverName: `${userFirstName} ${userLastName}`,
                                            receiverUID: `${"undefined"}`,
                                            receiverPhoto: `${userAvatar}`,
                                            messageDelivered: `${mMessageText?.trim()}`,
                                            messageTime: Date.now(),
                                        }, // some values ain't unsed, yet, but they will be used soon.
                                    };
                                    const stringifiedJSON = JSON.stringify(toSendNotification);
                                    setMessageText('');
                                });
                            }}
                            userUID={`${"undefined"}`}
                        />
                    )}
                    renderComposer={_ => undefined}
                    /* renderSystemMessage={props => {
                        return (
                            <SystemMessage
                                {...props}
                                textStyle={props?.textStyle}
                            />
                        );
                    }} */
                    renderTime={props => {
                        return (
                            <Time
                                {...props}
                                containerStyle={{
                                    right: {
                                        marginLeft: 10,
                                        marginRight: 10,
                                        marginBottom: 5,
                                        paddingTop: 2.5,
                                    },
                                    left: {
                                        marginLeft: 10,
                                        marginRight: 10,
                                        marginBottom: 5,
                                        paddingTop: 2.5,
                                    },
                                }}
                                timeTextStyle={{
                                    left: [props?.timeTextStyle?.left, {
                                        fontSize: 11,
                                    }],
                                    right: [props?.timeTextStyle?.right, {
                                        fontSize: 11,
                                    }],
                                }}
                            />
                        );
                    }}
                    shouldUpdateMessage={() => {
                        return true;
                    }}
                    parsePatterns={linkStyle => [
                        {
                            pattern: /#(\w+)/,
                            style: { ...linkStyle, color: Colors[colorScheme ?? "light"].primary },
                            onPress: undefined,
                        },
                    ]}
                    onPressAvatar={() => {
                        setStatusBarColor('dark');
                        setImageViewVisible(true);
                    }}
                    user={{
                        _id: _id ?? generateUniqueId(),
                        avatar: profile?.avatar_url ?? require('../../../assets/images/taxi_test.png'),
                        name: profile?.username ?? "Anonymous",
                    }}
                    scrollToBottom
                />
                {isTyping ? (
                    <View
                        style={{
                            marginLeft: '2%',
                            marginRight: '0.5%',
                            marginBottom: '0.25%',
                        }}>
                        <Text
                            style={{
                                fontSize: 14,
                                color: Colors[colorScheme ?? "light"].text_dark,
                                opacity: 0.5,
                            }}>{`${userFirstName} is typing...`}</Text>
                    </View>
                ) : (
                    <></>
                )}

                <Animated.View></Animated.View>
                <ImageView
                    images={[userAvatar ? { uri: userAvatar } : require('../../../assets/images/taxi_test.png')]}
                    imageIndex={0}
                    visible={imageViewVisible}
                    animationType={'slide'}
                    onRequestClose={() => {
                        setStatusBarColor('light');
                        setImageViewVisible(false);
                    }}
                    presentationStyle={'fullScreen'}
                />
            </BaseView>
        </View>
    );
};

export default ChatScreen;