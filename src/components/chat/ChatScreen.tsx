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
import { useRouter } from 'expo-router';
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

    // const [emojiKeyboardOpened, setEmojiKeyboardOpened] = React.useState(false);

    /* F U N C T I O N S */

    /**
     * Called when new message from `destinedUser` in the database are avaialable
     * but not marked as sent.
     */
    const updateUserMessageSentStatus = useCallback(async () => {
        /* const userMessageRef = await firestore()
            .collection('users')
            .doc(destinedUser)
            .collection('messages')
            .doc(auth()?.currentUser?.uid)
            .collection('discussions')
            .get();
        const batchUpdate = firestore().batch();
        userMessageRef?.docChanges()?.forEach(change => {
            if (change?.doc?.data()?.sent === false) {
                batchUpdate?.update(change?.doc?.ref, {
                    sent: true,
                });
            }
        });
        return batchUpdate?.commit(); */
    }, [/* destinedUser */]);

    /**
     * Called when new message from `Me` in the database are available
     * but not marked as sent.
     */
    const updateMySentStatus = useCallback(async () => {
        /* const userMessageRef = await firestore()
            .collection('users')
            .doc(auth()?.currentUser?.uid)
            .collection('messages')
            .doc(destinedUser)
            .collection('discussions')
            .get();
        const batchUpdate = firestore().batch();
        userMessageRef?.docChanges()?.forEach(change => {
            if (change?.doc?.data()?.sent === false) {
                batchUpdate?.update(change?.doc?.ref, {
                    sent: true,
                });
            }
        });
        return batchUpdate?.commit(); */
    }, [/* destinedUser */]);

    /**
     * Called when `Me` enter `destinedUser` conversation
     * And we will need to mark messages as seen by `Me`
     */
    const updateSeenForHisMessages = useCallback(async () => {
        /* const mySeenMessageRef = await firestore()
            .collection('users')
            .doc(destinedUser)
            .collection('messages')
            .doc(auth()?.currentUser?.uid)
            .collection('discussions')
            .get();
        const batchUpdate = firestore().batch();
        mySeenMessageRef?.docChanges()?.forEach(change => {
            if (change?.doc?.data()?.seen === false) {
                batchUpdate?.update(change?.doc?.ref, {
                    seen: true,
                });
            }
        });
        return batchUpdate?.commit(); */
    }, [/* destinedUser */]);

    /**
     * If you are in a conversation, we must mark it as it have readed.
     */
    const updateMyLastChatsRead = useCallback(async () => {
        /* const lastChatsMessageRef = await firestore()
            .collection('chats')
            .doc(auth()?.currentUser?.uid)
            .collection('discussions')
            .get();
        const batchUpdate = firestore().batch();
        lastChatsMessageRef?.docChanges()?.forEach(change => {
            if (change?.doc?.id === destinedUser) {
                if (change?.doc?.data()?.read === false) {
                    batchUpdate?.update(change?.doc?.ref, {
                        read: true,
                    });
                }
            }
        });
        return batchUpdate?.commit(); */
    }, [/* destinedUser */]);

    /**
     * Delete `typing` status from database.
     */
    const deleteMyTypingRef = useCallback(async () => {
        /* const myTypingRef = firestore()
            .collection('chats')
            .doc(destinedUser)
            .collection('discussions')
            .doc(auth()?.currentUser?.uid);
        return await myTypingRef?.get()?.then(documentSnapshot => {
            if (documentSnapshot?.exists) {
                if (!isNull(documentSnapshot?.data()?.typing)) {
                    documentSnapshot?.ref?.update({
                        typing: null,
                    });
                }
            }
        }); */
    }, [/* destinedUser */]);
    /**
     * Fetch `typing` status from database..
     */
    const fetchUserIsTyping = useCallback(async () => {
        /* const userTypingRef = await firestore()
            .collection('chats')
            .doc(auth()?.currentUser?.uid)
            .collection('discussions')
            .get();
        userTypingRef?.docChanges()?.forEach(change => {
            if (change?.doc?.id === destinedUser) {
                if (!isNull(change?.doc?.data()?.typing)) {
                    if (
                        firestore.Timestamp.fromDate(new Date())?.toDate()?.getTime() -
                        change?.doc?.data()?.typing?.toDate()?.getTime() <
                        10000
                    ) {
                        setIsTyping(true);
                    } else {
                        setIsTyping(false);
                    }
                } else {
                    setIsTyping(false);
                }
            }
        }); */
    }, [/* destinedUser */]);

    /**
     * Delete message from database using param `id`
     * @param {string} messageData
     * @param {boolean} forEveryone
     */
    async function deleteMessage(messageData: string, forEveryone: boolean) {
        /* const meMessageRef = firestore()
            .collection('users')
            .doc(auth()?.currentUser?.uid)
            .collection('messages')
            .doc(destinedUser)
            .collection('discussions');
        const userMessageRef = firestore()
            .collection('users')
            .doc(destinedUser)
            .collection('messages')
            .doc(auth()?.currentUser?.uid)
            .collection('discussions'); */
        /* if (forEveryone) {
            await meMessageRef?.get()?.then(collectionSnapshot => {
                collectionSnapshot?.docs?.map(documentSnapshot => {
                    if (documentSnapshot?.id === messageData?.id) {
                        documentSnapshot?.ref?.delete();
                        filter(mChatData, element => {
                            return element?.id === messageData?.id;
                        });
                    }
                });
            });
            await userMessageRef?.get()?.then(collectionSnapshot => {
                collectionSnapshot?.docs.map(documentSnapshot => {
                    if (documentSnapshot?.data()?._id === messageData?._id) {
                        documentSnapshot?.ref?.delete();
                        filter(mChatData, element => {
                            return element?.id === messageData?.id;
                        });
                    }
                });
            });
        } else {
            return await meMessageRef?.get()?.then(collectionSnapshot => {
                collectionSnapshot?.docs?.map(documentSnapshot => {
                    if (documentSnapshot?.id === messageData?.id) {
                        documentSnapshot?.ref?.delete();
                        filter(mChatData, element => {
                            element?.id === messageData?.id;
                        });
                    }
                });
            });
        } */
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
                                /* new ErrorToast(
                                    'bottom',
                                    'Unexpected Error Occured',
                                    `${e}`,
                                    true,
                                    1500,
                                ); */
                            }
                            break;
                        case 1:
                            try {
                                deleteMessage(message._id.toString(), true);
                            } catch (e) {
                                console.error("error during deleting message")
                                /* new ErrorToast(
                                    'bottom',
                                    'Unexpected Error Occured',
                                    `${e}`,
                                    true,
                                    1500,
                                ); */
                            }
                            break;
                        case 2:
                            try {
                                deleteMessage(message._id.toString(), false);
                            } catch (e) {
                                console.error("error during deleting message")
                                /* new ErrorToast(
                                    'bottom',
                                    'Unexpected Error Occured',
                                    `${e}`,
                                    true,
                                    1500,
                                ); */
                            }
                            break;
                    }
                } else {
                    switch (buttonIndex) {
                        case 0:
                            try {
                                Clipboard?.setStringAsync(message?.text);
                            } catch (e) {
                                /* new ErrorToast(
                                    'bottom',
                                    'Unexcpected Error Occured',
                                    `${e}`,
                                    true,
                                    1500,
                                ); */
                            }
                            break;
                        case 1:
                            try {
                                deleteMessage(message._id.toString(), false);
                            } catch (e) {
                                console.error("error during deleting message")
                                /* new ErrorToast(
                                    'bottom',
                                    'Unexcpected Error Occured',
                                    `${e}`,
                                    true,
                                    1500,
                                ); */
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
                            /* firestore()
                                .collection('users')
                                .doc(auth()?.currentUser?.uid)
                                .collection('messages')
                                .doc(destinedUser)
                                .collection('discussions')
                                .add({
                                    _id: _id,
                                    text: EncryptAES(mMessageText),
                                    createdAt: Date.now(),
                                    sent: false,
                                    seen: false,
                                    user: {
                                        _id: auth()?.currentUser?.uid,
                                    },
                                });
                            firestore()
                                .collection('users')
                                .doc(destinedUser)
                                .collection('messages')
                                .doc(auth()?.currentUser?.uid)
                                .collection('discussions')
                                .add({
                                    _id: _id,
                                    createdAt: Date.now(),
                                    text: EncryptAES(mMessageText),
                                    sent: false,
                                    seen: false,
                                    user: {
                                        _id: auth()?.currentUser?.uid,
                                    },
                                }); */
                            // setChatData(previousMessages =>
                            //     GiftedChat.append(previousMessages, mChatData),
                            // );
                            // HomeScreen recent chats.

                            /* firestore()
                                .collection('chats')
                                .doc(auth()?.currentUser?.uid)
                                .collection('discussions')
                                .doc(destinedUser)
                                .set({
                                    to_first_name: userFirstName,
                                    to_last_name: userLastName,
                                    to_message_text: EncryptAES(mMessageText),
                                    to_avatar: userAvatar,
                                    time: firestore?.Timestamp?.fromDate(new Date()),
                                    type: 'message',
                                    last_uid: auth()?.currentUser?.uid,
                                    sent_to_uid: destinedUser,
                                    read: false,
                                    typing: null,
                                });
                            firestore()
                                .collection('chats')
                                .doc(destinedUser)
                                .collection('discussions')
                                .doc(auth()?.currentUser?.uid)
                                .set({
                                    to_first_name: Me?.first_name,
                                    to_last_name: Me?.last_name,
                                    to_message_text: EncryptAES(mMessageText),
                                    to_avatar: Me?.avatar,
                                    time: firestore?.Timestamp?.fromDate(new Date()),
                                    type: 'message',
                                    last_uid: auth()?.currentUser?.uid,
                                    read: false,
                                    typing: null,
                                }); */
                        } catch (e) {
                            console.error("a problem occured when sending a message")
                            /* new ErrorToast(
                                'bottom',
                                'Failed to send message',
                                'a problem occured when sending a message',
                                true,
                                1000,
                            ); */
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

                    /* let pickedImage = `chats/images/${getRandomString(
                        18,
                    )}.${image?.substring(image?.lastIndexOf('.') + 1, 3)}`;

                    const storageRef = storage().ref(pickedImage); */

                    /**
                     * Uploading image to Firebase Storage
                     * @type {FirebaseStorageTypes.Task}
                     */

                    /* const uploadImageTask = storageRef?.putFile(image); */

                    /**
                     * Add observer to image uploading.
                     */

                    /* uploadImageTask.on('state_changed', taskSnapshot => {
                        new InfoToast(
                            'bottom',
                            'Sending Image',
                            `${bytesToSize(
                                taskSnapshot?.bytesTransferred,
                            )} transferred out of ${bytesToSize(taskSnapshot?.totalBytes)}`,
                            true,
                            500,
                        );
                    }); */

                    /**
                     * an async function to get {avatarUrl} and upload all user data.
                     */
                    /* uploadImageTask.then(async () => {
                        const uploadedImageURL = await storage()
                            .ref(pickedImage)
                            .getDownloadURL();
                        firestore()
                            .collection('users')
                            .doc(auth()?.currentUser?.uid)
                            .collection('messages')
                            .doc(destinedUser)
                            .collection('discussions')
                            .add({
                                _id: _id,
                                image: EncryptAES(uploadedImageURL),
                                seen: false,
                                sent: false,
                                createdAt: Date.now(),
                                user: {
                                    _id: auth()?.currentUser?.uid,
                                },
                            });
                        firestore()
                            .collection('users')
                            .doc(destinedUser)
                            .collection('messages')
                            .doc(auth()?.currentUser?.uid)
                            .collection('discussions')
                            .add({
                                _id: _id,
                                createdAt: Date.now(),
                                image: EncryptAES(uploadedImageURL),
                                seen: false,
                                sent: false,
                                user: {
                                    _id: auth()?.currentUser?.uid,
                                },
                            });
                        setChatData(previousMessage =>
                            GiftedChat.append(previousMessage, mChatData),
                        );
                        // Chats messages on home screen goes here
                        if (
                            !isEmpty(userFirstName) &&
                            !isEmpty(userLastName) &&
                            !isEmpty(userAvatar)
                        ) {
                            firestore()
                                .collection('chats')
                                .doc(auth()?.currentUser?.uid)
                                .collection('discussions')
                                .doc(destinedUser)
                                .set({
                                    to_first_name: userFirstName,
                                    to_last_name: userLastName,
                                    to_message_image: EncryptAES(uploadedImageURL),
                                    to_avatar: userAvatar,
                                    time: firestore?.Timestamp?.fromDate(new Date()),
                                    type: 'image',
                                    last_uid: auth()?.currentUser?.uid,
                                    sent_to_uid: destinedUser,
                                    read: false,
                                    typing: null,
                                });
                        }
                        firestore()
                            .collection('chats')
                            .doc(destinedUser)
                            .collection('discussions')
                            .doc(auth()?.currentUser?.uid)
                            .set({
                                to_first_name: Me?.first_name,
                                to_last_name: Me?.last_name,
                                to_message_image: EncryptAES(uploadedImageURL),
                                to_avatar: Me?.avatar,
                                time: firestore?.Timestamp?.fromDate(new Date()),
                                type: 'image',
                                last_uid: auth()?.currentUser?.uid,
                                read: false,
                                typing: null,
                            });
                    }); */
                }
            } else {
                console.error("Please enable Wi-Fi or Mobile data to send messages")
                /* new ErrorToast(
                    'bottom',
                    'Internet connection required',
                    'Please enable Wi-Fi or Mobile data to send messages',
                    true,
                    1000,
                ); */
            }
        },
        [
            /* Me?.avatar,
            Me?.first_name,
            Me?.last_name, */
            _id,
            /* destinedUser, */
            mMessageText,
            userAvatar,
            userFirstName,
            userLastName,
        ],
    );

    /* const handlePick = emojiObject => {
        setMessageText(mMessageText + emojiObject?.emoji);
    }; */

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
                    /* OneSignal.postNotification(
                        stringifiedJSON,
                        success => {
                            if (__DEV__) {
                                ToastAndroid.show(
                                    'Message notification sent',
                                    ToastAndroid.SHORT,
                                );
                                console.log(success);
                            }
                        },
                        error => {
                            if (__DEV__) {
                                console.error(error);
                            }
                        },
                    ); */
                });
            /* const requestResult = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message:
                        'Moon Meet requires this permission to access your phone storage',
                    buttonNegative: 'Deny',
                    buttonPositive: 'Grant',
                },
            );
            if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
                
                
            } else if (
                requestResult === PermissionsAndroid.RESULTS.DENY ||
                PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ) {
                try {
                    Linking?.openSettings();
                    ToastAndroid.show(
                        'Please grant storage permission manually',
                        ToastAndroid.SHORT,
                    );
                } catch (error) {
                    if (__DEV__) {
                        console.error(error);
                    }
                }
            } */
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
                    /* OneSignal.postNotification(
                        stringifiedJSON,
                        success => {
                            if (__DEV__) {
                                ToastAndroid.show(
                                    'Message notification sent',
                                    ToastAndroid.SHORT,
                                );
                                console.log(success);
                            }
                        },
                        error => {
                            if (__DEV__) {
                                console.error(error);
                            }
                        },
                    ); */
                });
            /* const requestResult = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Camera Permission',
                    message: 'Moon Meet requires this permission to access your camera',
                    buttonNegative: 'Deny',
                    buttonPositive: 'Grant',
                },
            );
            if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
                
            } else if (
                requestResult === PermissionsAndroid.RESULTS.DENY ||
                PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ) {
                try {
                    Linking?.openSettings();
                    ToastAndroid.show(
                        'Please grant camera permission manually',
                        ToastAndroid.SHORT,
                    );
                } catch (error) {
                    if (__DEV__) {
                        console.error(error);
                    }
                }
            } */
        } catch (err) {
            // Maybe something weird or the app running on iOS.
            if (__DEV__) {
                console.warn(err);
            }
        }
    };

    /* H O O K S */

    /* useEffect(() => {
        const userSubscribe = firestore()
            .collection('users')
            .doc(destinedUser)
            .onSnapshot(userSnapshot => {
                if (userSnapshot?.exists) {
                    if (
                        userSnapshot?.data()?.avatar &&
                        userSnapshot?.data()?.first_name &&
                        userSnapshot?.data()?.last_name
                    ) {
                        setUserFirstName(userSnapshot?.data()?.first_name);
                        setUserLastName(userSnapshot?.data()?.last_name);
                        setUserAvatar(userSnapshot?.data()?.avatar);
                        setUserActiveStatus(userSnapshot?.data()?.active_status);
                        setUserPlayerID(userSnapshot?.data()?.OneSignalID);
                        if (userSnapshot?.data()?.active_time === 'Last seen recently') {
                            setUserActiveTime(userSnapshot?.data()?.active_time);
                        } else {
                            setUserActiveTime(userSnapshot?.data()?.active_time?.toDate());
                        }
                    }
                }
            });
        return () => userSubscribe();
    }, []); */

    /* useEffect(() => {
        const messagesSubscribe = firestore()
            .collection('users')
            .doc(auth()?.currentUser?.uid)
            .collection('messages')
            .doc(destinedUser)
            .collection('discussions')
            .onSnapshot(collectionSnapshot => {
                if (collectionSnapshot?.empty) {
                    setChatData([]);
                } else {
                    let collectionDocs = collectionSnapshot?.docs?.map(subMap => {
                        if (subMap?.data()?.image) {
                            return {
                                ...subMap?.data(),
                                id: subMap?.id,
                                seen: subMap?.data()?.seen,
                                sent: subMap?.data()?.sent,
                                image: DecryptAES(subMap?.data()?.image),
                                user: {
                                    _id:
                                        subMap?.data()?.user?._id === auth()?.currentUser?.uid
                                            ? auth()?.currentUser?.uid
                                            : destinedUser,
                                    name:
                                        subMap?.data()?.user?._id === auth()?.currentUser?.uid
                                            ? auth()?.currentUser?.displayName
                                            : userFirstName + ' ' + userLastName,
                                    avatar:
                                        subMap?.data()?.user?._id === auth()?.currentUser?.uid
                                            ? auth()?.currentUser?.photoURL
                                            : userAvatar,
                                },
                            };
                        } else {
                            return {
                                ...subMap?.data(),
                                id: subMap?.id,
                                text: DecryptAES(subMap?.data()?.text),
                                seen: subMap?.data()?.seen,
                                sent: subMap?.data()?.sent,
                                user: {
                                    _id:
                                        subMap?.data()?.user?._id === auth()?.currentUser?.uid
                                            ? auth()?.currentUser?.uid
                                            : destinedUser,
                                    name:
                                        subMap?.data()?.user?._id === auth()?.currentUser?.uid
                                            ? auth()?.currentUser?.displayName
                                            : userFirstName + ' ' + userLastName,
                                    avatar:
                                        subMap?.data()?.user?._id === auth()?.currentUser?.uid
                                            ? auth()?.currentUser?.photoURL
                                            : userAvatar,
                                },
                            };
                        }
                    });
                    filter(collectionDocs, [
                        (docs, index) => {
                            if (docs?.image) {
                                collectionDocs[index].text = '';
                            }
                        },
                    ]);
                    collectionDocs = sortBy(collectionDocs, [docs => docs?.createdAt]);
                    collectionDocs = reverse(collectionDocs);
                    setChatData(collectionDocs);
                }
                setLoading(false);
            });
        return () => {
            messagesSubscribe();
            setLoading(true);
        };
    }, [
        Me?.avatar,
        Me?.first_name,
        Me?.last_name,
        destinedUser,
        userAvatar,
        userFirstName,
        userLastName,
    ]); */

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000)
        return () => {
            setLoading(true);
        }
    }, [])

    /* useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                deleteMyTypingRef();
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, []),
    ); */

    /* useAppInactive(() => {
        deleteMyTypingRef();
    }); */

    /* useEffect(() => {
        fetchUserIsTyping();
        return () => fetchUserIsTyping();
    }, [fetchUserIsTyping]);

    useEffect(() => {
        updateMySentStatus();
        return () => updateMySentStatus();
    }, [updateMySentStatus]);

    useEffect(() => {
        updateMyLastChatsRead();
        return () => updateMyLastChatsRead();
    }, [updateMyLastChatsRead]);

    useEffect(() => {
        updateSeenForHisMessages();
        return () => updateSeenForHisMessages();
    }, [updateSeenForHisMessages]);

    useEffect(() => {
        updateUserMessageSentStatus();
        return () => updateUserMessageSentStatus();
    }, [updateUserMessageSentStatus]); */

    /* useEffect(() => {
        navigation?.setOptions({
            headerTitle: props => (
                <ChatTitle
                    {...props}
                    firstName={userFirstName}
                    lastName={userLastName}
                    avatar={userAvatar}
                    myStatus={Me?.active_status}
                    userStatus={userActiveStatus}
                    userTime={userActiveTime}
                />
            ),
        });
        return () => {
            navigation?.setOptions({
                headerTitle: null,
            });
        };
    }, [
        Me?.active_status,
        navigation,
        userActiveStatus,
        userActiveTime,
        userAvatar,
        userFirstName,
        userLastName,
    ]); */

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
                            // emojiGetter={emojiKeyboardOpened}
                            // emojiSetter={setEmojiKeyboardOpened}
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
                                    /* OneSignal.postNotification(
                                        stringifiedJSON,
                                        success => {
                                            if (__DEV__) {
                                                ToastAndroid.show(
                                                    'Message notification sent',
                                                    ToastAndroid.SHORT,
                                                );
                                                console.log(success);
                                            }
                                        },
                                        error => {
                                            if (__DEV__) {
                                                console.error(error);
                                            }
                                        },
                                    ); */
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
                {/* <Divider leftInset={false} /> */}
                {/* <View className='w-[100%] self-center mb-1 border border-gray-600' /> */}

                {/* {emojiKeyboardOpened ? (
                    <EmojiKeyboard
                        emojiSize={28 - 0.1 * 28}
                        onEmojiSelected={handlePick}
                        enableRecentlyUsed
                        containerStyles={{ borderRadius: 0 }}
                    />
                ) : (
                    <></>
                )} */}
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