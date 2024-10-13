

import { View, Text } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LatLng } from 'react-native-maps';

import { useWSState } from '~/context/WSContext';
import { calculateDistance } from '~/utils/directions';
import { ConfortSVG } from '~/components/svgs';

const TaximeterRide: React.FC = () => {
    const { position } = useWSState()
    const lastPosition = useRef<LatLng | null>(null)
    const [distance, setDistance] = useState(0);
    const [time, setTime] = useState(0);

    useEffect(() => {

        if (lastPosition.current && position) {
            setDistance(distance + calculateDistance(lastPosition.current.latitude, lastPosition.current.longitude, position.coords.latitude, position.coords.longitude));
        }
        lastPosition.current = { latitude: position?.coords.latitude!, longitude: position?.coords.longitude! }
        setTime((prev) => prev + 1);

        return () => { };
    }, [position]);

    return (
        <View>
            <View className="flex-row gap-7 items-center py-2">
                {/* <ConfortSVG /> */}
                <View className="flex-row items-center justify-between flex-1 mx-1">
                    <View className="gap-2">
                        <Text className="text-xl font-medium text-[#C8C7CC] text-center">Distance</Text>
                        <Text className="text-xl font-bold">{distance.toFixed(2)} Km</Text>
                    </View>
                    <View className="gap-2">
                        <Text className="text-xl font-medium text-[#C8C7CC] text-center">Time</Text>
                        <Text className="text-xl font-bold">{time} s</Text>
                    </View>
                    <View className="gap-2">
                        <Text className="text-lg font-medium text-[#C8C7CC] text-center">Price</Text>
                        <Text className="text-xl font-bold">{(distance * 100).toFixed(2)} USD</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default TaximeterRide;