import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, usePathname, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import Popover, { PopoverMode, PopoverPlacement } from 'react-native-popover-view';
import Svg, { Path } from 'react-native-svg';
import OTPTextInput from 'react-native-otp-textinput';

import AbsoluteLoading from '~/components/AbsoluteLoading';
import { PressBtn } from '~/components/PressBtn';
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
  const { width, height } = useWindowDimensions();
  const { keyboardHeight } = useKeyboard();
  // const { isSignedIn, isLoading: isAuthLoading } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const [otpTimer, setOtpTimer] = useState(60);

  const [otpToken, setOtpToken] = useState('');

  const [inputCronemberg, setInputCronemberg] = useState({
    otpToken: '',
    showOtpTokenError: false,
    otpTokenError: '',
  });

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

  const verifyOtp = async () => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      phone: '+53' + phone,
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
        options={{
          statusBarColor: Colors[colorScheme ?? 'light'].primary,
          navigationBarColor: 'transparent',
        }}
      />
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].primary,
          height: '30%',
          paddingTop: 80,
        }}>
        <Text>
          Ingresa el código que te enviamos a tu celular: {phone}{' '}
          {otpTimer > 0 ? (
            <Text style={{ color: Colors[colorScheme ?? 'light'].text_light }}>{otpTimer}</Text>
          ) : (
            <PressBtn onPress={startTimer}>Reenviar código</PressBtn>
          )}{' '}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].secondary,
          position: 'absolute',
          top: (height - keyboardHeight) / 2 - 90,
          width: '100%',
          paddingHorizontal: 40,
          marginTop: 24,
          marginBottom: 32,
        }}>
        <OTPTextInput />
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? 'light'].secondary,
            flexDirection: 'row',
            marginTop: 24,
            marginBottom: 32,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
          }}>
          <TextInput
            style={{
              height: 60,
              width: 40,
              paddingLeft: 12,
              textDecorationColor: 'red',
              fontSize: 25,
              color: Colors[colorScheme ?? 'light'].text_dark,

              borderBottomWidth: 4,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
            }}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                otpToken: text,
                otpTokenError: '',
              });
            }}
            value={inputCronemberg.otpToken}
          />
          <TextInput
            style={{
              height: 60,
              width: 40,
              paddingLeft: 12,
              textDecorationColor: 'red',
              fontSize: 25,
              color: Colors[colorScheme ?? 'light'].text_dark,

              borderBottomWidth: 4,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
            }}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                otpToken: text,
                otpTokenError: '',
              });
            }}
            value={inputCronemberg.otpToken}
          />

          <TextInput
            style={{
              height: 60,
              width: 40,
              paddingLeft: 12,
              textDecorationColor: 'red',
              fontSize: 25,
              color: Colors[colorScheme ?? 'light'].text_dark,

              borderBottomWidth: 4,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
            }}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                otpToken: text,
                otpTokenError: '',
              });
            }}
            value={inputCronemberg.otpToken}
          />

          <TextInput
            style={{
              height: 60,
              width: 40,
              paddingLeft: 12,
              textDecorationColor: 'red',
              fontSize: 25,
              color: Colors[colorScheme ?? 'light'].text_dark,

              borderBottomWidth: 4,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
            }}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                otpToken: text,
                otpTokenError: '',
              });
            }}
            value={inputCronemberg.otpToken}
          />

          <TextInput
            style={{
              height: 60,
              width: 40,
              paddingLeft: 12,
              textDecorationColor: 'red',
              fontSize: 25,
              color: Colors[colorScheme ?? 'light'].text_dark,

              borderBottomWidth: 4,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
            }}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                otpToken: text,
                otpTokenError: '',
              });
            }}
            value={inputCronemberg.otpToken}
          />

          <TextInput
            style={{
              height: 60,
              width: 40,
              paddingLeft: 12,
              textDecorationColor: 'red',
              fontSize: 25,
              color: Colors[colorScheme ?? 'light'].text_dark,

              borderBottomWidth: 4,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
            }}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                otpToken: text,
                otpTokenError: '',
              });
            }}
            value={inputCronemberg.otpToken}
          />
        </View>
        <View
          style={{
            overflow: 'hidden',
            borderRadius: 8,
            alignSelf: 'center',
            width: 260,
          }}>
          <Button
            disabled={inputCronemberg.otpToken !== '' || inputCronemberg.otpTokenError !== ''}
            color={Colors[colorScheme ?? 'light'].primary}
            title="Verify"
            onPress={verifyOtp}
          />
        </View>
      </View>
    </View>
  );
}
