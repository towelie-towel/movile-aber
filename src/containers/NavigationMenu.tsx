import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native';

import Colors from '~/constants/Colors';
import { useWSConnection } from '~/context/WSContext';
import { PressBtn } from '~/shared/PressBtn';

interface NavigationMenuParams {
  navigationAnimValue: Animated.Value;
  toggleNavMenu: () => void;
  addMarkerHandler: () => void;
  openUserProfileHandler: () => void;
  taxiBtnHandler: () => void;
}

const NavigationMenu: React.FC<NavigationMenuParams> = ({
  navigationAnimValue,
  toggleNavMenu,
  addMarkerHandler,
  openUserProfileHandler,
  taxiBtnHandler,
}) => {
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get('window');
  const { resetConnection, trackPosition } = useWSConnection();

  return (
    <Animated.View
      style={{
        right: width / 7,
        bottom: height / 10,
      }}>
      <TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: 'absolute',
            transform: [
              {
                scale: navigationAnimValue,
              },
              {
                translateY: navigationAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -195],
                }),
              },
            ],
          }}>
          <PressBtn
            onPress={() => {
              void resetConnection();
              void trackPosition();
              taxiBtnHandler();
            }}>
            <MaterialIcons
              name="local-taxi"
              size={40}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </PressBtn>
        </Animated.View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: 'absolute',
            transform: [
              {
                scale: navigationAnimValue,
              },
              {
                translateY: navigationAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -130],
                }),
              },
            ],
          }}>
          <PressBtn callback={openUserProfileHandler}>
            <MaterialIcons
              name="account-circle"
              size={40}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </PressBtn>
        </Animated.View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: 'absolute',
            transform: [
              {
                scale: navigationAnimValue,
              },
              {
                translateY: navigationAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -65],
                }),
              },
            ],
          }}>
          <PressBtn onPress={addMarkerHandler}>
            <MaterialIcons
              name="add-location-alt"
              size={40}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </PressBtn>
        </Animated.View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback>
        <Animated.View
          style={{
            transform: [
              {
                rotate: navigationAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '135deg'],
                }),
              },
            ],
          }}>
          <Pressable onPress={toggleNavMenu}>
            <MaterialIcons name="add" size={48} color={Colors[colorScheme ?? 'light'].text} />
          </Pressable>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default memo(NavigationMenu);
