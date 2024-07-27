import React from 'react';
import { Keyboard, Pressable, SafeAreaView, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';

import Colors from '~/constants/Colors';

interface BaseViewProps {
    children: React.ReactNode;
}

const BaseView: React.FC<BaseViewProps> = ({ children }) => {
    const colorScheme = useColorScheme();

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: Colors[colorScheme ?? "light"].background_light,
        }}>
            <Pressable
                style={{
                    flex: 1,
                    backgroundColor: Colors[colorScheme ?? "light"].background_light,
                }}
                onPress={() => {
                    Keyboard.dismiss();
                }}>
                {children}
            </Pressable>
        </SafeAreaView>
    );
};

export default BaseView;