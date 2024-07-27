import React from 'react';
import {
    Pressable,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { Image } from 'expo-image';

import Colors from '~/constants/Colors';

interface ChatTitleProps {
    firstName: string;
    lastName: string;
    // avatar: string;
    // myStatus: string;
    // userStatus: string;
    // userTime: Date;
}

const ChatTitle = ({
    firstName,
    lastName,
    // avatar,
    // myStatus,
    // userStatus,
    // userTime,
}: ChatTitleProps) => {
    const colorScheme = useColorScheme();

    return (
        <Pressable
            style={{
                flex: 1,
                flexDirection: 'row',
                marginLeft: -10 - 0.1 * -10,
            }}>
            <Image
                style={{ width: 42.5, height: 42.5 }}
                source={require('../../../assets/images/taxi_test.png')}
            />
            <View style={{ flexDirection: 'column', marginLeft: 5 - 0.1 * 5 }}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                        fontSize: 17,
                        color: Colors[colorScheme ?? "light"].text_dark,
                        opacity: 0.9,
                    }}>
                    {`${firstName}${' '}${lastName}`}
                </Text>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                        fontSize: 15,

                        color: Colors[colorScheme ?? "light"].text_dark,
                        opacity: 0.4,
                    }}
                >
                    last seen recently
                </Text>
                {/* <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                        fontSize: fontValue(15),
                        
                        color: Colors[colorScheme ?? "light"].text_dark,
                        opacity: 0.4,
                    }}>
                    {
                        // ${userTime.getFullYear()} ${userTime.getFullYear()} ${userTime.getDay()}
                        myStatus === 'recently'
                            ? 'last seen recently'
                            : myStatus === 'normal' && userStatus === 'recently'
                                ? 'last seen recently'
                                : myStatus === 'normal' && userStatus === 'normal'
                                    ? firestore?.Timestamp?.fromDate(new Date())?.toDate().getTime() -
                                        userTime >
                                        86400000
                                        ? `last seen on ${moment(userTime)?.format('YYYY MMMM DD')}`
                                        : firestore?.Timestamp?.fromDate(new Date())?.toDate().getTime() -
                                            userTime <
                                            180000
                                            ? 'Active now'
                                            : `last seen on ${moment(userTime)?.format('HH:MM A')}`
                                    : 'long time ago'
                    }
                </Text> */}
            </View>
        </Pressable>
    );
};

export default ChatTitle;