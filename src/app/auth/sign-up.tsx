import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, TextInput, useColorScheme, ActivityIndicator, Text } from 'react-native';
import Popover from 'react-native-popover-view';

import { PressBtn } from '~/components/PressBtn';
import { View } from '~/components/Themed';
import Colors from '~/constants/Colors';
import { useUser } from '~/context/UserContext';
import { supabase } from '~/lib/supabase';
import { isValidPassword, isValidPhone, isValidUsername } from '~/utils/validators';

export default function Code({ phone }: { phone: string }) {
  const colorScheme = useColorScheme();
  const { replace } = useRouter();
  const { isSignedIn, isLoading: isAuthLoading } = useUser();

  const [isLoading, setIsLoading] = useState(false);
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
            </View>
          </View>
          <TextInput
            placeholderTextColor={colorScheme === 'dark' ? 'rgb(107 114 128)' : 'rgb(100 116 139)'}
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
          <PressBtn disabled={isLoading} onPress={() => verifyOtp()}>
            <Text>Registrar</Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                animating
                color={colorScheme === 'light' ? 'white' : 'black'}
              />
            )}
          </PressBtn>
        </>
      )}

      <View
        style={{
          height: '100%',
          padding: 40,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        }}>
        <AbsoluteLoading visible={isLoading} />
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              height: 45,
              borderWidth: 1,
              borderColor: Colors[colorScheme ?? 'light'].border,
              borderStyle: 'solid',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
            }}>
            <View
              style={{
                height: 43,
                width: '20%',
                borderRightWidth: 1,
                borderStyle: 'solid',
                backgroundColor: 'transparent',
                borderColor: Colors[colorScheme ?? 'light'].border,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: Colors[colorScheme ?? 'light'].text_dark,
                  fontSize: 17,
                  fontWeight: '400',
                }}>
                +53
              </Text>
            </View>
            <TextInput
              style={{
                height: 43,
                width: '80%',
                paddingLeft: 10,
                fontSize: 17,
                color: Colors[colorScheme ?? 'light'].text_dark,
              }}
              placeholder="Número de Móvil"
              autoCapitalize="none"
              keyboardType="numeric"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
              onChangeText={(text) => {
                setInputCronemberg({
                  ...inputCronemberg,
                  phone: text,
                  phoneError: '',
                  passwordError: '',
                });
              }}
              value={inputCronemberg.phone}
            />
            {inputCronemberg.phoneError && (
              <View
                style={{
                  position: 'absolute',
                  right: 8,
                }}>
                <Popover
                  verticalOffset={-32}
                  mode={PopoverMode.RN_MODAL}
                  placement={PopoverPlacement.LEFT}
                  isVisible={inputCronemberg.showPhonePopover}
                  onRequestClose={() => {
                    setInputCronemberg({
                      ...inputCronemberg,
                      showPhonePopover: false,
                    });
                  }}
                  from={
                    <TouchableOpacity
                      onPress={() => {
                        setInputCronemberg({
                          ...inputCronemberg,
                          showPhonePopover: true,
                        });
                        console.log(inputCronemberg);
                      }}>
                      <MaterialIcons
                        name="error"
                        size={24}
                        color={Colors[colorScheme ?? 'light'].text}
                      />
                    </TouchableOpacity>
                  }>
                  <Text
                    numberOfLines={2}
                    style={{
                      padding: 8,
                    }}>
                    {inputCronemberg.phoneError}
                  </Text>
                </Popover>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            position: 'relative',
            marginTop: 24,
            marginBottom: 32,
            height: 45,
            width: '100%',
            borderWidth: 1,
            borderColor: Colors[colorScheme ?? 'light'].border,
            borderStyle: 'solid',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              height: 43,
              width: '100%',
              paddingLeft: 20,
              fontSize: 17,
              color: Colors[colorScheme ?? 'light'].text_dark,
            }}
            placeholder="Contraseña"
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                password: text,
                phoneError: '',
                passwordError: '',
              });
            }}
            value={inputCronemberg.password}
          />
          {inputCronemberg.passwordError && (
            <View
              style={{
                position: 'absolute',
                right: 8,
              }}>
              <Popover
                verticalOffset={-32}
                mode={PopoverMode.RN_MODAL}
                placement={PopoverPlacement.LEFT}
                isVisible={inputCronemberg.showPasswordPopover}
                onRequestClose={() => {
                  setInputCronemberg({
                    ...inputCronemberg,
                    showPasswordPopover: false,
                  });
                }}
                from={
                  <TouchableOpacity
                    onPress={() => {
                      setInputCronemberg({
                        ...inputCronemberg,
                        showPasswordPopover: true,
                      });
                    }}>
                    <MaterialIcons
                      name="error"
                      size={24}
                      color={Colors[colorScheme ?? 'light'].text}
                    />
                  </TouchableOpacity>
                }>
                <Text
                  numberOfLines={2}
                  style={{
                    backgroundColor: Colors[colorScheme ?? 'light'].secondary,
                    padding: 8,
                  }}>
                  {inputCronemberg.passwordError}
                </Text>
              </Popover>
            </View>
          )}
        </View>

        <View
          style={{
            overflow: 'hidden',
            borderRadius: 8,
          }}>
          <Button
            disabled={inputCronemberg.phoneError !== '' || inputCronemberg.passwordError !== ''}
            color={Colors[colorScheme ?? 'light'].primary}
            title="Sign In"
            onPress={handleSignIn}
          />
        </View>
      </View>
    </View>
  );
}
