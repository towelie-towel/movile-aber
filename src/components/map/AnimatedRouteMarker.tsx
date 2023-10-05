import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { type LatLng } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import { getDirections } from '~/utils/helpers';
import Colors from '~/constants/Colors';
import AnimatedMarker from '~/components/map/AnimatedMarker';

const AnimatedRouteMarker = () => {

    const { colorScheme } = useColorScheme();

    const anim_route_ref = useRef<LatLng[]>([])
    const route_count_ref = useRef(0);
    const [current_coords, set_current_coords] = useState<{ latitude: number, longitude: number }>({
        latitude: 23.1218644,
        longitude: -82.32806211,
    });


    const _getLiveLocation = useCallback(() => {
        if (anim_route_ref.current.length !== route_count_ref.current) {

            const latitude = anim_route_ref.current[route_count_ref.current + 1]?.latitude;
            const longitude = anim_route_ref.current[route_count_ref.current + 1]?.longitude;
            route_count_ref.current = route_count_ref.current + 1

            if (!latitude || !longitude) {
                return
            }

            set_current_coords({ latitude, longitude });

        } else {
            route_count_ref.current = 0
        }
    }, [anim_route_ref, route_count_ref])


    useEffect(() => {

        void (async () => {
            const new_direction = await getDirections("23.1218644,-82.32806211", "23.1118644,-82.31806211")
            anim_route_ref.current = new_direction ?? []
        }
        )()

        const interbal_sub = setInterval(() => {
            _getLiveLocation()
        }, 3000)

        return () => {
            clearInterval(interbal_sub)
        }

    }, [_getLiveLocation])

    return (
        <>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                anim_route_ref.current.length > 0 && <AnimatedMarker latitude={current_coords.latitude} longitude={current_coords.longitude} heading={0} >

                    <MaterialIcons
                        name="location-on"
                        size={24}
                        color={Colors[colorScheme ?? 'light'].text}
                    />
                </AnimatedMarker>
            }
        </>
    )
}

export default memo(AnimatedRouteMarker)