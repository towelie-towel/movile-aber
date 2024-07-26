import React from 'react';
import { Platform, View, Text, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '~/constants/Colors';
import { ScaleBtn } from '~/components/common';

const ChatScreen = () => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const router = useRouter();

    return (
        <View className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
            <View className="w-[90%] self-center mt-5 h-20- flex-row justify-between items-center border border-orange-500">
                <View className="flex-row gap-3 items-center">
                    <Image
                        style={{ width: 50, height: 50 }}
                        source={require('../../../assets/images/taxi_test.png')}
                    />
                    <View className="justify-center">
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{"Anonymous"}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">active now</Text>
                        </View>
                    </View>
                </View>

                <ScaleBtn onPress={() => router.back()}>
                    <MaterialCommunityIcons name="close" size={28} color={Colors[colorScheme ?? "light"].border} />
                </ScaleBtn>
            </View>
            <View className='w-[90%] self-center mt-5 border border-white flex-1'>

            </View>
            <View style={{ marginBottom: insets.bottom }} className='w-[90%] h-16 self-center mt-5 border border-yellow-400'>
                <BottomSheetTextInput
                    style={{
                        position: 'relative',
                        zIndex: 1000,

                        padding: 12,
                        height: '100%',
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
            </View>
        </View>
    );
};

export default ChatScreen;
