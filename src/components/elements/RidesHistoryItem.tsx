import React, { useMemo } from "react"
import { View, ScrollView, Text } from "react-native"
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DBRide } from "~/types/RideFlow"

const RidesHistoryItem = ({ ride }: { ride: DBRide }) => {
    const getRideHistoryIcon = useMemo(() => {
        switch (ride.status) {
            case "calceled": return { icon: "map-marker-remove-variant", bgColor: "#242E42", color: "white" }
            case "completed": return { icon: "map-marker-check", bgColor: "#25D366", color: "white" }
            case "error": return { icon: "map-marker-alert", bgColor: "#f82f00", color: "white" }
            case "ongoing": return { icon: "map-marker-account", bgColor: "#FCCB6F", color: "white" }
            case "pending": return { icon: "map-marker-up", bgColor: "#FCCB6F", color: "white" }

            default:
                return null
        }
    }, [ride])

    return (
        <View className="flex-row items-center mt-3">
            <ScrollView contentContainerClassName='items-center' showsHorizontalScrollIndicator={false} horizontal>
                <View style={{ backgroundColor: getRideHistoryIcon?.bgColor, width: 40, height: 40 }} className="rounded-full items-center justify-center p-1 ml-3">
                    <MaterialCommunityIcons
                        // @ts-ignore
                        name={getRideHistoryIcon?.icon}
                        size={32} color={getRideHistoryIcon?.color}
                    />
                </View>
                <View className='justify-between ml-2 mr-3'>
                    <Text numberOfLines={1} className="text-[#1b1b1b] dark:text-[#d6d6d6] text-xl font-bold">
                        {ride.destination_address.split(",")[0]}
                    </Text>
                    <Text numberOfLines={1} className="text-[#1b1b1b] dark:text-[#d6d6d6] text-md font-medium">
                        {ride.destination_address}
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}

export default RidesHistoryItem;