import { MaterialIcons } from '@expo/vector-icons';
import {
  Stack /* , useRouter */,
  router,
  useRouter,
  useNavigation,
  useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
import {
  TextInput,
  useColorScheme,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  Button,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import Popover, { PopoverMode, PopoverPlacement } from 'react-native-popover-view';
import { Bar } from 'react-native-progress';
import { Path, Svg } from 'react-native-svg';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import { View } from '~/components/Themed';
import Colors from '~/constants/Colors';
import useKeyboard from '~/hooks/useKeyboard';
import { supabase } from '~/lib/supabase';
import { isValidPassword, isValidPhone } from '~/utils/validators';

export default function Sign(params: any) {
  const colorScheme = useColorScheme();
  const item = useLocalSearchParams();
  console.log('phone-Sign', item);
  const { width, height } = useWindowDimensions();
  // const router = useRouter();
  const { keyboardHeight } = useKeyboard();

  const [tabsIndex, setTabsIndex] = useState(0);
  const [tabsRoutes] = useState([
    { key: 'sign-in', title: 'Entrar' },
    { key: 'sign-up', title: 'Crear Cuenta' },
  ]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? 'light'].secondary,
      }}>
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
          /* position: 'absolute',
          top: 0, */
          backgroundColor: Colors[colorScheme ?? 'light'].primary,
          height: height / 2,
          paddingTop: 80,
          justifyContent: 'flex-end',
        }}>
        <Svg width={width} height={(width * 258) / 375} viewBox="0 0 375 258" fill="none">
          <Path
            d="M222.435 21.1065V1H220.695V21.1065H213.003V41.7377L205.684 49.0059V61.749H188.514V83.2732H183.859V92.0633H174.838V77.8885L168.093 69.4338V61.749H164.864V59.3752H143.843V61.749H140.617V82.1646H133.465V48.9485H130.237V46.5747H109.216V48.9485H105.989V106.631H99.4183V61.749H96.1913V59.3752H75.1698V61.749H71.9436V83.2732H62.8828V36.9786H51.0981V27.9991H39.3119V18.1915H27.5271V64.3303H7.67825L8.33252 96.2041H-1.00018V257H10.8594H14.3641H27.5271H30.2387H39.3119H51.0981H62.8828H71.9436H93.8127H99.4183H105.989H118.164H121.29H133.465H140.617H145.641H159.508H168.093H183.859H188.514H205.684H213.003H230.126H240.229H260.039H277.342H287.89H304.072H305.193H314.914H316.908H334.294H338.31H357.689H373.5V99.3495H357.689V75.2539L338.31 88.5727V107.712H336.584L337.475 64.3303H335.042V59.6909H333.24L331.798 31.6357L330.356 59.6909H320.983V64.3303H311.732L312.065 80.5288H304.072V119.569H294.426V110.003H287.89V60.779L273.965 39.7993L260.039 60.779V75.2539H257.188L245.549 69.4338V75.2539H240.229V99.3495H230.126V21.1065H222.435Z"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeOpacity="0.2"
          />
          <Path
            d="M284.533 104.038V91H285.697V104.038H290.842V117.416L295.739 122.129V130.392H307.224V144.349H310.339V150.049H316.373V140.857L320.885 135.375V130.392H323.045V128.853H337.107V130.392H339.266V143.63H344.05V122.092H346.209V120.552H360.271V122.092H362.43V159.495H366.825V130.392H368.984V128.853H375V257H366.825H362.43H354.285H352.194H344.05H339.266H335.905H326.628H320.885H310.339H307.224H295.739H290.842H279.388H272.63H259.378H247.803H240.747H229.922H229.172H222.669H221.335H209.705H207.018H194.055H181.09H173.088H172.504H159.38H154.708H141V150.014L159.38 135.375V146.293L173.088 135.375V142.569H181.09V154.774H194.055V139.149L207.018 147.785V160.196H208.173L207.577 132.066H209.204V129.057H210.41L211.375 110.865L212.34 129.057H218.609V132.066H224.798L224.575 142.569H229.922V167.885H236.374V161.682H240.747V129.763L250.062 116.159L259.378 129.763V139.149H261.285L269.071 135.375V139.149H272.63V154.774H279.388V104.038H284.533Z"
            fill="white"
            fillOpacity="0.2"
          />
          <Path
            d="M26.103 91H25.2014V104.038H21.2153V154.774H15.9795V139.149H13.222V135.375L7.19015 139.149H5.71251V129.763L0.499771 114.33L0.5 256.5L141 257V152.734H136.163L136.502 132.066H126.215V102.148H120.108V108.507H113.999V114.33H107.892V144.349H103.196V130.392H101.524V128.853H90.6291V130.392H88.9566V159.495H85.5515V122.092H83.8787V120.552H72.9844V122.092H71.3116V143.63H67.6051V130.392H65.9326V128.853H55.0383V130.392H53.3651V135.375L49.8692 140.857V150.049H45.194V144.349H42.7813V130.392H33.883V122.129L30.0895 117.416V104.038H26.103V91Z"
            fill="white"
            fillOpacity="0.2"
          />
        </Svg>
      </View>
      <View
        style={{
          position: 'absolute',
          overflow: 'hidden',
          top: (height - keyboardHeight) / 2 - 90,
          alignSelf: 'center',
          width: '90%',
          height: 350,
          backgroundColor: Colors[colorScheme ?? 'light'].secondary,
          shadowColor: Colors[colorScheme ?? 'light'].shadow,
          shadowOffset: {
            width: 0,
            height: -5,
          },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 2, // required for Android
          borderRadius: 8,
        }}>
        <TabView
          navigationState={{ index: tabsIndex, routes: tabsRoutes }}
          renderScene={renderTabsScene}
          onIndexChange={setTabsIndex}
          renderToHardwareTextureAndroid
          renderTabBar={(props) => (
            <TabBar
              activeColor="#262628"
              labelStyle={{
                fontSize: 16,
                fontWeight: '600',
              }}
              indicatorStyle={{
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
                width: 40,
                height: 6,
                borderRadius: 3,
                marginBottom: 20,
                left: props.layout.width / 4 - 17,
              }}
              tabStyle={{}}
              indicatorContainerStyle={{
                flexDirection: 'row',
              }}
              inactiveColor={Colors[colorScheme ?? 'light'].text_light}
              pressColor="transparent"
              style={{
                backgroundColor: 'transparent',
                shadowColor: 'transparent',
                borderBottomColor: Colors[colorScheme ?? 'light'].border,
                borderBottomWidth: 1,
              }}
              contentContainerStyle={{
                paddingVertical: 20,
              }}
              {...props}
            />
          )}
        />
      </View>
    </View>
  );
}

const SignInTab = () => {
  const colorScheme = useColorScheme();

  const [inputCronemberg, setInputCronemberg] = useState({
    phone: '',
    phoneError: '',
    showPhonePopover: false,
    password: '',
    passwordError: '',
    showPasswordPopover: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    const [phoneOk, phoneErr] = isValidPhone(inputCronemberg.phone.trim());
    const [passwordOk, passwordErr] = isValidPassword(inputCronemberg.password);
    console.log('handleSignIn');
    if (!phoneOk || !passwordOk) {
      setInputCronemberg({
        ...inputCronemberg,
        phoneError: phoneErr,
        showPhonePopover: !phoneOk,
        passwordError: passwordErr,
        showPasswordPopover: !passwordOk,
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      phone: '+53' + inputCronemberg.phone.trim(),
      password: inputCronemberg.password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setInputCronemberg({
        ...inputCronemberg,
        phoneError: error.message,
        showPhonePopover: true,
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    router.replace('/');
  };

  return (
    <View
      style={{
        borderColor: Colors[colorScheme ?? 'light'].border,
        borderStyle: 'solid',
      }}>
      {isLoading ? (
        <Bar
          indeterminate
          color={Colors[colorScheme ?? 'light'].primary}
          width={370}
          height={2}
          borderRadius={0}
          borderWidth={0}
        />
      ) : (
        <View style={{ height: 2 }} />
      )}
      <View
        style={{
          height: '100%',
          padding: 40,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        }}>
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
                  /* verticalOffset={-32} */
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
                /* verticalOffset={-32} */
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
};

const SignUpTab = () => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  const [inputCronemberg, setInputCronemberg] = useState({
    phone: '',
    phoneError: '',
    showPhonePopover: false,
    password: '',
    passwordError: '',
    showPasswordPopover: false,
    consfirmPassword: '',
    confirmPasswordError: '',
    consfirmShowPasswordPopover: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    const [phoneOk, phoneErr] = isValidPhone(inputCronemberg.phone.trim());
    const [passwordOk, passwordErr] = isValidPassword(inputCronemberg.password);
    console.log('handleSignUp');
    if (!phoneOk || !passwordOk) {
      setInputCronemberg({
        ...inputCronemberg,
        phoneError: phoneErr,
        showPhonePopover: !phoneOk,
        passwordError: passwordErr,
        showPasswordPopover: !passwordOk,
      });
      setIsLoading(false);
      return;
    }
    const passwordMismatch = inputCronemberg.password !== inputCronemberg.consfirmPassword;
    if (passwordMismatch) {
      setInputCronemberg({
        ...inputCronemberg,
        confirmPasswordError: passwordMismatch ? 'Las contraseñas no coinciden' : '',
        consfirmShowPasswordPopover: passwordMismatch,
      });
      setIsLoading(false);
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      phone: '+53' + inputCronemberg.phone.trim(),
      password: inputCronemberg.password,
      options: {
        data: {
          role: 'client',
          username: 'username',
        },
      },
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setInputCronemberg({
        ...inputCronemberg,
        phoneError: error.message,
        showPhonePopover: true,
      });
      setIsLoading(false);
      return;
    }
    console.log('User Signed Up', JSON.stringify(data, null, 2));
    setIsLoading(false);
    router.setParams({
      phone: inputCronemberg.phone.trim(),
    });
    router.push({ pathname: 'code', params: { phone: inputCronemberg.phone.trim() } });
  };

  return (
    <View
      style={{
        borderColor: Colors[colorScheme ?? 'light'].border,
        borderStyle: 'solid',
      }}>
      {isLoading ? (
        <Bar
          indeterminate
          color={Colors[colorScheme ?? 'light'].primary}
          width={370}
          height={2}
          borderRadius={0}
          borderWidth={0}
        />
      ) : (
        <View style={{ height: 2 }} />
      )}
      <View
        style={{
          height: '100%',
          paddingHorizontal: 40,
          paddingVertical: 20,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        }}>
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
                  /* verticalOffset={-32} */
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
            marginTop: 12,
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
                /* verticalOffset={-32} */
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
            position: 'relative',
            marginTop: 12,
            marginBottom: 16,
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
            placeholder="Confirmar Contraseña"
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry
            placeholderTextColor={Colors[colorScheme ?? 'light'].text_light}
            onChangeText={(text) => {
              setInputCronemberg({
                ...inputCronemberg,
                consfirmPassword: text,
                confirmPasswordError: '',
              });
            }}
            value={inputCronemberg.consfirmPassword}
          />
          {inputCronemberg.confirmPasswordError && (
            <View
              style={{
                position: 'absolute',
                right: 8,
              }}>
              <Popover
                /* verticalOffset={-32} */
                mode={PopoverMode.RN_MODAL}
                placement={PopoverPlacement.LEFT}
                isVisible={inputCronemberg.consfirmShowPasswordPopover}
                onRequestClose={() => {
                  setInputCronemberg({
                    ...inputCronemberg,
                    consfirmShowPasswordPopover: false,
                  });
                }}
                from={
                  <TouchableOpacity
                    onPress={() => {
                      setInputCronemberg({
                        ...inputCronemberg,
                        consfirmShowPasswordPopover: true,
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
                  {inputCronemberg.confirmPasswordError}
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
            disabled={
              inputCronemberg.phoneError !== '' ||
              inputCronemberg.passwordError !== '' ||
              inputCronemberg.confirmPasswordError !== ''
            }
            color={Colors[colorScheme ?? 'light'].primary}
            title="Sign Up"
            onPress={handleSignUp}
          />
        </View>
      </View>
    </View>
  );
};

const renderTabsScene = SceneMap({
  'sign-in': SignInTab,
  'sign-up': SignUpTab,
});
