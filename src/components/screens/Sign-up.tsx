import React, { useState } from 'react';
import {
    LayoutAnimation,
    TextInput,
    useColorScheme,
    ActivityIndicator,
    Text
} from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Popover from 'react-native-popover-view';

import { supabase } from '~/lib/supabase'
import { type DrawerParamList } from '~/app';
import { View } from '~/components/shared/Themed';
import { PressBtn } from '~/components/shared/PressBtn';
import Colors from '~/constants/Colors';
import { isValidPassword, isValidPhone, isValidUsername } from '~/utils/auth';
import { useUser } from '~/context/UserContext';

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const colorScheme = useColorScheme()
    const pathName = usePathname()
    const { replace } = useRouter()
    const {isSignedIn, isLoading: isAuthLoading} = useUser()
    const isOnSignUpRoute = pathName.includes("sign-up")

    const [isLoading, setIsLoading] = useState(false)

    const [phone, setPhone] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [phoneError, setPhoneError] = useState('')

    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const [username, setUsername] = useState('')
    const [usernameError, setUsernameError] = useState('')

    const [otpTimer, setOtpTimer] = useState(60);

    const [otpToken, setOtpToken] = useState("")
    const [otpTokenError, setOtpTokenError] = useState('')

    const [isReduced, setIsReduced] = useState(false)


    const reduceLogo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setIsReduced(true)
    }

    const startTimer = () => {
        setOtpTimer(60);
        const timer = setInterval(() => {
            setOtpTimer((prevCount) => {
                if (prevCount === 1) {
                    console.log('clearing interval')
                    clearInterval(timer)
                }

                console.log(prevCount)
                return prevCount - 1
            });
        }, 1000);
    };

    const sendOTP = async () => {
        setIsLoading(true);
        const [phoneOk, phoneErr] = isValidPhone(phone.trim())
        const [passwordOk, passwordErr] = isValidPassword(password)
        const [usernameOk, usernameErr] = isValidUsername(username)

        if (!phoneOk || !passwordOk || !usernameOk) {
            if (!phoneOk) {
                setPhoneError(phoneErr)
                console.error("invalid phone: " + phoneErr)
            }
            if (!passwordOk) {
                setPasswordError(passwordErr)
                console.error("invalid password: " + passwordErr)
            }
            if (!usernameOk) {
                setUsernameError(usernameErr)
                console.error("invalid username: " + usernameErr)
            }
            setIsLoading(false)
            return
        }

        console.log("Sending OTP Code")
        const { error } = await supabase.auth.signUp({
            phone: '+53' + phone.trim(),
            password: password,
            options: {
                data: {
                    username: username,
                    role: 'client'
                }
            }
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            setIsLoading(false)
            return
        }

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setPendingVerification(true)

        startTimer()
        setIsLoading(false)
    }

    const verifyOtp = async () => {
        setIsLoading(true)
        const { error, data } = await supabase.auth.verifyOtp({
            phone: '+53' + phone.trim(),
            token: otpToken,
            type: 'sms',
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            setIsLoading(false)
            return
        }

        console.log("User Signed In", JSON.stringify(data, null, 2))

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setIsPhoneVerified(true)
        setPendingVerification(false)
        setIsLoading(false)
    }

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Cuenta Nueva',
            }} />

            <View className='w-1/2 items-center justify-center font-[Inter-Regular]'>
                <Image
                    source={require('../../../assets/Logo.png')}
                    alt='Tu-Ruta Logo'
                    className='h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 max-[367px]:my-0'
                />
                <Text numberOfLines={1} adjustsFontSizeToFit className='mt-4 dark:text-white font-bold text-3xl text-center max-[367px]:text-2xl'>Bienvenida</Text>
            </View>

            {!pendingVerification && !isPhoneVerified && (
                <View className='w-2/3 items-center justify-center gap-4 my-6'>
                    <View className='relative w-full flex-row justify-center items-center'>
                        <View className='h-12 w-[20%] border border-r-0 rounded-l border-gray-300 dark:border-gray-600 dark:bg-transparent justify-center items-center'>
                            <Text className='text-gray-500 dark:text-slate-500'>+53</Text>
                        </View>
                        <TextInput
                            className={'h-12 w-[80%] pl-4 pr-10 border rounded-r border-gray-300 dark:border-gray-600 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholder="Número de Móvil"
                            autoCapitalize="none"
                            keyboardType='numeric'
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setPhone}
                            value={phone}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            phoneError &&
                            <View className='absolute right-2 my-auto'>
                                <Popover
                                    from={(
                                        <MaterialIcons
                                            name='error'
                                            size={24}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    )}>
                                    <Text>{phoneError}</Text>
                                </Popover>
                            </View>
                        }
                    </View>
                    <View className={'relative w-full justify-center items-center'}>
                        <TextInput
                            className={'w-full h-12 pl-4 pr-10 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Nombre de Usuario"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setUsername}
                            value={username}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            usernameError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>
                    <View className={'relative w-full justify-center items-center'}>
                        <TextInput
                            className={'w-full h-12 pl-4 pr-10 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Contraseña"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setPassword}
                            value={password}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            passwordError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>
                </View>
            )}

            {pendingVerification && (
                <View className='w-2/3 items-center justify-center my-6'>
                    <View className='w-full justify-center items-center relative'>
                        <View className='w-full justify-center items-center'>
                            <Text numberOfLines={1} adjustsFontSizeToFit className='dark:text-gray-400' >
                                No Te Ha Llegado?
                            </Text>
                            <View className='w-full justify-center items-center flex-row mb-4'>
                                <Text numberOfLines={1} adjustsFontSizeToFit className='dark:text-gray-400 mr-2' >
                                    Intenta de nuevo en {otpTimer}.
                                </Text>
                                <PressBtn
                                    disabled={otpTimer !== 0}
                                    onPress={() => sendOTP()}
                                >
                                    <Text className='dark:text-gray-400 font-bold text-base'>Enviar</Text>
                                </PressBtn>
                            </View>
                        </View>
                        <TextInput
                            className={'w-full h-12 pl-4 pr-10 border rounded border-gray-300 dark:border-gray-800 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            placeholder="Codigo"
                            onChangeText={(code) => setOtpToken(code)}
                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            otpTokenError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>

                </View>
            )}

            {
                isSignedIn &&
                <>
                
                </>
            }

            {
                isAuthLoading &&
                <>
                    <ActivityIndicator
                        size={'small'}
                        animating
                        color={colorScheme === 'light' ? 'black' : 'white'}
                    />
                </>
            }

            {
            !isSignedIn && 
                <>
                    <PressBtn
                        disabled={otpToken.length < 5 && pendingVerification || isLoading}
                        onPress={() => pendingVerification ? verifyOtp() : sendOTP()}
                        className={'w-[200px] align-text-bottom max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'}
                    >
                        <Text className={'text-white dark:text-black text-lg max-[367px]:text-base font-bold mr-3'}>{pendingVerification ? "Verificar" : "Registrar"}</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>

                    <PressBtn
                        className={'flex-row items-center justify-center mt-4'}
                        onPress={() => {
                            if (isOnSignUpRoute) {
                                replace('sign-in')
                            } else {
                                navigation?.navigate('Sign-In')
                            }
                        }}
                    >
                        <Text className={'text-sm max-[367px]:text-xs font-light dark:text-gray-400'}>Ya Tienes Cuenta?</Text>
                        <Text className={'text-[#2e78b7] font-normal ml-1 text-sm max-[367px]:text-xs'}>Inicia Sesión</Text>
                    </PressBtn>
                </>
            }
        </View>
    );
}