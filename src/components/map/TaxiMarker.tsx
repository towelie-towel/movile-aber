import { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Platform } from "react-native";
import { AnimatedRegion, MapMarker, Marker } from "react-native-maps";

type AnimatedMarkerParams = {
    index: string;
    onPress: () => void;
    longitude: number;
    latitude: number;
    heading: number;
    headingAnimated?: boolean;
}

export default function TaxiMarker({ index, onPress, latitude, longitude, heading, headingAnimated }: AnimatedMarkerParams) {
    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.003;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const animatedHeading = useRef(new Animated.Value(heading)).current;

    const anim_marker_ref = useRef<MapMarker | null>(null);
    const anim_marker_coords_ref = useRef<AnimatedRegion>(new AnimatedRegion({
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    }))

    const animateTo = useCallback((toLatitude: number, toLongitude: number, heading: number) => {
        if (Platform.OS === 'android') {
            if (anim_marker_ref) {
                anim_marker_ref.current?.animateMarkerToCoordinate(
                    {
                        latitude: toLatitude,
                        longitude: toLongitude,
                    },
                    2000,
                );
            }
        } else {
            anim_marker_coords_ref.current.timing({
                duration: 2000,
                easing: Easing.linear,
                toValue: 0,
                useNativeDriver: false,
                latitudeDelta: 0,
                longitudeDelta: 0,
                latitude: toLatitude,
                longitude: toLongitude,
            }).start();
        }
        if (heading) {
            Animated.timing(animatedHeading, {
                toValue: heading,
                duration: 100,
                useNativeDriver: true
            }).start();
        }
    }, [animatedHeading])

    useEffect(() => {
        animateTo(latitude, longitude, heading)
    }, [latitude, longitude, animateTo, heading])

    return (
        <Marker.Animated
            renderToHardwareTextureAndroid
            shouldRasterizeIOS
            key={index}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            coordinate={anim_marker_coords_ref.current} ref={(_ref) => anim_marker_ref.current = _ref}
            tracksViewChanges={false}
            onPress={onPress}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={!!headingAnimated ? heading : undefined}
            icon={require("../../../assets/images/Car_Black.png")} />
    );
}