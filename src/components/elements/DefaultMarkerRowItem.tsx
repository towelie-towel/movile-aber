import React, { useCallback } from "react";
import { useColorScheme, Animated, Easing, View, Text } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScaleBtn } from "~/components/common";
import Colors from "~/constants/Colors";
import { AddMarker } from "~/types/Marker";

const DefaultMarkerRowItem = ({ defaultMarker, color, bgColor, addHandler }: { defaultMarker: { name: string, icon: string }, addHandler: (addingMarker?: AddMarker) => void, color?: string, bgColor?: string }) => {

    const colorScheme = useColorScheme();
    const shakeAnimatedValue = React.useRef(new Animated.Value(0)).current;

    const shortShake = () => {
        shakeAnimatedValue.setValue(0);
        Animated.timing(shakeAnimatedValue,
            {
                toValue: 1,
                duration: 150,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start()
    }
    const addInnerHandler = useCallback(() => {
        addHandler(defaultMarker)
    }, [addHandler, defaultMarker])

    return (
        <View className='ml-5 items-center justify-center' key={defaultMarker.icon}>
            <ScaleBtn
                style={{ backgroundColor: bgColor ?? Colors[colorScheme ?? 'light'].border_light }}
                className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8]- dark:bg-[#444444]- items-center justify-center"
                onPress={() => {
                    shortShake()
                }}>
                <MaterialCommunityIcons
                    // @ts-ignore
                    name={defaultMarker.icon}
                    size={38}
                    color={color ?? Colors[colorScheme ?? 'light'].icons}
                />
            </ScaleBtn>
            <View className='h-12 w-full'>
                <Text className="text-lg font-semibold text-center text-[#1b1b1b] dark:text-[#C1C0C9]">{defaultMarker.name}</Text>
                <Animated.View className={""} style={{
                    transform: [{
                        translateX: shakeAnimatedValue.interpolate({
                            inputRange: [0, 0.25, 0.50, 0.75, 1],
                            outputRange: [0, 5, -5, 5, 0]
                        })
                    }]
                }}>
                    <ScaleBtn
                        className=""
                        onPress={addInnerHandler}>
                        <Text className="text-sm text-center text-[#1b1b1b] dark:text-[#C1C0C9]">Add</Text>
                    </ScaleBtn>
                </Animated.View>
            </View>
        </View>
    )
}

export default DefaultMarkerRowItem;