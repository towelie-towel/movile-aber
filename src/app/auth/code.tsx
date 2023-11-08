import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, usePathname, router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  LayoutAnimation,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Button,
  KeyboardAvoidingView,
  useWindowDimensions,
  Keyboard,
} from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
import Popover, { PopoverMode, PopoverPlacement } from 'react-native-popover-view';
import Svg, { Path } from 'react-native-svg';

import AbsoluteLoading from '~/components/AbsoluteLoading';
import { ScaleBtn } from '~/components/ScaleBtn';
import { View } from '~/components/Themed';
import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import useKeyboard from '~/hooks/useKeyboard';
import { supabase } from '~/lib/supabase';
import { isValidPassword, isValidPhone, isValidUsername } from '~/utils/validators';

export default function Code() {
  const { phone } = useLocalSearchParams();
  console.log('phone-Code', phone);
  const colorScheme = useColorScheme();
  // const { width, height } = useWindowDimensions();
  const { keyboardHeight } = useKeyboard();
  // const { isSignedIn, isLoading: isAuthLoading } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const [otpTimer, setOtpTimer] = useState(60);

  const [inputCronemberg, setInputCronemberg] = useState({
    otpToken: '',
    showOtpTokenError: false,
    otpTokenError: '',
  });
  const otpInputRef = useRef<OTPTextInput>(null);

  const startTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer((prevCount) => {
        if (prevCount === 1) {
          console.log('clearing interval');
          clearInterval(timer);
        }

        console.log(prevCount);
        return prevCount - 1;
      });
    }, 1000);
  };

  const verifyOtp = async (otpToken: string) => {
    setIsLoading(true);
    console.log('otpToken', otpToken);
    const { error, data } = await supabase.auth.verifyOtp({
      phone: '53' + phone,
      token: otpToken,
      type: 'sms',
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setIsLoading(false);
      return;
    }
    console.log('User Signed In', JSON.stringify(data, null, 2));

    setIsLoading(false);
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].secondary }}>
      <Stack.Screen
        options={
          {
            // statusBarColor: Colors[colorScheme ?? 'light'].primary,
            // navigationBarColor: 'transparent',
          }
        }
      />
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].primary,
          paddingTop: 80,
          paddingHorizontal: 20,
        }}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}>
          <MaterialIcons
            style={{ marginBottom: 15 }}
            color={Colors[colorScheme ?? 'light'].text_light2}
            name="arrow-back-ios"
            size={32}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors[colorScheme ?? 'light'].text_light2,
          }}>
          Verifica tu Teléfono
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            marginVertical: 18,
            fontWeight: '500',
            color: Colors[colorScheme ?? 'light'].text_light2,
          }}>
          Introduce el código que te enviamos via sms
        </Text>
      </View>
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].secondary,
          width: '100%',
          justifyContent: 'center',
          alignContent: 'center',
          marginBottom: 32,
        }}>
        <OTPTextInput
          inputCount={6}
          textInputStyle={{
            width: 40,
          }}
          handleTextChange={(text) => {
            setInputCronemberg((prev) => ({ ...prev, otpToken: text }));
            if (text.length === 6) {
              verifyOtp(text);
              Keyboard.dismiss();
            }
          }}
          ref={otpInputRef}
          containerStyle={{
            width: '80%',
            alignSelf: 'center',
            marginVertical: 40,
          }}
        />
      </View>
    </View>
  );
}
