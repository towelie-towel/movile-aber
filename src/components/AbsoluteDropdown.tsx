import { Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { LayoutAnimation, Pressable, View, useColorScheme } from 'react-native';

import { Text } from '~/components/Themed';
import Colors from '~/constants/Colors';

interface Action {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  title?: string;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
  loadingBackgroundColor?: string;
}

const AbsoluteDropdown = ({ actions }: { actions: Action[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();

  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);

  const handleOpenDropdown = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: 'easeInEaseOut',
        property: 'scaleXY',
      },
      create: {
        type: 'easeInEaseOut',
        property: 'opacity',
      },
    });
    setIsOpen(true);
    setWidth(150);
    setHeight(150);
  };

  const handleCloseDropdown = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: 'easeInEaseOut',
        property: 'scaleXY',
      },
      delete: {
        type: 'easeInEaseOut',
        property: 'opacity',
      },
    });
    setWidth(32);
    setHeight(32);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={handleOpenDropdown}
        style={{
          backgroundColor: colorScheme === 'light' ? 'white' : 'black',
          width,
          height,
          borderRadius: isOpen ? 5 : 150,
          justifyContent: isOpen ? 'space-evenly' : 'center',
          alignItems: 'center',
        }}>
        {!isOpen && (
          <Feather name="more-vertical" size={20} color={Colors[colorScheme ?? 'light'].text} />
        )}

        {isOpen &&
          actions.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => {
                action.onPress();
              }}
              disabled={action.disabled}
              style={{
                backgroundColor: action.backgroundColor,
              }}>
              {action.icon ? (
                <MaterialIcons
                  name={action.icon}
                  size={16}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              ) : (
                <View />
              )}
              <Text
                style={{
                  color: action.color ?? Colors[colorScheme ?? 'light'].text,
                  opacity: action.disabled ? 0.5 : 1,
                }}>
                {action.title}
              </Text>
            </Pressable>
          ))}
      </Pressable>

      {isOpen && (
        <Pressable onPress={handleCloseDropdown}>
          <BlurView intensity={1} />
        </Pressable>
      )}
    </>
  );
};

export default AbsoluteDropdown;
