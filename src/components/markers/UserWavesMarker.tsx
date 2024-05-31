import { MotiView, View } from "@motify/components";
import { Easing } from "react-native-reanimated";

import { useWSConnection } from "~/context/WSContext";
import AnimatedMarker from "./AnimatedMarker";

type WavesMarkerProps = {
    location?: {
        position: {
            latitude: number;
            longitude: number;
        },
        heading: number;
    };
    activeWaves?: boolean;
}

const UserWavesMarker = ({ activeWaves = false, location }: WavesMarkerProps) => {
    const { position, heading } = useWSConnection();

    if (!position || !location) {
        return null
    }

    return (
        <AnimatedMarker
            heading={location?.heading ?? heading?.magHeading!}
            headingAnimated={true}
            latitude={location?.position.latitude ?? position?.coords.latitude}
            longitude={location?.position.longitude ?? position?.coords.longitude}
            anchor={{ x: 0.5, y: 0.6 }}
            flat
        >
            <View className='h-10 w-5'></View>
            {
                activeWaves && [...Array(3).keys()].map((index) => (
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