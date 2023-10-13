import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import {
  ActivityIndicator,
  LayoutAnimation,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

type Params = {
  onCancel?: () => void;
  size?: number | 'small' | 'large';
  visible: boolean;
  intensity?: number;
} & ViewProps;

const AbsoluteLoading = ({
  onCancel,
  size,
  visible,
  intensity = 5,
  style,
  ...restProps
}: Params) => {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (visible) {
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: 'easeInEaseOut',
          property: 'opacity',
        },
        create: {
          type: 'easeInEaseOut',
          property: 'opacity',
        },
        delete: {
          type: 'easeInEaseOut',
          property: 'opacity',
        },
      });
    } else {
      LayoutAnimation.configureNext({
        duration: 200,
        update: {
          type: 'easeInEaseOut',
          property: 'opacity',
        },
        create: {
          type: 'easeInEaseOut',
          property: 'opacity',
        },
        delete: {
          type: 'easeInEaseOut',
          property: 'opacity',
        },
      });
    }
  }, [visible]);

  return (
    <BlurView
      style={[
        {
          display: visible ? 'flex' : 'none',
        },
        style,
      ]}
      {...restProps}
      intensity={intensity}>
      {visible && (
        <View>
          <ActivityIndicator
            size={size}
            animating
            color={colorScheme === 'light' ? 'black' : 'white'}
          />
          {onCancel && (
            <TouchableOpacity
              onPress={() => {
                onCancel();
              }}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </BlurView>
  );
};

export default AbsoluteLoading;
