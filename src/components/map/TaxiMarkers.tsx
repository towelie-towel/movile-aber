import React, { memo } from 'react'
import { useColorScheme } from 'react-native';
import { type MapMarkerProps } from 'react-native-maps'

import { useWSConnection } from '~/context/WSContext';
import TaxiMarker from './TaxiMarker';

interface props extends Omit<MapMarkerProps, "coordinate"> {
    description: string,
    title: string,
    userId: string,
    onSelectTaxi: (taxiId: string) => void
}

const TaxisMarkers = ({ onSelectTaxi }: props) => {
    const colorScheme = useColorScheme();
    const { wsTaxis } = useWSConnection();

    return (
        <>
            {wsTaxis?.map(taxi => {

                return (
                    <TaxiMarker
                        index={taxi.userId}
                        onPress={() => {
                            onSelectTaxi(taxi.userId);
                        }}
                        heading={0}
                        headingAnimated={false}
                        latitude={taxi.latitude}
                        longitude={taxi.longitude}
                    >
                    </TaxiMarker>
                )
            }
            )}
        </>
    )
}

export default memo(TaxisMarkers);