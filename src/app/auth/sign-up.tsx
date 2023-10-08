import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, TextInput, useColorScheme, ActivityIndicator, Text } from 'react-native';
import Popover from 'react-native-popover-view';

import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import { PressBtn } from '~/shared/PressBtn';
import { View } from '~/shared/Themed';
import { supabase } from '~/supabase';
import { isValidPassword, isValidPhone, isValidUsername } from '~/utils/validators';

export default function SignUp() {
  const colorScheme = useColorScheme();
  const pathName = usePathname();
  const { replace } = useRouter();
  const { isSignedIn, isLoading: isAuthLoading } = useUser();
  const isOnSignUpRoute = pathName.includes('sign-up');

  const [isLoading, setIsLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [otpTimer, setOtpTimer] = useState(60);

  const [otpToken, setOtpToken] = useState('');
  const [otpTokenError, _setOtpTokenError] = useState('');

  const [_isReduced, setIsReduced] = useState(false);

  const reduceLogo = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsReduced(true);
  };

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

  const sendOTP = async () => {
    setIsLoading(true);
    const [phoneOk, phoneErr] = isValidPhone(phone.trim());
    const [passwordOk, passwordErr] = isValidPassword(password);
    const [usernameOk, usernameErr] = isValidUsername(username);

    if (!phoneOk || !passwordOk || !usernameOk) {
      if (!phoneOk) {
        setPhoneError(phoneErr);
        console.error('invalid phone: ' + phoneErr);
      }
      if (!passwordOk) {
        setPasswordError(passwordErr);
        console.error('invalid password: ' + passwordErr);
      }
      if (!usernameOk) {
        setUsernameError(usernameErr);
        console.error('invalid username: ' + usernameErr);
      }
      setIsLoading(false);
      return;
    }

    console.log('Sending OTP Code');
    const { error } = await supabase.auth.signUp({
      phone: '+53' + phone.trim(),
      password,
      options: {
        data: {
          username,
          role: 'client',
        },
      },
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setIsLoading(false);
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPendingVerification(true);

    startTimer();
    setIsLoading(false);
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      phone: '+53' + phone.trim(),
      token: otpToken,
      type: 'sms',
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setIsLoading(false);
      return;
    }

    console.log('User Signed In', JSON.stringify(data, null, 2));

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsPhoneVerified(true);
    setPendingVerification(false);
    setIsLoading(false);
  };

  return (
    <View>
      <Stack.Screen
        options={{
          title: 'Cuenta Nueva',
        }}
      />

      <View>
        <Image source={require('../../../assets/Logo.png')} alt="Tu-Ruta Logo" />
        <Text numberOfLines={1} adjustsFontSizeToFit>
          Bienvenida
        </Text>
      </View>

      {!pendingVerification && !isPhoneVerified && (
        <View>
          <View>
            <View>
              <Text>+53</Text>
            </View>
            <TextInput
              placeholder="Número de Móvil"
              autoCapitalize="none"
              keyboardType="numeric"
              placeholderTextColor={
                colorScheme === 'dark' ? 'rgb(107 114 128)' : 'rgb(100 116 139)'
              }
              onChangeText={setPhone}
              value={phone}
              onFocus={() => {
                reduceLogo();
              }}
            />
            {phoneError && (
              <View>
                <Popover
                  from={
                    <MaterialIcons
                      name="error"
                      size={24}
                      color={Colors[colorScheme ?? 'light'].text}
                    />
                  }>
                  <Text>{phoneError}</Text>
                </Popover>
              </View>
            )}
          </View>
          <View>
            <TextInput
              placeholder="Nombre de Usuario"
              autoCapitalize="none"
              placeholderTextColor={
                colorScheme === 'dark' ? 'rgb(107 114 128)' : 'rgb(100 116 139)'
              }
              onChangeText={setUsername}
              value={username}
              onFocus={() => {
                reduceLogo();
              }}
            />
            {usernameError && (
              <View>
                <MaterialIcons name="error" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </View>
            )}
          </View>
          <View>
            <TextInput
              placeholder="Contraseña"
              autoCapitalize="none"
              placeholderTextColor={
                colorScheme === 'dark' ? 'rgb(107 114 128)' : 'rgb(100 116 139)'
              }
              onChangeText={setPassword}
              value={password}
              onFocus={() => {
                reduceLogo();
              }}
            />
            {passwordError && (
              <View>
                <MaterialIcons name="error" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </View>
            )}
          </View>
        </View>
      )}

      {pendingVerification && (
        <View>
          <View>
            <View>
              <Text numberOfLines={1} adjustsFontSizeToFit>
                No Te Ha Llegado?
              </Text>
              <View>
                <Text numberOfLines={1} adjustsFontSizeToFit>
                  Intenta de nuevo en {otpTimer}.
                </Text>
                <PressBtn disabled={otpTimer !== 0} onPress={() => sendOTP()}>
                  <Text>Enviar</Text>
                </PressBtn>
              </View>
            </View>
            <TextInput
              placeholderTextColor={
                colorScheme === 'dark' ? 'rgb(107 114 128)' : 'rgb(100 116 139)'
              }
              placeholder="Codigo"
              onChangeText={(code) => setOtpToken(code)}
              onFocus={() => {
                reduceLogo();
              }}
            />
            {otpTokenError && (
              <View>
                <MaterialIcons name="error" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </View>
            )}
          </View>
        </View>
      )}

      {isSignedIn && <></>}

      {isAuthLoading && (
        <>
          <ActivityIndicator
            size="small"
            animating
            color={colorScheme === 'light' ? 'black' : 'white'}
          />
        </>
      )}

      {!isSignedIn && (
        <>
          <PressBtn
            disabled={(otpToken.length < 5 && pendingVerification) || isLoading}
            onPress={() => (pendingVerification ? verifyOtp() : sendOTP())}>
            <Text>{pendingVerification ? 'Verificar' : 'Registrar'}</Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                animating
                color={colorScheme === 'light' ? 'white' : 'black'}
              />
            )}
          </PressBtn>

          <PressBtn
            onPress={() => {
              if (isOnSignUpRoute) {
                replace('sign-in');
              }
            }}>
            <Text>Ya Tienes Cuenta?</Text>
            <Text>Inicia Sesión</Text>
          </PressBtn>
        </>
      )}
    </View>
  );
}
