import { View, Text, useColorScheme } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import StarRating from 'react-native-star-rating-widget';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import FloatingLabelInput from '~/lib/floating-label-input';
import { useWSState } from '~/context/WSContext';
import { ScaleBtn } from '~/components/common';
import Colors from '~/constants/Colors';

interface IRideFlowInfo {
    finishRide: (review?: { stars?: number, comment?: string }) => void,
}

const RideReview: React.FC<IRideFlowInfo> = ({ finishRide }) => {
    const colorScheme = useColorScheme();
    const { confirmedTaxi } = useWSState()

    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState<string | null>(null);

    const finishRideHandler = useCallback(() => {
        finishRide({ stars: rating ?? undefined, comment: comment ?? undefined })
    }, [finishRide, rating, comment])

    return (
        <View className='w-full- mx-1.5- justify-center items-center-'>
            <Text className="font-bold text-xl text-[#1b1b1b] dark:text-[#C1C0C9]">Califica al chofer</Text>
            <View className="h-20- mt-3 mx-1.5 flex-row justify-between items-center">
                <View className="w-full flex-row gap-3 items-center- ">
                    <Image
                        style={{ width: 65, height: 65 }}
                        source={require('../../../assets/images/taxi_test.png')}
                    />
                    <View className="py-2- gap-1 justify-between- justify-center ">
                        <View className="flex-row justify-start items-center gap-2 ">
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{confirmedTaxi?.username ?? "Anonymous"}</Text>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{"-"}</Text>
                            <View className="flex-row justify-center items-center">
                                <Text className="text-[#FED141] text-[#1b1b1b]- dark:text-[#C1C0C9]- text-lg">★ </Text>
                                <Text className="text-[#1b1b1b] dark:text-[#C1C0C9]">4.9</Text>
                            </View>
                        </View>

                        <View className='flex-row justify-start items-center mb-3- '>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-md">{confirmedTaxi?.username ?? "Anonymous"}</Text>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-semibold text-lg">{" - "}</Text>
                            <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-medium text-lg">{confirmedTaxi?.username ?? "Anonymous"}</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <></>
                </View>
            </View>
            {/* <View className='h-10 flex-row justify-center items-center'>
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-2xl">Añadiendo Marcador</Text>
                      </View>
                      <Image
                        className=''
                        style={{ width: 100, height: 100 }}
                        source={require('../../../assets/images/taxi_test.png')}
                      />
                      <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-bold text-xl">{confirmedTaxi?.username ?? "Anonymous"}</Text>
                      <View className='flex-row justify-center items-center'>
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] text-md">{confirmedTaxi?.username ?? "Anonymous"}</Text>
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-semibold text-lg">{" - "}</Text>
                        <Text className="text-[#1b1b1b] dark:text-[#C1C0C9] font-medium text-lg">{confirmedTaxi?.username ?? "Anonymous"}</Text>
                      </View> */}
            <View className='w-full items-center- justify-center mt-3'>
                <StarRating
                    rating={rating ?? 0}
                    onChange={setRating}
                />
            </View>
            <FloatingLabelInput
                label={"Añade un comentario"}
                value={comment ?? undefined}
                onChangeText={value => setComment(value)}

                containerStyles={{
                    paddingTop: 24,
                    height: 96,
                    borderRadius: 10,
                    width: "100%",
                    marginTop: 24,

                    backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                }}
                customLabelStyles={{
                    colorFocused: Colors[colorScheme ?? "light"].border,
                    colorBlurred: Colors[colorScheme ?? "light"].border,
                    fontSizeFocused: 18,
                    fontSizeBlurred: 20,
                }}
                labelStyles={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background_light1,
                    paddingLeft: 8,
                }}
                inputStyles={{
                    paddingHorizontal: 12,
                    paddingBottom: 12,
                    fontWeight: '400',
                    fontSize: 16,
                    color: Colors[colorScheme ?? 'light'].text_dark,
                }}
                multiline
                numberOfLines={4}
                placeholderTextColor={colorScheme === 'light' ? 'black' : '#6C6C6C'}
                placeholder='Añade un comentario'
            />

            <ScaleBtn className="mt-4 w-full gap-3" onPress={finishRideHandler}>
                <View className="h-18 flex-row items-center justify-center bg-[#242E42] rounded-xl p-3">
                    <Text className="text-white font-bold text-xl">Finish</Text>
                </View>
            </ScaleBtn>
        </View>
    );
};

export default RideReview;