import { Easing } from "react-native-reanimated";
import { MotiView, View } from "@motify/components";

import { useWSState } from "~/context/WSContext";
import AnimatedMarker from "~/components/markers/AnimatedMarker";

type WavesMarkerProps = {
    location?: {
        position: {
            latitude: number;
            longitude: number;
        },
        heading: number;
    };
    findingRide?: boolean;
}

const UserWavesMarker = ({ findingRide = false, location }: WavesMarkerProps) => {
    const { position, heading } = useWSState();

    if (!position || !location) {
        return null
    }

    return (
        <AnimatedMarker
            heading={location?.heading ?? heading?.magHeading ?? position?.coords.heading ?? 0}
            headingAnimated={true}
            latitude={location?.position.latitude ?? position?.coords.latitude}
            longitude={location?.position.longitude ?? position?.coords.longitude}
            anchor={{ x: 0.5, y: 0.6 }}
            flat
        >
            <View className='h-10 w-5'></View>
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

export default UserWavesMarker;