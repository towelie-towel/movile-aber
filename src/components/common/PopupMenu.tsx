import React from 'react';
import { useColorScheme, Text } from 'react-native';
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Menu, MenuOptions, MenuOption, MenuTrigger } from "~/lib/react-native-popup-menu";
import Colors from '~/constants/Colors';

interface MenuOptionItem {
    title: string;
    icon: string;
    onPress: () => void;
    color?: string;
}

const PostPopupMenu = ({ options }: { options: MenuOptionItem[] }) => {
    const colorScheme = useColorScheme()

    return (
        <Menu style={{}}>
            <MenuTrigger
                customStyles={{
                    triggerWrapper: {
                        // top: 6,
                    },
                }}
            >
                <BlurView className='h-12 px-3 flex-row justify-center items-center gap-2 rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                    <Entypo name="dots-three-vertical" size={20} color={Colors[colorScheme ?? 'light'].icons} />
                </BlurView>
            </MenuTrigger>
            <MenuOptions
                customStyles={{
                    optionsContainer: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                        borderRadius: 10,
                    }
                }}
            >

                {
                    options?.map((option, index) => (
                        <MenuOption
                            key={index}
                            onSelect={() => option.onPress()}
                            customStyles={{
                                optionWrapper: {
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                },
                            }}
                        >
                            <Text style={{ marginLeft: 8, color: option.color ?? Colors[colorScheme ?? 'light'].icons }}>{option.title}</Text>
                            <MaterialCommunityIcons
                                style={{ marginRight: 8 }}
                                // @ts-ignore
                                name={option.icon}
                                size={24}
                                color={option.color ?? Colors[colorScheme ?? 'light'].icons}
                            />
                        </MenuOption>
                    ))
                }

            </MenuOptions>
        </Menu>
    )
}

export default PostPopupMenu;