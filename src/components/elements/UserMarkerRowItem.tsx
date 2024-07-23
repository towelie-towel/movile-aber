import React, { useCallback, useEffect } from "react";
import { Animated, useColorScheme, Easing, LayoutAnimation, View, Text } from "react-native";
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';

import { ScaleBtn } from "~/components/common";
import { UserMarkerIconType } from "~/components/markers/AddUserMarker";
import Colors from "~/constants/Colors";

const UserMarkerRowItem = ({ userMarker, color, bgColor, pressHandler, editingMarkers, deleteHandler }: { userMarker: UserMarkerIconType, pressHandler: (addingMarker: UserMarkerIconType) => void, color?: string, bgColor?: string, editingMarkers: boolean, deleteHandler: (deletingMarker: UserMarkerIconType) => void }) => {

    const shakeAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const colorScheme = useColorScheme();

    const pressInnerHandler = useCallback(() => {
        if (editingMarkers) {
            console.warn("case not handled yet")
        } else {
            pressHandler(userMarker)
        }
    }, [editingMarkers, userMarker, pressHandler])
    const deleteInnerHandler = useCallback(() => {
        if (editingMarkers) {
            deleteHandler(userMarker)
        } else {
            console.warn("case not handled yet")
        }
    }, [editingMarkers, userMarker, deleteHandler])

    const startShaking = () => {
        Animated.loop(
            Animated.timing(shakeAnimatedValue, {
                toValue: 1,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };
    const stopShaking = () => {
        shakeAnimatedValue.stopAnimation();
        shakeAnimatedValue.setValue(0);
    };
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (editingMarkers) {
            startShaking();
        } else {
            stopShaking();
        }
    }, [editingMarkers]);


    return (
        <View className='relative ml-5 items-center justify-center' key={userMarker.id}>
            <Animated.View className={""}
                style={{
                    transform: [
                        {
                            rotate: shakeAnimatedValue.interpolate({
                                inputRange: [0, 0.25, 0.5, 0.75, 1],
                                outputRange: ["0deg", "5deg", "-5deg", "5deg", "0deg"],
                            }),
                        },
                    ],
                }}
            >
                <ScaleBtn
                    style={{ backgroundColor: bgColor ?? Colors[colorScheme ?? 'light'].border_light }}
                    className="w-[64px] h-[64px] rounded-full bg-[#D8D8D8] dark:bg-[#444444]- items-center justify-center"
                    onPress={pressInnerHandler}
                >
                    <MaterialCommunityIcons
                        // @ts-ignore
                        name={userMarker.icon.name}
                        size={38}
                        color={color ?? Colors[colorScheme ?? 'light'].icons}
                    />
                </ScaleBtn>
            </Animated.View>
            {editingMarkers &&
                (
                    <ScaleBtn onPress={deleteInnerHandler} containerStyle={{ position: "absolute", right: 0 }}>
                        <FontAwesome6 name="circle-minus" size={24} color={Colors[colorScheme ?? 'light'].delete} />
                    </ScaleBtn>
                )
            }
            <View className='h-12 w-full'>
                <Text className="text-lg font-semibold text-center text-[#1b1b1b] dark:text-[#C1C0C9]">{userMarker.name}</Text>
            </View>
        </View>
    )
}

export default UserMarkerRowItem;