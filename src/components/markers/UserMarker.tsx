import { useEffect, useCallback } from "react";
import { MotiView, View } from "@motify/components";
import { Easing } from "react-native-reanimated";

import { useWSState } from "~/context/WSContext";
import AnimatedMarker from "~/components/markers/AnimatedMarker";
import AnimatedPosHeadingMarker from "~/components/markers/AnimatedPosHeadingMarker";
import { TaxiSVG } from "~/components/svgs";

type UserMarkerProps = {
    findingRide?: boolean;
    completeRide: () => void;
}

const UserMarker = ({ findingRide = false, completeRide }: UserMarkerProps) => {
    const { position, heading, confirmedTaxi } = useWSState();

    const onConfirmedTaxiChangeHandler = useCallback(() => {
        if (confirmedTaxi?.status === "completed") {
            completeRide()
        }
    }, [confirmedTaxi])
    useEffect(onConfirmedTaxiChangeHandler, [confirmedTaxi]);

    if (!position) {
        return null
    }

    if (confirmedTaxi?.status === "ongoing") {
        return (
            <AnimatedPosHeadingMarker
                headingAnimated={true}
                latitude={position?.coords.latitude}
                longitude={position?.coords.longitude}
                anchor={{ x: 0.5, y: 0.6 }}
                flat
            >
                <TaxiSVG isOnRide={!!confirmedTaxi} />
            </AnimatedPosHeadingMarker>
        )
    }

    return (
        <AnimatedMarker
            heading={heading?.magHeading ?? position?.coords.heading ?? 0}
            headingAnimated={true}
            latitude={position?.coords.latitude}
            longitude={position?.coords.longitude}
            anchor={{ x: 0.5, y: 0.6 }}
            flat
        >
            <View className='h-10 w-5 border bg-red-500'></View>
            {
                findingRide && [...Array(3).keys()].map((index) => (
                    <View key={index} className='flex-1 absolute top-[-13px] left-[-13px]'>
                        <MotiView
                            from={{ opacity: 0.7, scale: 0.2 }}
                            animate={{ opacity: 0, scale: 2 }}
                            // @ts-ignore
                            transition={{
                                type: "timing",
                                duration: 2000,
                                easing: Easing.out(Easing.ease),
                                delay: 1000 * index,
                                repeatReverse: false,
                                repeat: Infinity,
                            }}
                            style={[
                                {
                                    backgroundColor: '#FCCB6F',
                                    borderRadius: 1000,
                                    height: 50,
                                    width: 50,
                                },
                            ]}
                        />
                    </View>
                ))
            }
        </AnimatedMarker>
    )
}

export default UserMarker;