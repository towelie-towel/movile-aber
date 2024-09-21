import React from 'react';
import { useColorScheme, Text } from 'react-native';
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuTriggerProps, MenuOptionProps } from "~/lib/react-native-popup-menu";
import Colors from '~/constants/Colors';

interface MenuOptionItem {
    title: string;
    icon: string;
    onPress: () => void;
    color?: string;
}

interface PostPopupMenuProps {
    optionItems: MenuOptionItem[];
    triggerProps?: MenuTriggerProps;
    optionsProps?: MenuOptionProps;
    triggerDotsSize?: number;
}

const PostPopupMenu = ({ optionItems, triggerProps, optionsProps, triggerDotsSize = 20 }: PostPopupMenuProps) => {
    const colorScheme = useColorScheme()

    const { customStyles: triggerCustomStyles, ...restTriggerProps } = triggerProps || {};
    const { customStyles: optionsCustomStyles, ...restOptionsProps } = optionsProps || {};

    return (
        <Menu style={{}}>
            <MenuTrigger
                customStyles={{
                    triggerWrapper: {
                        // top: 6,
                    },
                    ...(triggerCustomStyles)
                }}
                {...restTriggerProps}
            >
                <BlurView className='h-12 px-3 flex-row justify-center items-center gap-2 rounded-lg overflow-hidden' tint={colorScheme === "light" ? "dark" : "light"} intensity={20}>
                    <Entypo name="dots-three-vertical" size={triggerDotsSize} color={Colors[colorScheme ?? 'light'].icons} />
                </BlurView>
            </MenuTrigger>
            <MenuOptions
                customStyles={{
                    optionsContainer: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                        borderRadius: 10,
                    },
                    ...(optionsCustomStyles)
                }}
                {...restOptionsProps}
            >

                {
                    optionItems?.map((option, index) => (
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

/* 
import React from 'react';
import { useColorScheme } from 'react-native';
import { Text } from "@gluestack-ui/themed";
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuTriggerProps, MenuOptionProps } from "@/lib/react-native-popup-menu";
import Colors from '@/constants/Colors';

interface MenuOptionItem {
    title: string;
    icon: string;
    onPress: () => void;
    color?: string;
}

interface PostPopupMenuProps {
    optionItems: MenuOptionItem[];
    triggerProps?: MenuTriggerProps;
    optionsProps?: MenuOptionProps;
    triggerDotsSize?: number;
}

const PostPopupMenu = ({ optionItems, triggerProps, optionsProps, triggerDotsSize = 18 }: PostPopupMenuProps) => {
    const colorScheme = useColorScheme()

    const { customStyles: triggerCustomStyles, ...restTriggerProps } = triggerProps || {};
    const { customStyles: optionsCustomStyles, ...restOptionsProps } = optionsProps || {};

    return (
        <Menu style={{}}>
            <MenuTrigger
                customStyles={{
                    triggerWrapper: {
                        top: 6,
                    },
                    ...(triggerCustomStyles)
                }}
                {...restTriggerProps}
            >
                <Entypo name="dots-three-vertical" size={triggerDotsSize} color={Colors[colorScheme ?? 'light'].icons} />
            </MenuTrigger>
            <MenuOptions
                customStyles={{
                    optionsContainer: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                        borderRadius: 10,
                    },
                    ...(optionsCustomStyles)
                }}
                {...restOptionsProps}
            >

                {
                    optionItems?.map((option, index) => (
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
                            <Text ml={8} color={option.color ?? Colors[colorScheme ?? 'light'].icons}>{option.title}</Text>
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
*/