import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutAnimation,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Popover, { PopoverMode, PopoverPlacement } from 'react-native-popover-view';

import { ScaleBtn } from '~/components/ScaleBtn';
import { View, Text } from '~/components/Themed';
import Colors from '~/constants/Colors';
import type { SignInConfig } from '~/constants/Configs';
import { supabase } from '~/lib/supabase';
import { isValidPassword, isValidPhone } from '~/utils/validators';

export default function SignIn() {
  const colorScheme = useColorScheme();
  const pathName = usePathname();
  const { replace } = useRouter();
  const isOnSignInRoute = pathName.includes('sign-in');
  const [signInConfigs, _setSignInConfigs] = useState<SignInConfig>();

  const passWordRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReduced, setIsReduced] = useState(false);

  const [showPhonePopover, setShowPhonePopover] = useState(false);
  const [showPasswordPopover, setShowPasswordPopover] = useState(false);

  const reduceLogo = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsReduced(true);
  };

  const handleSignIn = async () => {
    const [phoneOk, phoneErr] = isValidPhone(phone.trim(), signInConfigs?.errors.phone_error);
    const [passwordOk, passwordErr] = isValidPassword(
      password,
      signInConfigs?.errors.password_error
    );
    console.log('handleSignIn');

    if (!phoneOk || !passwordOk) {
      if (!phoneOk) {
        setPhoneError(phoneErr);
        setShowPhonePopover(true);
        console.error('invalid phone: ' + phoneErr);
      }
      if (!passwordOk) {
        setPasswordError(passwordErr);
        setShowPasswordPopover(true);
        console.error('invalid password: ' + passwordErr);
      }
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      phone: '+53' + phone.trim(),
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setPhoneError(error.message);
      setShowPhonePopover(true);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  useEffect(() => {}, []);

  return (
    <View>
      <Stack.Screen
        options={{
          title: signInConfigs?.screen_title ?? 'Inicio de Sesión',
        }}
      />

      <View
        style={{
          display: isReduced ? 'none' : 'flex',
        }}>
        <Text numberOfLines={2} adjustsFontSizeToFit>
          {signInConfigs?.title ?? 'Bienvenida Otra Vez'}
        </Text>
        {signInConfigs?.description && (
          <Text numberOfLines={2} adjustsFontSizeToFit>
            {signInConfigs?.description}
          </Text>
        )}
        <Image
          source={signInConfigs?.image ?? require('../../../assets/Logo.png')}
          alt="Tu-Ruta Logo"
        />
      </View>

      <View>
        <View>
          <View>
            <Text>+53</Text>
          </View>
          <TextInput
            placeholder={signInConfigs?.fields.phone.placeholder ?? 'Número de Móvil'}
            placeholderTextColor={
              colorScheme === 'dark'
                ? signInConfigs?.fields.phone.placeholder_text_color.dark ?? 'rgb(107 114 128)'
                : signInConfigs?.fields.phone.placeholder_text_color.light ?? 'rgb(100 116 139)'
            }
            autoCapitalize={signInConfigs?.fields.phone.auto_capitalize ?? 'none'}
            keyboardType={signInConfigs?.fields.phone.keyboard_type}
            maxLength={signInConfigs?.fields.phone.max_length}
            onChangeText={(text) => {
              setPhone(text);
              setPhoneError('');
              setPasswordError('');
            }}
            autoCorrect={signInConfigs?.fields.phone.auto_correct}
            value={phone}
            onFocus={() => {
              if (signInConfigs?.reduce_title) {
                reduceLogo();
              }
            }}
          />
          {phoneError && (
            <View>
              <Popover
                verticalOffset={-32}
                mode={PopoverMode.RN_MODAL}
                placement={PopoverPlacement.LEFT}
                isVisible={showPhonePopover}
                onRequestClose={() => setShowPhonePopover(false)}
                from={
                  <TouchableOpacity
                    onPress={() => {
                      setShowPhonePopover(true);
                    }}>
                    <MaterialIcons
                      name="error"
                      size={24}
                      color={Colors[colorScheme ?? 'light'].text}
                    />
                  </TouchableOpacity>
                }>
                <Text /* numberOfLines={1} */>{phoneError}</Text>
              </Popover>
            </View>
          )}
        </View>
        <View>
          <TextInput
            placeholder="Contraseña"
            autoCapitalize="none"
            placeholderTextColor={colorScheme === 'dark' ? 'rgb(107 114 128)' : 'gray'}
            onChangeText={(text) => {
              setPassword(text);
              setPhoneError('');
              setPasswordError('');
            }}
            value={password}
            onFocus={() => {
              if (signInConfigs?.reduce_title) {
                reduceLogo();
              }
            }}
            ref={passWordRef}
            textContentType="password"
            inputMode="text"
            keyboardType="default"
            autoComplete="off"
            autoCorrect={false}
          />
          {passwordError && (
            <View>
              <Popover
                verticalOffset={-32}
                mode={PopoverMode.RN_MODAL}
                placement={PopoverPlacement.LEFT}
                isVisible={showPasswordPopover}
                onRequestClose={() => setShowPasswordPopover(false)}
                from={
                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordPopover(true);
                    }}>
                    <MaterialIcons
                      name="error"
                      size={24}
                      color={Colors[colorScheme ?? 'light'].text}
                    />
                  </TouchableOpacity>
                }>
                <Text /* numberOfLines={1} */>{passwordError}</Text>
              </Popover>
            </View>
          )}
        </View>
        <ScaleBtn
          onPress={() => {
            void handleSignIn();
          }}>
          <Text darkColor="black">Iniciar Sesión</Text>
          {isLoading && (
            <ActivityIndicator
              size="small"
              animating
              color={colorScheme === 'light' ? 'white' : 'black'}
            />
          )}
        </ScaleBtn>
        <ScaleBtn
          onPress={() => {
            if (isOnSignInRoute) {
              replace('auth/sign-up');
            }
          }}>
          <Text>No Tienes Cuenta?</Text>
          <Text>Crear Cuenta</Text>
        </ScaleBtn>
      </View>
    </View>
  );
}
