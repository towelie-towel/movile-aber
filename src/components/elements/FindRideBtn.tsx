import React, { useCallback } from 'react';
import { View, Text } from 'react-native';

import { ScaleBtn } from '~/components/common';
import { PressBtnProps } from '~/components/common/ScaleBtn';
import { useWSActions } from '~/context/WSContext';
import { RideInfo } from '~/types/RideFlow';

type FindRideBtnProps = {
    disabled?: boolean;
    rideInfo: RideInfo | null;
    startFindingRide: () => void;
    errorFindingRide: () => void;
} & PressBtnProps;

const FindRideBtn: React.FC<FindRideBtnProps> = ({
    disabled = false,
    rideInfo,
    startFindingRide,
    errorFindingRide,
    ...props
}) => {
    const { findTaxi } = useWSActions();

    const findRideHandler = useCallback(async () => {
        startFindingRide()
        try {
            if (rideInfo) {
                // TODO: change from harcoded taxi id to actual selected id
                await findTaxi(rideInfo, "eff41f96-178e-4e97-9f43-35d4de7b7a18")
            } else {
                throw new Error('Ride Info is not set')
            }
        } catch (error) {
            console.error(error)
            errorFindingRide()
        }
    }, [rideInfo, findTaxi]);

    return (
        <ScaleBtn {...props} disabled={disabled} onPress={findRideHandler} />
    );
};

export default FindRideBtn;