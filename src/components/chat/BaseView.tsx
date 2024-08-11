import React from 'react';
import { Keyboard, Pressable, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import Colors from '~/constants/Colors';
import { LightBoxProvider } from '~/lib/lightbox';

interface BaseViewProps {
    children: React.ReactNode;
}

const BaseView: React.FC<BaseViewProps> = ({ children }) => {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: Colors[colorScheme ?? "light"].background_light,
                paddingBottom: insets.bottom + 18
            }}
        >
            <LightBoxProvider>
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
            </LightBoxProvider>
        </SafeAreaView>
    );
};

export default BaseView;