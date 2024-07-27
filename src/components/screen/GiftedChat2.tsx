import React, { useState, useCallback, useEffect } from 'react'
import { Platform, View, Text, useColorScheme, TextInput } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat'
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '~/constants/Colors';
import { ScaleBtn } from '~/components/common';

export default function GiftedChatScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const router = useRouter();

    const [messages, setMessages] = useState<any>([])

    useEffect(() => {
        setMessages([
            {
                _id: 4,
                text: 'enseguida salgo',
                createdAt: new Date("2024-07-26T18:57:00.000Z"),
                user: {
                    _id: 1,
                    name: 'julio',
                    avatar: require('../../../assets/images/taxi_test.png'),
                },
            },
            {
                _id: 3,
                text: 'ya estoy abajo',
                createdAt: new Date("2024-07-26T18:56:00.000Z"),
                user: {
                    _id: 2,
                    name: 'George Smith',
                    avatar: require('../../../assets/images/taxi_test.png'),
                },
            },
            {
                _id: 2,
                text: 'Ok aquí le espero',
                createdAt: new Date("2024-07-26T18:47:00.000Z"),
                user: {
                    _id: 1,
                    name: 'julio',
                    avatar: require('../../../assets/images/taxi_test.png'),
                },
            },
            {
                _id: 1,
                text: 'Hola ya voy en camino',
                createdAt: new Date("2024-07-26T18:46:00.000Z"),
                user: {
                    _id: 2,
                    name: 'George Smith',
                    avatar: require('../../../assets/images/taxi_test.png'),
                },
            },
        ])
    }, [])

    const onSend = useCallback((messages: any = []) => {
        setMessages((previousMessages: any) =>
            GiftedChat.append(previousMessages, messages),
        )
    }, [])

    return (
        <View style={{ paddingBottom: insets.bottom }} className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
            <View className="w-[90%] self-center mt-5 h-20- flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                    <Image
                        style={{ width: 50, height: 50 }}
                        source={require('../../../assets/images/taxi_test.png')}
                    />
                    <View className="justify-center">
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{"George Smith"}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">active now</Text>
                        </View>
                    </View>
                </View>

                <ScaleBtn onPress={() => router.back()}>
                    <MaterialCommunityIcons name="close" size={28} color={Colors[colorScheme ?? "light"].border} />
                </ScaleBtn>
            </View>

            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: 1,
                }}
                alwaysShowSend
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
                renderInputToolbar={props => {
                    return (
                        <View className='bg-transparent flex-row w-[95%] self-center'>
                            <TextInput
                                style={{
                                    position: 'relative',
                                    zIndex: 1000,

                                    flex: 1,
                                    padding: 12,
                                    fontWeight: '400',
                                    borderRadius: 10,
                                    fontSize: 16,
                                    textAlignVertical: 'center',
                                    color: Colors[colorScheme ?? 'light'].text_dark,
                                    backgroundColor: Colors[colorScheme ?? 'light'].background_light1,

                                    borderTopRightRadius: 10,
                                    borderBottomRightRadius: 10,
                                }}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor={colorScheme === 'light' ? 'black' : '#6C6C6C'}
                                placeholder='Añade un comentario'
                            />
                            <ScaleBtn onPress={() => { }} className='h-auto justify-center items-center px-3 pr-1'>
                                <MaterialCommunityIcons name="send" size={24} color={Colors[colorScheme ?? "light"].border} />
                            </ScaleBtn>
                        </View>
                    )
                }}
                renderComposer={_ => undefined}
                renderSend={_ => undefined}
                infiniteScroll
            />
        </View>
    )
}