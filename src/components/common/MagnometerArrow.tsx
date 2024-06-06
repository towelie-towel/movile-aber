import React, { memo, useEffect, useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { CardinalDirections, cardinalToDegrees } from '~/utils/directions';
import Colors from '~/constants/Colors';
import { useColorScheme } from 'react-native';

const MagnometerArrow = ({ cardinalDirection }: { cardinalDirection: CardinalDirections }) => {
    const colorScheme = useColorScheme()
    const animatedValue = useSharedValue(0);
    const directionInDegrees = cardinalToDegrees(cardinalDirection);
    const [currentAngle, setCurrentAngle] = useState(0);

    const updateAngle = (newAngle: number) => {
        let adjustedAngle = newAngle;
        if (newAngle > currentAngle + 180) {
            adjustedAngle -= 360;
        } else if (newAngle < currentAngle - 180) {
            adjustedAngle += 360;
        }
        setCurrentAngle(adjustedAngle);
    }

    useEffect(() => {
        let headingListener: any;

        (async () => {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            headingListener = await ExpoLocation.watchHeadingAsync(({ trueHeading }) => {
                updateAngle(trueHeading)
                // const deviceDirection = trueHeading < 0 ? trueHeading + 360 : trueHeading;
                // const directionDifference = directionInDegrees - deviceDirection;
                // animatedValue.value = withSpring(directionDifference);
            });
        })();

        return () => {
            if (headingListener) {
                headingListener.remove();
            }
        };
    }, [cardinalDirection]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${currentAngle}deg` }]
        }
    });

    return (
        <Animated.View style={animatedStyle}>
            <FontAwesome6 /* FontAwesome location-arrow-up */ name="location-arrow" size={24} color={Colors[colorScheme ?? 'light'].text_dark} />
        </Animated.View>
    );
};

export default memo(MagnometerArrow);