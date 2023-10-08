import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Marker } from 'react-native-maps';

import { type UserMarkerIconType } from '~/components/AddUserMarker';
import Colors from '~/constants/Colors';

const UserMarkerIcon: React.FC<UserMarkerIconType & { colorScheme: 'light' | 'dark' }> = ({
  coords,
  icon,
  id,
  name,
  description,
  colorScheme,
}) => {
  return (
    <Marker coordinate={coords}>
      <MaterialCommunityIcons
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name={icon.name}
        size={28}
        color={Colors[colorScheme ?? 'light'].text}
      />
    </Marker>
  );
};

export default memo(UserMarkerIcon);
