import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LayoutAnimation, Pressable, View, useColorScheme, TouchableWithoutFeedback } from 'react-native';

import { Text } from '~/components/common/Themed';
import Colors from '~/constants/Colors';
import ScaleBtn from './ScaleBtn';

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

interface AbsoluteDropdownProps {
  actions: Action[];
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}


const AbsoluteDropdown = ({ actions, isOpen = false, setIsOpen }: AbsoluteDropdownProps) => {
  const colorScheme = useColorScheme();

  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);

  useEffect(() => {
    if (isOpen) {
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
      setWidth(150);
      setHeight(150);
    } else {
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
    }
  }, [isOpen])

  return (
    <TouchableWithoutFeedback>
      <View
        style={{
          pointerEvents: "auto",
          position: "absolute",
          top: 0,
          right: 0,
          backgroundColor: colorScheme === 'light' ? 'white' : 'black',
          width,
          height,
          borderRadius: isOpen ? 5 : 150,
          justifyContent: isOpen ? 'space-evenly' : 'center',
          alignItems: 'center',
        }}>
        {!isOpen && (
          <ScaleBtn onPress={() => setIsOpen && setIsOpen(true)}>
            <Feather name="more-vertical" size={20} color={Colors[colorScheme ?? 'light'].text} />
          </ScaleBtn>
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AbsoluteDropdown;
