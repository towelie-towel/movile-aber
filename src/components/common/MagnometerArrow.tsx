import React, { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { CardinalDirections, cardinalToDegrees } from '~/utils/directions';

const MagnometerArrow = ({ cardinalDirection }: { cardinalDirection: CardinalDirections }) => {
    const animatedValue = useSharedValue(0);
    const directionInDegrees = cardinalToDegrees(cardinalDirection);

    useEffect(() => {
        let headingListener: any;

        (async () => {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            headingListener = await ExpoLocation.watchHeadingAsync(({ trueHeading }) => {
                const deviceDirection = trueHeading < 0 ? trueHeading + 360 : trueHeading;
                const directionDifference = directionInDegrees - deviceDirection;
                animatedValue.value = withSpring(directionDifference);
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
            transform: [{ rotateZ: `${animatedValue.value}deg` }],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <FontAwesome name="arrow-up" size={32} color="black" />
        </Animated.View>
    );
};

export default MagnometerArrow;