import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    type ViewProps
} from 'react-native';

type PressBtnProps = {
    onPress?: () => void;
    callback?: () => void;
    disabled?: boolean;
} & Animated.AnimatedProps<ViewProps>;

export const PressBtn: React.FC<PressBtnProps> = ({ onPress, style, children, callback, disabled = false, ...otherProps }) => {

    const animatedValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(animatedValue, {
            toValue: 0.9,
            duration: 75,
            useNativeDriver: true,
        }).start();
    };
    const handlePressOut = () => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
        }).start();
        onPress && onPress();
    };

    return (

        <Pressable disabled={disabled} onPress={callback} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
                {...otherProps}
                style={[
                    style,
                    {
                        transform: [{ scale: animatedValue }],
                        opacity: disabled ? 0.6 : 1
                    },
                ]}
            >
                {children}
            </Animated.View>
        </Pressable>
    );
}