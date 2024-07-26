import React from 'react';
import { Platform, View, Text, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '~/constants/Colors';
import { ScaleBtn } from '~/components/common';

const ChatScreen = () => {
    const colorScheme = useColorScheme();

    return (
        <View className="flex-1 bg-[#F8F8F8] dark:bg-[#1b1b1b]">
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
            <View className="w-[90%] self-center mt-5 h-20 flex-row justify-between items-center">
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

                <ScaleBtn>
                    <MaterialCommunityIcons name="close" size={28} color={Colors[colorScheme ?? "light"].border} />
                </ScaleBtn>
            </View>
        </View>
    );
};

export default ChatScreen;
