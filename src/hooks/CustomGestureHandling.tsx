import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import BottomSheet, {
  BottomSheetScrollView,
  SCROLLABLE_STATE,
  useBottomSheetInternal,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureTranslationProvider } from './GestureTranslationContext';
import { useCustomGestureEventsHandlers } from './useCustomGestureEventsHandlers';
import { useCustomScrollEventsHandlers } from './useScrollBottomSheetEventHandler';

const count = 60;
const snapPoints = ['10%', '50%', '75%'];

export const BottomSheetContent = () => {
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  const listContentContainerStyle = useMemo(
    () => [styles.listContentContainer, { paddingBottom: bottomSafeArea }],
    [bottomSafeArea]
  );

  const { animatedScrollableState, animatedIndex } = useBottomSheetInternal();

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    // [-1, 1, 2] this first array defines the [-1, disapearPoint, aperPoint]
    opacity: interpolate(animatedIndex.value, [-1, 0, 1], [0, 0, 1], Extrapolate.CLAMP),
    flex: 1,
  }));
  const containerStyle = useMemo(() => [containerAnimatedStyle], [containerAnimatedStyle]);

  const scrollableAnimatedProps = useAnimatedProps(() => ({
    showsVerticalScrollIndicator: animatedScrollableState.value === SCROLLABLE_STATE.UNLOCKED,
  }));
  const renderBottomSheetItem = useCallback(
    ({ item }) => (
      <View
        key={item.userId}
        style={{
          padding: 6,
          margin: 6,
          backgroundColor: '#eee',
        }}>
        <Text>{item.userId}</Text>
      </View>
    ),
    []
  );

  return (
    <BottomSheetFlatList
      style={[styles.listContainer, containerStyle]}
      keyExtractor={(i) => i.userId}
      contentContainerStyle={listContentContainerStyle}
      scrollEventsHandlersHook={useCustomScrollEventsHandlers}
      renderItem={renderItem}
      animatedProps={scrollableAnimatedProps}>
      {[
        {
          userId: '1',
        },
        {
          userId: '2',
        },
        {
          userId: '3',
        },
        {
          userId: '4',
        },
        {
          userId: '5',
        },
        {
          userId: '6',
        },
        {
          userId: '7',
        },
        {
          userId: '8',
        },
        {
          userId: '9',
        },
        {
          userId: '10',
        },
        {
          userId: '11',
        },
        {
          userId: '12',
        },
        {
          userId: '13',
        },
        {
          userId: '14',
        },
        {
          userId: '15',
        },
        {
          userId: '16',
        },
      ].map((value) => renderBottomSheetItem({ item: value }))}
    </BottomSheetFlatList>
  );
};

const styles = StyleSheet.create({
  listContainer: {},
  listContentContainer: {
    overflow: 'visible',
    paddingHorizontal: 16,
  },
});
